// components/VoiceReminder.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  StyleSheet,
  FlatList,
  Modal,
  ActivityIndicator,
  Animated,
  TextInput,
} from 'react-native';
import Voice, {
  SpeechRecognizedEvent,
  SpeechResultsEvent,
  SpeechErrorEvent,
} from '@react-native-voice/voice';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Tts from 'react-native-tts';
import moment from 'moment';
import {
  Reminder,
  processReminderFromSpeech,
  saveReminders,
  loadReminders,
  generateReminderResponse,
} from '../services/ReminderService';
import {
  HabitPattern,
  detectHabitPatterns,
  getHabitSuggestions,
  generateHabitSuggestionResponse,
} from '../services/HabitDetectionService';

interface RecognizedText {
  value: string;
  timestamp: Date;
}

const VoiceReminder: React.FC = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognized, setRecognized] = useState<string>('');
  const [results, setResults] = useState<RecognizedText[]>([]);
  const [error, setError] = useState<string>('');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [response, setResponse] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [manualText, setManualText] = useState<string>('');

  // Habit detection states
  const [habitPatterns, setHabitPatterns] = useState<HabitPattern[]>([]);
  const [habitSuggestions, setHabitSuggestions] = useState<HabitPattern[]>([]);
  const [showHabitModal, setShowHabitModal] = useState<boolean>(false);
  const [currentHabitSuggestion, setCurrentHabitSuggestion] = useState<HabitPattern | null>(null);

  const bar1Anim = useRef(new Animated.Value(10)).current;
  const bar2Anim = useRef(new Animated.Value(16)).current;
  const bar3Anim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    // Initialize Voice
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;

    // Volume changed event for debugging
    Voice.onSpeechVolumeChanged = e => {
      console.log('Speech volume changed:', e);
    };

    // Initialize Text-to-Speech
    initializeTts();

    // Load saved reminders
    loadSavedReminders();

    const animate = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(bar1Anim, {
            toValue: 16,
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(bar2Anim, {
            toValue: 10,
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(bar3Anim, {
            toValue: 14,
            duration: 600,
            useNativeDriver: false,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bar1Anim, {
            toValue: 10,
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(bar2Anim, {
            toValue: 16,
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(bar3Anim, {
            toValue: 12,
            duration: 600,
            useNativeDriver: false,
          }),
        ]),
      ]).start(() => animate());
    };

    if (isSpeaking) {
      animate();
    }

    return () => {
      // Cleanup
      Voice.destroy().then(Voice.removeAllListeners);
      cleanupTts();
    };
  }, []);

  // Initialize TTS
  const initializeTts = async () => {
    try {
      // Set default language and properties
      await Tts.setDefaultLanguage('en-US');
      await Tts.setDefaultRate(0.5); // Slower speech rate for clarity
      await Tts.setDefaultPitch(1.0);

      // Add TTS event listeners
      Tts.addEventListener('tts-start', event => {
        console.log('TTS started', event);
        setIsSpeaking(true);
      });

      Tts.addEventListener('tts-finish', event => {
        console.log('TTS finished', event);
        setIsSpeaking(false);
      });

      Tts.addEventListener('tts-cancel', event => {
        console.log('TTS cancelled', event);
        setIsSpeaking(false);
      });

      Tts.addEventListener('tts-error', event => {
        console.log('TTS error', event);
        setIsSpeaking(false);
      });

      // Get available voices (optional, for debugging)
      const voices = await Tts.voices();
      console.log('Available TTS voices:', voices);
    } catch (error) {
      console.error('Failed to initialize TTS:', error);
    }
  };

  // Cleanup TTS resources
  const cleanupTts = () => {
    Tts.stop();
    Tts.removeAllListeners('tts-start');
    Tts.removeAllListeners('tts-finish');
    Tts.removeAllListeners('tts-cancel');
    Tts.removeAllListeners('tts-error');
  };

  // Speak text using TTS
  const speakResponse = (text: string) => {
    // Stop any ongoing speech first
    Tts.stop();

    // Speak the new text
    Tts.speak(text);
  };

  // Set TTS language based on user preference
  const setTtsLanguage = (languageCode: string) => {
    try {
      Tts.setDefaultLanguage(languageCode);
      console.log(`TTS language set to: ${languageCode}`);
    } catch (error) {
      console.error('Failed to set TTS language:', error);
      // Fallback to English
      Tts.setDefaultLanguage('en-US');
    }
  };

  // Check for habit patterns whenever reminders change
  useEffect(() => {
    if (reminders.length >= 3) {
      // Detect patterns in reminders
      const patterns = detectHabitPatterns(reminders);
      setHabitPatterns(patterns);

      // Get relevant suggestions for today
      const suggestions = getHabitSuggestions(patterns, reminders);
      setHabitSuggestions(suggestions);

      // If we have suggestions and none are being shown, show the first one
      if (suggestions.length > 0 && !showHabitModal && !currentHabitSuggestion) {
        setCurrentHabitSuggestion(suggestions[0]);
        setShowHabitModal(true);

        // Speak the habit suggestion
        const habitResponse = generateHabitSuggestionResponse(suggestions[0]);
        speakResponse(habitResponse);
      }
    }
  }, [reminders]);

  // Load reminders from storage
  const loadSavedReminders = async (): Promise<void> => {
    try {
      const loadedReminders = await loadReminders();
      setReminders(loadedReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      const permission =
        Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO;

      const result = await request(permission);

      if (result !== RESULTS.GRANTED) {
        Alert.alert(
          'Permission Required',
          'Microphone permission is needed to use voice assistant',
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
    console.log('Speech error:', JSON.stringify(e));

    let errorMessage = 'Unknown error occurred';
    if (e && typeof e === 'object') {
      if ('error' in e && e.error && typeof e.error === 'object' && 'message' in e.error) {
        errorMessage = String(e.error.message);
      } else if ('code' in e) {
        errorMessage = `Error code: ${e.code}`;
      }
    }

    setError(errorMessage);
    setIsListening(false);

    // Speak the error message to the user
    speakResponse("I'm sorry, I didn't catch that. Could you try again?");
  };

  const onSpeechResults = (e: SpeechResultsEvent) => {
    if (e.value && e.value.length > 0) {
      const speech = e.value[0];

      const newResult: RecognizedText = {
        value: speech,
        timestamp: new Date(),
      };

      setResults(prev => [...prev, newResult]);

      // Process the speech for potential reminders
      processVoiceInput(speech);
    }
  };

  const onSpeechPartialResults = (e: SpeechResultsEvent) => {
    if (e.value && e.value.length > 0) {
      setRecognized(e.value[0]);
    }
  };

  const processVoiceInput = async (text: string): Promise<void> => {
    setIsProcessing(true);
    // Try to extract reminder information
    const reminder = processReminderFromSpeech(text);

    if (reminder) {
      // A reminder was detected in the speech
      const updatedReminders = [...reminders, reminder];
      setReminders(updatedReminders);

      // Save the updated reminders
      await saveReminders(updatedReminders);
      // Generate a response for the reminder
      const aiResponse = generateReminderResponse(reminder);
      setResponse(aiResponse);
      // Speak the response
      speakResponse(aiResponse);
    } else {
      // Check if it's a response to a habit suggestion
      if (currentHabitSuggestion && showHabitModal) {
        const lowerText = text.toLowerCase();
        const affirmativeResponses = [
          'yes',
          'yeah',
          'sure',
          'okay',
          'ok',
          'yep',
          'yup',
          'go ahead',
          'please do',
        ];
        const negativeResponses = ['no', 'nope', "don't", 'do not', 'not now', 'skip', 'cancel'];

        const isAffirmative = affirmativeResponses.some(response => lowerText.includes(response));
        const isNegative = negativeResponses.some(response => lowerText.includes(response));

        if (isAffirmative) {
          // User wants to add the suggested habit as a reminder
          handleAcceptHabitSuggestion();
        } else if (isNegative) {
          // User doesn't want the suggested reminder
          handleDeclineHabitSuggestion();
        } else {
          // Not a reminder command
          const generalResponse =
            "I'm not sure how to help with that. You can ask me to set a reminder like 'Remind me to call John at 5pm'";
          setResponse(generalResponse);
          speakResponse(generalResponse);
        }
      } else {
        // Not a reminder command
        const generalResponse =
          "I'm not sure how to help with that. You can ask me to set a reminder like 'Remind me to call John at 5pm'";
        setResponse(generalResponse);
        speakResponse(generalResponse);
      }
    }

    setIsProcessing(false);
  };

  const startListening = async () => {
    // If TTS is speaking, stop it before starting to listen
    if (isSpeaking) {
      Tts.stop();
    }

    setError('');
    setResponse('');
    const hasPermission = await requestMicrophonePermission();

    if (!hasPermission) return;

    try {
      await Voice.start('en-US');
      setIsListening(true);
    } catch (e) {
      console.error('Error starting speech recognition:', e);
      setError('Failed to start speech recognition');
      speakResponse('Sorry, I had trouble starting voice recognition. Please try again.');
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

  const deleteReminder = (id: string) => {
    Alert.alert('Delete Reminder', 'Are you sure you want to delete this reminder?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updatedReminders = reminders.filter(reminder => reminder.id !== id);
          setReminders(updatedReminders);
          await saveReminders(updatedReminders);

          // Confirm deletion with voice
          speakResponse("I've deleted that reminder for you.");
        },
      },
    ]);
  };

  // Handle user accepting habit suggestion
  const handleAcceptHabitSuggestion = async () => {
    if (!currentHabitSuggestion) return;

    // Create a new reminder from the habit suggestion
    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: currentHabitSuggestion.title,
      dateTime: currentHabitSuggestion.suggestedTime,
      isRecurring: !!currentHabitSuggestion.repeatPattern,
      repeatPattern: currentHabitSuggestion.repeatPattern,
      createdAt: new Date(),
      createdBy: 'voice',
      completed: false,
    };

    // Add the new reminder
    const updatedReminders = [...reminders, newReminder];
    setReminders(updatedReminders);

    // Save the updated reminders
    await saveReminders(updatedReminders);

    // Generate a confirmation response
    const confirmationResponse = `Great! I've added a reminder for you to ${
      newReminder.title
    } at ${moment(newReminder.dateTime).format('h:mm A')}.`;
    setResponse(confirmationResponse);

    // Speak the confirmation
    speakResponse(confirmationResponse);

    // Hide the modal and clear the suggestion
    setShowHabitModal(false);
    setCurrentHabitSuggestion(null);

    // Check for more suggestions
    showNextHabitSuggestion();
  };

  // Handle user declining habit suggestion
  const handleDeclineHabitSuggestion = () => {
    const declineResponse = "No problem, I won't add that reminder.";
    setResponse(declineResponse);

    // Speak the decline response
    speakResponse(declineResponse);

    // Hide the modal and clear the suggestion
    setShowHabitModal(false);
    setCurrentHabitSuggestion(null);

    // Check for more suggestions
    showNextHabitSuggestion();
  };

  // Show the next habit suggestion if available
  const showNextHabitSuggestion = () => {
    if (habitSuggestions.length > 0) {
      // Remove the current suggestion from the list
      const updatedSuggestions = habitSuggestions.filter(
        suggestion =>
          !currentHabitSuggestion ||
          suggestion.normalizedTitle !== currentHabitSuggestion.normalizedTitle,
      );

      setHabitSuggestions(updatedSuggestions);

      // Show the next suggestion if available
      if (updatedSuggestions.length > 0) {
        setCurrentHabitSuggestion(updatedSuggestions[0]);
        setShowHabitModal(true);

        // Speak the next habit suggestion
        const habitResponse = generateHabitSuggestionResponse(updatedSuggestions[0]);
        speakResponse(habitResponse);
      }
    }
  };

  const renderReminderItem = ({ item }: { item: Reminder }) => (
    <View style={styles.reminderItem}>
      <View style={styles.reminderContent}>
        <Text style={styles.reminderTitle}>{item.title}</Text>
        <Text style={styles.reminderTime}>
          {moment(item.dateTime).format('h:mm A, MMM D')}
          {item.isRecurring ? ` (${item.repeatPattern})` : ''}
        </Text>
      </View>
      <TouchableOpacity onPress={() => deleteReminder(item.id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={manualText}
          onChangeText={setManualText}
          placeholder="Type or speak your reminder..."
          placeholderTextColor="#666"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => {
            if (manualText.trim()) {
              processVoiceInput(manualText);
              setManualText('');
            }
          }}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Assistant response */}
      {response ? (
        <View style={[styles.responseContainer, isSpeaking && styles.speakingContainer]}>
          <Text style={styles.responseText}>{response}</Text>
          {isSpeaking && (
            <View style={styles.speakingIndicator}>
              <Animated.View style={[styles.speakingBar, { height: bar1Anim }]} />
              <Animated.View style={[styles.speakingBar, { height: bar2Anim }]} />
              <Animated.View style={[styles.speakingBar, { height: bar3Anim }]} />
            </View>
          )}
        </View>
      ) : null}

      {/* Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {isProcessing
            ? 'Processing...'
            : isListening
            ? 'Listening...'
            : isSpeaking
            ? 'Speaking...'
            : 'Press mic to speak'}
        </Text>
        {error ? <Text style={styles.errorText}>Error: {error}</Text> : null}
      </View>

      {/* Voice recognition */}
      <View style={styles.recognitionContainer}>
        {recognized ? <Text style={styles.recognizedText}>{recognized}</Text> : null}
      </View>

      {/* Reminders list */}
      <View style={styles.remindersContainer}>
        <Text style={styles.sectionTitle}>Your Reminders</Text>
        {reminders.length > 0 ? (
          <FlatList
            data={reminders.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())}
            renderItem={renderReminderItem}
            keyExtractor={item => item.id}
            style={styles.remindersList}
          />
        ) : (
          <Text style={styles.emptyText}>No reminders yet. Try saying "Remind me to..."</Text>
        )}
      </View>

      {/* Mic button */}
      <TouchableOpacity
        onPress={isListening ? stopListening : startListening}
        style={[
          styles.micButton,
          isListening ? styles.micButtonActive : null,
          isProcessing ? styles.micButtonDisabled : null,
        ]}
        disabled={isProcessing}>
        {isProcessing ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <Text style={styles.micButtonText}>🎤</Text>
        )}
      </TouchableOpacity>

      {/* Habit Suggestion Modal */}
      <Modal
        visible={showHabitModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowHabitModal(false);
          setCurrentHabitSuggestion(null);
        }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Habit Detected</Text>

            {currentHabitSuggestion && (
              <>
                <Text style={styles.habitSuggestionText}>
                  {generateHabitSuggestionResponse(currentHabitSuggestion)}
                </Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.declineButton]}
                    onPress={handleDeclineHabitSuggestion}>
                    <Text style={styles.declineButtonText}>No, thanks</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.acceptButton]}
                    onPress={handleAcceptHabitSuggestion}>
                    <Text style={styles.acceptButtonText}>Yes, please</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  responseContainer: {
    backgroundColor: '#e1f5fe',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  speakingContainer: {
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  responseText: {
    fontSize: 16,
    color: '#01579b',
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    marginTop: 8,
  },
  recognitionContainer: {
    minHeight: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    justifyContent: 'center',
  },
  recognizedText: {
    fontSize: 16,
  },
  remindersContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  remindersList: {
    flex: 1,
  },
  reminderItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  micButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  micButtonActive: {
    backgroundColor: '#f44336',
  },
  micButtonDisabled: {
    backgroundColor: '#9e9e9e',
  },
  micButtonText: {
    fontSize: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  habitSuggestionText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24,
    lineHeight: 22,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  declineButton: {
    backgroundColor: '#f5f5f5',
  },
  declineButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  speakingIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 20,
    marginTop: 10,
  },
  speakingBar: {
    width: 4,
    backgroundColor: '#2196F3',
    marginHorizontal: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    height: 40,
    color: '#000',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VoiceReminder;
