/**
 * Production-grade useWakeWord Hook
 * React hook interface for always-listening wake word detection
 * Provides comprehensive state management and callback handling
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { WakeWordEngine } from '../wakeword/WakeWordEngine';
import {
  WakeWordState,
  WakeWordDetection,
  VoiceCommand,
  WakeWordError,
  WakeWordConfig,
  PerformanceMetrics,
  WakeWordCallbacks,
} from '../types/wakeword';
import { DEFAULT_WAKEWORD_CONFIG } from '../config/wakeword';

export interface UseWakeWordOptions {
  config?: Partial<WakeWordConfig>;
  modelPath?: string;
  autoStart?: boolean;
  enablePerformanceTracking?: boolean;
  callbacks?: Partial<WakeWordCallbacks>;
}

export interface UseWakeWordReturn {
  // Engine state
  state: WakeWordState;
  isInitialized: boolean;
  isListening: boolean;
  isRecording: boolean;
  isActive: boolean;

  // Detection data
  lastDetection: WakeWordDetection | null;
  lastCommand: VoiceCommand | null;
  detectionCount: number;

  // Performance metrics
  performanceStats: PerformanceMetrics | null;

  // Error handling
  lastError: WakeWordError | null;

  // Control functions
  initialize: (modelPath?: string) => Promise<void>;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  reset: () => Promise<void>;
  cleanup: () => Promise<void>;

  // Configuration
  updateConfig: (newConfig: Partial<WakeWordConfig>) => void;
  getConfig: () => WakeWordConfig;

  // Utility functions
  forceStopRecording: () => Promise<void>;
  resetStats: () => void;
  testConnection: () => Promise<boolean>;
}

/**
 * Production-grade wake word detection hook
 * Provides always-listening functionality with comprehensive state management
 */
export const useWakeWord = (options: UseWakeWordOptions = {}): UseWakeWordReturn => {
  const {
    config = {},
    modelPath = '../../assets/models/gru.tflite',
    autoStart = false,
    enablePerformanceTracking = true,
    callbacks = {},
  } = options;

  // Engine reference
  const engineRef = useRef<WakeWordEngine | null>(null);

  // State management
  const [state, setState] = useState<WakeWordState>(WakeWordState.IDLE);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastDetection, setLastDetection] = useState<WakeWordDetection | null>(null);
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [detectionCount, setDetectionCount] = useState(0);
  const [performanceStats, setPerformanceStats] = useState<PerformanceMetrics | null>(null);
  const [lastError, setLastError] = useState<WakeWordError | null>(null);

  // Derived state
  const isListening = state === WakeWordState.LISTENING;
  const isRecording = state === WakeWordState.RECORDING;
  const isActive = isListening || isRecording;

  // Initialize engine on mount
  useEffect(() => {
    console.log('🎤 useWakeWord: Hook initialized');

    return () => {
      console.log('🧹 useWakeWord: Hook cleanup');
      cleanup();
    };
  }, []);

  // Auto-start functionality
  useEffect(() => {
    if (autoStart && isInitialized && !isActive) {
      console.log('🚀 useWakeWord: Auto-starting wake word detection');
      startListening();
    }
  }, [autoStart, isInitialized, isActive]);

  // Callback handlers
  const handleWakeWordDetected = useCallback(
    (detection: WakeWordDetection) => {
      console.log('🎉 useWakeWord: Wake word detected:', detection.wakeWord);
      setLastDetection(detection);
      setDetectionCount(prev => prev + 1);
      setLastError(null); // Clear previous errors on successful detection

      if (callbacks.onWakeWordDetected) {
        callbacks.onWakeWordDetected(detection);
      }
    },
    [callbacks],
  );

  const handleRecordingStart = useCallback(() => {
    console.log('🎤 useWakeWord: Recording started');

    if (callbacks.onRecordingStart) {
      callbacks.onRecordingStart();
    }
  }, [callbacks]);

  const handleRecordingStop = useCallback(
    (command: VoiceCommand) => {
      console.log('🔇 useWakeWord: Recording stopped, command:', command.text);
      setLastCommand(command);

      if (callbacks.onRecordingStop) {
        callbacks.onRecordingStop(command);
      }
    },
    [callbacks],
  );

  const handleStateChange = useCallback(
    (oldState: WakeWordState, newState: WakeWordState) => {
      console.log(`🔄 useWakeWord: State change: ${oldState} → ${newState}`);
      setState(newState);

      if (callbacks.onStateChange) {
        callbacks.onStateChange(oldState, newState);
      }
    },
    [callbacks],
  );

  const handleError = useCallback(
    (error: WakeWordError) => {
      console.error('❌ useWakeWord: Error occurred:', error);
      setLastError(error);

      if (callbacks.onError) {
        callbacks.onError(error);
      }
    },
    [callbacks],
  );

  const handlePerformanceUpdate = useCallback(
    (metrics: PerformanceMetrics) => {
      if (enablePerformanceTracking) {
        setPerformanceStats(metrics);

        if (callbacks.onPerformanceUpdate) {
          callbacks.onPerformanceUpdate(metrics);
        }
      }
    },
    [enablePerformanceTracking, callbacks],
  );

  // Initialize the wake word engine
  const initialize = useCallback(
    async (customModelPath?: string): Promise<void> => {
      try {
        console.log('🔄 useWakeWord: Initializing wake word engine...');

        if (engineRef.current) {
          console.warn('⚠️ useWakeWord: Engine already exists, cleaning up first');
          await cleanup();
        }

        // Create new engine instance
        const mergedConfig = { ...DEFAULT_WAKEWORD_CONFIG, ...config };
        engineRef.current = new WakeWordEngine(mergedConfig);

        // Set up callbacks
        engineRef.current.setCallbacks({
          onWakeWordDetected: handleWakeWordDetected,
          onRecordingStart: handleRecordingStart,
          onRecordingStop: handleRecordingStop,
          onStateChange: handleStateChange,
          onError: handleError,
          onPerformanceUpdate: handlePerformanceUpdate,
          ...callbacks, // Allow additional callbacks
        });

        // Initialize with model
        const pathToUse = customModelPath || modelPath;
        await engineRef.current.initialize(pathToUse);

        setIsInitialized(true);
        setLastError(null);
        console.log('✅ useWakeWord: Engine initialized successfully');
      } catch (error) {
        const wakeWordError: WakeWordError = {
          code: 'INITIALIZATION_FAILED',
          message: `Failed to initialize wake word engine: ${error}`,
          details: error,
          timestamp: Date.now(),
          severity: 'high',
          retryable: true,
        };

        handleError(wakeWordError);
        throw error;
      }
    },
    [
      config,
      modelPath,
      callbacks,
      handleWakeWordDetected,
      handleRecordingStart,
      handleRecordingStop,
      handleStateChange,
      handleError,
      handlePerformanceUpdate,
    ],
  );

  // Start always-listening mode
  const startListening = useCallback(async (): Promise<void> => {
    if (!engineRef.current || !isInitialized) {
      throw new Error('Wake word engine not initialized');
    }

    try {
      console.log('🎤 useWakeWord: Starting always-listening mode');
      await engineRef.current.startAlwaysListening();
      setLastError(null);
    } catch (error) {
      const wakeWordError: WakeWordError = {
        code: 'START_LISTENING_FAILED',
        message: `Failed to start listening: ${error}`,
        details: error,
        timestamp: Date.now(),
        severity: 'medium',
        retryable: true,
      };

      handleError(wakeWordError);
      throw error;
    }
  }, [isInitialized, handleError]);

  // Stop always-listening mode
  const stopListening = useCallback(async (): Promise<void> => {
    if (!engineRef.current) {
      console.warn('⚠️ useWakeWord: No engine to stop');
      return;
    }

    try {
      console.log('🔇 useWakeWord: Stopping always-listening mode');
      await engineRef.current.stopAlwaysListening();
      setLastError(null);
    } catch (error) {
      console.error('❌ useWakeWord: Error stopping listening:', error);
      // Don't throw error for stop operations, just log
    }
  }, []);

  // Reset hook state and restart engine
  const reset = useCallback(async (): Promise<void> => {
    console.log('🔄 useWakeWord: Resetting hook state');

    try {
      // Stop current operations
      await stopListening();

      // Reset state
      setState(WakeWordState.IDLE);
      setLastDetection(null);
      setLastCommand(null);
      setDetectionCount(0);
      setPerformanceStats(null);
      setLastError(null);

      // Reset engine stats if available
      if (engineRef.current) {
        engineRef.current.resetStats();
      }

      console.log('✅ useWakeWord: Reset completed');
    } catch (error) {
      console.error('❌ useWakeWord: Error during reset:', error);
    }
  }, [stopListening]);

  // Cleanup resources
  const cleanup = useCallback(async (): Promise<void> => {
    console.log('🧹 useWakeWord: Cleaning up resources');

    try {
      if (engineRef.current) {
        await engineRef.current.cleanup();
        engineRef.current = null;
      }

      // Reset all state
      setState(WakeWordState.IDLE);
      setIsInitialized(false);
      setLastDetection(null);
      setLastCommand(null);
      setDetectionCount(0);
      setPerformanceStats(null);
      setLastError(null);

      console.log('✅ useWakeWord: Cleanup completed');
    } catch (error) {
      console.error('❌ useWakeWord: Error during cleanup:', error);
    }
  }, []);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<WakeWordConfig>): void => {
    if (engineRef.current) {
      engineRef.current.updateConfig(newConfig);
      console.log('🔧 useWakeWord: Configuration updated');
    } else {
      console.warn('⚠️ useWakeWord: Cannot update config - engine not initialized');
    }
  }, []);

  // Get current configuration
  const getConfig = useCallback((): WakeWordConfig => {
    if (engineRef.current) {
      return engineRef.current.getConfig();
    }
    return { ...DEFAULT_WAKEWORD_CONFIG, ...config };
  }, [config]);

  // Force stop recording (emergency stop)
  const forceStopRecording = useCallback(async (): Promise<void> => {
    if (engineRef.current && isRecording) {
      console.log('🛑 useWakeWord: Force stopping recording');
      await engineRef.current.forceStopRecording();
    }
  }, [isRecording]);

  // Reset statistics
  const resetStats = useCallback((): void => {
    setDetectionCount(0);
    setPerformanceStats(null);
    setLastError(null);

    if (engineRef.current) {
      engineRef.current.resetStats();
    }

    console.log('📊 useWakeWord: Statistics reset');
  }, []);

  // Test API connection
  const testConnection = useCallback(async (): Promise<boolean> => {
    if (engineRef.current) {
      try {
        // Test connection by creating a new VoiceToTextAPI instance
        // since the engine's API is private
        const { VoiceToTextAPI } = await import('../wakeword/api/VoiceToTextAPI');
        const apiInstance = new VoiceToTextAPI();
        const result = await apiInstance.testConnection();
        return result || false;
      } catch (error) {
        console.error('❌ useWakeWord: Connection test failed:', error);
        return false;
      }
    }
    return false;
  }, []);

  return {
    // State
    state,
    isInitialized,
    isListening,
    isRecording,
    isActive,

    // Data
    lastDetection,
    lastCommand,
    detectionCount,
    performanceStats,
    lastError,

    // Control functions
    initialize,
    startListening,
    stopListening,
    reset,
    cleanup,

    // Configuration
    updateConfig,
    getConfig,

    // Utilities
    forceStopRecording,
    resetStats,
    testConnection,
  };
};
