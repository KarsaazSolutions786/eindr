/**
 * Production-grade Wake Word Detection Types
 * Comprehensive type definitions for always-listening wake word detection system
 */

// Core wake word detection types
export interface WakeWordDetection {
  wakeWord: string;
  confidence: number;
  timestamp: number;
  audioLength: number;
  audioBuffer?: AudioBuffer;
  metadata?: {
    processingTime: number;
    modelVersion: string;
    detectionMethod: 'local' | 'cloud';
  };
}

export interface VoiceCommand {
  text: string;
  audioData: Uint8Array;
  duration: number;
  timestamp: number;
  confidence?: number;
  language?: string;
  intent?: string;
  entities?: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
}

// Audio buffer interface
export interface AudioBuffer {
  data: Float32Array;
  sampleRate: number;
  channels: number;
  duration: number;
  timestamp?: number;
  format?: 'float32' | 'int16' | 'int32';
}

// Comprehensive wake word configuration
export interface WakeWordConfig {
  // Audio configuration
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
  bufferSize: number;

  // Wake word detection
  confidenceThreshold: number;
  enableMultipleWakeWords: boolean;
  wakeWords: string[];
  wakeWordThresholds?: Record<string, number>;

  // Voice command recording
  maxRecordingDuration: number;
  silenceTimeout: number;
  enableVAD: boolean;
  /**
   * Voice activity detector sensitivity (1 = default)
   */
  vadSensitivity: number;

  // Audio processing
  enablePreEmphasis: boolean;
  preEmphasisCoefficient: number;
  enableNoiseReduction: boolean;
  noiseGateThreshold: number;

  // MFCC feature extraction
  numMFCC: number;
  numMelFilters: number;
  fftSize: number;
  windowType: 'hann' | 'hamming' | 'blackman' | 'bartlett';

  // TensorFlow Lite model settings
  modelInputShape: number[];
  modelOutputShape: number[];
  normalizeInput: boolean;

  // Always-listening behavior
  enableAlwaysListening: boolean;
  startListeningOnInit: boolean;
  resumeAfterDetection: boolean;

  // Feedback and UX
  enableHaptics: boolean;
  enableAudioFeedback: boolean;
  hapticPattern: 'impactLight' | 'impactMedium' | 'impactHeavy' | 'notificationSuccess';

  // Performance and power management
  enableLowPowerMode: boolean;
  adaptiveProcessing: boolean;
  thermalThrottling: boolean;

  // Error handling and recovery
  maxConsecutiveErrors: number;
  errorRecoveryDelay: number;
  enableAutomaticRestart: boolean;

  // Logging and debugging
  enableDetailedLogging: boolean;
  logPerformanceMetrics: boolean;
  logAudioLevel: boolean;

  // Security and privacy
  enableLocalProcessing: boolean;
  clearAudioAfterProcessing: boolean;

  // API settings
  apiTimeout: number;
  apiRetries: number;
  enableOfflineMode: boolean;
}

// Wake word engine states
export enum WakeWordState {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  LISTENING = 'listening',
  DETECTED = 'detected',
  RECORDING = 'recording',
  PROCESSING = 'processing',
  ERROR = 'error',
  SLEEPING = 'sleeping', // Low-power mode
  DISABLED = 'disabled',
}

// Comprehensive callback interface
export interface WakeWordCallbacks {
  // Core detection events
  onWakeWordDetected?: (detection: WakeWordDetection) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: (command: VoiceCommand) => void;
  onRecordingProgress?: (duration: number, energy: number) => void;

  // State change events
  onStateChange?: (oldState: WakeWordState, newState: WakeWordState) => void;
  onListeningStart?: () => void;
  onListeningStop?: () => void;

  // Error handling
  onError?: (error: WakeWordError) => void;
  onRecovery?: (error: WakeWordError) => void;

  // Performance monitoring
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;
  onModelInference?: (inferenceTime: number, confidence: number) => void;

  // Voice activity detection
  onVoiceActivityStart?: () => void;
  onVoiceActivityEnd?: () => void;
  onSilenceDetected?: (duration: number) => void;

  // Audio level monitoring
  onAudioLevel?: (level: number, isSpeech: boolean) => void;

  // Power management
  onLowPowerModeStart?: () => void;
  onLowPowerModeEnd?: () => void;
  onThermalThrottling?: (level: 'warning' | 'critical') => void;

  // Network events
  onNetworkStatusChange?: (isOnline: boolean) => void;
  onAPIResponse?: (response: any, processingTime: number) => void;
}

// Error handling
export interface WakeWordError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  retryable?: boolean;
  recoveryAction?: string;
}

// Performance monitoring
export interface PerformanceMetrics {
  // Processing performance
  averageInferenceTime: number;
  maxInferenceTime: number;
  minInferenceTime: number;
  totalInferences: number;

  // Detection performance
  totalDetections: number;
  truePositives: number;
  falsePositives: number;
  accuracy: number;

  // System performance
  cpuUsage: number;
  memoryUsage: number;
  batteryUsage?: number;
  thermalState: 'normal' | 'warm' | 'hot' | 'critical';

  // Audio performance
  audioDropouts: number;
  bufferUnderruns: number;
  averageAudioLevel: number;

  // Network performance
  apiCallCount: number;
  averageApiResponseTime: number;
  networkErrors: number;

  // Timing
  uptime: number;
  lastUpdated: number;
}

// Permission status
export interface PermissionStatus {
  microphone: boolean;
  storage?: boolean;
  notifications?: boolean;
}

// Device capabilities
export interface DeviceCapabilities {
  // Audio capabilities
  maxSampleRate: number;
  supportedFormats: string[];
  hasNoiseCancellation: boolean;
  hasEchoCancellation: boolean;

  // Processing capabilities
  cpuCores: number;
  availableMemory: number;
  hasGPU: boolean;
  hasNPU: boolean; // Neural Processing Unit
  hasDSP: boolean; // Digital Signal Processor

  // Platform specific
  platform: 'ios' | 'android';
  osVersion: string;
  deviceModel: string;

  // Features
  supportsTensorFlowLite: boolean;
  supportsBackgroundProcessing: boolean;
  supportsLowLatencyAudio: boolean;
}

// Model information
export interface ModelInfo {
  name: string;
  version: string;
  filePath: string;
  fileSize: number;
  checksum?: string;
  architecture: 'GRU' | 'LSTM' | 'CNN' | 'Transformer';
  inputShape: number[];
  outputShape: number[];
  quantization?: 'float32' | 'float16' | 'int8';
  supportedWakeWords: string[];
  trainingData?: {
    language: string;
    speakers: number;
    hours: number;
    accuracy: number;
  };
}

// Audio processing options
export interface AudioProcessingOptions {
  // Preprocessing
  enablePreEmphasis: boolean;
  preEmphasisCoefficient: number;
  enableNormalization: boolean;
  normalizationMethod: 'peak' | 'rms' | 'lufs';

  // Noise reduction
  enableNoiseReduction: boolean;
  noiseReductionStrength: number;
  enableNoiseGate: boolean;
  noiseGateThreshold: number;

  // Filtering
  enableHighPassFilter: boolean;
  highPassCutoff: number;
  enableLowPassFilter: boolean;
  lowPassCutoff: number;

  // Dynamic range
  enableCompression: boolean;
  compressionRatio: number;
  enableLimiting: boolean;
  limitingThreshold: number;
}

// MFCC configuration
export interface MFCCConfig {
  numCoefficients: number;
  numFilters: number;
  frameLength: number; // in ms
  frameShift: number; // in ms
  preemphasis: number;
  windowType: 'hann' | 'hamming' | 'blackman';
  fMin: number;
  fMax: number;
  lifterCoeff?: number;
  useEnergy: boolean;
  energyFloor: number;
}

// Real-time audio configuration
export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
  bufferSize: number;
  latency: 'low' | 'medium' | 'high';
  enableEchoCancellation: boolean;
  enableNoiseSuppression: boolean;
  enableAutomaticGainControl: boolean;
}

// API response interfaces
export interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  requestId?: string;
  processingTime?: number;
  metadata?: {
    apiVersion: string;
    modelUsed: string;
    confidence: number;
    alternatives?: any[];
  };
}

// Voice activity detection configuration
export interface VADConfig {
  energyThreshold: number;
  zeroCrossingThreshold: number;
  spectralCentroidThreshold: number;
  hangtimeMs: number; // Time to keep detecting speech after it stops
  silenceTimeoutMs: number;
  adaptiveThreshold: boolean;
  noiseFloor: number;
}

// Background processing configuration
export interface BackgroundConfig {
  enableBackgroundMode: boolean;
  backgroundProcessingInterval: number;
  maxBackgroundTime: number; // Maximum time to run in background
  enableWakeOnDetection: boolean;
  backgroundNotificationTitle: string;
  backgroundNotificationText: string;
}

// Cloud integration configuration
export interface CloudConfig {
  enableCloudProcessing: boolean;
  cloudEndpoint: string;
  apiKey: string;
  fallbackToLocal: boolean;
  cloudTimeout: number;
  enableCloudTraining: boolean; // Allow model improvement
  dataRetention: 'none' | 'anonymous' | 'full';
}

// Security configuration
export interface SecurityConfig {
  enableEncryption: boolean;
  encryptionKey?: string;
  enableAudioHashing: boolean;
  enableAnonymization: boolean;
  dataRetentionDays: number;
  enableAuditLogging: boolean;
  requireAuthentication: boolean;
}

// Development and testing interfaces
export interface TestingConfig {
  enableMockMode: boolean;
  mockLatency: number;
  mockAccuracy: number;
  simulateErrors: boolean;
  errorRate: number;
  enablePerformanceTests: boolean;
  enableStressTests: boolean;
}

// Export utility types
export type WakeWordEventType =
  | 'detection'
  | 'recording_start'
  | 'recording_stop'
  | 'error'
  | 'state_change'
  | 'performance_update';

export type AudioFormat = 'wav' | 'mp3' | 'aac' | 'opus' | 'flac';

export type ProcessingMode = 'realtime' | 'batch' | 'streaming';

export type PowerMode = 'high_performance' | 'balanced' | 'power_saver' | 'ultra_low_power';

// Configuration presets
export interface ConfigPreset {
  name: string;
  description: string;
  config: Partial<WakeWordConfig>;
  targetDevice: 'flagship' | 'mid_range' | 'entry_level' | 'any';
  powerProfile: PowerMode;
  expectedAccuracy: number;
  expectedLatency: number;
}

// Advanced analytics
export interface AnalyticsData {
  sessionId: string;
  timestamp: number;
  event: WakeWordEventType;
  data: any;
  deviceInfo: DeviceCapabilities;
  environmentalFactors?: {
    noiseLevel: number;
    backgroundNoise: boolean;
    distance?: number; // Distance from microphone
    orientation?: string; // Device orientation
  };
}

// Model input features interface
export interface ModelInputFeatures {
  features: Float32Array;
  shape: number[];
}

// Audio processor interface
export interface AudioProcessor {
  processAudio(audioBuffer: AudioBuffer): ModelInputFeatures;
  extractMFCC(audioData: Float32Array, sampleRate: number): Float32Array;
  extractMFCCFeatures(audioData: Float32Array): Promise<Float32Array>;
  preEmphasis(audioData: Float32Array, alpha?: number): Float32Array;
  applyWindow(audioData: Float32Array, windowType?: 'hamming' | 'hanning'): Float32Array;
}

// Ring buffer interface
export interface RingBuffer {
  write(data: Float32Array): void;
  read(length: number): Float32Array;
  getLatestWindow(windowSize: number): Float32Array;
  clear(): void;
  getSize(): number;
  isFull(): boolean;
}

// Model manager interface
export interface ModelManager {
  loadModel(modelPath: string): Promise<void>;
  predict(features: ModelInputFeatures): Promise<number>;
  predictSync(features: ModelInputFeatures): number;
  isLoaded(): boolean;
  unload(): void;
  warmUp(): Promise<void>;
  benchmark(iterations?: number): Promise<{
    averageInferenceTime: number;
    minInferenceTime: number;
    maxInferenceTime: number;
  }>;
  getModelInfo(): {
    loaded: boolean;
    inputShape: number[];
    outputShape: number[];
  };
}

// Export all types for convenience
export * from './wakeword';
