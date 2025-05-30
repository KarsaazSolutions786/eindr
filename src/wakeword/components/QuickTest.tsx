import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useWakeWord } from '../hooks/useWakeWord';

/**
 * Quick test component for wake word detection
 * Import this anywhere to test wake word functionality
 */
export const QuickWakeWordTest: React.FC = () => {
  const wakeWord = useWakeWord({
    config: {
      confidenceThreshold: 0.6,
      enableHaptics: true,
    },
    autoInitialize: true,
  });

  const toggleListening = async () => {
    if (wakeWord.isListening) {
      await wakeWord.stopListening();
    } else {
      await wakeWord.startListening();
    }
  };

  React.useEffect(() => {
    if (wakeWord.lastDetection) {
      console.log('🎤 Wake word detected! Confidence:', wakeWord.lastDetection.confidence);
    }
  }, [wakeWord.lastDetection]);

  React.useEffect(() => {
    if (wakeWord.lastCommand) {
      console.log('🔊 Voice command:', wakeWord.lastCommand.text);
    }
  }, [wakeWord.lastCommand]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Wake Word Test</Text>

      <Text style={styles.status}>Status: {wakeWord.state}</Text>

      <Text style={styles.status}>Initialized: {wakeWord.isInitialized ? 'Yes' : 'No'}</Text>

      {wakeWord.lastError && <Text style={styles.error}>Error: {wakeWord.lastError.message}</Text>}

      <TouchableOpacity
        style={[
          styles.button,
          wakeWord.isListening && styles.buttonActive,
          !wakeWord.isInitialized && styles.buttonDisabled,
        ]}
        onPress={toggleListening}
        disabled={!wakeWord.isInitialized}>
        <Text style={styles.buttonText}>
          {wakeWord.isListening ? 'Stop Listening' : 'Start Listening'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.instructions}>Check console logs for detection events</Text>
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
    marginBottom: 16,
    color: '#333',
  },
  status: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  error: {
    fontSize: 12,
    color: '#e74c3c',
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
    backgroundColor: '#FF3B30',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
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
  },
});
