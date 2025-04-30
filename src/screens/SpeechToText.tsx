// SpeechToText.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import Voice, {
  SpeechRecognizedEvent,
  SpeechResultsEvent,
  SpeechErrorEvent,
} from '@react-native-voice/voice';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

interface RecognizedText {
  value: string;
  timestamp: Date;
}

const SpeechToText: React.FC = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognized, setRecognized] = useState<string>('');
  const [results, setResults] = useState<RecognizedText[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Initialize Voice
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;

    // Verbose logging for debugging - yahan add karein
    Voice.onSpeechVolumeChanged = e => {
      console.log('Speech volume changed:', e);
    };

    return () => {
      // Destroy Voice instance when component unmounts
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      const permission =
        Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO;

      const result = await request(permission);

      if (result !== RESULTS.GRANTED) {
        Alert.alert(
          'Permission Required',
          'Microphone permission is needed to use speech recognition',
          [{ text: 'OK' }],
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return false;
    }
  };

  const onSpeechStart = () => {
    console.log('Speech started');
    setRecognized('');
  };

  const onSpeechRecognized = (e: SpeechRecognizedEvent) => {
    setRecognized('✓');
  };

  const onSpeechEnd = () => {
    console.log('Speech ended');
    setIsListening(false);
  };

  const onSpeechError = (e: SpeechErrorEvent) => {
    console.error('Speech error:', e);
    setError(e.error?.message || 'Unknown error');
    setIsListening(false);
  };

  const onSpeechResults = (e: SpeechResultsEvent) => {
    if (e.value && e.value.length > 0) {
      const newResult: RecognizedText = {
        value: e.value[0],
        timestamp: new Date(),
      };
      setResults(prev => [...prev, newResult]);
    }
  };

  const onSpeechPartialResults = (e: SpeechResultsEvent) => {
    if (e.value && e.value.length > 0) {
      setRecognized(e.value[0]);
    }
  };

  const startListening = async () => {
    setError('');
    const hasPermission = await requestMicrophonePermission();

    if (!hasPermission) return;

    try {
      await Voice.start('en-US');
      setIsListening(true);
    } catch (e) {
      console.error('Error starting speech recognition:', e);
      setError('Failed to start speech recognition');
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error('Error stopping speech recognition:', e);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 }}>
        Speech to Text Test
      </Text>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>
          Status: {isListening ? 'Listening...' : 'Not listening'}
        </Text>
        {recognized ? <Text style={{ fontSize: 16 }}>Recognized: {recognized}</Text> : null}
        {error ? <Text style={{ color: 'red', fontSize: 16 }}>Error: {error}</Text> : null}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
        <TouchableOpacity
          onPress={isListening ? stopListening : startListening}
          style={{
            backgroundColor: isListening ? '#f44336' : '#4CAF50',
            padding: 15,
            borderRadius: 10,
            width: 150,
            alignItems: 'center',
          }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={clearResults}
          style={{
            backgroundColor: '#2196F3',
            padding: 15,
            borderRadius: 10,
            width: 150,
            alignItems: 'center',
          }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>Results:</Text>

      {results.length > 0 ? (
        results.map((result, index) => (
          <View
            key={index}
            style={{
              backgroundColor: '#f0f0f0',
              padding: 10,
              borderRadius: 5,
              marginBottom: 10,
            }}>
            <Text>{result.value}</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>
              {result.timestamp.toLocaleTimeString()}
            </Text>
          </View>
        ))
      ) : (
        <Text style={{ color: '#666' }}>No results yet. Press "Start Listening" to begin.</Text>
      )}
    </View>
  );
};

export default SpeechToText;
