import AudioRecord from 'react-native-audio-record';
import RNHapticFeedback from 'react-native-haptic-feedback';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

import {
  WakeWordConfig,
  WakeWordState,
  WakeWordDetection,
  VoiceCommand,
  WakeWordError,
  WakeWordCallbacks,
  AudioBuffer,
  PermissionStatus,
} from '../types/wakeword';
import { DEFAULT_WAKEWORD_CONFIG, ERROR_CODES, PERFORMANCE_CONFIG } from '../config/wakeword';
import { RingBuffer } from './audio/RingBuffer';
import { AudioProcessor } from './audio/AudioProcessor';
import { ModelManager } from './native/ModelManager';
import { VoiceActivityDetector } from './audio/VoiceActivityDetector';
import { VoiceToTextAPI } from './api/VoiceToTextAPI';

/**
 * Dynamic wake word detection engine with always-listening capability
 * Implements continuous low-power wake word detection with configurable wake words
 */
export class WakeWordEngine {
  private config: WakeWordConfig;
  private state: WakeWordState = WakeWordState.IDLE;
  private callbacks: WakeWordCallbacks = {};

  // Core components
  private ringBuffer: RingBuffer;
  private audioProcessor: AudioProcessor;
  private modelManager: ModelManager;
  private voiceActivityDetector: VoiceActivityDetector;
  private voiceToTextAPI: VoiceToTextAPI;

  // Always-listening state
  private isAlwaysListening: boolean = false;
  private wakeWordDetectionLoop: ReturnType<typeof setInterval> | null = null;
  private audioProcessingInterval: ReturnType<typeof setInterval> | null = null;

  // Audio recording state
  private isRecording: boolean = false;
  private recordingStartTime: number = 0;
  private recordingData: Uint8Array[] = [];
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;

  // Performance monitoring
  private inferenceTimeHistory: number[] = [];
  private detectionCount: number = 0;
  private lastDetectionTime: number = 0;

  // Audio event listener reference for cleanup
  private audioDataListener: ((data: string | Uint8Array | ArrayLike<number>) => void) | null =
    null;

  constructor(config: Partial<WakeWordConfig> = {}) {
    this.config = { ...DEFAULT_WAKEWORD_CONFIG, ...config };

    // Initialize components
    this.ringBuffer = new RingBuffer(PERFORMANCE_CONFIG.ringBufferSize);
    this.audioProcessor = new AudioProcessor(this.config.sampleRate);
    this.modelManager = new ModelManager();
    this.voiceActivityDetector = new VoiceActivityDetector({
      sampleRate: this.config.sampleRate,
      frameSize: PERFORMANCE_CONFIG.frameLength,
      energyThreshold: 0.01,
      silenceTimeout: this.config.silenceTimeout,
    });
    this.voiceToTextAPI = new VoiceToTextAPI();

    this.setupAudioRecording();

    console.log('🎤 WakeWordEngine: Dynamic engine initialized');
    console.log(
      `🎤 WakeWordEngine: Wake words: ${this.config.wakeWords.join(', ') || 'None configured'}`,
    );
  }

  /**
   * Initialize the wake word engine with always-listening capability
   */
  async initialize(modelPath?: string | undefined): Promise<void> {
    try {
      console.log('🔄 WakeWordEngine: Initializing production engine...');
      this.setState(WakeWordState.INITIALIZING);

      // Check permissions
      const permissions = await this.checkPermissions();
      if (!permissions.microphone) {
        throw new Error(ERROR_CODES.MICROPHONE_PERMISSION_DENIED);
      }
      console.log('✅ WakeWordEngine: Microphone permissions granted');

      // Load and warm up the TensorFlow Lite model (if provided)
      if (modelPath) {
        await this.modelManager.loadModel(modelPath);
        await this.modelManager.warmUp();
        console.log('✅ WakeWordEngine: TensorFlow Lite model loaded and warmed up');
      } else {
        console.log('⚠️ WakeWordEngine: No model provided - running in mock mode');
      }

      // Initialize audio components
      await this.initializeAudioComponents();
      console.log('✅ WakeWordEngine: Audio components initialized');

      this.setState(WakeWordState.IDLE);
      console.log('✅ WakeWordEngine: Production engine ready for always-listening');
    } catch (error) {
      const wakeWordError: WakeWordError = {
        code: ERROR_CODES.MODEL_LOAD_FAILED,
        message: `Failed to initialize wake word engine: ${error}`,
        details: error,
        timestamp: Date.now(),
      };
      this.handleError(wakeWordError);
      throw error;
    }
  }

  /**
   * Start always-listening wake word detection
   * Implements continuous low-power detection loop
   */
  async startAlwaysListening(): Promise<void> {
    if (this.state !== WakeWordState.IDLE) {
      console.warn('⚠️ WakeWordEngine: Cannot start always-listening - not in idle state');
      return;
    }

    try {
      console.log('🎤 WakeWordEngine: Starting always-listening mode...');
      this.setState(WakeWordState.LISTENING);
      this.isAlwaysListening = true;

      // Start continuous audio capture - ALWAYS capture real audio
      await this.startContinuousAudioCapture();

      // Start wake word detection loop
      this.startWakeWordDetectionLoop();

      console.log('✅ WakeWordEngine: Always-listening mode active');
      console.log(
        `🔄 WakeWordEngine: Monitoring for wake words: ${this.config.wakeWords.join(', ')}`,
      );
      console.log('🎤 WakeWordEngine: Real microphone audio capture active');
    } catch (error) {
      this.isAlwaysListening = false;
      const wakeWordError: WakeWordError = {
        code: ERROR_CODES.AUDIO_RECORDING_FAILED,
        message: `Failed to start always-listening: ${error}`,
        details: error,
        timestamp: Date.now(),
      };
      this.handleError(wakeWordError);
    }
  }

  /**
   * Stop always-listening wake word detection
   */
  async stopAlwaysListening(): Promise<void> {
    console.log('🔇 WakeWordEngine: Stopping always-listening mode...');

    this.isAlwaysListening = false;

    // Stop detection loop
    this.stopWakeWordDetectionLoop();

    // Stop audio capture
    await this.stopContinuousAudioCapture();

    // Clean up any ongoing recording
    if (this.isRecording) {
      await this.stopVoiceCommandRecording(true);
    }

    this.setState(WakeWordState.IDLE);
    console.log('✅ WakeWordEngine: Always-listening mode stopped');
  }

  /**
   * Start continuous audio capture for wake word detection
   */
  private async startContinuousAudioCapture(): Promise<void> {
    console.log('🔄 WakeWordEngine: Starting continuous audio capture...');

    try {
      // Configure for low-power continuous recording
      const options = {
        sampleRate: this.config.sampleRate,
        channels: 1,
        bitsPerSample: 16,
        audioFormat: 'wav',
        bufferSize: this.config.bufferSize,
        wavFile: '', // Empty string to disable file output
      };

      console.log('🎤 WakeWordEngine: Audio options:', JSON.stringify(options, null, 2));
      console.log('🎤 WakeWordEngine: Re-initializing AudioRecord for continuous capture...');

      // Re-initialize with the same options to ensure fresh start
      try {
        AudioRecord.init(options);
        console.log('✅ WakeWordEngine: AudioRecord re-initialized successfully');
      } catch (reinitError) {
        console.error('❌ WakeWordEngine: Failed to re-initialize AudioRecord:', reinitError);
        // Don't throw here, try to continue with existing initialization
        console.log('⚠️ WakeWordEngine: Continuing with existing AudioRecord configuration...');
      }

      console.log('🎤 WakeWordEngine: Starting AudioRecord...');
      try {
        AudioRecord.start();
        console.log('✅ WakeWordEngine: AudioRecord started successfully');
      } catch (startError) {
        console.error('❌ WakeWordEngine: Failed to start AudioRecord:', startError);
        throw new Error(`Failed to start audio recording: ${startError}`);
      }

      console.log('✅ WakeWordEngine: Continuous audio capture started');
      console.log('🎤 WakeWordEngine: Microphone should now be active - try speaking loudly!');
      console.log('🔊 WakeWordEngine: Expected audio data: 16kHz, 16-bit, mono = ~32KB/sec');

      // Log audio data reception after a short delay
      setTimeout(() => {
        console.log('🔍 WakeWordEngine: Checking if audio data is being received...');
        console.log(`📊 Ring buffer size: ${this.ringBuffer.size()}`);
        if (this.ringBuffer.size() === 0) {
          console.warn(
            '⚠️ WakeWordEngine: No audio data in ring buffer - microphone may not be working!',
          );
        } else {
          console.log('✅ WakeWordEngine: Audio data is being captured successfully');
        }
      }, 3000);
    } catch (error) {
      console.error('❌ WakeWordEngine: Failed to start continuous audio capture:', error);
      throw error;
    }
  }

  /**
   * Stop continuous audio capture
   */
  private async stopContinuousAudioCapture(): Promise<void> {
    try {
      console.log('🔄 WakeWordEngine: Stopping continuous audio capture...');
      AudioRecord.stop();
      console.log('✅ WakeWordEngine: Continuous audio capture stopped');
    } catch (error) {
      console.error('⚠️ WakeWordEngine: Error stopping audio capture:', error);
      // Don't throw here, cleanup should continue
    }
  }

  /**
   * Start the wake word detection loop
   * Processes audio in real-time for wake word detection
   */
  private startWakeWordDetectionLoop(): void {
    console.log('🔄 WakeWordEngine: Starting wake word detection loop...');

    this.wakeWordDetectionLoop = setInterval(async () => {
      if (!this.isAlwaysListening || this.state !== WakeWordState.LISTENING) {
        return;
      }

      try {
        await this.processWakeWordDetection();
      } catch (error) {
        console.error('⚠️ WakeWordEngine: Error in detection loop:', error);
        // Continue loop despite errors for robustness
      }
    }, PERFORMANCE_CONFIG.processingInterval);
  }

  /**
   * Stop the wake word detection loop
   */
  private stopWakeWordDetectionLoop(): void {
    if (this.wakeWordDetectionLoop) {
      clearInterval(this.wakeWordDetectionLoop);
      this.wakeWordDetectionLoop = null;
      console.log('✅ WakeWordEngine: Wake word detection loop stopped');
    }
  }

  /**
   * Process wake word detection on audio buffer
   * Core detection logic with TensorFlow Lite inference
   */
  private async processWakeWordDetection(): Promise<void> {
    // Get audio data from ring buffer
    const audioData = this.ringBuffer.getLatestWindow(PERFORMANCE_CONFIG.ringBufferSize);
    if (!audioData || audioData.length === 0) {
      return;
    }

    const startTime = Date.now();

    try {
      // Calculate audio level for real-time feedback
      const audioLevel = this.calculateAudioLevel(audioData);
      const isSpeech = audioLevel > 0.01; // Simple voice activity detection

      // Notify audio level for UI feedback
      if (this.callbacks.onAudioLevel) {
        this.callbacks.onAudioLevel(audioLevel, isSpeech);
      }

      // Check if model is loaded, otherwise use enhanced mock detection
      if (!this.modelManager.isLoaded()) {
        // Enhanced mock detection with realistic confidence scores
        await this.processEnhancedMockDetection(audioLevel, isSpeech);
        return;
      }

      // Create audio buffer for processing
      const audioBuffer: AudioBuffer = {
        data: audioData,
        sampleRate: this.config.sampleRate,
        channels: 1,
        duration: audioData.length / this.config.sampleRate,
        timestamp: Date.now(),
      };

      // Extract features using AudioProcessor
      const features = this.audioProcessor.processAudio(audioBuffer);

      // Run inference on TensorFlow Lite model
      const prediction = await this.modelManager.predict(features);

      // Track inference performance
      const inferenceTime = Date.now() - startTime;
      this.trackInferencePerformance(inferenceTime);

      // Notify inference results for UI feedback
      if (this.callbacks.onModelInference) {
        this.callbacks.onModelInference(inferenceTime, prediction);
      }

      // Process predictions for each wake word
      const detections = await this.processPredictions(prediction);

      // Check for valid detections
      for (const detection of detections) {
        if (detection.confidence >= this.getWakeWordThreshold(detection.wakeWord)) {
          await this.onWakeWordDetected(detection, audioBuffer);
          break; // Process only the first valid detection
        }
      }
    } catch (error) {
      console.error('⚠️ WakeWordEngine: Wake word detection error:', error);
      // Continue listening despite detection errors
    }
  }

  /**
   * Calculate audio level (RMS) for real-time feedback
   */
  private calculateAudioLevel(audioData: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    return Math.sqrt(sum / audioData.length);
  }

  /**
   * Enhanced mock wake word detection with realistic behavior
   * Now uses REAL audio data from microphone
   */
  private async processEnhancedMockDetection(audioLevel: number, isSpeech: boolean): Promise<void> {
    // Skip if no wake words are configured
    if (!this.config.wakeWords || this.config.wakeWords.length === 0) {
      return;
    }

    const currentTime = Date.now();
    const timeSinceLastDetection = currentTime - this.lastDetectionTime;

    // Generate realistic confidence scores based on REAL audio activity
    const baseConfidence = Math.min(audioLevel * 5, 1.0); // Scale real audio level to confidence
    const speechBoost = isSpeech ? 0.3 : 0; // Boost confidence when real speech detected

    // Simulate continuous inference for all wake words using REAL audio data
    this.config.wakeWords.forEach(wakeWord => {
      const randomVariation = (Math.random() - 0.5) * 0.2; // ±0.1 variation
      const confidence = Math.max(0, Math.min(1, baseConfidence + speechBoost + randomVariation));

      // Notify inference results for real-time UI feedback
      if (this.callbacks.onModelInference) {
        this.callbacks.onModelInference(5 + Math.random() * 10, confidence); // 5-15ms mock inference time
      }
    });

    // Enhanced trigger conditions based on REAL audio activity and speech detection
    const strongSpeechTrigger = isSpeech && audioLevel > 0.1; // Strong real speech detected
    const mediumSpeechTrigger = isSpeech && audioLevel > 0.05; // Medium real speech detected
    const timeBasedTrigger = timeSinceLastDetection > 8000; // At least 8 seconds

    // Much higher chance of detection when real speech is detected
    const speechBasedProbability = strongSpeechTrigger ? 0.05 : mediumSpeechTrigger ? 0.02 : 0.001;
    const randomTrigger = Math.random() < speechBasedProbability;

    if (randomTrigger && timeBasedTrigger) {
      // Choose a random wake word
      const randomWakeWord =
        this.config.wakeWords[Math.floor(Math.random() * this.config.wakeWords.length)];
      const mockConfidence = 0.75 + Math.random() * 0.25; // 0.75-1.0 confidence for mock detections

      const mockDetection: WakeWordDetection = {
        wakeWord: randomWakeWord,
        confidence: mockConfidence,
        timestamp: currentTime,
        audioLength: 1.0,
        metadata: {
          processingTime: 8,
          modelVersion: 'mock-real-audio',
          detectionMethod: 'local',
        },
      };

      console.log('🎭 WakeWordEngine: REAL AUDIO mock detection triggered!');
      console.log(
        `✅ Mock wake word: "${randomWakeWord}" (${mockConfidence.toFixed(3)} confidence)`,
      );
      console.log(
        `🔊 REAL audio level: ${audioLevel.toFixed(4)}, Real speech detected: ${isSpeech}`,
      );
      console.log(
        `🎯 Strong speech: ${strongSpeechTrigger}, Medium speech: ${mediumSpeechTrigger}`,
      );

      // Create audio buffer with actual captured audio data
      const realAudioData = this.ringBuffer.getLatestWindow(this.config.sampleRate); // Get 1 second of real audio
      const mockAudioBuffer: AudioBuffer = {
        data: realAudioData.length > 0 ? realAudioData : new Float32Array(this.config.sampleRate),
        sampleRate: this.config.sampleRate,
        channels: 1,
        duration: 1.0,
        timestamp: currentTime,
      };

      await this.onWakeWordDetected(mockDetection, mockAudioBuffer);
    }
  }

  /**
   * Process TensorFlow Lite model predictions into wake word detections
   */
  private async processPredictions(prediction: number): Promise<WakeWordDetection[]> {
    const detections: WakeWordDetection[] = [];

    // Skip if no wake words are configured
    if (!this.config.wakeWords || this.config.wakeWords.length === 0) {
      return detections;
    }

    // For multi-class models, process each wake word prediction
    this.config.wakeWords.forEach((wakeWord, index) => {
      // Use the single prediction for all wake words (binary classification)
      const confidence = prediction;

      detections.push({
        wakeWord,
        confidence,
        timestamp: Date.now(),
        audioLength: PERFORMANCE_CONFIG.ringBufferSize / this.config.sampleRate,
      });
    });

    // Sort by confidence (highest first)
    detections.sort((a, b) => b.confidence - a.confidence);

    return detections;
  }

  /**
   * Handle wake word detection event
   */
  private async onWakeWordDetected(
    detection: WakeWordDetection,
    audioBuffer: AudioBuffer,
  ): Promise<void> {
    const now = Date.now();

    // Rate limiting: prevent multiple detections too close together
    if (now - this.lastDetectionTime < 1000) {
      console.log('⚠️ WakeWordEngine: Detection rate limited');
      return;
    }

    this.lastDetectionTime = now;
    this.detectionCount++;

    console.log('🎉 WakeWordEngine: Wake word detected!');
    console.log(`✅ Wake word: "${detection.wakeWord}"`);
    console.log(`✅ Confidence: ${detection.confidence.toFixed(3)}`);
    console.log(`✅ Detection count: ${this.detectionCount}`);

    try {
      // Stop wake word detection temporarily
      this.stopWakeWordDetectionLoop();

      // Provide haptic feedback
      await this.provideFeedback();

      // Start voice command recording
      await this.startVoiceCommandRecording();

      // Notify callbacks
      if (this.callbacks.onWakeWordDetected) {
        this.callbacks.onWakeWordDetected(detection);
      }
    } catch (error) {
      console.error('❌ WakeWordEngine: Error handling wake word detection:', error);
      // Restart wake word detection on error
      await this.restartWakeWordDetection();
    }
  }

  /**
   * Start voice command recording after wake word detection
   */
  private async startVoiceCommandRecording(): Promise<void> {
    console.log('🎤 WakeWordEngine: Starting voice command recording...');

    try {
      this.setState(WakeWordState.RECORDING);
      this.isRecording = true;
      this.recordingStartTime = Date.now();

      // 🚨 CRITICAL FIX: Clear any previous recording data to prevent mixing
      this.recordingData = [];
      console.log('🧹 WakeWordEngine: Cleared previous recording data');

      console.log('🔍 WakeWordEngine: Recording state check:');
      console.log(`   - State: ${this.state}`);
      console.log(`   - isRecording: ${this.isRecording}`);
      console.log(`   - recordingData length: ${this.recordingData.length}`);
      console.log(`   - AudioRecord should be capturing data now...`);

      // Reconfigure audio for high-quality command recording
      await this.configureCommandRecording();

      // Start voice activity detection for auto-stop
      this.voiceActivityDetector.start();

      // Set maximum recording timeout
      setTimeout(() => {
        if (this.isRecording) {
          console.log('⏰ WakeWordEngine: Maximum recording time reached');
          this.stopVoiceCommandRecording(false);
        }
      }, this.config.maxRecordingDuration);

      if (this.callbacks.onRecordingStart) {
        this.callbacks.onRecordingStart();
      }

      // Add debug timer to check if recording is actually happening
      const debugTimer = setInterval(() => {
        if (this.isRecording) {
          console.log(
            `🔍 WakeWordEngine: Recording debug - Chunks: ${this.recordingData.length}, State: ${this.state}`,
          );
          if (this.recordingData.length > 0) {
            const totalBytes = this.recordingData.reduce((sum, chunk) => sum + chunk.length, 0);
            console.log(`📊 WakeWordEngine: Recording progress - ${totalBytes} bytes collected`);
          } else {
            console.warn('⚠️ WakeWordEngine: No audio chunks being captured during recording!');
          }
        } else {
          clearInterval(debugTimer);
        }
      }, 1000);

      console.log('✅ WakeWordEngine: Voice command recording started');
      console.log('🎤 WakeWordEngine: Speak now - your command is being recorded!');
    } catch (error) {
      console.error('❌ WakeWordEngine: Failed to start command recording:', error);
      await this.restartWakeWordDetection();
    }
  }

  /**
   * Stop voice command recording and process the audio
   */
  private async stopVoiceCommandRecording(cancelled: boolean = false): Promise<void> {
    if (!this.isRecording) {
      return;
    }

    console.log(`🔇 WakeWordEngine: Stopping voice command recording (cancelled: ${cancelled})...`);

    try {
      this.isRecording = false;
      const recordingDuration = Date.now() - this.recordingStartTime;

      // Stop voice activity detection
      this.voiceActivityDetector.stop();

      // Clear silence timer
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }

      if (!cancelled && this.recordingData.length > 0) {
        // Process and send the recorded audio
        await this.processVoiceCommand(recordingDuration);
      }

      // Clean up recording data
      this.recordingData = [];

      if (this.callbacks.onRecordingStop) {
        this.callbacks.onRecordingStop({
          text: '', // Will be filled by API response
          audioData: new Uint8Array(),
          duration: recordingDuration,
          timestamp: Date.now(),
        });
      }

      console.log('✅ WakeWordEngine: Voice command recording stopped');
    } catch (error) {
      console.error('❌ WakeWordEngine: Error stopping command recording:', error);
    } finally {
      // Always restart wake word detection
      await this.restartWakeWordDetection();
    }
  }

  /**
   * Process recorded voice command and send to backend
   */
  private async processVoiceCommand(duration: number): Promise<void> {
    console.log('🔄 WakeWordEngine: Processing voice command...');

    try {
      this.setState(WakeWordState.PROCESSING);

      // Combine recorded audio data
      const audioData = this.combineAudioData(this.recordingData);
      console.log(`📊 Audio data size: ${audioData.length} bytes, duration: ${duration}ms`);

      // Enhanced debugging for audio data
      if (audioData.length === 0) {
        console.error('❌ WakeWordEngine: No audio data recorded!');
        console.error('📊 Recording chunks:', this.recordingData.length);
        console.error('📊 Recording started at:', this.recordingStartTime);
        console.error('📊 Current state:', this.state);
        throw new Error('No audio data was recorded');
      }

      // Check if audio data contains actual audio or is just zeros/silence
      const nonZeroBytes = Array.from(audioData.slice(0, 1000)).filter(byte => byte !== 0).length;
      const silenceRatio = 1 - nonZeroBytes / Math.min(1000, audioData.length);

      console.log(`🔍 WakeWordEngine: Audio analysis:`);
      console.log(`   - Total bytes: ${audioData.length}`);
      console.log(`   - Non-zero bytes in first 1000: ${nonZeroBytes}`);
      console.log(`   - Silence ratio: ${(silenceRatio * 100).toFixed(1)}%`);
      console.log(`   - Recording chunks: ${this.recordingData.length}`);
      console.log(`   - First 20 bytes: [${Array.from(audioData.slice(0, 20)).join(', ')}]`);

      if (silenceRatio > 0.95) {
        console.warn(
          '⚠️ WakeWordEngine: Audio appears to be mostly silence - recording may have failed',
        );
      }

      // Send to voice-to-text API
      const response = await this.voiceToTextAPI.transcribe(audioData, {
        format: 'wav',
        sampleRate: this.config.sampleRate,
        duration: duration,
      });

      console.log('✅ WakeWordEngine: Voice command transcribed');
      console.log(`📝 Transcription: "${response.text}"`);

      // Create voice command object
      const voiceCommand: VoiceCommand = {
        text: response.text,
        audioData: audioData,
        duration: duration,
        timestamp: Date.now(),
        confidence: response.confidence,
      };

      // Notify callbacks
      if (this.callbacks.onRecordingStop) {
        this.callbacks.onRecordingStop(voiceCommand);
      }
    } catch (error) {
      console.error('❌ WakeWordEngine: Voice command processing failed:', error);

      const wakeWordError: WakeWordError = {
        code: ERROR_CODES.NETWORK_ERROR,
        message: `Voice command processing failed: ${error}`,
        details: error,
        timestamp: Date.now(),
      };
      this.handleError(wakeWordError);
    }
  }

  /**
   * Restart wake word detection after command processing
   */
  private async restartWakeWordDetection(): Promise<void> {
    console.log('🔄 WakeWordEngine: Restarting wake word detection...');

    try {
      // Brief debounce period
      await new Promise<void>(resolve => setTimeout(resolve, 1000));

      if (this.isAlwaysListening) {
        this.setState(WakeWordState.LISTENING);
        this.startWakeWordDetectionLoop();
        console.log('✅ WakeWordEngine: Wake word detection restarted');
      }
    } catch (error) {
      console.error('❌ WakeWordEngine: Failed to restart wake word detection:', error);
    }
  }

  /**
   * Setup audio recording configuration
   */
  private setupAudioRecording(): void {
    try {
      const options = {
        sampleRate: this.config.sampleRate,
        channels: 1, // Mono
        bitsPerSample: 16,
        audioFormat: 'wav',
        bufferSize: this.config.bufferSize,
        wavFile: '', // Empty string to disable file output
      };

      console.log('🔧 WakeWordEngine: Setting up audio recording with options:', options);
      console.log('🔧 WakeWordEngine: Expected bytes per second:', this.config.sampleRate * 2); // 16-bit = 2 bytes per sample

      // Wrap AudioRecord.init in try-catch to prevent native crashes
      try {
        AudioRecord.init(options);
        console.log('✅ WakeWordEngine: AudioRecord initialized successfully');
      } catch (initError) {
        console.error('❌ WakeWordEngine: Failed to initialize AudioRecord:', initError);
        throw new Error(`AudioRecord initialization failed: ${initError}`);
      }

      // Setup audio data listener - ONLY 'data' event is supported by react-native-audio-record
      let audioDataCount = 0;
      let totalBytesReceived = 0;
      let recordingDataCount = 0; // Track data received during recording
      const startTime = Date.now();

      // Create and store the listener for cleanup
      this.audioDataListener = (data: string | Uint8Array | ArrayLike<number>) => {
        try {
          audioDataCount++;
          totalBytesReceived += data?.length || 0;

          // Track if we're receiving data during recording
          if (this.state === WakeWordState.RECORDING) {
            recordingDataCount++;
            if (recordingDataCount <= 10) {
              console.log(`🎤 WakeWordEngine: Recording data #${recordingDataCount} received:`, {
                type: typeof data,
                length: data?.length || 0,
                state: this.state,
                isRecording: this.isRecording,
              });
            }
          }

          // Log first few audio packets for debugging
          if (audioDataCount <= 5) {
            console.log(`🎤 WakeWordEngine: Audio data packet #${audioDataCount}:`, {
              type: typeof data,
              constructor: data?.constructor?.name,
              length: data?.length || 0,
              isUint8Array: data instanceof Uint8Array,
            });

            // Check if we're getting actual data
            if (data instanceof Uint8Array && data.length > 0) {
              console.log('🎤 WakeWordEngine: First 20 bytes:', Array.from(data.slice(0, 20)));
            }
          }

          // Log data rate every 100 packets
          if (audioDataCount % 100 === 0) {
            const elapsedSeconds = (Date.now() - startTime) / 1000;
            const bytesPerSecond = totalBytesReceived / elapsedSeconds;
            console.log(
              `📊 WakeWordEngine: Audio rate check - Packets: ${audioDataCount}, Bytes/sec: ${bytesPerSecond.toFixed(
                0,
              )}, Expected: ${this.config.sampleRate * 2}`,
            );

            if (this.state === WakeWordState.RECORDING) {
              console.log(`📊 WakeWordEngine: Recording packets so far: ${recordingDataCount}`);
            }
          }

          this.processAudioData(data);
        } catch (dataError) {
          console.error('❌ WakeWordEngine: Error in audio data listener:', dataError);
        }
      };

      // Set up the event listener with error handling
      try {
        AudioRecord.on('data', this.audioDataListener);
        console.log('✅ WakeWordEngine: Audio event listener set up for "data" events');
      } catch (listenerError) {
        console.error('❌ WakeWordEngine: Failed to set up audio listener:', listenerError);
        throw new Error(`Audio listener setup failed: ${listenerError}`);
      }
    } catch (error) {
      console.error('❌ WakeWordEngine: Critical error in setupAudioRecording:', error);
      throw error;
    }
  }

  /**
   * Process incoming audio data
   */
  private processAudioData(audioData: string | Uint8Array | ArrayLike<number>): void {
    try {
      // Enhanced debugging for audio data
      if (Math.random() < 0.01) {
        if (typeof audioData === 'string') {
          // Handle base64 string debugging
          console.log('🔍 WakeWordEngine: Raw audio data inspection (base64 string):', {
            type: typeof audioData,
            constructor: audioData?.constructor?.name,
            length: audioData?.length || 0,
            isBase64String: true,
            firstFewChars: audioData.substring(0, 20),
            estimatedBytes: Math.floor((audioData.length * 3) / 4), // base64 to bytes estimation
          });
        } else {
          console.log('🔍 WakeWordEngine: Raw audio data inspection:', {
            type: typeof audioData,
            constructor: audioData?.constructor?.name,
            length: audioData?.length || 0,
            isUint8Array: audioData instanceof Uint8Array,
            firstFewBytes:
              audioData instanceof Uint8Array ? Array.from(audioData.slice(0, 10)) : 'N/A',
            isAllZeros:
              audioData instanceof Uint8Array
                ? Array.from(audioData.slice(0, 100)).every((b: number) => b === 0)
                : 'N/A',
          });
        }
      }

      // Convert audio data to Float32Array
      const floatData = this.convertToFloat32Array(audioData);

      // Enhanced debugging for converted data
      if (Math.random() < 0.01) {
        // Log 1% of samples
        const maxValue = Math.max(...Array.from(floatData));
        const minValue = Math.min(...Array.from(floatData));
        const avgValue =
          Array.from(floatData).reduce((sum, val) => sum + Math.abs(val), 0) / floatData.length;

        console.log('🔍 WakeWordEngine: Converted float data inspection:', {
          length: floatData.length,
          maxValue: maxValue.toFixed(6),
          minValue: minValue.toFixed(6),
          avgAbsValue: avgValue.toFixed(6),
          isAllZeros: Array.from(floatData).every(val => val === 0),
          sampleValues: Array.from(floatData.slice(0, 10)).map(v => v.toFixed(6)),
        });
      }

      // Always add to ring buffer for wake word detection - REAL AUDIO DATA
      if (this.state === WakeWordState.LISTENING && floatData.length > 0) {
        this.ringBuffer.write(floatData);

        // Calculate and log real audio levels for debugging
        const audioLevel = this.calculateAudioLevel(floatData);
        if (Math.random() < 0.02) {
          // Increase logging frequency to 2%
          console.log(
            `🎤 WakeWordEngine: Real audio captured - Level: ${audioLevel.toFixed(6)}, Samples: ${
              floatData.length
            }, Max: ${Math.max(...Array.from(floatData)).toFixed(6)}, Min: ${Math.min(
              ...Array.from(floatData),
            ).toFixed(6)}`,
          );
        }
      }

      // Store for command recording when in recording state
      if (this.state === WakeWordState.RECORDING && this.recordingData) {
        // Convert audio data to Uint8Array properly before storing
        let audioBytes: Uint8Array;

        if (typeof audioData === 'string') {
          // Handle base64 string from react-native-audio-record
          try {
            const binaryString = atob(audioData);
            audioBytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              audioBytes[i] = binaryString.charCodeAt(i);
            }
            console.log(
              `🔍 WakeWordEngine: Decoded base64 audio chunk: ${audioBytes.length} bytes`,
            );
          } catch (error) {
            console.error('❌ WakeWordEngine: Failed to decode base64 audio for recording:', error);
            audioBytes = new Uint8Array(0);
          }
        } else if (audioData instanceof Uint8Array) {
          audioBytes = audioData;
          console.log(`🔍 WakeWordEngine: Raw Uint8Array audio chunk: ${audioBytes.length} bytes`);
        } else if (audioData && audioData.length !== undefined) {
          // Handle array-like objects
          audioBytes = new Uint8Array(audioData);
          console.log(`🔍 WakeWordEngine: Array-like audio chunk: ${audioBytes.length} bytes`);
        } else {
          console.warn(
            '⚠️ WakeWordEngine: Unknown audio data format for recording:',
            typeof audioData,
          );
          audioBytes = new Uint8Array(0);
        }

        if (audioBytes.length > 0) {
          // 🚨 CRITICAL FIX: Create a COPY of the audio data to prevent reference issues
          // The same Uint8Array reference might be reused by react-native-audio-record
          const audioBytesCopy = new Uint8Array(audioBytes.length);
          audioBytesCopy.set(audioBytes);

          // Calculate fingerprint of this chunk to detect if same audio is repeating
          const chunkHash = Array.from(audioBytesCopy.slice(0, 50)).reduce((hash, byte) => {
            return ((hash << 5) - hash + byte) & 0xffffffff;
          }, 0);

          console.log(`📊 WakeWordEngine: Audio chunk ${this.recordingData.length + 1}:`);
          console.log(`   - Size: ${audioBytesCopy.length} bytes`);
          console.log(`   - Fingerprint: ${chunkHash}`);
          console.log(
            `   - First 10 bytes: [${Array.from(audioBytesCopy.slice(0, 10)).join(', ')}]`,
          );
          console.log(
            `   - Non-zero bytes: ${
              Array.from(audioBytesCopy.slice(0, 100)).filter(b => b !== 0).length
            }/100`,
          );

          // Store the COPY, not the original reference
          this.recordingData.push(audioBytesCopy);

          // Log recording progress
          if (this.recordingData.length % 5 === 0) {
            const totalBytes = this.recordingData.reduce((sum, chunk) => sum + chunk.length, 0);
            console.log(
              `🎤 WakeWordEngine: Recording progress - ${this.recordingData.length} chunks, ${totalBytes} bytes total`,
            );

            // Check if we're getting the same audio chunks repeatedly
            if (this.recordingData.length >= 2) {
              const lastChunk = this.recordingData[this.recordingData.length - 1];
              const secondLastChunk = this.recordingData[this.recordingData.length - 2];

              const lastHash = Array.from(lastChunk.slice(0, 50)).reduce((hash, byte) => {
                return ((hash << 5) - hash + byte) & 0xffffffff;
              }, 0);

              const secondLastHash = Array.from(secondLastChunk.slice(0, 50)).reduce(
                (hash, byte) => {
                  return ((hash << 5) - hash + byte) & 0xffffffff;
                },
                0,
              );

              if (lastHash === secondLastHash) {
                console.warn(
                  '🚨 WakeWordEngine: DUPLICATE AUDIO DETECTED! Same audio chunk repeated!',
                );
                console.warn('   This suggests the microphone is not capturing new audio!');
              }
            }
          }
        } else {
          console.warn('⚠️ WakeWordEngine: Empty audio chunk received during recording!');
        }
      }
    } catch (error) {
      console.error('❌ WakeWordEngine: Error processing real audio data:', error);
    }
  }

  /**
   * Convert audio data to Float32Array
   * Handles various audio formats from react-native-audio-record
   */
  private convertToFloat32Array(
    audioData: string | Uint8Array | ArrayLike<number> | Float32Array | Int16Array,
  ): Float32Array {
    if (audioData instanceof Float32Array) {
      return audioData;
    }

    // Handle base64-encoded string from react-native-audio-record
    if (typeof audioData === 'string') {
      try {
        // Decode base64 string to binary data
        const binaryString = atob(audioData);
        const bytes = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Convert 16-bit PCM to Float32Array
        const result = new Float32Array(bytes.length / 2);

        for (let i = 0; i < result.length; i++) {
          // Read 16-bit little-endian signed integer and convert to float [-1, 1]
          const byte1 = bytes[i * 2] || 0;
          const byte2 = bytes[i * 2 + 1] || 0;

          // Combine bytes to form 16-bit signed integer (little-endian)
          let sample = byte1 | (byte2 << 8);

          // Convert to signed 16-bit
          if (sample >= 32768) {
            sample -= 65536;
          }

          // Convert to float [-1, 1]
          result[i] = sample / 32768.0;
        }

        if (Math.random() < 0.001) {
          // Log 0.1% of conversions to avoid spam
          console.log(
            `🔄 WakeWordEngine: Decoded base64 string (${audioData.length} chars) to ${bytes.length} bytes, then to ${result.length} float samples`,
          );
        }
        return result;
      } catch (error) {
        console.error('❌ WakeWordEngine: Error decoding base64 audio data:', error);
        return new Float32Array(0);
      }
    }

    // Handle Uint8Array or Buffer-like objects from react-native-audio-record
    if (audioData instanceof Uint8Array || (audioData && audioData.length !== undefined)) {
      // Convert 16-bit PCM to Float32Array
      const result = new Float32Array(audioData.length / 2);

      for (let i = 0; i < result.length; i++) {
        // Read 16-bit little-endian signed integer and convert to float [-1, 1]
        const byte1 = audioData[i * 2] || 0;
        const byte2 = audioData[i * 2 + 1] || 0;

        // Combine bytes to form 16-bit signed integer (little-endian)
        let sample = byte1 | (byte2 << 8);

        // Convert to signed 16-bit
        if (sample >= 32768) {
          sample -= 65536;
        }

        // Convert to float [-1, 1]
        result[i] = sample / 32768.0;
      }

      if (Math.random() < 0.001) {
        // Log 0.1% of conversions to avoid spam
        console.log(
          `🔄 WakeWordEngine: Converted ${audioData.length} bytes to ${result.length} float samples`,
        );
      }
      return result;
    }

    // Handle Int16Array
    if (audioData instanceof Int16Array) {
      const result = new Float32Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        result[i] = audioData[i] / 32768.0; // Convert from 16-bit int to float
      }
      return result;
    }

    // Handle Array or other iterable
    if (Array.isArray(audioData)) {
      return new Float32Array(audioData);
    } else if (audioData && typeof (audioData as any)[Symbol.iterator] === 'function') {
      return new Float32Array(Array.from(audioData as Iterable<number>));
    }

    console.warn(
      '⚠️ WakeWordEngine: Unknown audio data format:',
      typeof audioData,
      audioData?.constructor?.name,
    );
    return new Float32Array(0);
  }

  /**
   * Combine audio data chunks into a proper WAV file
   */
  private combineAudioData(chunks: Uint8Array[]): Uint8Array {
    // Calculate total PCM data length
    const pcmDataLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);

    if (pcmDataLength === 0) {
      console.warn('⚠️ WakeWordEngine: No audio data to combine');
      return new Uint8Array(0);
    }

    // Create WAV header (44 bytes)
    const wavHeader = this.createWavHeader(pcmDataLength, this.config.sampleRate);

    // Combine header + PCM data
    const result = new Uint8Array(wavHeader.length + pcmDataLength);
    result.set(wavHeader, 0);

    let offset = wavHeader.length;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    console.log(
      `🎵 WakeWordEngine: Created WAV file: ${result.length} bytes total (${pcmDataLength} PCM + ${wavHeader.length} header)`,
    );

    return result;
  }

  /**
   * Create a proper WAV file header
   */
  private createWavHeader(pcmDataLength: number, sampleRate: number): Uint8Array {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);

    // RIFF header
    view.setUint8(0, 0x52); // 'R'
    view.setUint8(1, 0x49); // 'I'
    view.setUint8(2, 0x46); // 'F'
    view.setUint8(3, 0x46); // 'F'

    // File size (minus 8 bytes for RIFF header)
    view.setUint32(4, 36 + pcmDataLength, true);

    // WAVE header
    view.setUint8(8, 0x57); // 'W'
    view.setUint8(9, 0x41); // 'A'
    view.setUint8(10, 0x56); // 'V'
    view.setUint8(11, 0x45); // 'E'

    // fmt chunk
    view.setUint8(12, 0x66); // 'f'
    view.setUint8(13, 0x6d); // 'm'
    view.setUint8(14, 0x74); // 't'
    view.setUint8(15, 0x20); // ' '

    // fmt chunk size (16 for PCM)
    view.setUint32(16, 16, true);

    // Audio format (1 = PCM)
    view.setUint16(20, 1, true);

    // Number of channels (1 = mono)
    view.setUint16(22, 1, true);

    // Sample rate
    view.setUint32(24, sampleRate, true);

    // Byte rate (sampleRate * numChannels * bitsPerSample / 8)
    view.setUint32(28, (sampleRate * 1 * 16) / 8, true);

    // Block align (numChannels * bitsPerSample / 8)
    view.setUint16(32, (1 * 16) / 8, true);

    // Bits per sample
    view.setUint16(34, 16, true);

    // data chunk
    view.setUint8(36, 0x64); // 'd'
    view.setUint8(37, 0x61); // 'a'
    view.setUint8(38, 0x74); // 't'
    view.setUint8(39, 0x61); // 'a'

    // data chunk size
    view.setUint32(40, pcmDataLength, true);

    return new Uint8Array(header);
  }

  /**
   * Update internal state and notify callbacks
   */
  private setState(newState: WakeWordState): void {
    if (this.state !== newState) {
      const oldState = this.state;
      this.state = newState;

      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange(oldState, newState);
      }
    }
  }

  /**
   * Handle errors and notify callbacks
   */
  private handleError(error: WakeWordError): void {
    console.error('WakeWordEngine error:', error);

    this.setState(WakeWordState.ERROR);

    if (this.callbacks.onError) {
      this.callbacks.onError(error);
    }
  }

  /**
   * Provide haptic and audio feedback
   */
  private async provideFeedback(): Promise<void> {
    if (this.config.enableHaptics) {
      RNHapticFeedback.trigger('impactLight', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    }

    // Audio feedback can be added here if needed
    // For now, we avoid it to prevent feedback loops
  }

  /**
   * Check and request permissions
   */
  private async checkPermissions(): Promise<PermissionStatus> {
    const microphonePermission = await check(
      PERMISSIONS.ANDROID.RECORD_AUDIO || PERMISSIONS.IOS.MICROPHONE,
    );

    if (microphonePermission !== RESULTS.GRANTED) {
      const result = await request(PERMISSIONS.ANDROID.RECORD_AUDIO || PERMISSIONS.IOS.MICROPHONE);
      return { microphone: result === RESULTS.GRANTED };
    }

    return { microphone: true };
  }

  /**
   * Track inference performance
   */
  private trackInferencePerformance(inferenceTime: number): void {
    this.inferenceTimeHistory.push(inferenceTime);
  }

  /**
   * Initialize audio components
   */
  private async initializeAudioComponents(): Promise<void> {
    // Additional initialization steps if needed
  }

  /**
   * Configure command recording
   */
  private async configureCommandRecording(): Promise<void> {
    // Additional configuration steps if needed
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<WakeWordConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 WakeWordEngine: Configuration updated');
  }

  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: WakeWordCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Get current state
   */
  getState(): WakeWordState {
    return this.state;
  }

  /**
   * Get current configuration
   */
  getConfig(): WakeWordConfig {
    return { ...this.config };
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    detectionCount: number;
    averageInferenceTime: number;
    uptime: number;
  } {
    const averageInferenceTime =
      this.inferenceTimeHistory.length > 0
        ? this.inferenceTimeHistory.reduce((sum, time) => sum + time, 0) /
          this.inferenceTimeHistory.length
        : 0;

    return {
      detectionCount: this.detectionCount,
      averageInferenceTime: Math.round(averageInferenceTime * 100) / 100,
      uptime: Date.now() - (this.lastDetectionTime || Date.now()),
    };
  }

  /**
   * Force stop current recording (emergency stop)
   */
  async forceStopRecording(): Promise<void> {
    if (this.isRecording) {
      console.log('🛑 WakeWordEngine: Force stopping recording...');
      await this.stopVoiceCommandRecording(true);
    }
  }

  /**
   * Reset detection count and performance history
   */
  resetStats(): void {
    this.detectionCount = 0;
    this.inferenceTimeHistory = [];
    this.lastDetectionTime = 0;
    console.log('📊 WakeWordEngine: Statistics reset');
  }

  /**
   * Check if engine is currently active (listening or recording)
   */
  isActive(): boolean {
    return this.isAlwaysListening || this.isRecording;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    console.log('🧹 WakeWordEngine: Cleaning up resources...');

    try {
      // Stop all operations
      await this.stopAlwaysListening();

      // Stop any ongoing recording
      if (this.isRecording) {
        await this.stopVoiceCommandRecording(true);
      }

      // Clean up components
      this.voiceActivityDetector.cleanup();
      this.modelManager.unload();
      this.ringBuffer.clear();

      // Remove audio event listener to prevent memory leaks
      if (this.audioDataListener) {
        try {
          // react-native-audio-record doesn't have removeListener method
          // Instead, we just set the listener to null and let garbage collection handle it
          this.audioDataListener = null;
          console.log('✅ WakeWordEngine: Audio event listener reference cleared');
        } catch (error) {
          console.warn('⚠️ WakeWordEngine: Error clearing audio listener:', error);
        }
      }

      // Clear timers
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }

      // Reset state
      this.isAlwaysListening = false;
      this.isRecording = false;
      this.recordingData = [];
      this.setState(WakeWordState.IDLE);

      console.log('✅ WakeWordEngine: Cleanup completed');
    } catch (error) {
      console.error('❌ WakeWordEngine: Error during cleanup:', error);
    }
  }

  /**
   * Add a wake word dynamically
   */
  addWakeWord(wakeWord: string, threshold: number = 0.7): void {
    if (!this.config.wakeWords.includes(wakeWord)) {
      this.config.wakeWords = [...this.config.wakeWords, wakeWord];
      this.config.wakeWordThresholds = {
        ...this.config.wakeWordThresholds,
        [wakeWord]: threshold,
      };

      console.log(`✅ WakeWordEngine: Added wake word "${wakeWord}" with threshold ${threshold}`);
      console.log(`🎤 WakeWordEngine: Active wake words: ${this.config.wakeWords.join(', ')}`);
    }
  }

  /**
   * Remove a wake word dynamically
   */
  removeWakeWord(wakeWord: string): void {
    this.config.wakeWords = this.config.wakeWords.filter(w => w !== wakeWord);
    const { [wakeWord]: removed, ...remainingThresholds } = this.config.wakeWordThresholds || {};
    this.config.wakeWordThresholds = remainingThresholds;

    console.log(`✅ WakeWordEngine: Removed wake word "${wakeWord}"`);
    console.log(`🎤 WakeWordEngine: Active wake words: ${this.config.wakeWords.join(', ')}`);
  }

  /**
   * Get threshold for a specific wake word
   */
  private getWakeWordThreshold(wakeWord: string): number {
    return this.config.wakeWordThresholds?.[wakeWord] || this.config.confidenceThreshold;
  }

  /**
   * Test CORS configuration with the backend
   */
  async testCORS(): Promise<boolean> {
    return await this.voiceToTextAPI.testCORS();
  }

  /**
   * Test microphone connectivity and audio capture
   */
  async testMicrophone(): Promise<boolean> {
    console.log('🎤 WakeWordEngine: Testing microphone...');

    return new Promise(resolve => {
      let audioDataReceived = 0;
      let testStartTime = Date.now();

      const testListener = (data: string | Uint8Array | ArrayLike<number>) => {
        audioDataReceived++;
        console.log(`🎤 Microphone Test: Audio packet #${audioDataReceived} received`);
        console.log(`   - Type: ${typeof data}`);
        console.log(`   - Length: ${data?.length || 0}`);

        if (data instanceof Uint8Array && data.length > 0) {
          const nonZeroBytes = Array.from(data.slice(0, 100)).filter(b => b !== 0).length;
          console.log(`   - Non-zero bytes: ${nonZeroBytes}/100`);
          console.log(`   - First 10 bytes: [${Array.from(data.slice(0, 10)).join(', ')}]`);
        }

        // Stop test after 3 seconds or 5 packets
        if (Date.now() - testStartTime > 3000 || audioDataReceived >= 5) {
          try {
            AudioRecord.off('data', testListener);
          } catch (error) {
            console.warn('Could not remove test listener:', error);
          }

          console.log(`🎤 Microphone Test Complete:`);
          console.log(`   - Packets received: ${audioDataReceived}`);
          console.log(`   - Test duration: ${Date.now() - testStartTime}ms`);

          if (audioDataReceived > 0) {
            console.log('✅ Microphone is working - audio data is being captured');
            resolve(true);
          } else {
            console.error('❌ Microphone test failed - no audio data received');
            resolve(false);
          }
        }
      };

      try {
        AudioRecord.on('data', testListener);
        console.log('🎤 Microphone test started - speak loudly for 3 seconds...');

        // Fallback timeout
        setTimeout(() => {
          if (audioDataReceived === 0) {
            console.error('❌ Microphone test timeout - no audio received');
            try {
              AudioRecord.off('data', testListener);
            } catch (error) {
              console.warn('Could not remove test listener:', error);
            }
            resolve(false);
          }
        }, 5000);
      } catch (error) {
        console.error('❌ Failed to start microphone test:', error);
        resolve(false);
      }
    });
  }
}
