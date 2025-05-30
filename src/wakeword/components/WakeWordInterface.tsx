import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useWakeWord } from '../hooks/useWakeWord';
import { WakeWordButton } from './WakeWordButton';
import { VoiceToTextAPI } from '../api/VoiceToTextAPI';
import { WakeWordState, VoiceCommand, APIResponse } from '../../types/wakeword';

interface WakeWordInterfaceProps {
  /** API base URL for voice-to-text service */
  apiBaseURL?: string;
  /** Whether to auto-start listening on mount */
  autoStart?: boolean;
  /** Custom configuration */
  config?: any;
  /** Callback when text is received from API */
  onTextReceived?: (text: string, response: APIResponse) => void;
  /** Callback when wake word is detected */
  onWakeWordDetected?: () => void;
  /** Custom styles */
  style?: any;
}

/**
 * Complete wake word interface with button, status, and API integration
 */
export const WakeWordInterface: React.FC<WakeWordInterfaceProps> = ({
  apiBaseURL = '',
  autoStart = false,
  config,
  onTextReceived,
  onWakeWordDetected,
  style,
}) => {
  const wakeWord = useWakeWord({
    config,
    autoInitialize: true,
    autoStart,
  });

  const [api] = useState(() => new VoiceToTextAPI(apiBaseURL));
  const [lastTranscription, setLastTranscription] = useState<string>('');
  const [isProcessingAPI, setIsProcessingAPI] = useState(false);

  // Handle voice command processing
  useEffect(() => {
    if (wakeWord.lastCommand && !isProcessingAPI) {
      handleVoiceCommand(wakeWord.lastCommand);
    }
  }, [wakeWord.lastCommand]);

  // Handle wake word detection
  useEffect(() => {
    if (wakeWord.lastDetection && onWakeWordDetected) {
      onWakeWordDetected();
    }
  }, [wakeWord.lastDetection, onWakeWordDetected]);

  const handleVoiceCommand = async (command: VoiceCommand) => {
    setIsProcessingAPI(true);
    setLastTranscription('Processing...');

    try {
      const response = await api.sendVoiceCommand(command);

      if (response.success && response.text) {
        setLastTranscription(response.text);
        if (onTextReceived) {
          onTextReceived(response.text, response);
        }
      } else {
        setLastTranscription('Failed to transcribe audio');
        console.error('API Error:', response.error);
      }
    } catch (error) {
      setLastTranscription('Network error occurred');
      console.error('Network Error:', error);
    } finally {
      setIsProcessingAPI(false);
    }
  };

  const handleButtonPress = async () => {
    if (!wakeWord.isInitialized) {
      try {
        await wakeWord.initialize();
      } catch (error) {
        Alert.alert(
          'Initialization Error',
          'Failed to initialize wake word detection. Please check permissions and try again.',
        );
        return;
      }
    }

    if (wakeWord.isListening) {
      await wakeWord.stopListening();
    } else {
      await wakeWord.startListening();
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return '#4CAF50'; // Green
    if (confidence >= 0.6) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    return `${seconds}.${Math.floor(milliseconds / 100)}s`;
  };

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      {/* Wake Word Button */}
      <View style={styles.buttonContainer}>
        <WakeWordButton
          state={wakeWord.state}
          disabled={!wakeWord.isInitialized}
          size={120}
          onPress={handleButtonPress}
        />
      </View>

      {/* Status Information */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Status</Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Engine:</Text>
          <Text
            style={[styles.statusValue, { color: wakeWord.isInitialized ? '#4CAF50' : '#F44336' }]}>
            {wakeWord.isInitialized ? 'Initialized' : 'Not Initialized'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>State:</Text>
          <Text style={styles.statusValue}>{wakeWord.state}</Text>
        </View>

        {wakeWord.isRecording && (
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Recording:</Text>
            <Text style={[styles.statusValue, { color: '#F44336' }]}>
              {formatDuration(wakeWord.recordingDuration)}
            </Text>
          </View>
        )}
      </View>

      {/* Wake Word Detection Info */}
      {wakeWord.lastDetection && (
        <View style={styles.detectionContainer}>
          <Text style={styles.sectionTitle}>Last Detection</Text>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Confidence:</Text>
            <Text
              style={[
                styles.statusValue,
                { color: getConfidenceColor(wakeWord.lastDetection.confidence) },
              ]}>
              {(wakeWord.lastDetection.confidence * 100).toFixed(1)}%
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Time:</Text>
            <Text style={styles.statusValue}>
              {new Date(wakeWord.lastDetection.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        </View>
      )}

      {/* Transcription Result */}
      {lastTranscription && (
        <View style={styles.transcriptionContainer}>
          <Text style={styles.sectionTitle}>Transcription</Text>
          <View style={styles.transcriptionBox}>
            <Text style={styles.transcriptionText}>{lastTranscription}</Text>
          </View>
        </View>
      )}

      {/* Error Display */}
      {wakeWord.lastError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{wakeWord.lastError.message}</Text>
          <Text style={styles.errorCode}>Code: {wakeWord.lastError.code}</Text>
        </View>
      )}

      {/* Debug Information */}
      <View style={styles.debugContainer}>
        <Text style={styles.sectionTitle}>Debug Info</Text>

        <TouchableOpacity
          style={styles.debugButton}
          onPress={() => {
            const config = wakeWord.getConfig();
            Alert.alert('Configuration', JSON.stringify(config, null, 2));
          }}>
          <Text style={styles.debugButtonText}>Show Config</Text>
        </TouchableOpacity>

        {wakeWord.engine && (
          <TouchableOpacity
            style={styles.debugButton}
            onPress={async () => {
              try {
                const benchmark = await wakeWord.engine?.benchmark?.(10);
                if (benchmark) {
                  Alert.alert(
                    'Model Performance',
                    `Average: ${benchmark.averageInferenceTime.toFixed(2)}ms\n` +
                      `Min: ${benchmark.minInferenceTime.toFixed(2)}ms\n` +
                      `Max: ${benchmark.maxInferenceTime.toFixed(2)}ms`,
                  );
                }
              } catch (error) {
                Alert.alert('Benchmark Error', 'Failed to run benchmark');
              }
            }}>
            <Text style={styles.debugButtonText}>Run Benchmark</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  statusContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  detectionContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  transcriptionContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  transcriptionBox: {
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
    padding: 12,
    minHeight: 60,
  },
  transcriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    marginBottom: 4,
  },
  errorCode: {
    fontSize: 12,
    color: '#757575',
    fontFamily: 'monospace',
  },
  debugContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  debugButton: {
    backgroundColor: '#e3f2fd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '500',
  },
});
