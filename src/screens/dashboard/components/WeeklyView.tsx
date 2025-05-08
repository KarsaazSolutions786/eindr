import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import GradientBorder from '@components/common/GradientBorder';
import styles from '../styles/WeeklyViewStyles';

type ReminderItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  app: string;
  active: boolean;
  avatarUrl: ReturnType<typeof require>;
};

type WeeklyReminders = {
  [date: string]: ReminderItem[];
};

type WeeklyViewProps = {
  weeklyReminders: WeeklyReminders;
  getAppIcon: (app: string) => React.ReactNode;
};

const WeeklyView: React.FC<WeeklyViewProps> = ({ weeklyReminders, getAppIcon }) => {
  return (
    <View style={styles.weeklyContainer}>
      {Object.entries(weeklyReminders).map(([date, dateReminders]) => (
        <View key={date} style={styles.dateSection}>
          <View style={styles.dateLabelContainer}>
            <Text style={styles.dateLabel}>{date}</Text>
          </View>

          {/* Vertical timeline line */}
          <View style={styles.weeklyTimelineLine} />

          {dateReminders.map(reminder => {
            // Extract just the time portion (e.g., "7:00AM")
            const timeDisplay = reminder.time.split(' - ')[0];

            // Get appropriate color based on reminder type
            const gradientColors = (() => {
              switch (reminder.title) {
                case 'Business Meeting':
                  return ['#3267CC', '#78A6FF'];
                case 'Gym Session':
                  return ['#5976B8', '#AFC6FA'];
                case 'Ledger update':
                  return ['#1581DB', '#92D4FF'];
                case 'Zoom Meeting':
                  return ['#555BE9', '#9EA1F8'];
                default:
                  return ['#3267CC', '#78A6FF'];
              }
            })();

            return (
              <View key={reminder.id} style={styles.weeklyReminderRow}>
                <View style={styles.weeklyTimeColumn}>
                  <Text style={styles.weeklyTimeText}>
                    {timeDisplay.replace(/(\d+):(\d+)([AP]M)/, '$1:$2\n$3')}
                  </Text>
                </View>

                <View style={styles.weeklyReminderCardContainer}>
                  <GradientBorder
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.weeklyReminderCard}>
                    <View>
                      <View style={styles.weeklyReminderHeader}>
                        <Text style={styles.weeklyReminderTitle}>{reminder.title}</Text>
                        <TouchableOpacity style={styles.weeklyToggleButton}>
                          <View style={styles.weeklyToggleCircle} />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.weeklyReminderDescription}>"{reminder.description}"</Text>

                      <View style={styles.weeklyTimeRow}>
                        <Text style={styles.weeklyReminderTime}>{reminder.time}</Text>
                      </View>

                      <View style={styles.weeklyFooter}>
                        <View style={styles.weeklyAppInfo}>
                          <View style={styles.weeklyAppIconContainer}>
                            {getAppIcon(reminder.app)}
                          </View>
                          <Text style={styles.weeklyAppText}>{reminder.app}</Text>
                        </View>

                        <View style={styles.weeklySetByContainer}>
                          <Text style={styles.weeklySetByText}>Set By</Text>
                          <Image source={reminder.avatarUrl} style={styles.weeklyAvatarImage} />
                        </View>
                      </View>

                      <View style={styles.weeklyActionButtons}>
                        <TouchableOpacity style={styles.weeklyActionButton}>
                          <MaterialIcons name="volume-up" size={20} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.weeklyActionButton}>
                          <MaterialIcons name="notifications" size={20} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </GradientBorder>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

export default WeeklyView;
