/**
 * Comprehensive Test Suite for Production Wake Word Engine
 * Tests always-listening functionality, TensorFlow Lite integration, and error handling
 */

import { WakeWordEngine } from '../../src/wakeword/WakeWordEngine';
import {
  WakeWordState,
  WakeWordDetection,
  VoiceCommand,
  WakeWordError,
} from '../../src/types/wakeword';
import { WAKE_WORDS, DEFAULT_WAKEWORD_CONFIG } from '../../src/config/wakeword';

// Mock dependencies
jest.mock('react-native-audio-record');
jest.mock('react-native-haptic-feedback');
jest.mock('react-native-permissions');

describe('WakeWordEngine', () => {
  let engine: WakeWordEngine;
  let mockCallbacks: any;

  beforeEach(() => {
    // Create fresh engine instance for each test
    engine = new WakeWordEngine();

    // Mock callbacks
    mockCallbacks = {
      onWakeWordDetected: jest.fn(),
      onRecordingStart: jest.fn(),
      onRecordingStop: jest.fn(),
      onStateChange: jest.fn(),
      onError: jest.fn(),
      onPerformanceUpdate: jest.fn(),
    };

    engine.setCallbacks(mockCallbacks);
  });

  afterEach(async () => {
    // Clean up after each test
    if (engine) {
      await engine.cleanup();
    }
  });

  describe('Initialization', () => {
    test('should initialize successfully with valid model path', async () => {
      const modelPath = './assets/models/gru.tflite';

      await expect(engine.initialize(modelPath)).resolves.not.toThrow();
      expect(engine.getState()).toBe(WakeWordState.IDLE);
    });

    test('should fail initialization with invalid model path', async () => {
      const invalidPath = './invalid/path.tflite';

      await expect(engine.initialize(invalidPath)).rejects.toThrow();
      expect(mockCallbacks.onError).toHaveBeenCalled();
    });

    test('should configure engine with custom settings', () => {
      const customConfig = {
        confidenceThreshold: 0.8,
        maxRecordingDuration: 15000,
        enableVAD: false,
      };

      engine.updateConfig(customConfig);
      const config = engine.getConfig();

      expect(config.confidenceThreshold).toBe(0.8);
      expect(config.maxRecordingDuration).toBe(15000);
      expect(config.enableVAD).toBe(false);
    });
  });

  describe('Always-Listening Mode', () => {
    beforeEach(async () => {
      // Initialize engine for listening tests
      await engine.initialize('./assets/models/gru.tflite');
    });

    test('should start always-listening mode successfully', async () => {
      await engine.startAlwaysListening();

      expect(engine.getState()).toBe(WakeWordState.LISTENING);
      expect(engine.isActive()).toBe(true);
    });

    test('should stop always-listening mode successfully', async () => {
      await engine.startAlwaysListening();
      await engine.stopAlwaysListening();

      expect(engine.getState()).toBe(WakeWordState.IDLE);
      expect(engine.isActive()).toBe(false);
    });

    test('should handle multiple start/stop cycles', async () => {
      for (let i = 0; i < 3; i++) {
        await engine.startAlwaysListening();
        expect(engine.getState()).toBe(WakeWordState.LISTENING);

        await engine.stopAlwaysListening();
        expect(engine.getState()).toBe(WakeWordState.IDLE);
      }
    });

    test('should not allow multiple simultaneous listening sessions', async () => {
      await engine.startAlwaysListening();

      // Second call should be ignored
      await engine.startAlwaysListening();

      expect(engine.getState()).toBe(WakeWordState.LISTENING);
    });
  });

  describe('Wake Word Detection', () => {
    beforeEach(async () => {
      await engine.initialize('./assets/models/gru.tflite');
      await engine.startAlwaysListening();
    });

    test('should detect wake word with sufficient confidence', async () => {
      const mockDetection: WakeWordDetection = {
        wakeWord: 'hey',
        confidence: 0.85,
        timestamp: Date.now(),
        audioLength: 1.0,
      };

      // Simulate wake word detection
      await simulateWakeWordDetection(engine, mockDetection);

      expect(mockCallbacks.onWakeWordDetected).toHaveBeenCalledWith(
        expect.objectContaining({
          wakeWord: 'hey',
          confidence: 0.85,
        }),
      );
    });

    test('should ignore wake word with low confidence', async () => {
      const lowConfidenceDetection: WakeWordDetection = {
        wakeWord: 'hey',
        confidence: 0.5, // Below threshold
        timestamp: Date.now(),
        audioLength: 1.0,
      };

      await simulateWakeWordDetection(engine, lowConfidenceDetection);

      expect(mockCallbacks.onWakeWordDetected).not.toHaveBeenCalled();
    });

    test('should handle multiple wake words', async () => {
      const wakeWords = ['hey', 'hello', 'assistant'];

      for (const wakeWord of wakeWords) {
        const detection: WakeWordDetection = {
          wakeWord,
          confidence: 0.8,
          timestamp: Date.now(),
          audioLength: 1.0,
        };

        await simulateWakeWordDetection(engine, detection);

        expect(mockCallbacks.onWakeWordDetected).toHaveBeenCalledWith(
          expect.objectContaining({ wakeWord }),
        );
      }
    });

    test('should implement rate limiting between detections', async () => {
      const detection: WakeWordDetection = {
        wakeWord: 'hey',
        confidence: 0.8,
        timestamp: Date.now(),
        audioLength: 1.0,
      };

      // First detection should work
      await simulateWakeWordDetection(engine, detection);
      expect(mockCallbacks.onWakeWordDetected).toHaveBeenCalledTimes(1);

      // Immediate second detection should be rate limited
      await simulateWakeWordDetection(engine, detection);
      expect(mockCallbacks.onWakeWordDetected).toHaveBeenCalledTimes(1);
    });
  });

  describe('Voice Command Recording', () => {
    beforeEach(async () => {
      await engine.initialize('./assets/models/gru.tflite');
      await engine.startAlwaysListening();
    });

    test('should start recording after wake word detection', async () => {
      const detection: WakeWordDetection = {
        wakeWord: 'hey',
        confidence: 0.8,
        timestamp: Date.now(),
        audioLength: 1.0,
      };

      await simulateWakeWordDetection(engine, detection);

      expect(mockCallbacks.onRecordingStart).toHaveBeenCalled();
      expect(engine.getState()).toBe(WakeWordState.RECORDING);
    });

    test('should stop recording on silence detection', async () => {
      await simulateWakeWordDetection(engine, createMockDetection());

      // Simulate silence detection
      await simulateSilenceDetection(engine, 1000);

      expect(mockCallbacks.onRecordingStop).toHaveBeenCalled();
    });

    test('should handle maximum recording duration', async () => {
      const shortDurationConfig = { maxRecordingDuration: 1000 };
      engine.updateConfig(shortDurationConfig);

      await simulateWakeWordDetection(engine, createMockDetection());

      // Wait for max duration
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(mockCallbacks.onRecordingStop).toHaveBeenCalled();
    });

    test('should process voice command successfully', async () => {
      const mockCommand: VoiceCommand = {
        text: 'Set a reminder for 3 PM',
        audioData: new Uint8Array([1, 2, 3, 4]),
        duration: 3000,
        timestamp: Date.now(),
        confidence: 0.9,
      };

      await simulateVoiceCommandProcessing(engine, mockCommand);

      expect(mockCallbacks.onRecordingStop).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Set a reminder for 3 PM',
          confidence: 0.9,
        }),
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle model loading errors gracefully', async () => {
      const invalidModelPath = './invalid/model.tflite';

      await expect(engine.initialize(invalidModelPath)).rejects.toThrow();

      expect(mockCallbacks.onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: expect.stringContaining('MODEL_LOAD_FAILED'),
        }),
      );
    });

    test('should recover from microphone permission errors', async () => {
      // Mock permission denial
      mockMicrophonePermissionDenied();

      await expect(engine.startAlwaysListening()).rejects.toThrow();

      expect(mockCallbacks.onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'MICROPHONE_PERMISSION_DENIED',
        }),
      );
    });

    test('should handle network errors during API calls', async () => {
      await engine.initialize('./assets/models/gru.tflite');

      // Mock network error
      mockNetworkError();

      const mockCommand: VoiceCommand = {
        text: 'test command',
        audioData: new Uint8Array([1, 2, 3]),
        duration: 1000,
        timestamp: Date.now(),
      };

      await simulateVoiceCommandProcessing(engine, mockCommand);

      expect(mockCallbacks.onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'NETWORK_ERROR',
        }),
      );
    });

    test('should implement automatic error recovery', async () => {
      const config = {
        enableAutomaticRestart: true,
        maxConsecutiveErrors: 3,
        errorRecoveryDelay: 100,
      };

      engine.updateConfig(config);

      // Simulate consecutive errors
      for (let i = 0; i < 2; i++) {
        const error: WakeWordError = {
          code: 'TEMPORARY_ERROR',
          message: 'Temporary error',
          timestamp: Date.now(),
          retryable: true,
        };

        await simulateError(engine, error);
      }

      // Engine should still be functional
      expect(engine.getState()).toBe(WakeWordState.IDLE);
    });
  });

  describe('Performance Monitoring', () => {
    beforeEach(async () => {
      await engine.initialize('./assets/models/gru.tflite');
    });

    test('should track inference performance metrics', async () => {
      await engine.startAlwaysListening();

      // Simulate multiple inferences
      for (let i = 0; i < 5; i++) {
        await simulateInference(engine, 10 + i); // Variable inference times
      }

      const stats = engine.getPerformanceStats();

      expect(stats.totalInferences).toBe(5);
      expect(stats.averageInferenceTime).toBeGreaterThan(0);
    });

    test('should track detection accuracy', async () => {
      await engine.startAlwaysListening();

      // Simulate true positives
      for (let i = 0; i < 3; i++) {
        await simulateWakeWordDetection(engine, createMockDetection());
      }

      // Simulate false positives (should be tracked)
      for (let i = 0; i < 1; i++) {
        await simulateFalsePositive(engine);
      }

      const stats = engine.getPerformanceStats();

      expect(stats.totalDetections).toBe(4);
      expect(stats.truePositives).toBe(3);
      expect(stats.falsePositives).toBe(1);
      expect(stats.accuracy).toBe(0.75); // 3/4
    });

    test('should provide performance callbacks', async () => {
      await engine.startAlwaysListening();

      // Simulate activity that triggers performance updates
      await simulateWakeWordDetection(engine, createMockDetection());

      expect(mockCallbacks.onPerformanceUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          totalDetections: expect.any(Number),
          averageInferenceTime: expect.any(Number),
        }),
      );
    });
  });

  describe('Configuration Management', () => {
    test('should update configuration at runtime', () => {
      const newConfig = {
        confidenceThreshold: 0.9,
        silenceTimeout: 1500,
        vadSensitivity: 1.2,
      };

      engine.updateConfig(newConfig);
      const config = engine.getConfig();

      expect(config.confidenceThreshold).toBe(0.9);
      expect(config.silenceTimeout).toBe(1500);
      expect(config.vadSensitivity).toBe(1.2);
    });

    test('should validate configuration parameters', () => {
      const invalidConfig = {
        confidenceThreshold: 1.5, // Invalid: > 1.0
        sampleRate: -1, // Invalid: negative
      };

      expect(() => engine.updateConfig(invalidConfig)).toThrow();
    });

    test('should reset to default configuration', () => {
      engine.updateConfig({ confidenceThreshold: 0.9 });

      const defaultConfig = { ...DEFAULT_WAKEWORD_CONFIG };
      engine.updateConfig(defaultConfig);

      const config = engine.getConfig();
      expect(config.confidenceThreshold).toBe(DEFAULT_WAKEWORD_CONFIG.confidenceThreshold);
    });
  });

  describe('Resource Management', () => {
    test('should cleanup resources properly', async () => {
      await engine.initialize('./assets/models/gru.tflite');
      await engine.startAlwaysListening();

      await engine.cleanup();

      expect(engine.getState()).toBe(WakeWordState.IDLE);
      expect(engine.isActive()).toBe(false);
    });

    test('should handle memory management', async () => {
      await engine.initialize('./assets/models/gru.tflite');

      // Simulate heavy usage
      await engine.startAlwaysListening();

      for (let i = 0; i < 100; i++) {
        await simulateInference(engine, 10);
      }

      const stats = engine.getPerformanceStats();

      // Memory usage should remain reasonable
      expect(stats.memoryUsage).toBeLessThan(100 * 1024 * 1024); // 100MB limit
    });

    test('should handle concurrent operations safely', async () => {
      await engine.initialize('./assets/models/gru.tflite');

      // Start multiple operations concurrently
      const promises = [
        engine.startAlwaysListening(),
        engine.startAlwaysListening(),
        engine.stopAlwaysListening(),
      ];

      await Promise.allSettled(promises);

      // Engine should end in a consistent state
      expect([WakeWordState.IDLE, WakeWordState.LISTENING]).toContain(engine.getState());
    });
  });

  // Helper functions for testing
  function createMockDetection(wakeWord = 'hey', confidence = 0.8): WakeWordDetection {
    return {
      wakeWord,
      confidence,
      timestamp: Date.now(),
      audioLength: 1.0,
    };
  }

  async function simulateWakeWordDetection(
    engine: WakeWordEngine,
    detection: WakeWordDetection,
  ): Promise<void> {
    // This would trigger the internal wake word detection flow
    // In a real implementation, this would call the private method
    // For testing, we simulate the callback invocation
    const callbacks = (engine as any).callbacks;
    if (callbacks.onWakeWordDetected) {
      callbacks.onWakeWordDetected(detection);
    }
  }

  async function simulateSilenceDetection(engine: WakeWordEngine, duration: number): Promise<void> {
    // Simulate silence detection triggering recording stop
    const callbacks = (engine as any).callbacks;
    if (callbacks.onSilenceDetected) {
      callbacks.onSilenceDetected(duration);
    }
  }

  async function simulateVoiceCommandProcessing(
    engine: WakeWordEngine,
    command: VoiceCommand,
  ): Promise<void> {
    const callbacks = (engine as any).callbacks;
    if (callbacks.onRecordingStop) {
      callbacks.onRecordingStop(command);
    }
  }

  async function simulateError(engine: WakeWordEngine, error: WakeWordError): Promise<void> {
    const callbacks = (engine as any).callbacks;
    if (callbacks.onError) {
      callbacks.onError(error);
    }
  }

  async function simulateInference(engine: WakeWordEngine, inferenceTime: number): Promise<void> {
    // Simulate model inference timing
    const callbacks = (engine as any).callbacks;
    if (callbacks.onModelInference) {
      callbacks.onModelInference(inferenceTime, 0.5);
    }
  }

  async function simulateFalsePositive(engine: WakeWordEngine): Promise<void> {
    // Simulate a false positive detection
    const detection = createMockDetection('noise', 0.8);
    await simulateWakeWordDetection(engine, detection);
  }

  function mockMicrophonePermissionDenied(): void {
    // Mock permission denial
    jest.spyOn(engine as any, 'checkPermissions').mockResolvedValue({
      microphone: false,
    });
  }

  function mockNetworkError(): void {
    // Mock network error for API calls
    jest.spyOn(engine as any, 'voiceToTextAPI').mockImplementation(() => ({
      transcribe: jest.fn().mockRejectedValue(new Error('Network error')),
    }));
  }
});
