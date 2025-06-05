import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, StatusBar } from 'react-native';
import { WakeWordInterface } from '../../wakeword/components/WakeWordInterface';
import { APIResponse } from '../../types/wakeword';

/**
 * Demo screen showcasing Mycroft Precise wake word detection
 * This demonstrates the complete integration of wake word detection
 * with voice-to-text processing and UI feedback
 */
export const WakeWordDemoScreen: React.FC = () => {
  const [detectionCount, setDetectionCount] = useState(0);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  const handleTextReceived = (text: string, response: APIResponse) => {
    console.log('Received transcription:', text);

    // Add to command history
    setCommandHistory(prev => [text, ...prev.slice(0, 4)]); // Keep last 5 commands

    // Show alert for demonstration
    Alert.alert(
      'Voice Command Received',
      `Transcribed text: "${text}"\n\nRequest ID: ${response.requestId}`,
      [{ text: 'OK' }],
    );
  };

  const handleWakeWordDetected = () => {
    setDetectionCount(prev => prev + 1);
    console.log('Wake word detected!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Wake Word Detection</Text>
        <Text style={styles.subtitle}>Powered by Mycroft Precise & TensorFlow Lite</Text>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{detectionCount}</Text>
          <Text style={styles.statLabel}>Detections</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{commandHistory.length}</Text>
          <Text style={styles.statLabel}>Commands</Text>
        </View>
      </View>

      {/* Command History */}
      {commandHistory.length > 0 && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Recent Commands</Text>
          {commandHistory.map((command, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyText} numberOfLines={2}>
                {command}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Wake Word Interface */}
      <WakeWordInterface
        autoStart={false}
        onTextReceived={handleTextReceived}
        onWakeWordDetected={handleWakeWordDetected}
        config={{
          confidenceThreshold: 0.6, // Lower threshold for demo
          enableHaptics: true,
          maxRecordingDuration: 10000, // 10 seconds max
        }}
        style={styles.interfaceContainer}
      />

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>How to Use</Text>
        <Text style={styles.instructionsText}>
          1. Tap the button to start wake word detection{'\n'}
          2. Say your wake word to trigger recording{'\n'}
          3. Speak your command after the haptic feedback{'\n'}
          4. Your command will be transcribed and displayed
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  historyContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  historyItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  historyText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  interfaceContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  instructionsContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
