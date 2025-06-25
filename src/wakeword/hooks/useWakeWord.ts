import { useEffect, useState, useRef, useCallback } from 'react';
import { WakeWordEngine } from '../WakeWordEngine';
import {
  WakeWordConfig,
  WakeWordState,
  WakeWordDetection,
  VoiceCommand,
  WakeWordError,
  WakeWordCallbacks,
} from '../../types/wakeword';

interface UseWakeWordOptions {
  /** Custom configuration for wake word detection */
  config?: Partial<WakeWordConfig>;
  /** Path to the TensorFlow Lite model */
  modelPath?: any;
  /** Whether to auto-initialize the engine */
  autoInitialize?: boolean;
  /** Whether to auto-start listening after initialization */
  autoStart?: boolean;
}

interface UseWakeWordReturn {
  /** Current wake word detection state */
  state: WakeWordState;
  /** Whether the engine is initialized */
  isInitialized: boolean;
  /** Whether currently listening for wake word */
  isListening: boolean;
  /** Whether currently recording command */
  isRecording: boolean;
  /** Last detection result */
  lastDetection: WakeWordDetection | null;
  /** Last recorded command */
  lastCommand: VoiceCommand | null;
  /** Last error that occurred */
  lastError: WakeWordError | null;
  /** Current recording duration (ms) */
  recordingDuration: number;
  /** Initialize the wake word engine */
  initialize: () => Promise<void>;
  /** Start listening for wake word */
  startListening: () => Promise<void>;
  /** Stop listening for wake word */
  stopListening: () => Promise<void>;
  /** Update configuration */
  updateConfig: (newConfig: Partial<WakeWordConfig>) => void;
  /** Get current configuration */
  getConfig: () => WakeWordConfig;
  /** Cleanup resources */
  cleanup: () => Promise<void>;
  /** Get engine instance (for advanced usage) */
  engine: WakeWordEngine | null;
}

/**
 * React Hook for wake word detection
 * Provides a simple interface for integrating Mycroft Precise wake word detection
 */
export function useWakeWord(options: UseWakeWordOptions = {}): UseWakeWordReturn {
  const {
    config,
    modelPath = (() => {
      try {
        return require('../../../assets/models/eindr_complete.tflite');
      } catch (error) {
        console.warn('Default model path not found, please provide modelPath in options');
        return null;
      }
    })(),
    autoInitialize = false,
    autoStart = false,
  } = options;

  // State
  const [state, setState] = useState<WakeWordState>(WakeWordState.IDLE);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastDetection, setLastDetection] = useState<WakeWordDetection | null>(null);
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [lastError, setLastError] = useState<WakeWordError | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Engine instance
  const engineRef = useRef<WakeWordEngine | null>(null);

  // Derived state
  const isListening = state === WakeWordState.LISTENING;
  const isRecording = state === WakeWordState.RECORDING;

  // Initialize engine
  const initialize = useCallback(async () => {
    try {
      if (!modelPath) {
        throw new Error(
          'No model path provided. Please provide modelPath in useWakeWord options or ensure eindr_complete.tflite exists in assets/models/',
        );
      }

      if (engineRef.current) {
        await engineRef.current.cleanup();
      }

      // Create new engine instance
      engineRef.current = new WakeWordEngine(config);

      // Setup callbacks
      const callbacks: WakeWordCallbacks = {
        onWakeWordDetected: detection => {
          setLastDetection(detection);
          setLastError(null);
        },
        onRecordingStart: () => {
          setRecordingDuration(0);
        },
        onRecordingStop: command => {
          setLastCommand(command);
          setRecordingDuration(0);
        },
        onStateChange: newState => {
          setState(newState);
        },
        onError: error => {
          setLastError(error);
          console.error('Wake word error:', error);
        },
        onRecordingProgress: duration => {
          setRecordingDuration(duration);
        },
      };

      engineRef.current.setCallbacks(callbacks);

      // Initialize the engine
      await engineRef.current.initialize(modelPath);
      setIsInitialized(true);
      setLastError(null);

      console.log('Wake word engine initialized successfully');

      // Auto-start if requested
      if (autoStart) {
        await engineRef.current.startListening();
      }
    } catch (error) {
      console.error('Failed to initialize wake word engine:', error);
      setLastError({
        code: 'INITIALIZATION_FAILED',
        message: `Failed to initialize: ${error}`,
        details: error,
        timestamp: Date.now(),
      });
      setIsInitialized(false);
    }
  }, [config, modelPath, autoStart]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!engineRef.current || !isInitialized) {
      console.warn('Engine not initialized');
      return;
    }

    try {
      await engineRef.current.startListening();
      setLastError(null);
    } catch (error) {
      console.error('Failed to start listening:', error);
      setLastError({
        code: 'START_LISTENING_FAILED',
        message: `Failed to start listening: ${error}`,
        details: error,
        timestamp: Date.now(),
      });
    }
  }, [isInitialized]);

  // Stop listening
  const stopListening = useCallback(async () => {
    if (!engineRef.current) {
      return;
    }

    try {
      await engineRef.current.stopListening();
      setLastError(null);
    } catch (error) {
      console.error('Failed to stop listening:', error);
      setLastError({
        code: 'STOP_LISTENING_FAILED',
        message: `Failed to stop listening: ${error}`,
        details: error,
        timestamp: Date.now(),
      });
    }
  }, []);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<WakeWordConfig>) => {
    if (engineRef.current) {
      engineRef.current.updateConfig(newConfig);
    }
  }, []);

  // Get current configuration
  const getConfig = useCallback((): WakeWordConfig => {
    if (engineRef.current) {
      return engineRef.current.getConfig();
    }
    throw new Error('Engine not initialized');
  }, []);

  // Cleanup
  const cleanup = useCallback(async () => {
    if (engineRef.current) {
      await engineRef.current.cleanup();
      engineRef.current = null;
    }
    setIsInitialized(false);
    setState(WakeWordState.IDLE);
    setLastDetection(null);
    setLastCommand(null);
    setLastError(null);
    setRecordingDuration(0);
  }, []);

  // Auto-initialize on mount
  useEffect(() => {
    if (autoInitialize) {
      initialize();
    }

    // Cleanup on unmount
    return () => {
      if (engineRef.current) {
        engineRef.current.cleanup();
      }
    };
  }, [autoInitialize, initialize]);

  return {
    state,
    isInitialized,
    isListening,
    isRecording,
    lastDetection,
    lastCommand,
    lastError,
    recordingDuration,
    initialize,
    startListening,
    stopListening,
    updateConfig,
    getConfig,
    cleanup,
    engine: engineRef.current,
  };
}
