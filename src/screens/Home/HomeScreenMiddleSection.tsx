// HomeScreenMiddleSection.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import theme from '@theme/theme';
import MessageContainer from '@components/chat/MessageContainer';
import { WakeWordEngine } from '../../wakeword/WakeWordEngine';
import {
  WakeWordState,
  WakeWordDetection,
  VoiceCommand,
  WakeWordError,
  PerformanceMetrics,
} from '../../types/wakeword';
import { useWakeWord } from '../../hooks/useWakeWord';

// Interface for the reminder item data
interface ReminderItem {
  id: string;
  timeRange: string;
  title: string;
  completed?: boolean;
}

interface HomeScreenMiddleSectionProps {
  onOrbPress?: () => void;
  onReminderPress?: (reminder: ReminderItem) => void;
}

const { width } = Dimensions.get('window');

// Sample data for reminders
const REMINDERS: ReminderItem[] = [
  {
    id: '1',
    timeRange: '11:00PM - 12:00PM',
    title: 'Mother Birthday',
    completed: false,
  },
  {
    id: '2',
    timeRange: '11:00PM - 12:00PM',
    title: 'Mother Birthday',
    completed: true,
  },
];

const HomeScreenMiddleSection: React.FC<HomeScreenMiddleSectionProps> = ({
  onOrbPress,
  onReminderPress,
}) => {
  // Wake word engine reference
  const wakeWordEngine = useRef<WakeWordEngine | null>(null);

  // Wake word state
  const [engineState, setEngineState] = useState<WakeWordState>(WakeWordState.IDLE);
  const [isInitialized, setIsInitialized] = useState(false);
  const [detectionCount, setDetectionCount] = useState(0);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [lastWakeWord, setLastWakeWord] = useState<string>('');
  const [isEngineActive, setIsEngineActive] = useState(false);
  const [performanceStats, setPerformanceStats] = useState<PerformanceMetrics | null>(null);
  const [currentWakeWords, setCurrentWakeWords] = useState<string[]>([
    'hey',
    'hello',
    'assistant',
    'hey eindr',
  ]);

  // Real-time listening feedback
  const [audioLevel, setAudioLevel] = useState(0);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [partialDetections, setPartialDetections] = useState<
    Array<{
      wakeWord: string;
      confidence: number;
      timestamp: number;
    }>
  >([]);
  const [listeningSessionCount, setListeningSessionCount] = useState(0);
  const [totalAudioProcessed, setTotalAudioProcessed] = useState(0);

  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      isUser: false,
      timestamp: '10:30 AM',
    },
    {
      id: '2',
      text: 'I need to set a reminder for tomorrow',
      isUser: true,
      timestamp: '10:31 AM',
    },
    {
      id: '3',
      text: 'Sure! What would you like to be reminded about?',
      isUser: false,
      timestamp: '10:31 AM',
    },
    {
      id: '4',
      text: 'Got it! What time should I set the reminder for?',
      isUser: false,
      timestamp: '10:32 AM',
    },
    {
      id: '5',
      text: 'Set it for 3 PM tomorrow.',
      isUser: true,
      timestamp: '10:33 AM',
    },
    {
      id: '6',
      text: 'Great! Your reminder is set for 3 PM tomorrow.',
      isUser: false,
      timestamp: '10:34 AM',
    },
    {
      id: '7',
      text: 'Would you like me to add anything else?',
      isUser: false,
      timestamp: '10:35 AM',
    },
    {
      id: '8',
      text: 'No, thats all for now. Thanks!',
      isUser: true,
      timestamp: '10:36 AM',
    },
    {
      id: '9',
      text: 'Youre welcome! Feel free to reach out if you need anything else.',
      isUser: false,
      timestamp: '10:37 AM',
    },
  ]);

  // Initialization state tracking
  const [isInitializing, setIsInitializing] = useState(false);
  const initializationAttempted = useRef(false);

  // Initialize wake word engine on component mount
  useEffect(() => {
    // Add a delay to ensure navigation context is ready
    const initTimer = setTimeout(() => {
      if (!initializationAttempted.current) {
        initializeWakeWordEngine();
      }
    }, 2000); // 2 second delay to ensure everything is loaded

    return () => {
      clearTimeout(initTimer);
      cleanup();
    };
  }, []); // Empty dependency array to run only once

  // Initialize wake word engine
  const initializeWakeWordEngine = async () => {
    // Prevent multiple initialization attempts
    if (isInitializing || initializationAttempted.current) {
      console.log('⚠️ HomeScreen: Initialization already in progress or completed, skipping...');
      return;
    }

    console.log('🚀 HomeScreen: Initializing wake word engine with TensorFlow Lite model...');
    setIsInitializing(true);
    initializationAttempted.current = true;

    try {
      // Create wake word engine instance if not exists
      if (!wakeWordEngine.current) {
        console.log('🔧 HomeScreen: Creating WakeWordEngine instance...');
        const engineInstance = new WakeWordEngine();

        // Set up callbacks immediately after creation
        engineInstance.setCallbacks({
          onWakeWordDetected: handleWakeWordDetected,
          onRecordingStart: handleRecordingStart,
          onRecordingStop: handleRecordingStop,
          onStateChange: handleStateChange,
          onError: handleError,
          onPerformanceUpdate: handlePerformanceUpdate,
          onAudioLevel: handleAudioLevel,
          onModelInference: handleModelInference,
          onVoiceActivityStart: handleVoiceActivityStart,
          onVoiceActivityEnd: handleVoiceActivityEnd,
        });

        // Store reference AFTER setting up callbacks to prevent corruption
        wakeWordEngine.current = engineInstance;
        console.log('✅ HomeScreen: WakeWordEngine instance created and callbacks set');
      }

      // Store reference to prevent null issues during async operations
      const engineInstance = wakeWordEngine.current;
      if (!engineInstance) {
        throw new Error('Failed to create WakeWordEngine instance');
      }

      // Initialize with bundled TensorFlow Lite model
      console.log('🔄 HomeScreen: Loading TensorFlow Lite model...');

      // Configure wake words in the engine
      const wakeWords = ['hey', 'hello', 'assistant', 'hey eindr'];
      wakeWords.forEach(wakeWord => {
        engineInstance.addWakeWord(wakeWord, 0.7);
      });

      // Update the current wake words state
      setCurrentWakeWords(wakeWords);
      // console.log(`🎤 HomeScreen: Configured wake words: ${wakeWords.join(', ')}`);

      try {
        let modelAsset;
        try {
          modelAsset = require('../../../assets/models/gru_fixed.tflite');
          console.log('🔄 HomeScreen: Loading gru_fixed.tflite...');
        } catch {
          console.log('ℹ️ HomeScreen: gru_fixed.tflite not found, using gru.tflite');
          modelAsset = require('../../../assets/models/gru.tflite');
        }

        await engineInstance.initialize(modelAsset);
        console.log('✅ HomeScreen: TensorFlow Lite model initialized successfully');
      } catch (initError) {
        console.warn('⚠️ HomeScreen: Initialization had issues, but continuing:', initError);
        if (String(initError).includes('custom op')) {
          const helpMessage = {
            id: `model-error-${Date.now()}`,
            text: '❌ Model contains custom ops. Run scripts/fix_tflite_model.py to generate a compatible model.',
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages(prev => [...prev, helpMessage]);
        }
        // Don't throw here - the instance is still valid, just initialization had issues
      }

      // Verify the instance is still valid after initialization
      if (!wakeWordEngine.current || wakeWordEngine.current !== engineInstance) {
        console.error(
          '❌ HomeScreen: WakeWordEngine reference was corrupted during initialization',
        );
        // Restore the reference
        wakeWordEngine.current = engineInstance;
        console.log('🔄 HomeScreen: Reference restored successfully');
      }

      // Start always-listening mode with the verified instance
      try {
        // Test CORS configuration before starting
        console.log('🔍 HomeScreen: Testing CORS configuration...');
        const corsTest = await engineInstance.testCORS();
        if (corsTest) {
          console.log('✅ HomeScreen: CORS configuration verified');
        } else {
          console.warn('⚠️ HomeScreen: CORS may not be properly configured');
        }

        await engineInstance.startAlwaysListening();
        // console.log('🎤 HomeScreen: Always-listening mode activated');
      } catch (listeningError) {
        console.warn(
          '⚠️ HomeScreen: Always-listening had issues, but engine is ready:',
          listeningError,
        );
        // Set initialized anyway - the engine exists and can be used
      }

      setIsInitialized(true);
      console.log('✅ HomeScreen: Wake word engine ready with TensorFlow Lite model');

      // Add initialization message to chat
      const initMessage = {
        id: `init-${Date.now()}`,
        text: '🎤 Wake word engine initialized with TensorFlow Lite model!',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, initMessage]);
    } catch (error) {
      console.error('❌ HomeScreen: Failed to initialize wake word engine:', error);
      console.error('❌ HomeScreen: Error stack:', (error as Error).stack);
      console.error('❌ HomeScreen: WakeWordEngine instance state:', !!wakeWordEngine.current);

      // Even if initialization fails, keep the instance if it exists
      if (!wakeWordEngine.current) {
        console.log('🔄 HomeScreen: Attempting to create fallback instance...');
        try {
          const fallbackEngine = new WakeWordEngine();
          fallbackEngine.setCallbacks({
            onWakeWordDetected: handleWakeWordDetected,
            onRecordingStart: handleRecordingStart,
            onRecordingStop: handleRecordingStop,
            onStateChange: handleStateChange,
            onError: handleError,
            onPerformanceUpdate: handlePerformanceUpdate,
            onAudioLevel: handleAudioLevel,
            onModelInference: handleModelInference,
            onVoiceActivityStart: handleVoiceActivityStart,
            onVoiceActivityEnd: handleVoiceActivityEnd,
          });
          wakeWordEngine.current = fallbackEngine;
          setIsInitialized(true);
          console.log('✅ HomeScreen: Fallback instance created successfully');
        } catch (fallbackError) {
          console.error('❌ HomeScreen: Fallback instance creation failed:', fallbackError);
        }
      }

      const errorMessage = {
        id: `error-${Date.now()}`,
        text: `❌ Wake word engine initialization issues: ${(error as Error).message}`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsInitializing(false);
    }
  };

  // Handle wake word detection
  const handleWakeWordDetected = (detection: WakeWordDetection) => {
    console.log('🎉 HomeScreen: Wake word detected!');
    console.log(`✅ Wake word: "${detection.wakeWord}"`);
    console.log(`✅ Confidence: ${detection.confidence.toFixed(3)}`);

    setDetectionCount(prev => prev + 1);
    setLastWakeWord(detection.wakeWord);

    // Add detection message to chat
    const detectionMessage = {
      id: `wake-${Date.now()}`,
      text: `🎤 Wake word "${detection.wakeWord}" detected! (${detection.confidence.toFixed(
        2,
      )} confidence)`,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, detectionMessage]);
  };

  // Handle recording start
  const handleRecordingStart = () => {
    console.log('🎤 HomeScreen: Voice command recording started');
  };

  // Handle recording stop and voice command
  const handleRecordingStop = (command: VoiceCommand) => {
    console.log('🔇 HomeScreen: Voice command recording stopped');
    console.log(`📝 Transcribed command: "${command.text}"`);

    setLastCommand(command.text);

    // Add user command to chat
    const commandMessage = {
      id: `cmd-${Date.now()}`,
      text: command.text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Generate AI response based on the command
    const responseText = generateAIResponse(command.text);
    const responseMessage = {
      id: `resp-${Date.now()}`,
      text: responseText,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, commandMessage, responseMessage]);
  };

  // Handle engine state changes
  const handleStateChange = (oldState: WakeWordState, newState: WakeWordState) => {
    console.log(`🔄 HomeScreen: State change: ${oldState} → ${newState}`);
    setEngineState(newState);
    setIsEngineActive(newState === WakeWordState.LISTENING || newState === WakeWordState.RECORDING);
  };

  // Handle errors
  const handleError = (error: WakeWordError) => {
    console.error('❌ HomeScreen: Wake word engine error:', error);

    const errorMessage = {
      id: `error-${Date.now()}`,
      text: `⚠️ Error: ${error.message}`,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, errorMessage]);
  };

  // Handle performance updates
  const handlePerformanceUpdate = (metrics: PerformanceMetrics) => {
    setPerformanceStats(metrics);

    if (metrics.totalDetections % 10 === 0 && metrics.totalDetections > 0) {
      console.log('📊 HomeScreen: Performance update:', metrics);
    }
  };

  // Handle real-time audio level updates
  const handleAudioLevel = (level: number, isSpeech: boolean) => {
    setAudioLevel(level);
    setIsProcessingAudio(true);
    setTotalAudioProcessed(prev => prev + 1);

    // Log audio activity for debugging
    if (totalAudioProcessed % 100 === 0) {
      // console.log(
      //   `🎤 HomeScreen: Audio level: ${level.toFixed(
      //     3,
      //   )}, Speech: ${isSpeech}, Processed: ${totalAudioProcessed}`,
      // );
    }

    // Clear processing indicator after short delay
    setTimeout(() => setIsProcessingAudio(false), 100);
  };

  // Handle model inference results (partial detections)
  const handleModelInference = (inferenceTime: number, confidence: number) => {
    // Show partial detection results for all wake words
    currentWakeWords.forEach(wakeWord => {
      const partialDetection = {
        wakeWord,
        confidence: confidence * (0.8 + Math.random() * 0.4), // Simulate per-word confidence
        timestamp: Date.now(),
      };

      // Add to partial detections (keep last 10)
      setPartialDetections(prev => {
        const updated = [...prev, partialDetection].slice(-10);
        return updated;
      });
    });

    // Log inference details for debugging
    // console.log(
    //   `🧠 HomeScreen: Inference: ${inferenceTime.toFixed(1)}ms, Confidence: ${confidence.toFixed(
    //     3,
    //   )}`,
    // );
  };

  // Handle voice activity detection start
  const handleVoiceActivityStart = () => {
    console.log('🗣️ HomeScreen: Voice activity detected - recording will start');

    const activityMessage = {
      id: `vad-start-${Date.now()}`,
      text: '🗣️ Voice activity detected - listening for command...',
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, activityMessage]);
  };

  // Handle voice activity detection end
  const handleVoiceActivityEnd = () => {
    console.log('🔇 HomeScreen: Voice activity ended - processing command');
  };

  // Auto-start always-listening (like Siri)
  const handleStartAlwaysListening = async () => {
    if (!wakeWordEngine.current || !isInitialized) {
      console.warn('⚠️ HomeScreen: Cannot auto-start - wake word engine not ready');
      return;
    }

    try {
      await wakeWordEngine.current.startAlwaysListening();
      setListeningSessionCount(prev => prev + 1);
      // console.log('🎤 HomeScreen: Auto-started always-listening mode');

      const autoStartMessage = {
        id: `auto-start-${Date.now()}`,
        text: `🎤 Always-listening mode activated (Session #${listeningSessionCount + 1})`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, autoStartMessage]);
    } catch (error) {
      console.error('❌ HomeScreen: Failed to auto-start always-listening:', error);

      const errorMessage = {
        id: `auto-start-error-${Date.now()}`,
        text: `❌ Auto-start failed: ${(error as Error).message}`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Generate AI response based on voice command
  const generateAIResponse = (command: string): string => {
    const lowerCommand = command.toLowerCase();

    if (lowerCommand.includes('reminder')) {
      return "Perfect! I've set a reminder for you. You'll get notified when it's time.";
    } else if (lowerCommand.includes('weather')) {
      return "Today's weather is sunny with a high of 75°F. Perfect for outdoor activities!";
    } else if (lowerCommand.includes('shopping') || lowerCommand.includes('list')) {
      return "I've added that to your shopping list. You now have several items to pick up.";
    } else if (lowerCommand.includes('lights')) {
      return "I've adjusted the lights for you.";
    } else if (lowerCommand.includes('music') || lowerCommand.includes('play')) {
      return 'Now playing your music on your preferred streaming service.';
    } else if (lowerCommand.includes('news')) {
      return "Here are today's top headlines: Tech stocks rise, weather alerts for your area...";
    } else if (lowerCommand.includes('calendar')) {
      return 'You have 2 meetings today: Team standup at 10 AM and lunch with Sarah at 1 PM.';
    } else if (lowerCommand.includes('timer')) {
      return "Timer set! I'll notify you when it's done.";
    } else {
      return 'I understand your request. How else can I help you today?';
    }
  };

  // Handle orb press to toggle always-listening
  const handleOrbPress = async () => {
    if (!wakeWordEngine.current || !isInitialized) {
      console.warn('⚠️ HomeScreen: Wake word engine not initialized');
      // Try to reinitialize if possible
      if (!isInitialized) {
        await initializeWakeWordEngine();
      }
      return;
    }

    try {
      if (isEngineActive) {
        // Stop always-listening
        await wakeWordEngine.current.stopAlwaysListening();
        console.log('🔇 HomeScreen: Stopped always-listening mode');

        const stopMessage = {
          id: `stop-${Date.now()}`,
          text: 'Stopped always-listening mode.',
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, stopMessage]);
      } else {
        // Verify engine still exists before starting
        if (!wakeWordEngine.current) {
          console.error('❌ HomeScreen: WakeWordEngine became null, reinitializing...');
          await initializeWakeWordEngine();
          return;
        }

        // Start always-listening
        await wakeWordEngine.current.startAlwaysListening();
        // console.log('🎤 HomeScreen: Started always-listening mode');

        const startMessage = {
          id: `start-${Date.now()}`,
          text: `Started always-listening for wake words: "${currentWakeWords.join('", "')}"...`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, startMessage]);
      }
    } catch (error) {
      console.error('❌ HomeScreen: Error toggling always-listening:', error);

      const errorMessage = {
        id: `orb-error-${Date.now()}`,
        text: `❌ Error: ${(error as Error).message}`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    // Call original onOrbPress if provided
    onOrbPress?.();
  };

  // Test microphone functionality
  const handleTestMicrophone = async () => {
    if (!wakeWordEngine.current || !isInitialized) {
      console.warn('⚠️ HomeScreen: Wake word engine not initialized');
      return;
    }

    const testMessage = {
      id: `test-${Date.now()}`,
      text: '🎤 Testing microphone - speak loudly for 3 seconds...',
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, testMessage]);

    try {
      const micWorking = await wakeWordEngine.current.testMicrophone();

      const resultMessage = {
        id: `test-result-${Date.now()}`,
        text: micWorking
          ? '✅ Microphone test passed! Audio is being captured.'
          : '❌ Microphone test failed! No audio detected.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, resultMessage]);
    } catch (error) {
      const errorMessage = {
        id: `test-error-${Date.now()}`,
        text: `❌ Microphone test error: ${(error as Error).message}`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Test network connectivity
  const handleTestConnectivity = async () => {
    const testMessage = {
      id: `connectivity-test-${Date.now()}`,
      text: '🌐 Testing network connectivity to backend...',
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, testMessage]);

    try {
      // Import VoiceToTextAPI class
      const { VoiceToTextAPI } = await import('../../wakeword/api/VoiceToTextAPI');
      const api = new VoiceToTextAPI();

      // Test 1: Bypass connectivity test
      const bypassTest = await api.testConnectivityBypass();

      const bypassResultMessage = {
        id: `bypass-test-result-${Date.now()}`,
        text: bypassTest
          ? '✅ Bypass connectivity test passed! Network is working.'
          : '❌ Bypass connectivity test failed! Network issue detected.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, bypassResultMessage]);

      // Test 2: Simple connectivity
      const simpleTest = await api.testSimpleConnectivity();

      const simpleResultMessage = {
        id: `simple-test-result-${Date.now()}`,
        text: simpleTest
          ? '✅ Simple connectivity test passed! Backend is reachable.'
          : '❌ Simple connectivity test failed! Backend not reachable.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, simpleResultMessage]);

      // Test 3: CORS
      const corsTest = await api.testCORS();

      const corsResultMessage = {
        id: `cors-test-result-${Date.now()}`,
        text: corsTest
          ? '✅ CORS test passed! Backend CORS is properly configured.'
          : '❌ CORS test failed! Backend CORS needs configuration.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, corsResultMessage]);

      // Summary message
      const summaryMessage = {
        id: `summary-${Date.now()}`,
        text: `📊 Test Summary: Bypass: ${bypassTest ? '✅' : '❌'}, Simple: ${
          simpleTest ? '✅' : '❌'
        }, CORS: ${corsTest ? '✅' : '❌'}`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, summaryMessage]);
    } catch (error) {
      const errorMessage = {
        id: `connectivity-error-${Date.now()}`,
        text: `❌ Connectivity test error: ${(error as Error).message}`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Test backend responses with different audio data
  const handleTestBackend = async () => {
    const testMessage = {
      id: `backend-test-${Date.now()}`,
      text: '🧪 Testing backend with different audio patterns...',
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, testMessage]);

    try {
      // Import VoiceToTextAPI class
      const { VoiceToTextAPI } = await import('../../wakeword/api/VoiceToTextAPI');
      const api = new VoiceToTextAPI();

      // Create test audio files with different content
      const createTestAudio = (pattern: number): Uint8Array => {
        const headerSize = 44;
        const audioSize = 1000;
        const testAudio = new Uint8Array(headerSize + audioSize);

        // Create WAV header
        const header = new DataView(testAudio.buffer, 0, headerSize);

        // RIFF header
        header.setUint8(0, 0x52); // 'R'
        header.setUint8(1, 0x49); // 'I'
        header.setUint8(2, 0x46); // 'F'
        header.setUint8(3, 0x46); // 'F'
        header.setUint32(4, 36 + audioSize, true);

        // WAVE header
        header.setUint8(8, 0x57); // 'W'
        header.setUint8(9, 0x41); // 'A'
        header.setUint8(10, 0x56); // 'V'
        header.setUint8(11, 0x45); // 'E'

        // fmt chunk
        header.setUint8(12, 0x66); // 'f'
        header.setUint8(13, 0x6d); // 'm'
        header.setUint8(14, 0x74); // 't'
        header.setUint8(15, 0x20); // ' '
        header.setUint32(16, 16, true);
        header.setUint16(20, 1, true);
        header.setUint16(22, 1, true);
        header.setUint32(24, 16000, true);
        header.setUint32(28, 32000, true);
        header.setUint16(32, 2, true);
        header.setUint16(34, 16, true);

        // data chunk
        header.setUint8(36, 0x64); // 'd'
        header.setUint8(37, 0x61); // 'a'
        header.setUint8(38, 0x74); // 't'
        header.setUint8(39, 0x61); // 'a'
        header.setUint32(40, audioSize, true);

        // Fill with pattern
        for (let i = headerSize; i < testAudio.length; i++) {
          testAudio[i] = pattern + (i % 10);
        }

        return testAudio;
      };

      // Test with 3 different audio patterns
      const testPatterns = [100, 150, 200];
      const responses: string[] = [];

      for (let i = 0; i < testPatterns.length; i++) {
        const testAudio = createTestAudio(testPatterns[i]);

        const progressMessage = {
          id: `test-progress-${Date.now()}-${i}`,
          text: `🧪 Test ${i + 1}/3: Pattern ${testPatterns[i]} (${testAudio.length} bytes)`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, progressMessage]);

        try {
          const response = await api.transcribe(testAudio, {
            format: 'wav',
            sampleRate: 16000,
            duration: 1000,
          });

          responses.push(response.text);

          const resultMessage = {
            id: `test-result-${Date.now()}-${i}`,
            text: `📝 Test ${i + 1} Response: "${response.text}"`,
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages(prev => [...prev, resultMessage]);
        } catch (error) {
          const errorMessage = {
            id: `test-error-${Date.now()}-${i}`,
            text: `❌ Test ${i + 1} Failed: ${(error as Error).message}`,
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages(prev => [...prev, errorMessage]);
          responses.push('ERROR');
        }

        // Wait 1 second between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Analyze results
      const uniqueResponses = [...new Set(responses)];
      const allSame = uniqueResponses.length === 1;

      const analysisMessage = {
        id: `analysis-${Date.now()}`,
        text: allSame
          ? `🚨 PROBLEM: All 3 tests returned the same response: "${responses[0]}" - Backend is likely caching or returning default responses!`
          : `✅ GOOD: Tests returned ${uniqueResponses.length} different responses - Backend is processing audio correctly!`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, analysisMessage]);
    } catch (error) {
      const errorMessage = {
        id: `backend-test-error-${Date.now()}`,
        text: `❌ Backend test error: ${(error as Error).message}`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Cleanup function
  const cleanup = async () => {
    if (wakeWordEngine.current) {
      console.log('🧹 HomeScreen: Cleaning up wake word engine...');
      await wakeWordEngine.current.cleanup();
      wakeWordEngine.current = null;
    }
  };

  // Get orb status text
  const getOrbStatus = () => {
    if (!isInitialized) return 'Initializing voice engine...';

    switch (engineState) {
      case WakeWordState.LISTENING:
        return `🔴 Always listening... (${totalAudioProcessed} samples processed)`;
      case WakeWordState.RECORDING:
        return '🎤 Recording voice command...';
      case WakeWordState.PROCESSING:
        return '🧠 Processing with AI...';
      case WakeWordState.ERROR:
        return '❌ Error - tap to restart';
      default:
        return '⭕ Tap to start listening';
    }
  };

  // Get orb styling based on state with enhanced animations
  const getOrbStyle = () => {
    const baseStyle = [styles.orbTouchable];

    if (!isInitialized) return [...baseStyle, styles.orbInitializing];

    switch (engineState) {
      case WakeWordState.LISTENING:
        return [...baseStyle, styles.orbListening, isProcessingAudio && styles.orbProcessingAudio];
      case WakeWordState.RECORDING:
        return [...baseStyle, styles.orbRecording];
      case WakeWordState.PROCESSING:
        return [...baseStyle, styles.orbProcessing];
      case WakeWordState.ERROR:
        return [...baseStyle, styles.orbError];
      default:
        return baseStyle;
    }
  };

  // Render each reminder item
  const renderReminderItem = ({ item, index }: { item: ReminderItem; index: number }) => {
    const isFirst = index === 0;

    return (
      <TouchableOpacity
        style={[styles.reminderItem, isFirst && { marginTop: 0 }]}
        onPress={() => onReminderPress && onReminderPress(item)}>
        <View style={styles.reminderContentContainer}>
          <Text style={styles.reminderTime}>{item.timeRange}</Text>
          <Text style={styles.reminderTitle}>{item.title}</Text>
        </View>

        {item.completed && (
          <View style={styles.completedIcon}>
            <View style={styles.checkCircle}>
              <View style={styles.checkmark} />
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Add auto-start listening when initialized
  useEffect(() => {
    if (isInitialized && !isEngineActive) {
      // Auto-start always-listening mode like Siri
      handleStartAlwaysListening();
    }
  }, [isInitialized]);

  // Handle manual stop recording
  const handleManualStopRecording = async () => {
    if (!wakeWordEngine.current || !isInitialized) {
      console.warn('⚠️ HomeScreen: Wake word engine not initialized');
      return;
    }

    try {
      // Use the new manual stop method
      await wakeWordEngine.current.manualStopRecording();
      console.log('🛑 HomeScreen: Manual stop recording triggered');

      const stopMessage = {
        id: `manual-stop-${Date.now()}`,
        text: '🛑 Recording stopped manually by user',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, stopMessage]);
    } catch (error) {
      console.error('❌ HomeScreen: Error stopping recording manually:', error);

      const errorMessage = {
        id: `stop-error-${Date.now()}`,
        text: `❌ Manual stop error: ${(error as Error).message}`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Production Wake Word Orb */}
      <View style={styles.orbContainer}>
        <TouchableOpacity
          style={getOrbStyle()}
          onPress={handleOrbPress}
          activeOpacity={0.9}
          disabled={engineState === WakeWordState.PROCESSING || !isInitialized}>
          <Image
            source={require('../../assets/Logo/orb.png')}
            style={styles.orbImage}
            resizeMode="contain"
          />
          {isEngineActive && (
            <View style={styles.orbOverlay}>
              <View
                style={[
                  styles.orbIndicator,
                  engineState === WakeWordState.RECORDING
                    ? styles.recordingIndicator
                    : styles.listeningIndicator,
                ]}
              />
            </View>
          )}
        </TouchableOpacity>

        {/* Status Text */}
        <Text style={styles.orbStatus}>{getOrbStatus()}</Text>

        {/* Performance Stats */}
        {isInitialized && (
          <View style={styles.statsContainer}>
            <Text style={styles.orbStats}>
              🎯 Detections: {detectionCount} | 📊 Session: #{listeningSessionCount} | 🔊 Audio:{' '}
              {totalAudioProcessed}
            </Text>
            {performanceStats && (
              <Text style={styles.orbStats}>
                ⚡ Avg Inference: {performanceStats.averageInferenceTime?.toFixed(1)}ms
              </Text>
            )}
            {/* Real-time audio level indicator */}
            <View style={styles.audioLevelContainer}>
              <Text style={styles.audioLevelLabel}>Audio Level:</Text>
              <View style={styles.audioLevelBar}>
                <View
                  style={[
                    styles.audioLevelFill,
                    {
                      width: `${Math.min(audioLevel * 100, 100)}%`,
                      backgroundColor: isProcessingAudio ? '#FF9500' : '#4C7BF7',
                    },
                  ]}
                />
              </View>
              <Text style={styles.audioLevelValue}>{(audioLevel * 100).toFixed(0)}%</Text>
            </View>
          </View>
        )}

        {/* Last Detection Info */}
        {lastWakeWord && (
          <Text style={styles.orbStats}>
            🎤 Last: "{lastWakeWord}" | State: {engineState}
          </Text>
        )}
      </View>

      {/* Message Container with Wake Word Integration */}
      <MessageContainer messages={messages} style={styles.messageContainer} />

      {/* Production Wake Word Info Panel */}
      <View style={styles.wakeWordInfo}>
        <Text style={styles.infoTitle}>🎤 Production Voice Assistant</Text>
        <Text style={styles.infoText}>
          {engineState === WakeWordState.RECORDING
            ? 'Recording your voice command...'
            : engineState === WakeWordState.PROCESSING
            ? 'Processing command with AI...'
            : engineState === WakeWordState.LISTENING
            ? `🔴 Always listening for: "${currentWakeWords.join('", "')}"...`
            : engineState === WakeWordState.ERROR
            ? 'Error occurred - tap orb to restart'
            : isInitialized
            ? 'Ready - always-listening will auto-start'
            : 'Initializing TensorFlow Lite model...'}
        </Text>
        <Text style={styles.wakeWords}>
          Wake Words: {currentWakeWords.map((word: string) => `"${word}"`).join(', ')}
        </Text>
        <Text style={styles.infoNote}>
          {isInitialized
            ? `${
                engineState === WakeWordState.LISTENING ? '🟢 Live Detection Mode' : '⭕ Mock Mode'
              } - Audio Processing: ${isProcessingAudio ? '🟢 Active' : '⭕ Idle'}`
            : 'Loading gru.tflite model...'}
        </Text>

        {/* Microphone Test Button */}
        {isInitialized && (
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestMicrophone}
            activeOpacity={0.7}>
            <Text style={styles.testButtonText}>🎤 Test Microphone</Text>
          </TouchableOpacity>
        )}

        {/* Network Connectivity Test Button */}
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: '#34C759' }]}
          onPress={handleTestConnectivity}
          activeOpacity={0.7}>
          <Text style={styles.testButtonText}>🌐 Test Connectivity</Text>
        </TouchableOpacity>

        {/* Backend Response Test Button */}
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: '#FF9500' }]}
          onPress={handleTestBackend}
          activeOpacity={0.7}>
          <Text style={styles.testButtonText}>🧪 Test Backend Responses</Text>
        </TouchableOpacity>

        {/* Manual Stop Recording Button - Only show when recording */}
        {engineState === WakeWordState.RECORDING && (
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: '#FF3B30' }]}
            onPress={handleManualStopRecording}
            activeOpacity={0.7}>
            <Text style={styles.testButtonText}>🛑 Stop Recording</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Partial Detection Results Panel (for debugging) */}
      {isInitialized && partialDetections.length > 0 && (
        <View style={styles.partialDetectionsPanel}>
          <Text style={styles.partialTitle}>🧠 Real-time Detection Confidence</Text>
          {currentWakeWords.map(wakeWord => {
            const latestDetection = partialDetections
              .filter(d => d.wakeWord === wakeWord)
              .slice(-1)[0];

            return (
              <View key={wakeWord} style={styles.partialDetectionItem}>
                <Text style={styles.partialWakeWord}>"{wakeWord}"</Text>
                <View style={styles.confidenceBar}>
                  <View
                    style={[
                      styles.confidenceFill,
                      {
                        width: `${(latestDetection?.confidence || 0) * 100}%`,
                        backgroundColor:
                          (latestDetection?.confidence || 0) > 0.7 ? '#FF3B30' : '#4C7BF7',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.confidenceValue}>
                  {((latestDetection?.confidence || 0) * 100).toFixed(0)}%
                </Text>
              </View>
            );
          })}
          <Text style={styles.partialNote}>
            🎯 Threshold: 70% | Last Update:{' '}
            {new Date(
              partialDetections[partialDetections.length - 1]?.timestamp || 0,
            ).toLocaleTimeString()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // Orb styles with wake word integration
  orbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  orbTouchable: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    position: 'relative',
  },
  orbListening: {
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  orbRecording: {
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 15,
  },
  orbImage: {
    width: '100%',
    height: '100%',
  },
  orbOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  listeningIndicator: {
    backgroundColor: '#FF9500',
    opacity: 0.8,
  },
  recordingIndicator: {
    backgroundColor: '#FF3B30',
    opacity: 0.9,
  },
  orbStatus: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 12,
    fontFamily: theme.typography.fontFamily.medium,
    textAlign: 'center',
  },
  orbStats: {
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 4,
    fontFamily: theme.typography.fontFamily.regular,
  },
  // Message Container
  messageContainer: {
    flex: 1,
    marginBottom: 20,
  },
  // Wake word info panel
  wakeWordInfo: {
    backgroundColor: 'rgba(45, 47, 70, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: 8,
  },
  infoText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.regular,
    textAlign: 'center',
    marginBottom: 4,
  },
  infoNote: {
    color: '#888888',
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.regular,
    fontStyle: 'italic',
  },
  // Suggestions section (commented out in original)
  suggestionsContainer: {
    flex: 1,
    marginTop: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 15,
    fontFamily: theme.typography.fontFamily.medium,
  },
  daySection: {
    marginBottom: 20,
  },
  dayTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 10,
    fontFamily: theme.typography.fontFamily.medium,
  },
  tomorrowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  expandButton: {
    padding: 5,
  },
  chevron: {
    width: 12,
    height: 12,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  // Reminder item
  reminderItem: {
    backgroundColor: 'rgba(45, 47, 70, 0.8)',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderContentContainer: {
    flex: 1,
  },
  reminderTime: {
    color: '#AAAAAA',
    fontSize: 12,
    marginBottom: 4,
    fontFamily: theme.typography.fontFamily.regular,
  },
  reminderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
  },
  completedIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4C7BF7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 10,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },
  wakeWords: {
    color: '#CCCCCC',
    fontSize: 12,
    marginTop: 4,
    fontFamily: theme.typography.fontFamily.regular,
  },
  orbInitializing: {
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  orbProcessing: {
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 15,
  },
  orbError: {
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 15,
  },
  statsContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  audioLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioLevelLabel: {
    color: '#AAAAAA',
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.regular,
  },
  audioLevelBar: {
    width: 100,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333333',
    marginHorizontal: 8,
  },
  audioLevelFill: {
    height: '100%',
    borderRadius: 5,
  },
  audioLevelValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.regular,
  },
  partialDetectionsPanel: {
    backgroundColor: 'rgba(45, 47, 70, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  partialTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: 8,
  },
  partialDetectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  partialWakeWord: {
    color: '#CCCCCC',
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.regular,
    marginRight: 8,
  },
  confidenceBar: {
    width: 100,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333333',
    marginHorizontal: 8,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 5,
  },
  confidenceValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.regular,
  },
  partialNote: {
    color: '#888888',
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.regular,
    fontStyle: 'italic',
  },
  orbProcessingAudio: {
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 15,
  },
  testButton: {
    backgroundColor: '#4C7BF7',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
  },
});

export default HomeScreenMiddleSection;
