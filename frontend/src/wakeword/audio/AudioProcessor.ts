import {
  AudioProcessor as IAudioProcessor,
  AudioBuffer,
  ModelInputFeatures,
} from '../../types/wakeword';
import { PERFORMANCE_CONFIG, MODEL_CONFIG } from '../../config/wakeword';

/**
 * Audio processor for extracting features from raw audio data
 * Implements MFCC feature extraction compatible with Mycroft Precise
 */
export class AudioProcessor implements IAudioProcessor {
  private readonly sampleRate: number;
  private readonly frameLength: number;
  private readonly frameShift: number;
  private readonly nMfcc: number;
  private readonly nMels: number;
  private readonly fMin: number;
  private readonly fMax: number;
  private readonly preEmphasisAlpha: number;

  constructor(sampleRate: number = 16000) {
    this.sampleRate = sampleRate;
    this.frameLength = PERFORMANCE_CONFIG.frameLength;
    this.frameShift = PERFORMANCE_CONFIG.hopLength;
    this.nMfcc = MODEL_CONFIG.mfccConfig.numCoefficients;
    this.nMels = MODEL_CONFIG.mfccConfig.numFilters;
    this.fMin = 0;
    this.fMax = sampleRate / 2;
    this.preEmphasisAlpha = MODEL_CONFIG.mfccConfig.preemphasis;
  }

  /**
   * Process raw audio into features for model inference
   */
  processAudio(audioBuffer: AudioBuffer): ModelInputFeatures {
    let audioData = audioBuffer.data;

    // Resample if necessary
    if (audioBuffer.sampleRate !== this.sampleRate) {
      audioData = this.resample(audioData, audioBuffer.sampleRate, this.sampleRate);
    }

    // Apply pre-emphasis
    audioData = this.preEmphasis(audioData, this.preEmphasisAlpha);

    // Extract MFCC features
    const mfccFeatures = this.extractMFCC(audioData, this.sampleRate);

    // Calculate sequence length based on expected duration (1 second window)
    const expectedFrames = 29; // For 1 second at 16kHz with 25ms frames and 10ms shifts
    const featuresPerFrame = this.nMfcc;

    // Ensure we have enough features for the model
    const totalFeatures = expectedFrames * featuresPerFrame;
    const features = new Float32Array(totalFeatures);

    if (mfccFeatures.length >= totalFeatures) {
      // Take the most recent features
      const startIndex = mfccFeatures.length - totalFeatures;
      features.set(mfccFeatures.slice(startIndex));
    } else {
      // Pad with zeros if we don't have enough features
      features.set(mfccFeatures);
      // The rest remains zero-filled
    }

    return {
      features,
      shape: [1, expectedFrames, featuresPerFrame], // [batch, time, features]
    };
  }

  /**
   * Extract MFCC features from audio data (async version)
   */
  async extractMFCCFeatures(audioData: Float32Array): Promise<Float32Array> {
    return this.extractMFCC(audioData, this.sampleRate);
  }

  /**
   * Extract MFCC features from audio data
   */
  extractMFCC(audioData: Float32Array, sampleRate: number): Float32Array {
    // Get magnitude spectrogram
    const spectrogram = this.getMagnitudeSpectrogram(audioData);

    // Convert to mel scale
    const melSpectrogram = this.toMelScale(spectrogram);

    // Apply log
    const logMelSpectrogram = this.applyLog(melSpectrogram);

    // Apply DCT to get MFCC
    const mfccFeatures = this.applyDCT(logMelSpectrogram);

    return mfccFeatures;
  }

  /**
   * Apply pre-emphasis filter
   */
  preEmphasis(audioData: Float32Array, alpha: number = 0.97): Float32Array {
    const result = new Float32Array(audioData.length);
    result[0] = audioData[0];

    for (let i = 1; i < audioData.length; i++) {
      result[i] = audioData[i] - alpha * audioData[i - 1];
    }

    return result;
  }

  /**
   * Apply windowing function (Hamming window)
   */
  applyWindow(
    audioData: Float32Array,
    windowType: 'hamming' | 'hanning' = 'hamming',
  ): Float32Array {
    const result = new Float32Array(audioData.length);
    const length = audioData.length;

    for (let i = 0; i < length; i++) {
      let windowValue: number;

      if (windowType === 'hamming') {
        windowValue = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (length - 1));
      } else {
        // hanning
        windowValue = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (length - 1)));
      }

      result[i] = audioData[i] * windowValue;
    }

    return result;
  }

  /**
   * Simple resampling using linear interpolation
   * For production use, consider using a proper resampling library
   */
  private resample(audioData: Float32Array, fromRate: number, toRate: number): Float32Array {
    if (fromRate === toRate) return audioData;

    const ratio = fromRate / toRate;
    const outputLength = Math.floor(audioData.length / ratio);
    const result = new Float32Array(outputLength);

    for (let i = 0; i < outputLength; i++) {
      const srcIndex = i * ratio;
      const srcIndexFloor = Math.floor(srcIndex);
      const srcIndexCeil = Math.min(srcIndexFloor + 1, audioData.length - 1);
      const t = srcIndex - srcIndexFloor;

      result[i] = audioData[srcIndexFloor] * (1 - t) + audioData[srcIndexCeil] * t;
    }

    return result;
  }

  /**
   * Get magnitude spectrogram using FFT
   * Simplified implementation - for production, use a proper FFT library
   */
  private getMagnitudeSpectrogram(audioData: Float32Array): Float32Array[] {
    const frames: Float32Array[] = [];
    const frameStep = this.frameShift;

    for (let i = 0; i <= audioData.length - this.frameLength; i += frameStep) {
      const frame = audioData.slice(i, i + this.frameLength);
      const windowedFrame = this.applyWindow(frame);
      const magnitude = this.fftMagnitude(windowedFrame);
      frames.push(magnitude);
    }

    return frames;
  }

  /**
   * Simplified FFT magnitude calculation
   * In production, use a proper FFT implementation like kiss-fft-js
   */
  private fftMagnitude(frame: Float32Array): Float32Array {
    const length = frame.length;
    const result = new Float32Array(Math.floor(length / 2) + 1);

    // This is a simplified implementation
    // In a real implementation, you would use proper FFT
    for (let k = 0; k < result.length; k++) {
      let real = 0;
      let imag = 0;

      for (let n = 0; n < length; n++) {
        const angle = (-2 * Math.PI * k * n) / length;
        real += frame[n] * Math.cos(angle);
        imag += frame[n] * Math.sin(angle);
      }

      result[k] = Math.sqrt(real * real + imag * imag);
    }

    return result;
  }

  /**
   * Convert magnitude spectrogram to mel scale
   */
  private toMelScale(spectrogram: Float32Array[]): Float32Array[] {
    // Create mel filter bank
    const melFilters = this.createMelFilterBank();
    const melSpectrogram: Float32Array[] = [];

    for (const frame of spectrogram) {
      const melFrame = new Float32Array(this.nMels);

      for (let i = 0; i < this.nMels; i++) {
        let sum = 0;
        for (let j = 0; j < frame.length; j++) {
          sum += frame[j] * melFilters[i][j];
        }
        melFrame[i] = sum;
      }

      melSpectrogram.push(melFrame);
    }

    return melSpectrogram;
  }

  /**
   * Create mel filter bank
   */
  private createMelFilterBank(): Float32Array[] {
    const nfft = this.frameLength;
    const nFreqs = Math.floor(nfft / 2) + 1;
    const filters: Float32Array[] = [];

    // Convert Hz to mel scale
    const melMin = this.hzToMel(this.fMin);
    const melMax = this.hzToMel(this.fMax);

    // Create mel points
    const melPoints: number[] = [];
    for (let i = 0; i <= this.nMels + 1; i++) {
      const mel = melMin + (i * (melMax - melMin)) / (this.nMels + 1);
      melPoints.push(this.melToHz(mel));
    }

    // Convert to FFT bin numbers
    const binPoints = melPoints.map(hz => Math.floor(((nfft + 1) * hz) / this.sampleRate));

    // Create triangular filters
    for (let i = 1; i <= this.nMels; i++) {
      const filter = new Float32Array(nFreqs);
      const leftBin = binPoints[i - 1];
      const centerBin = binPoints[i];
      const rightBin = binPoints[i + 1];

      for (let j = leftBin; j < centerBin; j++) {
        if (j >= 0 && j < nFreqs) {
          filter[j] = (j - leftBin) / (centerBin - leftBin);
        }
      }

      for (let j = centerBin; j < rightBin; j++) {
        if (j >= 0 && j < nFreqs) {
          filter[j] = (rightBin - j) / (rightBin - centerBin);
        }
      }

      filters.push(filter);
    }

    return filters;
  }

  /**
   * Convert Hz to mel scale
   */
  private hzToMel(hz: number): number {
    return 2595 * Math.log10(1 + hz / 700);
  }

  /**
   * Convert mel to Hz scale
   */
  private melToHz(mel: number): number {
    return 700 * (Math.pow(10, mel / 2595) - 1);
  }

  /**
   * Apply logarithm to mel spectrogram
   */
  private applyLog(melSpectrogram: Float32Array[]): Float32Array[] {
    return melSpectrogram.map(frame => {
      const logFrame = new Float32Array(frame.length);
      for (let i = 0; i < frame.length; i++) {
        logFrame[i] = Math.log(Math.max(frame[i], 1e-10)); // Avoid log(0)
      }
      return logFrame;
    });
  }

  /**
   * Apply Discrete Cosine Transform to get MFCC
   */
  private applyDCT(logMelSpectrogram: Float32Array[]): Float32Array {
    const result: number[] = [];

    for (const frame of logMelSpectrogram) {
      const mfccFrame = new Float32Array(this.nMfcc);

      for (let k = 0; k < this.nMfcc; k++) {
        let sum = 0;
        for (let n = 0; n < frame.length; n++) {
          sum += frame[n] * Math.cos((Math.PI * k * (2 * n + 1)) / (2 * frame.length));
        }
        mfccFrame[k] = sum;
      }

      result.push(...Array.from(mfccFrame));
    }

    return new Float32Array(result);
  }
}
