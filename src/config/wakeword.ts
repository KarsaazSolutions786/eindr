import { WakeWordConfig } from '../types/wakeword';

/**
 * Dynamic Wake Word Detection Configuration
 * Flexible settings for runtime-configurable wake word detection with TensorFlow Lite
 */

// Performance configuration for production use
export const PERFORMANCE_CONFIG = {
  // Always-listening settings
  processingInterval: 100, // Process audio every 100ms for real-time detection
  ringBufferSize: 16000, // 1 second of audio at 16kHz
  frameLength: 1024, // Audio frame size for processing
  hopLength: 512, // Hop length for feature extraction

  // TensorFlow Lite optimization
  numThreads: 2, // Number of CPU threads for inference
  useGPU: false, // GPU acceleration (if available)
  useHexagon: false, // Hexagon DSP acceleration (Android)

  // Memory management
  maxAudioBufferSize: 160000, // 10 seconds of audio at 16kHz
  modelWarmupIterations: 3, // Warmup runs for consistent inference timing

  // Detection optimization
  confidenceHistoryLength: 5, // Number of recent confidence scores to track
  minimumDetectionInterval: 1000, // Minimum time between detections (ms)

  // Low-power mode settings
  backgroundProcessingInterval: 200, // Slower processing when app is backgrounded
  sleepModeThreshold: 300000, // Enter sleep mode after 5 minutes of inactivity
} as const;

// Default configuration for production wake word detection
export const DEFAULT_WAKEWORD_CONFIG: WakeWordConfig = {
  // Audio settings optimized for TensorFlow Lite model
  sampleRate: 16000, // Required by most TFLite models
  channels: 1, // Mono audio
  bitsPerSample: 16,
  bufferSize: 4096, // Audio buffer size for capture

  // Wake word detection - configurable at runtime
  confidenceThreshold: 0.7, // Default threshold for wake word detection
  enableMultipleWakeWords: true, // Support multiple wake words
  wakeWords: [], // Empty by default - set dynamically

  // Individual wake word thresholds - configurable per wake word
  wakeWordThresholds: {}, // Empty by default - set dynamically

  // Voice command recording
  maxRecordingDuration: 10000, // 10 seconds maximum
  silenceTimeout: 800, // Stop recording after 800ms of silence
  enableVAD: true, // Voice Activity Detection for auto-stop

  // Audio processing
  enablePreEmphasis: true,
  preEmphasisCoefficient: 0.97,
  enableNoiseReduction: true,
  noiseGateThreshold: 0.01,

  // MFCC feature extraction (optimized for TensorFlow Lite)
  numMFCC: 13, // Number of MFCC coefficients
  numMelFilters: 26, // Number of mel filters
  fftSize: 512, // FFT size for spectral analysis
  windowType: 'hann', // Window function

  // TensorFlow Lite model settings
  modelInputShape: [1, 29, 13], // Batch, time, features (configurable)
  modelOutputShape: [1, 1], // Single output for binary classification
  normalizeInput: true, // Normalize MFCC features

  // Always-listening behavior
  enableAlwaysListening: true,
  startListeningOnInit: false, // Manual start for better UX
  resumeAfterDetection: true, // Automatically resume listening

  // Feedback and UX
  enableHaptics: true,
  enableAudioFeedback: false, // Disabled to prevent feedback loops
  hapticPattern: 'impactLight',

  // Performance and power management
  enableLowPowerMode: true,
  adaptiveProcessing: true, // Adjust processing based on device performance
  thermalThrottling: true, // Reduce processing when device gets hot

  // Error handling and recovery
  maxConsecutiveErrors: 5, // Restart after 5 consecutive errors
  errorRecoveryDelay: 2000, // Wait 2 seconds before recovery
  enableAutomaticRestart: true,

  // Logging and debugging
  enableDetailedLogging: true,
  logPerformanceMetrics: true,
  logAudioLevel: false, // Can be enabled for debugging

  // Security and privacy
  enableLocalProcessing: true, // Process everything on-device when possible
  clearAudioAfterProcessing: true, // Clear audio data after use

  // API settings
  apiTimeout: 30000, // 30 seconds for voice-to-text API
  apiRetries: 3,
  enableOfflineMode: false, // Future feature for offline processing
};

// Utility functions for dynamic wake word management
export const WakeWordUtils = {
  /**
   * Add a wake word with configuration
   */
  addWakeWord: (
    config: WakeWordConfig,
    wakeWord: string,
    threshold: number = 0.7,
    expectedAccuracy: number = 0.85,
    commonFalsePositives: string[] = [],
  ): WakeWordConfig => {
    const newConfig = { ...config };

    // Add to wake words array if not already present
    if (!newConfig.wakeWords.includes(wakeWord)) {
      newConfig.wakeWords = [...newConfig.wakeWords, wakeWord];
    }

    // Set threshold
    newConfig.wakeWordThresholds = {
      ...newConfig.wakeWordThresholds,
      [wakeWord]: threshold,
    };

    return newConfig;
  },

  /**
   * Remove a wake word
   */
  removeWakeWord: (config: WakeWordConfig, wakeWord: string): WakeWordConfig => {
    const newConfig = { ...config };

    // Remove from wake words array
    newConfig.wakeWords = newConfig.wakeWords.filter(w => w !== wakeWord);

    // Remove threshold configuration
    const { [wakeWord]: removed, ...remainingThresholds } = newConfig.wakeWordThresholds || {};
    newConfig.wakeWordThresholds = remainingThresholds;

    return newConfig;
  },

  /**
   * Update wake word threshold
   */
  updateThreshold: (
    config: WakeWordConfig,
    wakeWord: string,
    threshold: number,
  ): WakeWordConfig => {
    const newConfig = { ...config };

    if (newConfig.wakeWords.includes(wakeWord)) {
      newConfig.wakeWordThresholds = {
        ...newConfig.wakeWordThresholds,
        [wakeWord]: threshold,
      };
    }

    return newConfig;
  },

  /**
   * Set multiple wake words at once
   */
  setWakeWords: (
    config: WakeWordConfig,
    wakeWords: Array<{ word: string; threshold?: number }>,
  ): WakeWordConfig => {
    const newConfig = { ...config };

    newConfig.wakeWords = wakeWords.map(w => w.word);
    newConfig.wakeWordThresholds = wakeWords.reduce(
      (thresholds, w) => ({
        ...thresholds,
        [w.word]: w.threshold || 0.7,
      }),
      {},
    );

    return newConfig;
  },

  /**
   * Get threshold for a specific wake word
   */
  getThreshold: (config: WakeWordConfig, wakeWord: string): number => {
    return config.wakeWordThresholds?.[wakeWord] || config.confidenceThreshold;
  },
};

// Error codes for comprehensive error handling
export const ERROR_CODES = {
  // Initialization errors
  MODEL_LOAD_FAILED: 'MODEL_LOAD_FAILED',
  AUDIO_INIT_FAILED: 'AUDIO_INIT_FAILED',
  PERMISSIONS_DENIED: 'PERMISSIONS_DENIED',

  // Runtime errors
  AUDIO_RECORDING_FAILED: 'AUDIO_RECORDING_FAILED',
  MODEL_INFERENCE_FAILED: 'MODEL_INFERENCE_FAILED',
  FEATURE_EXTRACTION_FAILED: 'FEATURE_EXTRACTION_FAILED',

  // Permission errors
  MICROPHONE_PERMISSION_DENIED: 'MICROPHONE_PERMISSION_DENIED',
  STORAGE_PERMISSION_DENIED: 'STORAGE_PERMISSION_DENIED',

  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',

  // Hardware errors
  MICROPHONE_NOT_AVAILABLE: 'MICROPHONE_NOT_AVAILABLE',
  INSUFFICIENT_MEMORY: 'INSUFFICIENT_MEMORY',
  THERMAL_THROTTLING: 'THERMAL_THROTTLING',

  // Configuration errors
  INVALID_CONFIGURATION: 'INVALID_CONFIGURATION',
  UNSUPPORTED_AUDIO_FORMAT: 'UNSUPPORTED_AUDIO_FORMAT',
  UNSUPPORTED_SAMPLE_RATE: 'UNSUPPORTED_SAMPLE_RATE',
} as const;

// API configuration for backend integration
export const API_CONFIG = {
  // Voice-to-text endpoints
  voiceToText: '/api/v1/stt/transcribe-and-respond',
  health: '/api/health',

  // Default settings
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,

  // Request headers
  userAgent: 'Eindr-Mobile/1.0',
  acceptLanguage: 'en-US,en;q=0.9',

  // File upload limits
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFormats: ['wav', 'mp3', 'opus'],

  // Quality settings
  compressionQuality: 0.8, // For lossy formats
  enableCompression: true,
} as const;

// Model configuration for TensorFlow Lite
export const MODEL_CONFIG = {
  // Model file information
  fileName: 'gru.tflite',
  expectedSize: 19456, // Expected file size in bytes
  version: '1.0',

  // Model architecture
  modelType: 'GRU', // Gated Recurrent Unit
  inputType: 'float32',
  outputType: 'float32',

  // Preprocessing requirements
  requiresNormalization: true,
  normalizationMean: 0.0,
  normalizationStd: 1.0,

  // Input specifications
  expectedSampleRate: 16000,
  expectedChannels: 1,
  expectedDuration: 1.0, // 1 second windows

  // Feature extraction
  mfccConfig: {
    numCoefficients: 13,
    numFilters: 26,
    frameLength: 25, // 25ms frames
    frameShift: 10, // 10ms shifts
    preemphasis: 0.97,
    windowType: 'hann',
  },

  // Model outputs
  outputInterpretation: {
    threshold: 0.5, // Base threshold (can be overridden per wake word)
    confidenceMapping: 'sigmoid', // Output activation function
    multiclass: false, // Binary classification
  },

  // Performance characteristics
  averageInferenceTime: 5, // Expected inference time in milliseconds
  memoryUsage: 2 * 1024 * 1024, // Expected memory usage (2MB)
  cpuUsage: 'low', // Expected CPU usage level
} as const;

// Development and testing configurations
export const DEV_CONFIG = {
  // Debug features
  enableVerboseLogging: true,
  logAudioData: false, // Only enable for specific debugging
  saveAudioFiles: false, // Save audio for analysis

  // Testing helpers
  simulateErrors: false, // Randomly inject errors for testing
  errorRate: 0.1, // Error rate when simulation is enabled

  // Performance monitoring
  trackMemoryUsage: true,
  trackCPUUsage: true,
  trackBatteryUsage: true,
} as const;

// Production optimization presets
export const OPTIMIZATION_PRESETS = {
  // High performance mode (for flagship devices)
  performance: {
    processingInterval: 50, // 50ms for ultra-responsive detection
    confidenceThreshold: 0.65, // Lower threshold for better detection
    enableGPU: true,
    numThreads: 4,
  },

  // Balanced mode (default for most devices)
  balanced: {
    processingInterval: 100, // 100ms processing
    confidenceThreshold: 0.7, // Standard threshold
    enableGPU: false,
    numThreads: 2,
  },

  // Battery saver mode (for older devices or low battery)
  batterySaver: {
    processingInterval: 200, // 200ms for reduced CPU usage
    confidenceThreshold: 0.75, // Higher threshold to reduce false positives
    enableGPU: false,
    numThreads: 1,
  },
} as const;
