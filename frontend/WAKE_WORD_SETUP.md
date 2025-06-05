# Wake Word Detection Setup Guide

This guide will help you complete the setup and integration of the Mycroft Precise wake word detection system in your React Native app.

## 🎯 What's Already Implemented

✅ **Complete Wake Word Engine** - Real-time audio processing and detection  
✅ **MFCC Audio Processing** - Compatible with Mycroft Precise models  
✅ **TensorFlow Lite Integration** - High-performance on-device inference  
✅ **React Components** - Ready-to-use UI components  
✅ **Voice-to-Text API** - Backend integration with retry logic  
✅ **Permissions Setup** - Android and iOS microphone permissions  
✅ **Demo Screen** - Full testing interface  
✅ **TypeScript Types** - Complete type definitions  
✅ **Tests** - Unit tests for core functionality

## 🚀 Quick Start

### 1. Verify Setup

```bash
npm run verify-wakeword
```

This will check all dependencies, permissions, and files are in place.

### 2. Add Your Model

Place your trained Mycroft Precise model:

```
assets/models/gru.tflite
```

**Model Requirements:**

- Format: TensorFlow Lite (.tflite)
- Input: [1, 29, 13] (MFCC features)
- Output: [1, 1] (confidence score)
- Sample Rate: 16kHz

### 3. Test the Implementation

Navigate to: **Settings → Development → Wake Word Demo**

Or add to any screen:

```typescript
import { WakeWordInterface } from '@wakeword';

<WakeWordInterface
  autoStart={false}
  onTextReceived={text => console.log('Transcribed:', text)}
  onWakeWordDetected={() => console.log('Wake word detected!')}
/>;
```

## 🔧 Configuration

### Basic Usage

```typescript
import { useWakeWord } from '@wakeword';

const wakeWord = useWakeWord({
  config: {
    confidenceThreshold: 0.7,
    enableHaptics: true,
  },
  autoInitialize: true,
});
```

### Advanced Configuration

```typescript
const config = {
  confidenceThreshold: 0.6, // Detection sensitivity (0-1)
  sampleRate: 16000, // Audio sample rate
  bufferSize: 4096, // Audio buffer size
  maxRecordingDuration: 30000, // Max command recording (ms)
  silenceTimeout: 2000, // Silence detection timeout
  enableHaptics: true, // Haptic feedback on detection
  enableAudioFeedback: false, // Audio feedback (avoid loops)
};
```

## 🌐 Backend Integration

### API Configuration

```typescript
<WakeWordInterface
  apiBaseURL="https://your-api.com"
  onTextReceived={(text, response) => {
    // Handle transcribed voice commands
    processVoiceCommand(text);
  }}
/>
```

### Expected API Format

```typescript
// POST /api/voice-to-text
// Content-Type: multipart/form-data

{
  audio: Blob,           // WAV audio file
  duration: string,      // Duration in milliseconds
  format: string,        // Audio format (wav)
  sampleRate: string,    // Sample rate (16000)
  requestId: string      // Unique request ID
}

// Response
{
  "success": true,
  "text": "turn on the lights",
  "requestId": "voice-1234567890-abc123"
}
```

## 📱 Platform-Specific Setup

### Android

Permissions are already added to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

### iOS

Permissions are already added to `Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to the microphone for wake word detection and voice commands.</string>
```

## 🎮 Usage Examples

### Simple Button Integration

```typescript
import { WakeWordButton, useWakeWord } from '@wakeword';

function VoiceButton() {
  const wakeWord = useWakeWord({ autoInitialize: true });

  return (
    <WakeWordButton
      state={wakeWord.state}
      onPress={() => {
        if (wakeWord.isListening) {
          wakeWord.stopListening();
        } else {
          wakeWord.startListening();
        }
      }}
    />
  );
}
```

### Full Voice Control Interface

```typescript
import { WakeWordInterface } from '@wakeword';

function VoiceControlScreen() {
  const handleVoiceCommand = (text: string) => {
    // Process voice commands
    if (text.includes('turn on')) {
      // Handle turn on command
    } else if (text.includes('set reminder')) {
      // Handle reminder command
    }
  };

  return (
    <WakeWordInterface
      autoStart={false}
      onTextReceived={text => handleVoiceCommand(text)}
      onWakeWordDetected={() => {
        // Optional: Handle wake word detection
        console.log('Ready for command...');
      }}
      config={{
        confidenceThreshold: 0.6,
        enableHaptics: true,
        maxRecordingDuration: 10000,
      }}
    />
  );
}
```

### Custom Hook Integration

```typescript
import { useWakeWord } from '@wakeword';

function MyComponent() {
  const wakeWord = useWakeWord({
    config: { confidenceThreshold: 0.8 },
    autoInitialize: true,
    autoStart: true, // Start listening immediately
  });

  useEffect(() => {
    if (wakeWord.lastCommand) {
      // Process voice command
      console.log('Received command:', wakeWord.lastCommand);
    }
  }, [wakeWord.lastCommand]);

  return (
    <View>
      <Text>State: {wakeWord.state}</Text>
      <Text>Listening: {wakeWord.isListening ? 'Yes' : 'No'}</Text>
      {wakeWord.lastDetection && (
        <Text>Confidence: {(wakeWord.lastDetection.confidence * 100).toFixed(1)}%</Text>
      )}
    </View>
  );
}
```

## 🔍 Testing & Debugging

### Performance Monitoring

```typescript
// Access engine directly for advanced features
const { engine } = useWakeWord();

// Run performance benchmark
const benchmark = await engine?.benchmark?.(100);
console.log('Average inference time:', benchmark?.averageInferenceTime);
```

### Debug Information

```typescript
// Get current configuration
const config = wakeWord.getConfig();
console.log('Current config:', config);

// Check model status
const modelInfo = engine?.getModelInfo?.();
console.log('Model info:', modelInfo);
```

### Error Handling

```typescript
const wakeWord = useWakeWord({
  config: { confidenceThreshold: 0.7 },
});

useEffect(() => {
  if (wakeWord.lastError) {
    console.error('Wake word error:', wakeWord.lastError);
    // Handle error (show user message, retry, etc.)
  }
}, [wakeWord.lastError]);
```

## 🚨 Troubleshooting

### Common Issues

1. **"Model not loading"**

   - Ensure `gru.tflite` is in `assets/models/`
   - Check model format and file size
   - Verify model is compatible with TensorFlow Lite

2. **"Permission denied"**

   - Check device microphone permissions
   - Verify app permissions in device settings
   - Test on physical device (not simulator)

3. **"Poor detection accuracy"**

   - Adjust `confidenceThreshold` (lower = more sensitive)
   - Test in quiet environment
   - Retrain model with your voice samples

4. **"High CPU/battery usage"**
   - Increase `processingInterval` in config
   - Use lower sample rate if model supports it
   - Stop listening when not needed

### Performance Tips

- Use `predictSync()` for real-time detection
- Adjust buffer sizes based on device capabilities
- Implement proper cleanup on component unmount
- Consider voice activity detection (VAD) for better efficiency

## 📊 Performance Metrics

Typical performance on modern devices:

- **Inference time**: 5-15ms per prediction
- **Memory usage**: 10-20MB additional
- **CPU usage**: 5-10% during active listening
- **Battery impact**: Minimal when optimized

## 🎯 Next Steps

1. **Train your model** - Use Mycroft Precise training scripts
2. **Implement voice commands** - Add business logic for voice processing
3. **Optimize performance** - Tune configuration for your use case
4. **Add analytics** - Track usage and accuracy metrics
5. **User onboarding** - Guide users through wake word setup

## 🔗 Resources

- [Mycroft Precise Documentation](https://github.com/MycroftAI/mycroft-precise)
- [TensorFlow Lite Guide](https://www.tensorflow.org/lite)
- [React Native Audio Recording](https://github.com/goodatlas/react-native-audio-record)

## 📞 Support

If you encounter issues:

1. Run `npm run verify-wakeword` to check setup
2. Check the demo screen for functionality tests
3. Review console logs for error details
4. Test with different confidence thresholds
