import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '@theme/theme';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BlurView } from '@react-native-community/blur';

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

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedDay, setSelectedDay] = useState(3);
  const [activeTab, setActiveTab] = useState('Today');

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
    {
      id: '5',
      title: 'Zoom Meeting',
      description: 'Meeting with Board of Directors',
      time: '7:00AM - 9:00AM',
      app: 'google',
      active: true,
      avatarUrl: require('../../assets/images/user.png'),
    },
    {
      id: '6',
      title: 'Zoom Meeting',
      description: 'Meeting with Board of Directors',
      time: '7:00AM - 9:00AM',
      app: 'google',
      active: true,
      avatarUrl: require('../../assets/images/user.png'),
    },
  ];

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

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
            <TouchableOpacity
              style={styles.calendarIcon}
              onPress={() => navigation.navigate('Calendar')}>
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
            onPress={() => navigation.navigate('Reminders')}>
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
            <View style={styles.timelineLine} />
            <LinearGradient
              style={styles.activeTimelineLine}
              colors={['#4A6BF5', 'rgba(74, 107, 245, 0.1)']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
            {reminders.map((reminder, index) => (
              <View key={reminder.id} style={styles.reminderItem}>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>{index % 2 === 0 ? '7:00\nAM' : '12:00\nPM'}</Text>
                </View>
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
                          <MaterialIcons name="volume-up" size={22} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                          <MaterialIcons name="notifications" size={22} color="#fff" />
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
            ))}
          </View>
        </View>
      </ScrollView>
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
    // backgroundColor: 'rgba(29, 30, 44, 0.95)',
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
    // borderBottomWidth: 1,
    // borderBottomColor: 'rgba(255, 255, 255, 0.08)',
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
  },
  timelineLine: {
    position: 'absolute',
    top: 0,
    left: 25,
    bottom: 0,
    width: 2,
    backgroundColor: '#4267D4', // Deeper blue for the main line
    opacity: 0.4, // Make it slightly transparent
    zIndex: 1,
  },
  activeTimelineLine: {
    position: 'absolute',
    top: 0,
    left: 25,
    width: 2,
    height: 120, // Height of the active section with fade
    zIndex: 2,
  },
  reminderItem: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  timeContainer: {
    width: 50,
    alignItems: 'center',
    marginRight: 10,
    zIndex: 3, // Ensure this is above the timeline
    position: 'relative',
  },
  timeText: {
    color: '#8D8E99',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingLeft: 10, // Shift text left
  },
  reminderContent: {
    flex: 1,
  },
  reminderCard: {
    borderRadius: 20,
    padding: 20,
    paddingBottom: 16,
  },
  reminderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: theme.colors.white,
  },
  toggleButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 4,
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
    width: 22,
    height: 22,
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
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
    flex: 1,
    marginRight: 10,
    lineHeight: 20,
  },
  reminderTimeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 10,
    fontWeight: '500',
  },
  reminderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
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
  },
  actionButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
});

export default DashboardScreen;
