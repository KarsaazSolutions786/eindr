import { Image } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import * as ort from 'onnxruntime-react-native';
import RNFS from 'react-native-fs';
import dayjs from 'dayjs';
import { showToast } from '@utils/toast';

/**
 * Random Forest-based Wake Word Engine using MFCC features
 * Trained on "eindr" wake word data with 87.5% test accuracy
 */
class RandomForestWakeWordEngine {
  private static _instance: RandomForestWakeWordEngine;

  /** ONNX Models - bundled assets for React Native */
  private readonly modelAsset = require('../../../assets/models/eindr_random_forest.onnx');
  private readonly scalerAsset = require('../../../assets/models/eindr_scaler.onnx');
  private readonly configAsset = require('../../../assets/models/eindr_rf_config.json');

  private modelSession: ort.InferenceSession | null = null;
  private scalerSession: ort.InferenceSession | null = null;
  private config: any = null;
  private listeners: (() => void)[] = [];

  // Audio processing
  private audioRecorderPlayer: AudioRecorderPlayer;
  private isRecording = false;
  private readonly SAMPLE_RATE = 16_000;
  private readonly CHUNK_MS = 50; // Process in 50ms chunks
  private readonly WINDOW_SAMPLES = this.SAMPLE_RATE * 2; // 2 seconds for MFCC
  private audioBuffer: Float32Array = new Float32Array(0);
  private recordingPath: string = '';

  // Audio processing timer
  private processingTimer: NodeJS.Timeout | null = null;

  /** Toggle verbose console logging for debugging */
  private readonly DEBUG = true;

  /** Pretty logger */
  private log(message: string, data?: any) {
    if (!this.DEBUG) return;
    const ts = dayjs().format('HH:mm:ss.SSS');
    if (data !== undefined) {
      console.log(`[WakeWord ${ts}] ${message}`, data);
    } else {
      console.log(`[WakeWord ${ts}] ${message}`);
    }
  }

  /**
   * Public accessor for singleton.
   */
  public static get instance(): RandomForestWakeWordEngine {
    if (!RandomForestWakeWordEngine._instance) {
      RandomForestWakeWordEngine._instance = new RandomForestWakeWordEngine();
    }
    return RandomForestWakeWordEngine._instance;
  }

  private constructor() {
    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.recordingPath = `${RNFS.DocumentDirectoryPath}/wake_word_audio.wav`;
  }

  /** Begin streaming microphone + model inference */
  public async start() {
    console.log('[RandomForestWakeWord] Starting wake word engine...');
    await this.initModels();
    await this.initMic();
  }

  public stop() {
    console.log('[RandomForestWakeWord] Stopping wake word engine...');
    this.stopRecording();
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = null;
    }
  }

  /** Subscribe to wake-word detection events. */
  public addListener(cb: () => void) {
    this.listeners.push(cb);
  }

  public removeListener(cb: () => void) {
    const index = this.listeners.indexOf(cb);
    if (index > -1) this.listeners.splice(index, 1);
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  private async initModels() {
    if (this.modelSession && this.scalerSession) return;

    console.log('[RandomForestWakeWord] Loading ONNX models...');

    try {
      // Load configuration
      this.config = this.configAsset;
      console.log('[RandomForestWakeWord] Config loaded:', this.config);

      // For React Native, resolve asset URIs and fetch as ArrayBuffers
      const modelSource = Image.resolveAssetSource(this.modelAsset);
      const scalerSource = Image.resolveAssetSource(this.scalerAsset);

      if (!modelSource || !scalerSource) {
        throw new Error('Failed to resolve asset sources');
      }

      console.log('[RandomForestWakeWord] Model URI:', modelSource.uri);
      console.log('[RandomForestWakeWord] Scaler URI:', scalerSource.uri);

      // Fetch models as ArrayBuffers
      console.log('[RandomForestWakeWord] Fetching scaler model...');
      const scalerResponse = await fetch(scalerSource.uri);
      const scalerBuffer = await scalerResponse.arrayBuffer();

      console.log('[RandomForestWakeWord] Fetching Random Forest model...');
      const modelResponse = await fetch(modelSource.uri);
      const modelBuffer = await modelResponse.arrayBuffer();

      console.log('[RandomForestWakeWord] Loading scaler session...');
      this.scalerSession = await ort.InferenceSession.create(scalerBuffer, {
        executionProviders: ['cpu'],
      });

      console.log('[RandomForestWakeWord] Loading Random Forest session...');
      this.modelSession = await ort.InferenceSession.create(modelBuffer, {
        executionProviders: ['cpu'],
      });

      console.log('[RandomForestWakeWord] Models loaded successfully');
      console.log('[RandomForestWakeWord] Scaler inputs:', this.scalerSession.inputNames);
      console.log('[RandomForestWakeWord] Scaler outputs:', this.scalerSession.outputNames);
      console.log('[RandomForestWakeWord] Model inputs:', this.modelSession.inputNames);
      console.log('[RandomForestWakeWord] Model outputs:', this.modelSession.outputNames);
    } catch (error) {
      console.error('[RandomForestWakeWord] Failed to load models:', error);
      throw error;
    }
  }

  private async initMic() {
    try {
      console.log('[RandomForestWakeWord] Initializing microphone...');

      // Configure audio recorder
      // Android constants: AudioEncoder.AAC = 3, AudioSource.VOICE_RECOGNITION = 6, OutputFormat.MPEG_4 = 2
      const audioSet = {
        AudioEncoderAndroid: 3,
        AudioSourceAndroid: 6,
        OutputFormatAndroid: 2,

        // iOS keys remain strings
        AVEncoderAudioQualityKeyIOS: 'high',
        AVNumberOfChannelsKeyIOS: 1,
        AVFormatIDKeyIOS: 'wav',
        AVSampleRateKeyIOS: this.SAMPLE_RATE,

        // Android sample rate
        AudioSampleRateAndroid: this.SAMPLE_RATE,
      };

      console.log('[RandomForestWakeWord] Starting continuous recording...');
      await this.audioRecorderPlayer.startRecorder(this.recordingPath, audioSet);
      this.isRecording = true;

      // Start processing timer to periodically read and process audio
      this.processingTimer = setInterval(() => {
        this.processAudioChunk();
      }, this.CHUNK_MS);

      console.log('[RandomForestWakeWord] Microphone initialized successfully');
    } catch (error) {
      console.error('[RandomForestWakeWord] Failed to initialize microphone:', error);
      throw error;
    }
  }

  private async stopRecording() {
    if (this.isRecording) {
      try {
        await this.audioRecorderPlayer.stopRecorder();
        this.isRecording = false;
        console.log('[RandomForestWakeWord] Recording stopped');
      } catch (error) {
        console.error('[RandomForestWakeWord] Error stopping recording:', error);
      }
    }
  }

  private async processAudioChunk() {
    if (!this.isRecording) return;

    try {
      // This is a simplified approach - in a real implementation, you'd need to
      // process the audio file incrementally or use a streaming approach
      // For now, we'll simulate audio processing
      const dummyAudio = new Float32Array(this.SAMPLE_RATE * 0.05); // 50ms worth
      for (let i = 0; i < dummyAudio.length; i++) {
        dummyAudio[i] = (Math.random() - 0.5) * 0.1; // Small random noise
      }

      this.appendAudio(dummyAudio);
    } catch (error) {
      console.error('[RandomForestWakeWord] Error processing audio chunk:', error);
    }
  }

  private appendAudio(chunk: Float32Array) {
    // Append and keep buffer at max WINDOW_SAMPLES
    const combined = new Float32Array(this.audioBuffer.length + chunk.length);
    combined.set(this.audioBuffer);
    combined.set(chunk, this.audioBuffer.length);

    if (combined.length > this.WINDOW_SAMPLES) {
      this.audioBuffer = combined.slice(combined.length - this.WINDOW_SAMPLES);
    } else {
      this.audioBuffer = combined;
    }

    // Once we have enough samples → run inference
    if (this.audioBuffer.length >= this.WINDOW_SAMPLES) {
      this.runInference(this.audioBuffer.slice());
    }
  }

  /**
   * Run Random Forest inference on a Float32Array of 2 s audio.
   */
  private async runInference(audio: Float32Array) {
    if (!this.modelSession || !this.scalerSession) return;

    try {
      // 1. Extract MFCC features (52 dimensions)
      const mfccFeatures = this.extractMFCCFeatures(audio);

      if (this.DEBUG) {
        const peekMfcc = Array.from(mfccFeatures.slice(0, 4))
          .map(v => v.toFixed(2))
          .join(',');
        this.log(`MFCC[0-3]=[${peekMfcc}]`);
      }

      // 2. Scale features using the scaler model
      const inputTensor = new ort.Tensor('float32', mfccFeatures, [1, 52]);
      const scalerInputName = this.scalerSession.inputNames[0];
      const scalerOutputs = await this.scalerSession.run({
        [scalerInputName]: inputTensor,
      });
      const scaledFeatures = scalerOutputs[this.scalerSession.outputNames[0]];

      // 3. Run Random Forest model
      const modelInputName = this.modelSession.inputNames[0];
      const modelOutputs = await this.modelSession.run({
        [modelInputName]: scaledFeatures,
      });

      // 4. Get probability output
      const output = modelOutputs[this.modelSession.outputNames[0]].data as Float32Array;

      // The Random Forest model outputs probabilities for both classes [neg_prob, pos_prob]
      // We want the probability of the positive class (wake word)
      let confidence: number;
      if (output.length === 2) {
        confidence = output[1]; // Probability of positive class (wake word)
      } else if (output.length === 1) {
        confidence = output[0]; // Single output case
      } else {
        console.warn(`[RandomForestWakeWord] Unexpected output shape: ${output.length}`);
        confidence = 0;
      }

      this.log(`Confidence: ${confidence.toFixed(3)}`);

      if (confidence > this.config.threshold) {
        this.emitWakeWord(confidence);
      }
    } catch (error) {
      console.error('[RandomForestWakeWord] Inference error:', error);
    }
  }

  private emitWakeWord(confidence: number) {
    this.log(`🛑 WAKE-WORD DETECTED! conf=${confidence.toFixed(3)}`);
    showToast('success', `Confidence ${(confidence * 100).toFixed(1)}%`, 'Wake word detected');
    this.listeners.forEach(cb => cb());
  }

  // ---------------------------------------------------------------------------
  // MFCC Feature Extraction
  // ---------------------------------------------------------------------------

  /**
   * Extract MFCC features that match the training data format:
   * 13 MFCC coefficients × 4 statistics (mean, std, max, min) = 52 features
   */
  private extractMFCCFeatures(signal: Float32Array): Float32Array {
    // Pad or trim to exactly 2 seconds
    const targetLength = this.config.sample_rate * this.config.window_duration;
    let processedSignal: Float32Array;

    if (signal.length > targetLength) {
      processedSignal = signal.slice(0, targetLength);
    } else {
      processedSignal = new Float32Array(targetLength);
      processedSignal.set(signal);
      // Zero-padding is applied by default
    }

    // Extract MFCC using the same parameters as training
    const mfccMatrix = this.computeMFCC(
      processedSignal,
      this.config.sample_rate,
      this.config.n_mfcc,
      this.config.n_fft,
      this.config.hop_length,
    );

    // Calculate statistics: mean, std, max, min for each MFCC coefficient
    const features = new Float32Array(this.config.n_mfcc * 4);

    for (let i = 0; i < this.config.n_mfcc; i++) {
      const coeffRow = mfccMatrix[i];

      // Calculate statistics
      const mean = this.calculateMean(coeffRow);
      const std = this.calculateStd(coeffRow, mean);
      const max = this.arrayMax(coeffRow);
      const min = this.arrayMin(coeffRow);

      // Store in feature vector
      features[i] = mean; // mean
      features[i + this.config.n_mfcc] = std; // std
      features[i + this.config.n_mfcc * 2] = max; // max
      features[i + this.config.n_mfcc * 3] = min; // min
    }

    return features;
  }

  /**
   * Compute MFCC coefficients
   */
  private computeMFCC(
    signal: Float32Array,
    sampleRate: number,
    nMfcc: number,
    nFft: number,
    hopLength: number,
  ): Float32Array[] {
    // This is a simplified MFCC implementation
    // For production, you might want to use a more robust implementation

    const frameLength = nFft;
    const numFrames = Math.floor((signal.length - frameLength) / hopLength) + 1;

    // Initialize MFCC matrix
    const mfccMatrix: Float32Array[] = [];
    for (let i = 0; i < nMfcc; i++) {
      mfccMatrix.push(new Float32Array(numFrames));
    }

    // Pre-emphasis
    const preEmphasis = 0.97;
    const emphasizedSignal = new Float32Array(signal.length);
    emphasizedSignal[0] = signal[0];
    for (let i = 1; i < signal.length; i++) {
      emphasizedSignal[i] = signal[i] - preEmphasis * signal[i - 1];
    }

    // Windowing function (Hamming window)
    const window = this.hammingWindow(frameLength);

    // Process each frame
    for (let frameIdx = 0; frameIdx < numFrames; frameIdx++) {
      const start = frameIdx * hopLength;
      const frame = new Float32Array(frameLength);

      // Extract and window the frame
      for (let i = 0; i < frameLength && start + i < emphasizedSignal.length; i++) {
        frame[i] = emphasizedSignal[start + i] * window[i];
      }

      // Compute power spectrum (simplified)
      const powerSpectrum = this.computePowerSpectrum(frame);

      // Apply mel filterbank
      const melSpectrum = this.applyMelFilterbank(powerSpectrum, sampleRate, nFft);

      // Apply DCT to get MFCC coefficients
      for (let mfccIdx = 0; mfccIdx < nMfcc; mfccIdx++) {
        let dctSum = 0;
        for (let k = 0; k < melSpectrum.length; k++) {
          dctSum += melSpectrum[k] * Math.cos((Math.PI * mfccIdx * (k + 0.5)) / melSpectrum.length);
        }
        mfccMatrix[mfccIdx][frameIdx] = dctSum;
      }
    }

    return mfccMatrix;
  }

  private hammingWindow(length: number): Float32Array {
    const window = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      window[i] = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (length - 1));
    }
    return window;
  }

  private computePowerSpectrum(frame: Float32Array): Float32Array {
    // Simple FFT magnitude computation (simplified)
    const fftSize = frame.length;
    const powerSpectrum = new Float32Array(fftSize / 2);

    for (let k = 0; k < powerSpectrum.length; k++) {
      let real = 0;
      let imag = 0;

      for (let n = 0; n < fftSize; n++) {
        const angle = (-2 * Math.PI * k * n) / fftSize;
        real += frame[n] * Math.cos(angle);
        imag += frame[n] * Math.sin(angle);
      }

      powerSpectrum[k] = real * real + imag * imag;
    }

    return powerSpectrum;
  }

  private applyMelFilterbank(
    powerSpectrum: Float32Array,
    sampleRate: number,
    nFft: number,
  ): Float32Array {
    const numFilters = 26; // Standard number of mel filters
    const melFilters = new Float32Array(numFilters);

    // Convert power spectrum to mel scale
    const minMel = this.hzToMel(0);
    const maxMel = this.hzToMel(sampleRate / 2);

    // Create mel filterbank
    const melPoints = new Float32Array(numFilters + 2);
    for (let i = 0; i < melPoints.length; i++) {
      melPoints[i] = this.melToHz(minMel + ((maxMel - minMel) * i) / (numFilters + 1));
    }

    // Convert mel points to FFT bin indices
    const fftPoints = new Uint32Array(melPoints.length);
    for (let i = 0; i < fftPoints.length; i++) {
      fftPoints[i] = Math.floor(((nFft + 1) * melPoints[i]) / sampleRate);
    }

    // Apply triangular filters
    for (let m = 1; m <= numFilters; m++) {
      let filterSum = 0;
      const leftEdge = fftPoints[m - 1];
      const center = fftPoints[m];
      const rightEdge = fftPoints[m + 1];

      for (let k = leftEdge; k < center; k++) {
        if (k < powerSpectrum.length) {
          filterSum += powerSpectrum[k] * ((k - leftEdge) / (center - leftEdge));
        }
      }

      for (let k = center; k < rightEdge; k++) {
        if (k < powerSpectrum.length) {
          filterSum += powerSpectrum[k] * ((rightEdge - k) / (rightEdge - center));
        }
      }

      melFilters[m - 1] = Math.log(Math.max(filterSum, 1e-10)); // Log mel spectrum
    }

    return melFilters;
  }

  private hzToMel(hz: number): number {
    return 2595 * Math.log10(1 + hz / 700);
  }

  private melToHz(mel: number): number {
    return 700 * (Math.pow(10, mel / 2595) - 1);
  }

  private calculateMean(array: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
      sum += array[i];
    }
    return sum / array.length;
  }

  private calculateStd(array: Float32Array, mean: number): number {
    let sumSquaredDiff = 0;
    for (let i = 0; i < array.length; i++) {
      const diff = array[i] - mean;
      sumSquaredDiff += diff * diff;
    }
    return Math.sqrt(sumSquaredDiff / array.length);
  }

  private arrayMax(array: Float32Array): number {
    let max = array[0];
    for (let i = 1; i < array.length; i++) {
      if (array[i] > max) {
        max = array[i];
      }
    }
    return max;
  }

  private arrayMin(array: Float32Array): number {
    let min = array[0];
    for (let i = 1; i < array.length; i++) {
      if (array[i] < min) {
        min = array[i];
      }
    }
    return min;
  }
}

export default RandomForestWakeWordEngine.instance;
