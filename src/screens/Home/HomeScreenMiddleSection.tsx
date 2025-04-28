// HomeScreenMiddleSection.tsx
import theme from '@theme/theme';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';

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
  }
];

const HomeScreenMiddleSection: React.FC<HomeScreenMiddleSectionProps> = ({
  onOrbPress,
  onReminderPress,
}) => {
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
      {/* Animated Orb */}
      <View style={styles.orbContainer}>
        <TouchableOpacity style={styles.orbTouchable} onPress={onOrbPress} activeOpacity={0.9}>

          {/* Alternatively, if you have an image */}
          <Image
            source={require('../../assets/Logo/orb.png')}
            style={styles.orbImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Activation Text */}
      <Text style={styles.activationText}>Say "Hey Eindr" to activate</Text>

      {/* Suggestions Section */}
      <View style={styles.suggestionsContainer}>
        <Text style={styles.sectionTitle}>Suggested for you:</Text>

        {/* Today section */}
        <View style={styles.daySection}>
          <Text style={styles.dayTitle}>Today</Text>
          {renderReminderItem({ item: REMINDERS[0], index: 0 })}
        </View>

        {/* Tomorrow section */}
        <View style={styles.daySection}>
          <View style={styles.tomorrowHeader}>
            <Text style={styles.dayTitle}>Tomorrow</Text>
            <TouchableOpacity style={styles.expandButton}>
              <View style={styles.chevron} />
            </TouchableOpacity>
          </View>
          {renderReminderItem({ item: REMINDERS[1], index: 0 })}
        </View>
      </View>
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
    marginTop: 20,
    marginBottom: 20,
  },
  orbTouchable: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
  },
  orbVideo: {
    width: '100%',
    height: '100%',
  },
  orbImage: {
    width: '100%',
    height: '100%',
  },
  // Activation Text
  activationText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 40,
    fontFamily: theme.typography.fontFamily.medium,
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
