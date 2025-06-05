import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useWakeWord, WakeWordButton } from '../../wakeword';

/**
 * Simple wake word integration example
 * Shows minimal code needed to get wake word detection working
 */
export const WakeWordSimpleDemo: React.FC = () => {
  const wakeWord = useWakeWord({
    config: {
      confidenceThreshold: 0.6, // Lower threshold for easier detection
      enableHaptics: true,
    },
    autoInitialize: true, // Initialize automatically
  });

  const handleWakeWordDetected = () => {
    console.log('🎤 Wake word detected!');
  };

  const handleVoiceCommand = (command: any) => {
    console.log('🔊 Voice command received:', command);
  };

  React.useEffect(() => {
    if (wakeWord.lastDetection) {
      handleWakeWordDetected();
    }
  }, [wakeWord.lastDetection]);

  React.useEffect(() => {
    if (wakeWord.lastCommand) {
      handleVoiceCommand(wakeWord.lastCommand);
    }
  }, [wakeWord.lastCommand]);

  const toggleListening = async () => {
    if (wakeWord.isListening) {
      await wakeWord.stopListening();
    } else {
      await wakeWord.startListening();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Simple Wake Word Demo</Text>

        <Text style={styles.status}>Status: {wakeWord.state}</Text>

        <Text style={styles.status}>Initialized: {wakeWord.isInitialized ? 'Yes' : 'No'}</Text>

        {wakeWord.lastError && (
          <Text style={styles.error}>Error: {wakeWord.lastError.message}</Text>
        )}

        <WakeWordButton
          state={wakeWord.state}
          disabled={!wakeWord.isInitialized}
          onPress={toggleListening}
          size={100}
        />

        <Text style={styles.instructions}>
          Tap the button to start listening for your wake word.{'\n'}
          After detection, speak your command.
        </Text>

        {wakeWord.lastDetection && (
          <Text style={styles.detection}>
            Last Detection: {(wakeWord.lastDetection.confidence * 100).toFixed(1)}% confidence
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  error: {
    fontSize: 14,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    marginBottom: 20,
  },
  detection: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: '500',
  },
});
