// HomeScreenMiddleSection.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import theme from '@theme/theme';
import MessageContainer from '@components/chat/MessageContainer';
import VoiceCaptureService from '@services/voice/VoiceCaptureService';
import { showToast } from '@utils/toast';

// Interface for the reminder item data
interface ReminderItem {
  id: string;
  timeRange: string;
  title: string;
  completed?: boolean;
}

interface HomeScreenMiddleSectionProps {
  onOrbPress?: () => void;
  onReminderPress?: (reminder: ReminderItem) => void;
}

const { width } = Dimensions.get('window');

// Sample data for reminders
const REMINDERS: ReminderItem[] = [
  {
    id: '1',
    timeRange: '11:00PM - 12:00PM',
    title: 'Mother Birthday',
    completed: false,
  },
  {
    id: '2',
    timeRange: '11:00PM - 12:00PM',
    title: 'Mother Birthday',
    completed: true,
  },
];

const HomeScreenMiddleSection: React.FC<HomeScreenMiddleSectionProps> = ({
  onOrbPress,
  onReminderPress,
}) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      isUser: false,
      timestamp: '10:30 AM',
    },
    {
      id: '2',
      text: 'I need to set a reminder for tomorrow',
      isUser: true,
      timestamp: '10:31 AM',
    },
    {
      id: '3',
      text: 'Sure! What would you like to be reminded about?',
      isUser: false,
      timestamp: '10:31 AM',
    },
    {
      id: '4',
      text: 'Got it! What time should I set the reminder for?',
      isUser: false,
      timestamp: '10:32 AM',
    },
    {
      id: '5',
      text: 'Set it for 3 PM tomorrow.',
      isUser: true,
      timestamp: '10:33 AM',
    },
    {
      id: '6',
      text: 'Great! Your reminder is set for 3 PM tomorrow.',
      isUser: false,
      timestamp: '10:34 AM',
    },
    {
      id: '7',
      text: 'Would you like me to add anything else?',
      isUser: false,
      timestamp: '10:35 AM',
    },
    {
      id: '8',
      text: "No, that's all for now. Thanks!",
      isUser: true,
      timestamp: '10:36 AM',
    },
    {
      id: '9',
      text: "You're welcome! Feel free to reach out if you need anything else.",
      isUser: false,
      timestamp: '10:37 AM',
    },
  ]);

  // Wake word state management
  const [isWakeWordActive, setIsWakeWordActive] = useState(false);
  const [wakeWordEngine, setWakeWordEngine] = useState<any>(null);
  const [detectionCount, setDetectionCount] = useState(0);
  const [lastDetectionTime, setLastDetectionTime] = useState<Date | null>(null);

  // Enhanced wake-word integration with Random Forest model
  useEffect(() => {
    let engine: any = null;

    const initializeWakeWord = async () => {
      try {
        const { default: RandomForestWakeWordEngine } = await import(
          '@services/wakeword/RandomForestWakeWordEngine'
        );
        engine = RandomForestWakeWordEngine;
        setWakeWordEngine(engine);

        // Start the wake word detection
        await engine.start();
        setIsWakeWordActive(true);

        // Add listener with enhanced functionality
        const handleWakeWordDetection = (confidence?: number) => {
          const now = new Date();
          setDetectionCount(prev => prev + 1);
          setLastDetectionTime(now);

          // Generate contextual responses based on time and detection count
          const responses = [
            '🎉 Wake-word "Eindr" detected! How can I assist you?',
            '👋 Hello! I heard you say "Eindr". What can I help with?',
            '🚀 Ready to help! What would you like to do?',
            "✨ I'm listening! How may I assist you today?",
            "🔊 Voice command received! What's on your mind?",
          ];

          const timeBasedResponses = {
            morning: '🌅 Good morning! I detected "Eindr". How can I start your day?',
            afternoon: '☀️ Good afternoon! Ready to help. What do you need?',
            evening: '🌆 Good evening! I heard "Eindr". How can I assist tonight?',
            night: "🌙 Good night! I'm here to help. What can I do for you?",
          };

          let responseText = responses[Math.floor(Math.random() * responses.length)];

          // Use time-based response occasionally
          const hour = now.getHours();
          if (Math.random() < 0.3) {
            // 30% chance for time-based response
            if (hour >= 5 && hour < 12) responseText = timeBasedResponses.morning;
            else if (hour >= 12 && hour < 17) responseText = timeBasedResponses.afternoon;
            else if (hour >= 17 && hour < 21) responseText = timeBasedResponses.evening;
            else responseText = timeBasedResponses.night;
          }

          // Add confidence information if available
          if (confidence !== undefined) {
            const confidenceLevel =
              confidence > 0.8 ? 'Very High' : confidence > 0.6 ? 'High' : 'Medium';
            responseText += `\n\n🎯 Detection confidence: ${confidenceLevel} (${(
              confidence * 100
            ).toFixed(1)}%)`;
          }

          // Add detection count context for frequent users
          if (detectionCount > 5) {
            responseText += `\n📊 Session detections: ${detectionCount + 1}`;
          }

          // Add helpful tips occasionally
          if (detectionCount === 2) {
            responseText += '\n\n💡 Tip: You can tap the orb to pause/resume voice detection!';
          } else if (detectionCount === 10) {
            responseText += "\n\n🎊 Great! You're getting the hang of voice commands!";
          }

          // Append message with enhanced information
          setMessages(prev => [
            ...prev,
            {
              id: String(prev.length + 1),
              text: responseText,
              isUser: false,
              timestamp: now.toLocaleTimeString(),
              metadata: {
                type: 'wake_word_detection',
                detectionCount: detectionCount + 1,
                confidence: confidence || 0.5,
                modelType: 'RandomForest',
              },
            },
          ]);

          // Start recording user's voice command
          VoiceCaptureService.start(filePath => {
            console.log('[VoiceCmd] saved to', filePath);
            showToast('info', 'Voice command captured', 'Recorder');
          });

          console.log(
            `[HomeScreen] Wake word detected at ${now.toISOString()}, count: ${
              detectionCount + 1
            }, confidence: ${confidence || 'N/A'}`,
          );
        };

        engine.addListener(handleWakeWordDetection);

        console.log('[HomeScreen] Random Forest wake word engine initialized successfully');
      } catch (error) {
        console.error('[HomeScreen] Failed to initialize wake word engine:', error);
        setIsWakeWordActive(false);
      }
    };

    initializeWakeWord();

    // Cleanup on unmount
    return () => {
      if (engine) {
        try {
          engine.stop();
          setIsWakeWordActive(false);
          console.log('[HomeScreen] Wake word engine stopped');
        } catch (error) {
          console.error('[HomeScreen] Error stopping wake word engine:', error);
        }
      }
    };
  }, [detectionCount]);

  // Function to manually toggle wake word detection
  const toggleWakeWordDetection = async () => {
    if (!wakeWordEngine) return;

    try {
      if (isWakeWordActive) {
        wakeWordEngine.stop();
        setIsWakeWordActive(false);
        setMessages(prev => [
          ...prev,
          {
            id: String(prev.length + 1),
            text: '🔇 Wake word detection paused. Tap the orb to reactivate.',
            isUser: false,
            timestamp: new Date().toLocaleTimeString(),
            metadata: { type: 'system_status' },
          },
        ]);
      } else {
        await wakeWordEngine.start();
        setIsWakeWordActive(true);
        setMessages(prev => [
          ...prev,
          {
            id: String(prev.length + 1),
            text: '🔊 Wake word detection reactivated. Say "Eindr" to interact!',
            isUser: false,
            timestamp: new Date().toLocaleTimeString(),
            metadata: { type: 'system_status' },
          },
        ]);
      }
    } catch (error) {
      console.error('[HomeScreen] Error toggling wake word detection:', error);
    }
  };

  // Enhanced orb press handler
  const handleOrbPress = () => {
    if (onOrbPress) {
      onOrbPress();
    }

    // Also toggle wake word detection when orb is pressed
    toggleWakeWordDetection();
  };

  // Render each reminder item
  const renderReminderItem = ({ item, index }: { item: ReminderItem; index: number }) => {
    const isFirst = index === 0;

    return (
      <TouchableOpacity
        style={[styles.reminderItem, isFirst && { marginTop: 0 }]}
        onPress={() => onReminderPress && onReminderPress(item)}>
        <View style={styles.reminderContentContainer}>
          <Text style={styles.reminderTime}>{item.timeRange}</Text>
          <Text style={styles.reminderTitle}>{item.title}</Text>
        </View>

        {item.completed && (
          <View style={styles.completedIcon}>
            <View style={styles.checkCircle}>
              <View style={styles.checkmark} />
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Animated Orb with Wake Word Status */}
      <View style={styles.orbContainer}>
        <TouchableOpacity style={styles.orbTouchable} onPress={handleOrbPress} activeOpacity={0.9}>
          <View style={[styles.orbWrapper, isWakeWordActive && styles.orbActive]}>
            <Image
              source={require('../../assets/Logo/orb.png')}
              style={styles.orbImage}
              resizeMode="contain"
            />
            {/* Wake Word Status Indicator */}
            <View
              style={[
                styles.statusIndicator,
                isWakeWordActive ? styles.statusActive : styles.statusInactive,
              ]}>
              <Text style={styles.statusText}>{isWakeWordActive ? '🎤' : '🔇'}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Wake Word Info */}
        <Text style={styles.wakeWordInfo}>
          {isWakeWordActive ? 'Say "Eindr" to activate' : 'Tap orb to enable voice'}
        </Text>

        {detectionCount > 0 && (
          <Text style={styles.detectionCount}>
            Detections: {detectionCount}
            {lastDetectionTime && ` • Last: ${lastDetectionTime.toLocaleTimeString()}`}
          </Text>
        )}
      </View>

      {/* Message Container */}
      <MessageContainer messages={messages} style={styles.messageContainer} />

      {/* <View style={styles.suggestionsContainer}>
        <Text style={styles.sectionTitle}>Suggested for you:</Text>

        <View style={styles.daySection}>
          <Text style={styles.dayTitle}>Today</Text>
          {renderReminderItem({ item: REMINDERS[0], index: 0 })}
        </View>

        <View style={styles.daySection}>
          <View style={styles.tomorrowHeader}>
            <Text style={styles.dayTitle}>Tomorrow</Text>
            <TouchableOpacity style={styles.expandButton}>
              <View style={styles.chevron} />
            </TouchableOpacity>
          </View>
          {renderReminderItem({ item: REMINDERS[1], index: 0 })}
        </View>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // Orb styles
  orbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 120,
    marginBottom: 20,
  },
  orbTouchable: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
  },
  orbWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  orbActive: {
    borderColor: '#4C7BF7',
    shadowColor: '#4C7BF7',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  orbVideo: {
    width: '100%',
    height: '100%',
  },
  orbImage: {
    width: '100%',
    height: '100%',
  },
  statusIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  statusActive: {
    backgroundColor: '#4C7BF7',
    borderColor: '#FFFFFF',
  },
  statusInactive: {
    backgroundColor: '#666666',
    borderColor: '#CCCCCC',
  },
  statusText: {
    fontSize: 12,
  },
  wakeWordInfo: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    fontFamily: theme.typography.fontFamily.regular,
    opacity: 0.8,
  },
  detectionCount: {
    color: '#4C7BF7',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    fontFamily: theme.typography.fontFamily.regular,
  },
  // Message Container
  messageContainer: {
    flex: 1,
    marginBottom: -70,
    // marginBottom: 20,
  },
  // Suggestions section
  suggestionsContainer: {
    flex: 1,
    marginTop: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 15,
    fontFamily: theme.typography.fontFamily.medium,
  },
  daySection: {
    marginBottom: 20,
  },
  dayTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 10,
    fontFamily: theme.typography.fontFamily.medium,
  },
  tomorrowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  expandButton: {
    padding: 5,
  },
  chevron: {
    width: 12,
    height: 12,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  // Reminder item
  reminderItem: {
    backgroundColor: 'rgba(45, 47, 70, 0.8)',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderContentContainer: {
    flex: 1,
  },
  reminderTime: {
    color: '#AAAAAA',
    fontSize: 12,
    marginBottom: 4,
    fontFamily: theme.typography.fontFamily.regular,
  },
  reminderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
  },
  completedIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4C7BF7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 10,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
    marginTop: -2,
  },
});

export default HomeScreenMiddleSection;
