// components/TestHabitDetection.tsx - Debugged Version
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import moment from 'moment';
import { Reminder, loadReminders, saveReminders } from '../services/ReminderService';
import {
  HabitPattern,
  detectHabitPatterns,
  getHabitSuggestions,
  generateHabitSuggestionResponse,
  normalizeTitle,
} from '../services/HabitDetectionService';

const TestHabitDetection: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [habitPatterns, setHabitPatterns] = useState<HabitPattern[]>([]);
  const [habitSuggestions, setHabitSuggestions] = useState<HabitPattern[]>([]);
  const [currentHabitSuggestion, setCurrentHabitSuggestion] = useState<HabitPattern | null>(null);
  const [showHabitModal, setShowHabitModal] = useState<boolean>(false);
  const [testMode, setTestMode] = useState<boolean>(false);
  const [detectionResults, setDetectionResults] = useState<string>('');

  useEffect(() => {
    loadSavedReminders();
  }, []);

  const loadSavedReminders = async (): Promise<void> => {
    try {
      // Load real reminders from storage
      const loadedReminders = await loadReminders();
      console.log('Loaded reminders:', loadedReminders.length);
      setReminders(loadedReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const createMockReminders = () => {
    // Create mock reminders with patterns - Using absolute dates for clarity
    // Simplifying by making all dates and times very obvious
    const mockReminders: Reminder[] = [
      // Simplified Morning medicine pattern - same exact time and title
      {
        id: '1',
        title: 'Take medicine',
        dateTime: new Date(2023, 0, 1, 9, 0, 0), // Jan 1, 2023 at 9 AM
        isRecurring: false,
        createdAt: new Date(2023, 0, 1, 8, 0, 0), // Jan 1, 2023 at 8 AM
        createdBy: 'manual',
        completed: false,
      },
      {
        id: '2',
        title: 'Take medicine',
        dateTime: new Date(2023, 0, 2, 9, 0, 0), // Jan 2, 2023 at 9 AM
        isRecurring: false,
        createdAt: new Date(2023, 0, 2, 8, 0, 0), // Jan 2, 2023 at 8 AM
        createdBy: 'manual',
        completed: false,
      },
      {
        id: '3',
        title: 'Take medicine',
        dateTime: new Date(2023, 0, 3, 9, 0, 0), // Jan 3, 2023 at 9 AM
        isRecurring: false,
        createdAt: new Date(2023, 0, 3, 8, 0, 0), // Jan 3, 2023 at 8 AM
        createdBy: 'manual',
        completed: false,
      },

      // Simplified evening exercise pattern - exact same time and title
      {
        id: '4',
        title: 'Exercise',
        dateTime: new Date(2023, 0, 1, 18, 0, 0), // Jan 1, 2023 at 6 PM
        isRecurring: false,
        createdAt: new Date(2023, 0, 1, 17, 0, 0), // Jan 1, 2023 at 5 PM
        createdBy: 'manual',
        completed: false,
      },
      {
        id: '5',
        title: 'Exercise',
        dateTime: new Date(2023, 0, 2, 18, 0, 0), // Jan 2, 2023 at 6 PM
        isRecurring: false,
        createdAt: new Date(2023, 0, 2, 17, 0, 0), // Jan 2, 2023 at 5 PM
        createdBy: 'manual',
        completed: false,
      },
      {
        id: '6',
        title: 'Exercise',
        dateTime: new Date(2023, 0, 3, 18, 0, 0), // Jan 3, 2023 at 6 PM
        isRecurring: false,
        createdAt: new Date(2023, 0, 3, 17, 0, 0), // Jan 3, 2023 at 5 PM
        createdBy: 'manual',
        completed: false,
      },

      // Simplified weekly meeting pattern (every Monday)
      {
        id: '7',
        title: 'Team meeting',
        dateTime: new Date(2023, 0, 2, 10, 0, 0), // Monday, Jan 2, 2023 at 10 AM
        isRecurring: false,
        createdAt: new Date(2023, 0, 2, 9, 0, 0), // Monday, Jan 2, 2023 at 9 AM
        createdBy: 'manual',
        completed: false,
      },
      {
        id: '8',
        title: 'Team meeting',
        dateTime: new Date(2023, 0, 9, 10, 0, 0), // Monday, Jan 9, 2023 at 10 AM
        isRecurring: false,
        createdAt: new Date(2023, 0, 9, 9, 0, 0), // Monday, Jan 9, 2023 at 9 AM
        createdBy: 'manual',
        completed: false,
      },
      {
        id: '9',
        title: 'Team meeting',
        dateTime: new Date(2023, 0, 16, 10, 0, 0), // Monday, Jan 16, 2023 at 10 AM
        isRecurring: false,
        createdAt: new Date(2023, 0, 16, 9, 0, 0), // Monday, Jan 16, 2023 at 9 AM
        createdBy: 'manual',
        completed: false,
      },
    ];

    console.log('Created mock reminders:', mockReminders.length);
    console.log('First reminder:', JSON.stringify(mockReminders[0]));

    // Check if the normalization function is working
    console.log('Normalized title for "Take medicine":', normalizeTitle('Take medicine'));
    console.log('Normalized title for "Take my medicine":', normalizeTitle('Take my medicine'));

    setReminders(mockReminders);
    setTestMode(true);

    // Immediately run detection after creating mock data
    setTimeout(() => {
      runHabitDetectionDebug(mockReminders);
    }, 500);
  };

  const runHabitDetection = () => {
    // Run the debug version with current reminders
    runHabitDetectionDebug(reminders);
  };

  const runHabitDetectionDebug = (remindersList: Reminder[]) => {
    console.log('Running habit detection debug on', remindersList.length, 'reminders');

    // Check if we have enough reminders for patterns
    if (remindersList.length < 3) {
      setDetectionResults('Not enough reminders to detect patterns (minimum 3 required).');
      Alert.alert('Not enough data', 'Need at least 3 reminders to detect patterns.');
      return;
    }

    // Group reminders to check normalization
    const groupedByTitle: Record<string, Reminder[]> = {};
    remindersList.forEach(reminder => {
      const normalizedTitle = normalizeTitle(reminder.title);
      if (!normalizedTitle) return;

      if (!groupedByTitle[normalizedTitle]) {
        groupedByTitle[normalizedTitle] = [];
      }
      groupedByTitle[normalizedTitle].push(reminder);
    });

    console.log('Grouped reminders by normalized title:');
    Object.entries(groupedByTitle).forEach(([title, items]) => {
      console.log(`- "${title}": ${items.length} items`);
    });

    // Check if any group has at least 3 reminders
    const hasValidGroup = Object.values(groupedByTitle).some(group => group.length >= 3);
    if (!hasValidGroup) {
      setDetectionResults('No groups with at least 3 similar reminders found.');
      Alert.alert('No patterns possible', 'Need at least 3 similar reminders to form a pattern.');
      return;
    }

    try {
      // Call the actual detection functions and add debugging
      console.log('Calling detectHabitPatterns...');
      const patterns = detectHabitPatterns(remindersList);
      console.log('Patterns detected:', patterns.length);
      setHabitPatterns(patterns);

      // Manually create a pattern if none was detected
      if (patterns.length === 0) {
        console.log('No patterns detected, creating a fallback pattern for debugging');
        // Find a group with at least 3 items to create a mock pattern from
        const mockPatternGroup = Object.entries(groupedByTitle).find(
          ([_, items]) => items.length >= 3,
        );

        if (mockPatternGroup) {
          const [normalizedTitle, items] = mockPatternGroup;

          // Create a fallback pattern for testing UI
          const fallbackPattern: HabitPattern = {
            title: items[0].title,
            normalizedTitle,
            suggestedTime: new Date(), // Current time
            confidenceScore: 0.8,
            occurrences: items.length,
            lastOccurrence: items[items.length - 1].dateTime,
            timeOfDay: 'morning',
            repeatPattern: 'daily',
          };

          console.log('Created fallback pattern:', fallbackPattern);
          const debugPatterns = [fallbackPattern];
          setHabitPatterns(debugPatterns);

          // Get suggestions from the fallback pattern
          const suggestions = getHabitSuggestions(debugPatterns, remindersList);
          setHabitSuggestions(suggestions);

          // Show first suggestion if available
          if (suggestions.length > 0) {
            setCurrentHabitSuggestion(suggestions[0]);
            setShowHabitModal(true);
          }

          // Prepare debug results
          let results = 'HABIT DETECTION DEBUG MODE:\n\n';
          results += '• Original pattern detection failed\n';
          results += '• Created fallback pattern for testing\n\n';
          results += `PATTERN:\n`;
          results += `• Title: "${fallbackPattern.title}"\n`;
          results += `• Normalized: "${fallbackPattern.normalizedTitle}"\n`;
          results += `• Confidence: ${(fallbackPattern.confidenceScore * 100).toFixed(0)}%\n`;
          results += `• Occurrences: ${fallbackPattern.occurrences}\n`;

          setDetectionResults(results);
          return;
        }
      }

      // Get habit suggestions
      console.log('Getting habit suggestions...');
      const suggestions = getHabitSuggestions(patterns, remindersList);
      console.log('Suggestions found:', suggestions.length);
      setHabitSuggestions(suggestions);

      // Prepare detection results for display
      let results = 'HABIT DETECTION RESULTS:\n\n';
      if (patterns.length === 0) {
        results += '• No habit patterns detected\n';
        results += '• Check logs for debugging information\n';
      } else {
        results += `• ${patterns.length} patterns detected\n\n`;

        patterns.forEach((pattern, index) => {
          results += `PATTERN ${index + 1}:\n`;
          results += `• Title: "${pattern.title}"\n`;
          results += `• Normalized: "${pattern.normalizedTitle}"\n`;
          results += `• Time: ${moment(pattern.suggestedTime).format('h:mm A')}\n`;
          results += `• Confidence: ${(pattern.confidenceScore * 100).toFixed(0)}%\n`;
          results += `• Occurrences: ${pattern.occurrences}\n`;
          if (pattern.repeatPattern) {
            results += `• Repeat: ${pattern.repeatPattern}\n`;
          }
          if (pattern.dayOfWeek !== undefined) {
            const days = [
              'Sunday',
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
            ];
            results += `• Day of Week: ${days[pattern.dayOfWeek]}\n`;
          }
          results += `• Time of Day: ${pattern.timeOfDay}\n`;
          results += '\n';
        });

        results += `SUGGESTIONS FOR TODAY:\n`;
        if (suggestions.length === 0) {
          results += '• No suggestions for today\n';
        } else {
          suggestions.forEach((suggestion, index) => {
            results += `• Suggestion ${index + 1}: "${suggestion.title}" at ${moment(
              suggestion.suggestedTime,
            ).format('h:mm A')}\n`;
          });
        }
      }

      setDetectionResults(results);

      // Show the first suggestion if available
      if (suggestions.length > 0 && !showHabitModal) {
        setCurrentHabitSuggestion(suggestions[0]);
        setShowHabitModal(true);
      }
    } catch (error) {
      console.error('Error in habit detection:', error);
      setDetectionResults(`ERROR IN HABIT DETECTION:\n${error}`);
      Alert.alert('Error', 'An error occurred during habit detection. Check console logs.');
    }
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
      createdBy: 'manual',
      completed: false,
    };

    // Add the new reminder
    const updatedReminders = [...reminders, newReminder];
    setReminders(updatedReminders);

    // Save the updated reminders
    await saveReminders(updatedReminders);

    // Hide the modal and clear the suggestion
    setShowHabitModal(false);
    setCurrentHabitSuggestion(null);

    // Check for more suggestions
    showNextHabitSuggestion();
  };

  // Handle user declining habit suggestion
  const handleDeclineHabitSuggestion = () => {
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
      }
    }
  };

  const clearAllReminders = async () => {
    setReminders([]);
    setHabitPatterns([]);
    setHabitSuggestions([]);
    setCurrentHabitSuggestion(null);
    setShowHabitModal(false);
    setDetectionResults('');
    setTestMode(false);

    // Clear reminders from storage
    await saveReminders([]);
  };

  const renderReminderItem = ({ item }: { item: Reminder }) => (
    <View style={styles.reminderItem}>
      <View style={styles.reminderContent}>
        <Text style={styles.reminderTitle}>{item.title}</Text>
        <Text style={styles.reminderTime}>
          {moment(item.dateTime).format('h:mm A, ddd, MMM D')}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Habit Detection Test</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.loadButton]} onPress={createMockReminders}>
          <Text style={styles.buttonText}>Create Test Data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.runButton]} onPress={runHabitDetection}>
          <Text style={styles.buttonText}>Run Detection</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearAllReminders}>
          <Text style={styles.buttonText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Test Mode Indicator */}
      {testMode && (
        <View style={styles.testModeIndicator}>
          <Text style={styles.testModeText}>Test Mode Active</Text>
        </View>
      )}

      {/* Detection Results */}
      {detectionResults ? (
        <ScrollView style={styles.resultsContainer}>
          <Text style={styles.resultsText}>{detectionResults}</Text>
        </ScrollView>
      ) : null}

      {/* Reminders List */}
      <View style={styles.remindersContainer}>
        <Text style={styles.sectionTitle}>Reminders ({reminders.length})</Text>
        {reminders.length > 0 ? (
          <FlatList
            data={reminders.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())}
            renderItem={renderReminderItem}
            keyExtractor={item => item.id}
            style={styles.remindersList}
          />
        ) : (
          <Text style={styles.emptyText}>No reminders. Create test data to begin.</Text>
        )}
      </View>

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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  loadButton: {
    backgroundColor: '#4CAF50',
  },
  runButton: {
    backgroundColor: '#2196F3',
  },
  clearButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  testModeIndicator: {
    backgroundColor: '#FFC107',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 12,
    alignSelf: 'center',
  },
  testModeText: {
    color: '#333',
    fontWeight: 'bold',
  },
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    maxHeight: 200,
  },
  resultsText: {
    fontSize: 14,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  remindersContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  remindersList: {
    flex: 1,
  },
  reminderItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
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
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
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
});

export default TestHabitDetection;
