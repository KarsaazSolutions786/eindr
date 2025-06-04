/**
 * Voice Activity Detector (VAD)
 * Detects voice activity and silence periods for automatic recording control
 * Implements energy-based detection with configurable thresholds
 */

export interface VADConfig {
  sampleRate: number;
  frameSize: number;
  energyThreshold: number;
  silenceTimeout: number;
  hangoverTime?: number; // Time to continue recording after speech ends
  preEmphasis?: number; // Pre-emphasis filter coefficient
  /** Sensitivity factor (1 = default) */
  sensitivity?: number;
}

export interface VADResult {
  isSpeech: boolean;
  energy: number;
  timestamp: number;
}

export class VoiceActivityDetector {
  private config: VADConfig;
  private isRunning: boolean = false;
  private silenceStartTime: number = 0;
  private lastSpeechTime: number = 0;
  private energyBuffer: number[] = [];
  private callbacks: {
    onSpeechStart?: () => void;
    onSpeechEnd?: () => void;
    onSilenceDetected?: (duration: number) => void;
    onEnergyUpdate?: (energy: number) => void;
  } = {};

  // Pre-emphasis filter state
  private preEmphasisState: number = 0;

  // Adaptive threshold
  private backgroundNoise: number = 0;
  private noiseUpdateRate: number = 0.01;

  constructor(config: VADConfig) {
    this.config = {
      hangoverTime: 300, // 300ms hangover by default
      preEmphasis: 0.97,
      sensitivity: 1,
      ...config,
    };

    console.log('🎙️ VAD: Voice Activity Detector initialized');
    console.log(`🎙️ VAD: Energy threshold: ${this.config.energyThreshold}`);
    console.log(`🎙️ VAD: Silence timeout: ${this.config.silenceTimeout}ms`);
    console.log(`🎙️ VAD: Sensitivity: ${this.config.sensitivity}`);
  }

  /**
   * Start voice activity detection
   */
  start(): void {
    if (this.isRunning) {
      console.warn('⚠️ VAD: Already running');
      return;
    }

    this.isRunning = true;
    this.silenceStartTime = 0;
    this.lastSpeechTime = Date.now();
    this.energyBuffer = [];
    this.backgroundNoise = 0;
    this.preEmphasisState = 0;

    console.log('🎙️ VAD: Started voice activity detection');
  }

  /**
   * Stop voice activity detection
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    this.silenceStartTime = 0;
    this.energyBuffer = [];

    console.log('🎙️ VAD: Stopped voice activity detection');
  }

  /**
   * Process audio frame for voice activity detection
   */
  processFrame(audioData: Float32Array): VADResult {
    if (!this.isRunning) {
      return {
        isSpeech: false,
        energy: 0,
        timestamp: Date.now(),
      };
    }

    const now = Date.now();

    // Apply pre-emphasis filter
    const preEmphasized = this.applyPreEmphasis(audioData);

    // Calculate frame energy (RMS)
    const energy = this.calculateRMSEnergy(preEmphasized);

    // Update background noise estimate
    this.updateBackgroundNoise(energy);

    // Determine speech activity
    const sensitivity = this.config.sensitivity || 1;
    const baselineThreshold = this.config.energyThreshold / sensitivity;
    const adaptiveThreshold = Math.max(
      baselineThreshold,
      this.backgroundNoise * 2,
    );

    const isSpeech = energy > adaptiveThreshold;

    // Track speech/silence timing
    if (isSpeech) {
      this.lastSpeechTime = now;

      // Reset silence timer when speech is detected
      if (this.silenceStartTime > 0) {
        this.silenceStartTime = 0;
        console.log('🔊 VAD: Speech activity resumed');

        if (this.callbacks.onSpeechStart) {
          this.callbacks.onSpeechStart();
        }
      }
    } else {
      // Check for silence period
      const timeSinceLastSpeech = now - this.lastSpeechTime;

      if (timeSinceLastSpeech > (this.config.hangoverTime || 0)) {
        if (this.silenceStartTime === 0) {
          this.silenceStartTime = now;
          console.log('🔇 VAD: Silence period started');

          if (this.callbacks.onSpeechEnd) {
            this.callbacks.onSpeechEnd();
          }
        } else {
          const silenceDuration = now - this.silenceStartTime;

          if (silenceDuration >= this.config.silenceTimeout) {
            console.log(`🔇 VAD: Silence detected (${silenceDuration}ms)`);

            if (this.callbacks.onSilenceDetected) {
              this.callbacks.onSilenceDetected(silenceDuration);
            }

            // Reset for next detection
            this.silenceStartTime = 0;
          }
        }
      }
    }

    // Update energy buffer for averaging
    this.energyBuffer.push(energy);
    if (this.energyBuffer.length > 10) {
      this.energyBuffer.shift();
    }

    // Notify energy update
    if (this.callbacks.onEnergyUpdate) {
      this.callbacks.onEnergyUpdate(energy);
    }

    const result: VADResult = {
      isSpeech,
      energy,
      timestamp: now,
    };

    // Log detailed VAD state every 100ms for debugging
    if (now % 100 < 50) {
      console.log(
        `🔄 VAD: Energy: ${energy.toFixed(4)}, ` +
          `Threshold: ${adaptiveThreshold.toFixed(4)}, ` +
          `Speech: ${isSpeech}, ` +
          `Silence: ${this.silenceStartTime > 0 ? now - this.silenceStartTime : 0}ms`,
      );
    }

    return result;
  }

  /**
   * Apply pre-emphasis filter to reduce low-frequency noise
   */
  private applyPreEmphasis(audioData: Float32Array): Float32Array {
    if (!this.config.preEmphasis || this.config.preEmphasis === 0) {
      return audioData;
    }

    const filtered = new Float32Array(audioData.length);

    for (let i = 0; i < audioData.length; i++) {
      const current = audioData[i];
      filtered[i] = current - this.config.preEmphasis * this.preEmphasisState;
      this.preEmphasisState = current;
    }

    return filtered;
  }

  /**
   * Calculate RMS (Root Mean Square) energy of audio frame
   */
  private calculateRMSEnergy(audioData: Float32Array): number {
    if (audioData.length === 0) {
      return 0;
    }

    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }

    return Math.sqrt(sum / audioData.length);
  }

  /**
   * Update background noise estimate using exponential smoothing
   */
  private updateBackgroundNoise(energy: number): void {
    if (this.backgroundNoise === 0) {
      // Initialize with first energy value
      this.backgroundNoise = energy;
    } else {
      // Only update if energy is below current estimate (likely background noise)
      if (energy < this.backgroundNoise * 1.5) {
        this.backgroundNoise =
          (1 - this.noiseUpdateRate) * this.backgroundNoise + this.noiseUpdateRate * energy;
      }
    }
  }

  /**
   * Set callbacks for VAD events
   */
  setCallbacks(callbacks: {
    onSpeechStart?: () => void;
    onSpeechEnd?: () => void;
    onSilenceDetected?: (duration: number) => void;
    onEnergyUpdate?: (energy: number) => void;
  }): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Get current VAD statistics
   */
  getStats(): {
    isRunning: boolean;
    backgroundNoise: number;
    averageEnergy: number;
    currentSilenceDuration: number;
  } {
    const averageEnergy =
      this.energyBuffer.length > 0
        ? this.energyBuffer.reduce((sum, e) => sum + e, 0) / this.energyBuffer.length
        : 0;

    const currentSilenceDuration =
      this.silenceStartTime > 0 ? Date.now() - this.silenceStartTime : 0;

    return {
      isRunning: this.isRunning,
      backgroundNoise: this.backgroundNoise,
      averageEnergy,
      currentSilenceDuration,
    };
  }

  /**
   * Update VAD configuration
   */
  updateConfig(newConfig: Partial<VADConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 VAD: Configuration updated');
  }

  /**
   * Reset VAD state
   */
  reset(): void {
    this.silenceStartTime = 0;
    this.lastSpeechTime = Date.now();
    this.energyBuffer = [];
    this.backgroundNoise = 0;
    this.preEmphasisState = 0;
    console.log('🔄 VAD: State reset');
  }

  /**
   * Check if currently in silence period
   */
  isInSilence(): boolean {
    return this.silenceStartTime > 0;
  }

  /**
   * Get time since last speech activity
   */
  getTimeSinceLastSpeech(): number {
    return Date.now() - this.lastSpeechTime;
  }

  /**
   * Force trigger silence detection (for testing/emergency stop)
   */
  forceSilenceDetection(): void {
    if (this.callbacks.onSilenceDetected) {
      console.log('🛑 VAD: Forced silence detection triggered');
      this.callbacks.onSilenceDetected(this.config.silenceTimeout);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stop();
    this.callbacks = {};
    this.energyBuffer = [];
    console.log('🧹 VAD: Cleanup completed');
  }
}
