import { NativeModules, NativeEventEmitter } from 'react-native';
import AudioRecord from 'react-native-audio-record';
import * as ort from 'onnxruntime-react-native';

/**
 * Singleton engine that keeps the ONNX model in memory and continuously
 * monitors the microphone for the custom "eindr" wake-word.
 *
 * Usage:
 *   import WakeWordEngine from '@services/wakeword/WakeWordEngine';
 *   WakeWordEngine.start();
 *   WakeWordEngine.addListener(() => console.log('🔥 Wake-word detected!'));
 */
class WakeWordEngine {
  private static _instance: WakeWordEngine;

  /** Path inside the JS bundle.  Metro must treat .onnx as an asset type. */
  private readonly modelAsset = require('../../../final_models/openwakeword_model/eindr_custom.onnx');

  private session: ort.InferenceSession | null = null;
  private listeners: (() => void)[] = [];

  /**
   * Audio settings: 16 kHz mono, PCM 16-bit.
   * We collect 1.5 s of audio (~24 k samples) and run a sliding window
   * Mel-spectrogram: (batch=1, melBins=16, frames=96).
   */
  private readonly SAMPLE_RATE = 16_000;
  private readonly CHUNK_MS = 30; // 30 ms chunks from AudioRecord
  private readonly CHUNK_SAMPLES = (this.SAMPLE_RATE * this.CHUNK_MS) / 1000;
  private readonly WINDOW_SAMPLES = this.SAMPLE_RATE * 1.5; // 1.5 s context
  private audioBuffer: Float32Array = new Float32Array(0);

  /**
   * Public accessor for singleton.
   */
  public static get instance(): WakeWordEngine {
    if (!WakeWordEngine._instance) {
      WakeWordEngine._instance = new WakeWordEngine();
    }
    return WakeWordEngine._instance;
  }

  private constructor() {
    // Prevent direct instantiation; use WakeWordEngine.instance.
  }

  /** Begin streaming microphone + model inference */
  public async start() {
    if (this.session) return; // already running

    await this.initModel();
    await this.initMic();
  }

  public stop() {
    AudioRecord.stop();
    this.session = null;
  }

  /** Subscribe to wake-word detection events. */
  public addListener(cb: () => void) {
    this.listeners.push(cb);
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  private async initModel() {
    if (this.session) return;
    const modelUri = ort.bundleResourceIO(this.modelAsset);
    this.session = await ort.InferenceSession.create(modelUri, { executionProviders: ['cpu'] });
    console.log('[WakeWord] ONNX model loaded');
  }

  private async initMic() {
    AudioRecord.init({
      sampleRate: this.SAMPLE_RATE,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6, // VOICE_RECOGNITION on Android
      wavFile: 'dummy.wav',
    });

    const emitter = new NativeEventEmitter(NativeModules.AudioRecord);
    emitter.addListener('data', (data: string) => {
      // data is base64-encoded PCM.
      const pcm = this.base64ToFloat32(data);
      this.appendAudio(pcm);
    });

    AudioRecord.start();
    console.log('[WakeWord] Microphone stream started');
  }

  private appendAudio(chunk: Float32Array) {
    // Append and keep buffer at max WINDOW_SAMPLES.
    const combined = new Float32Array(this.audioBuffer.length + chunk.length);
    combined.set(this.audioBuffer);
    combined.set(chunk, this.audioBuffer.length);

    if (combined.length > this.WINDOW_SAMPLES) {
      this.audioBuffer = combined.slice(combined.length - this.WINDOW_SAMPLES);
    } else {
      this.audioBuffer = combined;
    }

    // Once we have enough samples → run inference every CHUNK.
    if (this.audioBuffer.length >= this.WINDOW_SAMPLES) {
      this.runInference(this.audioBuffer.slice());
    }
  }

  /**
   * Convert base64 <=> Float32 utility.
   */
  private base64ToFloat32(b64: string): Float32Array {
    const raw = Buffer.from(b64, 'base64');
    const pcm16 = new Int16Array(raw.buffer, raw.byteOffset, raw.byteLength / 2);
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768; // normalize −1 … 1
    }
    return float32;
  }

  /**
   * Run model inference on a Float32Array of 1.5 s audio.
   */
  private async runInference(audio: Float32Array) {
    if (!this.session) return;

    // 1. Convert to Mel-spectrogram tensor expected by model.
    const mel = this.extractMelSpectrogram(audio); // Float32Array(16*96)

    // 2. Create ONNX tensor: [1, 16, 96]
    const inputTensor = new ort.Tensor('float32', mel, [1, 16, 96]);
    const feeds: Record<string, ort.Tensor> = {};
    feeds[this.session.inputNames[0]] = inputTensor;

    const results = await this.session.run(feeds);
    const output = results[this.session.outputNames[0]].data as Float32Array;
    const confidence = output[0];
    if (confidence > 0.5) {
      this.emitWakeWord();
    }
  }

  private emitWakeWord() {
    console.log('[WakeWord] Detected!');
    this.listeners.forEach(cb => cb());
  }

  // ---------------------------------------------------------------------------
  // Signal → Mel helper (lightweight JS, no native deps)
  // ---------------------------------------------------------------------------
  /**
   * Convert raw audio to (16×96) log-mel spectrogram similar to OpenWakeWord's
   * preprocessing.  The maths is simplified to keep it dependency-free.  For
   * production you should swap this with a native FFT for >20× speed-up.
   */
  private extractMelSpectrogram(signal: Float32Array): Float32Array {
    // Hyper-parameters aligned with model training
    const frameLen = 512;
    const hopLen = 160; // 10 ms hop @16 kHz
    const nMels = 16;
    const nFrames = 96;

    // 1. Pre-emphasis (simple energy boost on high-freq)
    const preEmph = 0.97;
    const pre = new Float32Array(signal.length);
    pre[0] = signal[0];
    for (let i = 1; i < signal.length; i++) {
      pre[i] = signal[i] - preEmph * signal[i - 1];
    }

    // 2. STFT via naive FFT (radix-2 Cooley-Tukey)
    // NOTE: For brevity we use a minimal JS FFT implementation.
    // tslint:disable-next-line: no-var-requires
    const fft = require('fft.js');
    const f = new fft(frameLen);
    const window = this.hann(frameLen);

    // Mel filterbank cache
    const melFilter = this.melFilterBank(nMels, frameLen, this.SAMPLE_RATE);

    const melSpec = new Float32Array(nMels * nFrames);
    let frame = 0;
    for (let pos = 0; pos + frameLen <= pre.length && frame < nFrames; pos += hopLen) {
      const frameSlice = pre.slice(pos, pos + frameLen);
      for (let i = 0; i < frameLen; i++) frameSlice[i] *= window[i];
      const out = f.createComplexArray();
      f.realTransform(out, frameSlice);
      f.completeSpectrum(out);

      // magnitude spectrum
      const mags = new Float32Array(frameLen / 2 + 1);
      for (let k = 0; k < mags.length; k++) {
        const re = out[2 * k];
        const im = out[2 * k + 1];
        mags[k] = Math.sqrt(re * re + im * im);
      }

      // Apply mel filterbank
      for (let m = 0; m < nMels; m++) {
        let sum = 0;
        for (let k = 0; k < mags.length; k++) {
          sum += mags[k] * melFilter[m][k];
        }
        melSpec[m * nFrames + frame] = Math.log10(sum + 1e-6);
      }
      frame++;
    }

    return melSpec;
  }

  // ---------------------------------------------------------------------------
  // DSP utilities (window, mel scale, etc.)
  // ---------------------------------------------------------------------------

  private hann(N: number): Float32Array {
    const w = new Float32Array(N);
    for (let n = 0; n < N; n++) w[n] = 0.5 * (1 - Math.cos((2 * Math.PI * n) / (N - 1)));
    return w;
  }

  /** Compute triangular mel filterbank */
  private melFilterBank(nMels: number, nFft: number, sr: number): number[][] {
    const fMin = 0;
    const fMax = sr / 2;
    const melMin = this.hz2mel(fMin);
    const melMax = this.hz2mel(fMax);
    const melPoints = new Array(nMels + 2)
      .fill(0)
      .map((_, i) => melMin + ((melMax - melMin) / (nMels + 1)) * i);
    const hzPoints = melPoints.map(m => this.mel2hz(m));
    const bin = hzPoints.map(hz => Math.floor(((nFft + 1) * hz) / sr));

    const filters: number[][] = Array.from({ length: nMels }, () =>
      new Array(nFft / 2 + 1).fill(0),
    );
    for (let m = 1; m <= nMels; m++) {
      const fM = bin[m];
      const fMPrev = bin[m - 1];
      const fMNext = bin[m + 1];
      for (let k = fMPrev; k < fM; k++) {
        filters[m - 1][k] = (k - fMPrev) / (fM - fMPrev);
      }
      for (let k = fM; k < fMNext; k++) {
        filters[m - 1][k] = (fMNext - k) / (fMNext - fM);
      }
    }
    return filters;
  }

  private hz2mel(hz: number): number {
    return 2595 * Math.log10(1 + hz / 700);
  }
  private mel2hz(mel: number): number {
    return 700 * (10 ** (mel / 2595) - 1);
  }
}

export default WakeWordEngine.instance;
