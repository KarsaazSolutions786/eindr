import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

/**
 * Mock wake word test component for testing UI without native dependencies
 * This simulates wake word detection for development purposes
 */
export const MockWakeWordTest: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [detectionCount, setDetectionCount] = useState(0);
  const [lastCommand, setLastCommand] = useState<string>('');

  const simulateWakeWordDetection = () => {
    console.log('🎤 Mock wake word detected!');
    setDetectionCount(prev => prev + 1);
    setIsRecording(true);

    // Simulate recording for 3 seconds
    setTimeout(() => {
      const mockCommand = `Mock command ${detectionCount + 1}`;
      setLastCommand(mockCommand);
      setIsRecording(false);
      console.log('🔊 Mock voice command:', mockCommand);

      Alert.alert('Wake Word Detected!', `Mock voice command: "${mockCommand}"`, [{ text: 'OK' }]);
    }, 3000);
  };

  const toggleListening = () => {
    setIsListening(!isListening);

    if (!isListening) {
      console.log('👂 Started listening (mock mode)');
      // Simulate wake word detection after 5 seconds
      setTimeout(() => {
        if (isListening) {
          simulateWakeWordDetection();
        }
      }, 5000);
    } else {
      console.log('🔇 Stopped listening (mock mode)');
    }
  };

  const getStatusText = () => {
    if (isRecording) return 'Recording Command...';
    if (isListening) return 'Listening for Wake Word...';
    return 'Idle';
  };

  const getButtonText = () => {
    if (isRecording) return 'Recording...';
    if (isListening) return 'Stop Listening';
    return 'Start Listening (Mock)';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mock Wake Word Test</Text>
      <Text style={styles.subtitle}>Simulates wake word detection without native dependencies</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.status}>Status: {getStatusText()}</Text>
        <Text style={styles.status}>Detections: {detectionCount}</Text>
      </View>

      {lastCommand && <Text style={styles.lastCommand}>Last Command: {lastCommand}</Text>}

      <TouchableOpacity
        style={[
          styles.button,
          isListening && styles.buttonActive,
          isRecording && styles.buttonRecording,
        ]}
        onPress={toggleListening}
        disabled={isRecording}>
        <Text style={styles.buttonText}>{getButtonText()}</Text>
      </TouchableOpacity>

      <Text style={styles.instructions}>
        {isListening
          ? 'Wake word will be detected automatically in 5 seconds...'
          : 'Tap to start mock wake word detection'}
      </Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Native Module Status:</Text>
        <Text style={styles.infoText}>• react-native-audio-record: Not linked</Text>
        <Text style={styles.infoText}>• react-native-fast-tflite: Not linked</Text>
        <Text style={styles.infoText}>• react-native-permissions: Not linked</Text>
        <Text style={styles.infoNote}>Link native modules to enable real detection</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  status: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  lastCommand: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  buttonActive: {
    backgroundColor: '#FF9500',
  },
  buttonRecording: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  infoContainer: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 6,
    width: '100%',
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  infoNote: {
    fontSize: 11,
    color: '#007AFF',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
