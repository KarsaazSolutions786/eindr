import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Animated,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '@theme/theme';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BlurView } from '@react-native-community/blur';
import { Calendar, DateData } from 'react-native-calendars';
import ReminderModal, { ReminderData } from '../../components/modals/ReminderModal';

// Define props type for DashboardScreen using the RootStackParamList
type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

// Define color groups for gradients - ensure darker color is first, lighter color second
const COLOR_GROUPS = [
  ['#3267CC', '#78A6FF'], // Blue gradient (darker to lighter)
  ['#5976B8', '#AFC6FA'], // Light blue gradient (darker to lighter)
  ['#1581DB', '#92D4FF'], // Sky blue gradient (darker to lighter)
  ['#555BE9', '#9EA1F8'], // Purple gradient (darker to lighter)
];

// Function to get a consistent color based on ID
const getConsistentColor = (id: string): string[] => {
  // Convert the id to a number by summing character codes
  let sum = 0;
  for (let i = 0; i < id.length; i++) {
    sum += id.charCodeAt(i);
  }

  // Use modulo to get a consistent index within the color array
  const colorIndex = sum % COLOR_GROUPS.length;

  return COLOR_GROUPS[colorIndex];
};

// Type for the selected dates
interface MarkedDates {
  [date: string]: {
    selected: boolean;
    selectedColor: string;
  };
}

// Add this helper function to convert time string to minutes for sorting
const timeToMinutes = (timeStr: string) => {
  // Extract time from format like "7:00AM - 9:00AM"
  const startTime = timeStr.split(' - ')[0];
  let hours = parseInt(startTime.match(/\d+/)?.[0] || '0');
  const minutes = parseInt(startTime.match(/:(\d+)/)?.[1] || '0');
  const isPM = startTime.toLowerCase().includes('pm');

  // Convert to 24 hour format
  if (isPM && hours < 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedDay, setSelectedDay] = useState(3);
  const [activeTab, setActiveTab] = useState('Today');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDates, setSelectedDates] = useState<MarkedDates>({});
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(Dimensions.get('window').height));

  // Reminder state
  const [selectedHour, setSelectedHour] = useState(3);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [isAM, setIsAM] = useState(true);
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [selectedDays, setSelectedDays] = useState<{ [key: string]: boolean }>({
    MON: false,
    TUE: false,
    WED: false,
    THU: false,
    FRI: false,
    SAT: false,
    SUN: false,
  });

  // Add scroll state tracking
  const scrollY = useRef(new Animated.Value(0)).current;
  const timelineScrollY = useRef(new Animated.Value(0)).current;

  // Generate 14 days for the calendar
  const generateDays = () => {
    const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const days = [];

    for (let i = 1; i <= 14; i++) {
      const dayIndex = (i - 1) % 7;
      days.push({ day: weekdays[dayIndex], date: i });
    }

    return days;
  };

  const days = generateDays();

  const reminders = [
    {
      id: '1',
      title: 'Business Meeting',
      description: 'Meeting with Mr. Shoaib at Ramada Plaza',
      time: '7:00AM - 8:00AM',
      app: 'Outlook',
      active: true,
      avatarUrl: require('../../assets/images/user.png'),
    },
    {
      id: '2',
      title: 'Gym Session',
      description: 'All Be on time today and bring car',
      time: '9:00PM - 10:00PM',
      app: 'Fitbit',
      active: true,
      avatarUrl: require('../../assets/images/user.png'),
    },
    {
      id: '3',
      title: 'Ledger update',
      description: 'Take back Rs.1000 which you lend to Sahir',
      time: '7:00AM - 9:00AM',
      app: 'Ledger',
      active: true,
      avatarUrl: require('../../assets/images/user.png'),
    },
    {
      id: '4',
      title: 'Zoom Meeting',
      description: 'Meeting with Board of Directors',
      time: '7:00AM - 9:00AM',
      app: 'google',
      active: true,
      avatarUrl: require('../../assets/images/user.png'),
    },
  ];

  // Sort reminders by time
  const sortedReminders = useMemo(() => {
    return [...reminders].sort((a, b) => {
      return timeToMinutes(a.time) - timeToMinutes(b.time);
    });
  }, [reminders]);

  // Calculate the active timeline height based on number of reminders
  const timelineHeight = sortedReminders.length * 200; // Approximate height per item

  // Calculate visible timeline section based on scroll
  const activeLineTranslateY = scrollY.interpolate({
    inputRange: [0, 500],
    outputRange: [0, 300],
    extrapolate: 'clamp',
  });

  // Use a standard function instead
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.setValue(offsetY);
  };

  // Function to get color for a reminder
  const getReminderColor = (reminderId: string) => {
    return getConsistentColor(reminderId);
  };

  const getAppIcon = (app: string) => {
    switch (app.toLowerCase()) {
      case 'outlook':
        return <MaterialIcons name="mail-outline" size={16} color="#fff" />;
      case 'fitbit':
        return <MaterialIcons name="fitness-center" size={16} color="#fff" />;
      case 'ledger':
        return <MaterialIcons name="account-balance-wallet" size={16} color="#fff" />;
      case 'google':
        return <MaterialCommunityIcons name="google" size={16} color="#fff" />;
      default:
        return <MaterialIcons name="event" size={16} color="#fff" />;
    }
  };

  // Handle date selection in the calendar
  const onDayPress = (day: DateData) => {
    // Toggle selection for multiple dates
    setSelectedDates(prev => {
      const newDates = { ...prev };
      if (newDates[day.dateString]) {
        delete newDates[day.dateString];
      } else {
        newDates[day.dateString] = {
          selected: true,
          selectedColor: '#2176FF', // Your blue color
        };
      }
      return newDates;
    });
  };

  // Handle the slide animation when the reminder modal opens/closes
  useEffect(() => {
    if (reminderModalVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [reminderModalVisible, slideAnim]);

  // Toggle a day selection
  const toggleDay = (day: string) => {
    setSelectedDays(prev => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  // Handle reminder form submission
  const handleReminderConfirm = (reminderData: ReminderData) => {
    console.log('New reminder data:', reminderData);
    // Here you would save the reminder data to your state/database
    setReminderModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        <View style={styles.dayDateContainer}>
          <LinearGradient
            colors={['rgba(157, 157, 255, 0.05)', 'rgba(39, 39, 54, 0.05)']}
            style={StyleSheet.absoluteFill}
          />
          {/* Calendar Header */}
          <View style={styles.calendarHeader}>
            <View>
              <Text style={styles.dateText}>January 30 2025</Text>
              <Text style={styles.title}>Today Reminder</Text>
            </View>
            <TouchableOpacity style={styles.calendarIcon} onPress={() => setCalendarVisible(true)}>
              <MaterialIcons name="calendar-today" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Day Selector with horizontal scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayScrollContent}>
            {days.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.dayItem, selectedDay === item.date && styles.selectedDayItem]}
                onPress={() => setSelectedDay(item.date)}>
                <Text style={styles.dayText}>{item.day}</Text>
                <Text
                  style={[
                    styles.dateNumber,
                    selectedDay === item.date && styles.selectedDateNumber,
                  ]}>
                  {item.date}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Add Reminder Button */}
        <View style={styles.addReminderContainer}>
          <TouchableOpacity
            style={styles.addReminderButton}
            onPress={() => setReminderModalVisible(true)}>
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.addReminderText}>Reminder</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.remindersMainContainer}>
          {/* Tabs */}
          <View style={styles.tabContainer}>
            {['Today', 'Weekly', 'Monthly'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}>
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryText}>Category</Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Reminders List */}
          <View style={styles.timelineContainer}>
            {/* Background timeline line (grayed) */}
            <View style={styles.timelineLine} />

            {/* Active blue gradient timeline line - Now animated */}
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

            {sortedReminders.map((reminder, index) => {
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

              return (
                <View key={reminder.id} style={styles.reminderItem}>
                  <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{formattedHour}</Text>
                    <Text style={styles.timeText}>{formattedPeriod}</Text>
                  </View>

                  {/* Circle indicator on timeline */}
                  <View style={styles.timelineCircle} />

                  <View style={styles.reminderContent}>
                    <LinearGradient
                      colors={getReminderColor(reminder.id)}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      locations={[0.5, 1.0]}
                      style={styles.reminderCard}>
                      {/* Card Header with Title and Toggle */}
                      <View style={styles.reminderCardHeader}>
                        <Text style={styles.reminderTitle}>{reminder.title}</Text>
                        <TouchableOpacity
                          style={[
                            styles.toggleButton,
                            reminder.active ? styles.toggleActive : styles.toggleInactive,
                          ]}>
                          <View
                            style={[
                              styles.toggleCircle,
                              reminder.active && styles.toggleCircleActive,
                            ]}
                          />
                        </TouchableOpacity>
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
                    </LinearGradient>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Calendar Modal */}
      <Modal
        visible={calendarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCalendarVisible(false)}>
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={() => setCalendarVisible(false)}>
          <View style={styles.calendarWrapper}>
            {/* The blur effect applied behind everything */}
            <BlurView
              style={StyleSheet.absoluteFillObject}
              blurType="dark"
              blurAmount={18}
              reducedTransparencyFallbackColor="rgba(35, 36, 58, 0.2)"
            />

            {/* Calendar content with transparent background */}
            <TouchableOpacity
              style={styles.calendarContainer}
              activeOpacity={1}
              onPress={e => e.stopPropagation()}>
              <View style={styles.calendarHeader}>{/* Calendar header content if needed */}</View>

              <Calendar
                theme={{
                  backgroundColor: 'transparent',
                  calendarBackground: 'transparent',
                  textSectionTitleColor: '#fff',
                  selectedDayBackgroundColor: '#2176FF',
                  selectedDayTextColor: '#fff',
                  todayTextColor: '#2176FF',
                  dayTextColor: '#fff',
                  textDisabledColor: '#444a6d',
                  monthTextColor: '#fff',
                  arrowColor: '#fff',
                  stylesheet: {
                    calendar: {
                      header: {
                        week: {
                          marginTop: 7,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        },
                      },
                    },
                  },
                }}
                markedDates={selectedDates}
                onDayPress={onDayPress}
                enableSwipeMonths
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Reminder Modal */}
      <ReminderModal
        visible={reminderModalVisible}
        onClose={() => setReminderModalVisible(false)}
        onConfirm={handleReminderConfirm}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 12,
  },
  scrollContent: {
    paddingBottom: 130,
  },
  remindersMainContainer: {
    borderRadius: 18,
    padding: 20,
    marginTop: 20,
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  dayDateContainer: {
    borderRadius: 18,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    marginBottom: 10,
    marginTop: 120,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 24,
    paddingHorizontal: 15,
  },
  dateText: {
    fontSize: 15,
    color: '#8D8E99',
    fontWeight: '400',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.white,
    marginTop: 6,
  },
  calendarIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayScrollContent: {
    paddingBottom: 5,
    paddingTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginHorizontal: 8,
    width: 45,
    height: 70,
  },
  selectedDayItem: {
    backgroundColor: 'rgba(91, 104, 255, 0.95)',
    borderRadius: 12,
    width: 45,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5B68FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dayText: {
    fontSize: 13,
    color: '#8D8E99',
    marginBottom: 12,
    fontWeight: '500',
  },
  dateNumber: {
    fontSize: 20,
    color: '#8D8E99',
  },
  selectedDateNumber: {
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  addReminderContainer: {
    alignItems: 'flex-end',
    marginVertical: 10,
  },
  addReminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 39, 54, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addReminderText: {
    color: theme.colors.white,
    fontSize: 16,
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#92B7FF',
  },
  tabText: {
    color: '#8D8E99',
    fontSize: 16,
  },
  activeTabText: {
    color: '#92B7FF',
    fontWeight: '400',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 39, 54, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 'auto',
  },
  categoryText: {
    color: theme.colors.white,
    fontSize: 14,
    marginRight: 4,
  },
  timelineContainer: {
    paddingTop: 10,
    position: 'relative',
    marginLeft: 10, // Provide space for the time indicators
    paddingBottom: 30,
  },
  timelineLine: {
    position: 'absolute',
    top: 0,
    left: 10, // Position slightly to the right of the time text
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(66, 103, 212, 0.25)', // Lighter blue, more transparent
    zIndex: 1,
  },
  activeTimelineLineContainer: {
    position: 'absolute',
    top: 0,
    left: 10, // Match position with timelineLine
    height: 200, // Fixed height for the gradient
    zIndex: 2,
  },
  activeTimelineLine: {
    width: 2,
    height: '100%',
    shadowColor: '#4A6BF5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  reminderItem: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
    alignItems: 'flex-start',
  },
  timeContainer: {
    position: 'absolute',
    left: -20,
    alignItems: 'center',
    top: 10,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
    lineHeight: 18, // Reduce line height for tighter text
  },
  timelineCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A6BF5',
    position: 'absolute',
    left: 7, // Center on timeline
    top: 20, // Align with first line of content
    zIndex: 3,
    shadowColor: '#4A6BF5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  reminderContent: {
    flex: 1,
    marginLeft: 25, // Give space after the timeline
  },
  reminderCard: {
    marginVertical: 10,
    borderRadius: 20,
    padding: 15,
    backgroundColor: 'rgba(35, 36, 58, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reminderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reminderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.white,
  },
  toggleButton: {
    width: 30,
    height: 18,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  toggleActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  toggleInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  toggleCircle: {
    width: 16,
    height: 16,
    borderRadius: 11,
    backgroundColor: '#fff',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  descriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  reminderDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
    flex: 1,
    marginRight: 10,
    lineHeight: 18,
    marginBottom: -15,
  },
  reminderTimeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: -5,
    fontWeight: '500',
    marginTop: -10,
  },
  reminderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 7,
  },
  appContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconContainer: {
    width: 25,
    height: 25,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  appText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  reminderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: -12,
  },
  actionButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    // backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -3,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setByText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginRight: 8,
  },
  profileAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarWrapper: {
    borderRadius: 35,
    padding: 0,
    overflow: 'hidden',
    width: 350,
  },
  blurContainer: {
    overflow: 'hidden',
    borderRadius: 35,
    borderWidth: 1,
  },
  calendarContainer: {
    overflow: 'hidden',
    padding: 16,
    borderRadius: 35,
    width: 350,
    backgroundColor: '#23243a',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  closeButton: {
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DashboardScreen;
