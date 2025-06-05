# Production-Grade Wake Word Detection System

## 🎯 **Overview**

This is a production-ready, always-listening wake word detection system for React Native using TensorFlow Lite. The system implements continuous low-power wake word detection with complete voice interaction flow, designed for the Mycroft Precise `gru.tflite` model.

## 🚀 **Key Features**

### **Always-Listening Capability**

- ✅ Continuous low-power wake word detection (like Siri/Alexa)
- ✅ Real-time TensorFlow Lite inference on-device
- ✅ Multiple wake words: "hey", "hello", "assistant"
- ✅ Configurable confidence thresholds per wake word

### **Voice Interaction Flow**

- ✅ Wake word detection → Automatic recording start
- ✅ Voice Activity Detection (VAD) for auto-stop on silence
- ✅ Background API upload for transcription
- ✅ Comprehensive error handling and recovery

### **Production Features**

- ✅ Performance monitoring and analytics
- ✅ Thermal throttling and power management
- ✅ Background processing support
- ✅ Cross-platform (iOS/Android) compatibility

## 📱 **Quick Start**

### **1. Basic Implementation**

```typescript
import { useWakeWord } from './hooks/useWakeWord';

function VoiceAssistant() {
  const {
    state,
    isInitialized,
    isListening,
    lastDetection,
    lastCommand,
    initialize,
    startListening,
    stopListening,
  } = useWakeWord({
    autoStart: true,
    callbacks: {
      onWakeWordDetected: detection => {
        console.log(`Wake word "${detection.wakeWord}" detected!`);
      },
      onRecordingStop: command => {
        console.log(`Command: "${command.text}"`);
      },
    },
  });

  useEffect(() => {
    initialize();
  }, []);

  return (
    <TouchableOpacity
      onPress={isListening ? stopListening : startListening}
      disabled={!isInitialized}>
      <Text>{isListening ? 'Listening...' : 'Start Listening'}</Text>
    </TouchableOpacity>
  );
}
```

### **2. Direct Engine Usage**

```typescript
import { WakeWordEngine } from './wakeword/WakeWordEngine';

const engine = new WakeWordEngine();

// Initialize with TensorFlow Lite model
await engine.initialize('./assets/models/gru.tflite');

// Set up callbacks
engine.setCallbacks({
  onWakeWordDetected: detection => {
    console.log(`Detected: ${detection.wakeWord}`);
  },
  onRecordingStop: command => {
    console.log(`Command: ${command.text}`);
  },
});

// Start always-listening
await engine.startAlwaysListening();
```

## 🔧 **Configuration**

### **Wake Word Settings**

```typescript
const config = {
  // Wake word detection
  confidenceThreshold: 0.7,
  wakeWords: ['hey', 'hello', 'assistant'],
  wakeWordThresholds: {
    hey: 0.7,
    hello: 0.75,
    assistant: 0.65,
  },

  // Audio settings (optimized for gru.tflite)
  sampleRate: 16000,
  channels: 1,
  bufferSize: 4096,

  // Voice command recording
  maxRecordingDuration: 10000, // 10 seconds
  silenceTimeout: 800, // 800ms silence to stop
  enableVAD: true, // Voice Activity Detection
};
```

### **Performance Optimization**

```typescript
// High-performance mode (flagship devices)
const performanceConfig = {
  processingInterval: 50, // 50ms for ultra-responsive
  confidenceThreshold: 0.65,
  enableGPU: true,
  numThreads: 4,
};

// Battery saver mode (older devices)
const batterySaverConfig = {
  processingInterval: 200, // 200ms for reduced CPU
  confidenceThreshold: 0.75,
  enableGPU: false,
  numThreads: 1,
};
```

## 📊 **Architecture**

### **Core Components**

```
┌─────────────────────────────────────────────────────────────┐
│                    WakeWordEngine                           │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   RingBuffer    │ │  AudioProcessor │ │  ModelManager   ││
│  │ (Circular Audio)│ │ (MFCC Features) │ │ (TensorFlow Lite)││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │      VAD        │ │ VoiceToTextAPI  │ │  Performance    ││
│  │(Silence Detect) │ │  (Backend API)  │ │   Monitoring    ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### **Always-Listening Flow**

```
1. 🎤 Continuous Audio Capture (Low-Power Mode)
   ↓
2. 🔄 Real-Time MFCC Feature Extraction
   ↓
3. 🧠 TensorFlow Lite Model Inference (100ms intervals)
   ↓
4. 📊 Confidence Threshold Check
   ↓
5. 🎉 Wake Word Detected → Start Command Recording
   ↓
6. 🎙️ Voice Activity Detection → Auto-Stop on Silence
   ↓
7. 🌐 Upload to Voice-to-Text API
   ↓
8. 📝 Process Transcribed Command
   ↓
9. 🔄 Resume Always-Listening
```

## 🛠 **Setup Instructions**

### **1. Install Dependencies**

```bash
npm install react-native-audio-record
npm install react-native-permissions
npm install react-native-fast-tflite
npm install react-native-haptic-feedback
```

### **2. Model Setup**

1. Download Mycroft Precise `gru.tflite` model
2. Place in `src/assets/models/gru.tflite`
3. Verify model file size: ~19KB

### **3. Native Module Linking**

**iOS:**

```bash
cd ios && pod install
```

**Android:**
Add to `android/app/build.gradle`:

```gradle
android {
    packagingOptions {
        pickFirst '**/libc++_shared.so'
        pickFirst '**/libtensorflowlite_jni.so'
    }
}
```

### **4. Permissions Setup**

**iOS (`ios/YourApp/Info.plist`):**

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access for voice commands</string>
```

**Android (`android/app/src/main/AndroidManifest.xml`):**

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

## 📈 **Performance Monitoring**

### **Real-Time Metrics**

```typescript
const { performanceStats } = useWakeWord({
  enablePerformanceTracking: true,
});

console.log('Performance Metrics:', {
  averageInferenceTime: performanceStats.averageInferenceTime,
  totalDetections: performanceStats.totalDetections,
  accuracy: performanceStats.accuracy,
  cpuUsage: performanceStats.cpuUsage,
  memoryUsage: performanceStats.memoryUsage,
});
```

### **Analytics Integration**

```typescript
engine.setCallbacks({
  onPerformanceUpdate: metrics => {
    // Send to analytics service
    analytics.track('wake_word_performance', {
      inference_time: metrics.averageInferenceTime,
      detection_count: metrics.totalDetections,
      accuracy: metrics.accuracy,
    });
  },
});
```

## 🔍 **Debugging & Troubleshooting**

### **Enable Detailed Logging**

```typescript
const config = {
  enableDetailedLogging: true,
  logPerformanceMetrics: true,
  logAudioLevel: true, // Use sparingly
};
```

### **Common Issues**

1. **Model Not Loading**

   ```
   Error: MODEL_LOAD_FAILED
   Solution: Verify gru.tflite is in assets/models/
   ```

2. **Audio Permission Denied**

   ```
   Error: MICROPHONE_PERMISSION_DENIED
   Solution: Check permissions in app settings
   ```

3. **Native Module Not Found**
   ```
   Error: Cannot read property 'IDLE' of undefined
   Solution: Run `cd ios && pod install` or rebuild Android
   ```

### **Debug Commands**

```typescript
// Test engine functionality
await engine.testConnection(); // Test API connectivity
engine.getPerformanceStats(); // Get current metrics
engine.resetStats(); // Reset counters
```

## 🎯 **Best Practices**

### **1. Lifecycle Management**

```typescript
useEffect(() => {
  // Initialize on mount
  initialize();

  return () => {
    // Always cleanup on unmount
    cleanup();
  };
}, []);
```

### **2. Error Handling**

```typescript
const { lastError } = useWakeWord({
  callbacks: {
    onError: error => {
      if (error.retryable) {
        // Automatic retry for recoverable errors
        setTimeout(() => initialize(), 2000);
      } else {
        // User intervention required
        showErrorDialog(error.message);
      }
    },
  },
});
```

### **3. Power Management**

```typescript
// Enable low-power optimizations
const config = {
  enableLowPowerMode: true,
  adaptiveProcessing: true,
  thermalThrottling: true,
};

// Handle app state changes
AppState.addEventListener('change', nextAppState => {
  if (nextAppState === 'background') {
    // Reduce processing in background
    updateConfig({ processingInterval: 200 });
  } else if (nextAppState === 'active') {
    // Resume normal processing
    updateConfig({ processingInterval: 100 });
  }
});
```

## 🌐 **API Integration**

### **Voice-to-Text Backend**

```typescript
// Configure API endpoint
const apiConfig = {
  baseUrl: 'https://your-api.com',
  apiKey: 'your-api-key',
  timeout: 30000,
  stubMode: false, // Set to true for development
};

// Custom stub responses for testing
voiceAPI.addStubResponse('Turn on the lights');
voiceAPI.addStubResponse("What's the weather today?");
```

### **Backend API Format**

**Request:**

```
POST /api/voice-to-text
Content-Type: multipart/form-data

audio: [WAV file]
format: "wav"
sampleRate: 16000
duration: 3500
language: "en-US"
```

**Response:**

```json
{
  "text": "Set a reminder for 3 PM",
  "confidence": 0.95,
  "language": "en-US",
  "duration": 3500,
  "alternatives": [
    { "text": "Set a reminder for 3 PM", "confidence": 0.95 },
    { "text": "Set reminder for 3 PM", "confidence": 0.87 }
  ]
}
```

## 🧪 **Testing**

### **Unit Tests**

```typescript
// Test wake word detection
it('should detect wake word with high confidence', async () => {
  const engine = new WakeWordEngine();
  await engine.initialize(mockModelPath);

  const mockAudio = generateMockWakeWordAudio('hey');
  const detection = await engine.processWakeWordDetection(mockAudio);

  expect(detection.confidence).toBeGreaterThan(0.7);
  expect(detection.wakeWord).toBe('hey');
});
```

### **Integration Tests**

```typescript
// Test full voice interaction flow
it('should complete full voice interaction', async () => {
  const { initialize, startListening } = useWakeWord();

  await initialize();
  await startListening();

  // Simulate wake word + command
  simulateAudioInput('hey', 'set a reminder');

  // Verify flow completion
  expect(lastCommand?.text).toContain('reminder');
});
```

## 📱 **Production Deployment**

### **1. Model Optimization**

- Verify `gru.tflite` model size (~19KB)
- Test on target devices for performance
- Consider model quantization for older devices

### **2. Performance Tuning**

```typescript
// Device-specific optimization
const deviceConfig = DeviceInfo.isTablet()
  ? OPTIMIZATION_PRESETS.performance
  : OPTIMIZATION_PRESETS.balanced;
```

### **3. Monitoring & Analytics**

```typescript
// Production monitoring
engine.setCallbacks({
  onError: error => {
    Crashlytics.recordError(error);
    Analytics.track('wake_word_error', {
      code: error.code,
      severity: error.severity,
    });
  },
});
```

## 🔐 **Security & Privacy**

### **Local Processing**

- All wake word detection happens on-device
- Audio buffers are cleared after processing
- No audio data stored permanently

### **API Security**

```typescript
const secureConfig = {
  enableEncryption: true,
  clearAudioAfterProcessing: true,
  dataRetentionDays: 0, // No retention
};
```

## 📋 **Roadmap**

### **Completed ✅**

- Always-listening wake word detection
- Real-time TensorFlow Lite inference
- Voice Activity Detection (VAD)
- Production error handling
- Performance monitoring

### **Future Enhancements 🔮**

- Offline voice-to-text processing
- Custom wake word training
- Multi-language support
- Edge model updates
- Adaptive threshold tuning

---

## 📞 **Support**

For issues, questions, or contributions:

- Check the troubleshooting section above
- Review console logs for detailed error information
- Test with mock mode first (`stubMode: true`)
- Verify native module linking

**Happy voice commanding! 🎤✨**
