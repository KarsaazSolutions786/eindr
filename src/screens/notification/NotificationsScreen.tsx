import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Notification, { NotificationProps } from './Notification';
import SearchBar from '@components/SearchBar';
import LinearGradient from 'react-native-linear-gradient';

// Sample profile image - in a real app, this would come from your assets or a remote URL
const sampleProfileImage = { uri: 'https://randomuser.me/api/portraits/women/44.jpg' };

const NotificationsScreen: React.FC = () => {
  const [searchText, setSearchText] = useState('');

  const notifications: NotificationProps[] = [
    {
      type: 'friend',
      title: 'Friend Request',
      description: 'You have a new friend request from Jennifer',
      date: '11/06/2024',
      image: sampleProfileImage,
    },
    {
      type: 'reminder',
      title: 'Reminder - Coffee',
      description: 'Your Friend Aleena has set a reminder for you.',
      date: '11/06/2024',
    },
    {
      type: 'ledger',
      title: 'Ledger Alert',
      description:
        'Your friend owe you Rs.1000, which was set to return today, do you want to set a reminder for Ali?',
      date: '11/06/2024',
    },
    {
      type: 'workout',
      title: 'Workout - 6PM',
      description: 'Your Reminder for gym workout has been missed, do you want to reschedule?',
      date: '11/06/2024',
    },
  ];

  const handleConfirm = (index: number) => {
    console.log('Confirmed notification at index:', index);
  };

  const handleDecline = (index: number) => {
    console.log('Declined notification at index:', index);
  };

  const handleReschedule = (index: number) => {
    console.log('Rescheduled notification at index:', index);
  };

  const handleDelete = (index: number) => {
    console.log('Deleted notification at index:', index);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.notificationList} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search"
            backgroundColor="#2D2F3E"
            fontSize={16}
            iconColor="#FFF"
            containerStyle={styles.searchBarContainer}
          />
        </View>

        <View style={styles.sortContainer}>
          <LinearGradient
            colors={['rgba(196,183,255,0.5)', 'rgba(245,243,255,0.5)']}
            start={{ x: 1, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.sortButtonGradient}>
            <View style={styles.sortButtonInner}>
              <TouchableOpacity style={styles.sortButton}>
                <Feather name="align-left" size={14} color="#FFF" style={styles.sortIcon} />
                <Text style={styles.sortText}>Sort by</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.notificationsContainer}>
          {notifications.map((notification, index) => (
            <Notification
              key={index}
              {...notification}
              onConfirm={() => handleConfirm(index)}
              onDecline={() => handleDecline(index)}
              onReschedule={() => handleReschedule(index)}
              onDelete={() => handleDelete(index)}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.viewOldButton}>
          <Text style={styles.viewOldText}>View old notifications</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 150,
  },
  header: {
    marginBottom: 12,
  },
  searchBarContainer: {
    paddingHorizontal: 0,
    marginVertical: 0,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  sortButton: {
    backgroundColor: '#3a3b55',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortIcon: {
    marginRight: 6,
  },
  sortText: {
    color: '#FFF',
    fontSize: 14,
  },
  notificationList: {
    flex: 1,
  },
  notificationsContainer: {
    marginBottom: 24,
  },
  viewOldButton: {
    backgroundColor: '#2D2F3E',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 100,
  },
  viewOldText: {
    color: '#FFF',
    fontSize: 14,
  },
  sortButtonGradient: {
    borderRadius: 20,
    padding: 1,
  },
  sortButtonInner: {
    borderRadius: 20,
    overflow: 'hidden',
  },
});

export default NotificationsScreen;
