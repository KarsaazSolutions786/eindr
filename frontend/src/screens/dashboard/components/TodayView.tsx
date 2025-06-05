import React, { useState } from 'react';
import { View, Text, Animated, Switch } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import GradientBorder from '@components/common/GradientBorder';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Image, TouchableOpacity } from 'react-native';
import styles from '../styles/TodayViewStyles';

type ReminderItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  app: string;
  active: boolean;
  avatarUrl: ReturnType<typeof require>;
};

type TodayViewProps = {
  reminders: ReminderItem[];
  activeLineTranslateY: Animated.AnimatedInterpolation<string | number>;
  getReminderColor: (id: string) => string[];
  getAppIcon: (app: string) => React.ReactNode;
  onToggleReminder?: (id: string, active: boolean) => void;
};

const TodayView: React.FC<TodayViewProps> = ({
  reminders,
  activeLineTranslateY,
  getReminderColor,
  getAppIcon,
  onToggleReminder = () => {}, // Default empty function if not provided
}) => {
  // Track local state for toggle switches
  const [reminderStates, setReminderStates] = useState(
    reminders.reduce((acc, reminder) => {
      acc[reminder.id] = reminder.active;
      return acc;
    }, {} as Record<string, boolean>),
  );

  // Handle toggle change
  const handleToggle = (id: string, newValue: boolean) => {
    // Update local state
    setReminderStates(prev => ({
      ...prev,
      [id]: newValue,
    }));

    // Call parent callback
    onToggleReminder(id, newValue);
  };

  return (
    <View style={styles.timelineContainer}>
      {/* Background timeline line (grayed) */}
      <View style={styles.timelineLine} />

      {/* Active blue gradient timeline line - Animated */}
      <Animated.View
        style={[
          styles.activeTimelineLineContainer,
          {
            transform: [{ translateY: activeLineTranslateY }],
          },
        ]}>
        <LinearGradient
          style={styles.activeTimelineLine}
          colors={['#4A6BF5', 'rgba(74, 107, 245, 0.1)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {reminders.map(reminder => {
        // Parse the time from the reminder.time format (e.g., "7:00AM - 9:00AM")
        const startTime = reminder.time.split(' - ')[0];
        const timeMatch = startTime.match(/(\d+):(\d+)([AP]M)/);

        let formattedHour = '';
        let formattedPeriod = '';

        if (timeMatch) {
          const [_, hours, minutes, period] = timeMatch;
          formattedHour = `${hours}:${minutes}`;
          formattedPeriod = period;
        }

        // Get current active state from local state
        const isActive = reminderStates[reminder.id];

        return (
          <View key={reminder.id} style={styles.reminderItem}>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formattedHour}</Text>
              <Text style={styles.timeText}>{formattedPeriod}</Text>
            </View>

            <View style={styles.reminderContent}>
              <GradientBorder
                colors={getReminderColor(reminder.id)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                locations={[0.5, 1.0]}
                style={styles.reminderCard}>
                <View>
                  {/* Card Header with Title and Switch */}
                  <View style={styles.reminderCardHeader}>
                    <Text style={styles.reminderTitle}>{reminder.title}</Text>
                    <Switch
                      value={isActive}
                      onValueChange={newValue => handleToggle(reminder.id, newValue)}
                      trackColor={{
                        false: 'rgba(255, 255, 255, 0.2)',
                        true: 'rgba(74, 107, 245, 0.6)',
                      }}
                      thumbColor={isActive ? '#4A6BF5' : '#f4f3f4'}
                      ios_backgroundColor="rgba(255, 255, 255, 0.2)"
                      style={styles.switchStyle}
                    />
                  </View>

                  {/* Description and Action Buttons side by side */}
                  <View style={styles.descriptionRow}>
                    <Text style={styles.reminderDescription}>"{reminder.description}"</Text>
                    <View style={styles.reminderActions}>
                      <TouchableOpacity style={styles.actionButton}>
                        <MaterialIcons name="volume-up" size={20} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton}>
                        <MaterialIcons name="notifications" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Time and App */}
                  <Text style={styles.reminderTimeText}>{reminder.time}</Text>

                  {/* Bottom Row with App and Profile */}
                  <View style={styles.reminderFooter}>
                    {/* App Info */}
                    <View style={styles.appContainer}>
                      <View style={styles.appIconContainer}>{getAppIcon(reminder.app)}</View>
                      <Text style={styles.appText}>{reminder.app}</Text>
                    </View>

                    {/* Set By */}
                    <View style={styles.profileSection}>
                      <Text style={styles.setByText}>Set By :</Text>
                      <Image source={reminder.avatarUrl} style={styles.profileAvatar} />
                    </View>
                  </View>
                </View>
              </GradientBorder>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default TodayView;
