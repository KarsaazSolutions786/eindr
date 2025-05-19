import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Text,
  Modal,
  Animated,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Calendar, DateData } from 'react-native-calendars';
import ReminderModal, { ReminderData } from '@components/modals/ReminderModal';
import BlurViewFix from '@components/common/BlurViewFix';

// Import components
import TodayView from './components/TodayView';
import WeeklyView from './components/WeeklyView';
import DashboardHeader from './components/DashboardHeader';
import CalendarModal from './components/CalendarModal';

// Import styles
import styles from './styles/DashboardScreenStyles';

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


  // Add scroll state tracking
  const scrollY = useRef(new Animated.Value(0)).current;

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
      description: 'Take back Rs.1000 which you lend to Sahir' ,
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


  // Handle reminder form submission
  const handleReminderConfirm = (reminderData: ReminderData) => {
    console.log('New reminder data:', reminderData);
    // Here you would save the reminder data to your state/database
    setReminderModalVisible(false);
  };

  // Update the reminders structure to match the Weekly view (by date)
  const weeklyReminders = {
    '7th Oct': [
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
        time: '7:00AM - 9:00AM',
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
    ],
    '8th Oct': [
      {
        id: '5',
        title: 'Gym Session',
        description: 'All Be on time today and bring car',
        time: '7:00AM - 9:00AM',
        app: 'Fitbit',
        active: true,
        avatarUrl: require('../../assets/images/user.png'),
      },
      {
        id: '6',
        title: 'Ledger update',
        description: 'Take back Rs.1000 which you lend to Sahir',
        time: '7:00AM - 9:00AM',
        app: 'Ledger',
        active: true,
        avatarUrl: require('../../assets/images/user.png'),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        {/* Dashboard Header with Day Selector */}
        <DashboardHeader
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          setCalendarVisible={setCalendarVisible}
          days={days}
        />

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
            {['Today', 'Weekly'].map(tab => (
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

          {/* Render the appropriate view based on active tab */}
          {activeTab === 'Today' ? (
            <TodayView
              reminders={sortedReminders}
              activeLineTranslateY={activeLineTranslateY}
              getReminderColor={getReminderColor}
              getAppIcon={getAppIcon}
            />
          ) : (
            <WeeklyView weeklyReminders={weeklyReminders} getAppIcon={getAppIcon} />
          )}
        </View>
      </ScrollView>

      {/* Calendar Modal */}
      <CalendarModal
        visible={calendarVisible}
        selectedDates={selectedDates}
        onDayPress={onDayPress}
        onClose={() => setCalendarVisible(false)}
      />

      {/* Reminder Modal */}
      <ReminderModal
        visible={reminderModalVisible}
        onClose={() => setReminderModalVisible(false)}
        onConfirm={handleReminderConfirm}
      />
    </View>
  );
};

export default DashboardScreen;
