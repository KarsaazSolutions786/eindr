// Core engine and types
export { WakeWordEngine } from './WakeWordEngine';
export * from '../types/wakeword';
export * from '../config/wakeword';

// React hook
export { useWakeWord } from '../hooks/useWakeWord';

// UI components
export { WakeWordButton } from './components/WakeWordButton';
export { WakeWordInterface } from './components/WakeWordInterface';
export { QuickWakeWordTest } from './components/QuickTest';

// Audio processing
export { RingBuffer } from './audio/RingBuffer';
export { AudioProcessor } from './audio/AudioProcessor';

// Model management
export { ModelManager } from './native/ModelManager';

// API integration
export { VoiceToTextAPI } from './api/VoiceToTextAPI';

// Re-export for convenience
export {
  DEFAULT_WAKEWORD_CONFIG,
  MODEL_CONFIG,
  PERFORMANCE_CONFIG,
  ERROR_CODES,
  API_CONFIG,
} from '../config/wakeword';

export {
  WakeWordState,
  type WakeWordConfig,
  type WakeWordDetection,
  type VoiceCommand,
  type WakeWordError,
  type WakeWordCallbacks,
  type AudioBuffer,
  type ModelInputFeatures,
} from '../types/wakeword';
