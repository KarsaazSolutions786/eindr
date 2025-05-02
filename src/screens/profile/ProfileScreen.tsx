// UserProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

interface ReminderItem {
  id: string;
  title: string;
}

interface ActivityItem {
  id: string;
  title: string;
}

interface HistoryItem {
  id: string;
  title: string;
  date: string;
  time: string;
}

const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isTrustedFriend, setIsTrustedFriend] = useState<boolean>(true);
  const [canSetNotes, setCanSetNotes] = useState<boolean>(false);

  // Hide header when component mounts
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Mock data for reminders
  const reminders: ReminderItem[] = [
    { id: '1', title: 'Morning walk' },
    { id: '2', title: "Doc's Appointment" },
  ];

  // Mock data for activities
  const activities: ActivityItem[] = [
    { id: '1', title: 'Morning walk' },
    { id: '2', title: "Doc's Appointment" },
    { id: '3', title: 'Coffee - Date' },
    { id: '4', title: 'Morning walk' },
    { id: '5', title: "Doc's Appointment" },
  ];

  // Mock data for history
  const historyItems: HistoryItem[] = [
    { id: '1', title: 'Walk the dog', date: '12/12/25', time: '2PM' },
    { id: '2', title: 'Call the dentist', date: '12/12/25', time: '1PM' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F1F35" />

      <ScrollView showsVerticalScrollIndicator={false} >
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/women/46.jpg' }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>Zara khan</Text>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="people-outline" size={20} color="#FFF" />
              <Text style={styles.actionText}>Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="access-time" size={20} color="#FFF" />
              <Text style={styles.actionText}>Set Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Interaction Summary */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Interaction Summery</Text>

          <TouchableOpacity style={styles.sectionHeader}>
            <Text style={styles.sectionSubtitle}>12 Shared Reminders</Text>
            <Ionicons name="chevron-forward" size={18} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.reminderContainer}>
            {reminders.map(reminder => (
              <View key={reminder.id} style={styles.reminderItem}>
                <Text style={styles.reminderText}>{reminder.title}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.sectionHeader}>
            <Text style={styles.sectionSubtitle}>5 Ledger Activity</Text>
            <Ionicons name="chevron-forward" size={18} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.activityRowContainer}>
            <View style={styles.activityRow}>
              <View style={styles.activityItem}>
                <Text style={styles.activityText}>{activities[0].title}</Text>
              </View>
              <View style={styles.activityItem}>
                <Text style={styles.activityText}>{activities[1].title}</Text>
              </View>
            </View>
            <View style={styles.activityRow}>
              <View style={styles.activityItem}>
                <Text style={styles.activityText}>{activities[2].title}</Text>
              </View>
            </View>
            <View style={styles.activityRow}>
              <View style={styles.activityItem}>
                <Text style={styles.activityText}>{activities[3].title}</Text>
              </View>
              <View style={styles.activityItem}>
                <Text style={styles.activityText}>{activities[4].title}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Permissions Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Permission</Text>

          <View style={styles.permissionItem}>
            <Text style={styles.permissionText}>Add to Trusted Friends</Text>
            <Switch
              trackColor={{ false: '#3e3e5e', true: '#5A5A89' }}
              thumbColor={isTrustedFriend ? '#FFF' : '#f4f3f4'}
              ios_backgroundColor="#3e3e5e"
              onValueChange={setIsTrustedFriend}
              value={isTrustedFriend}
            />
          </View>

          <View style={styles.permissionItem}>
            <Text style={styles.permissionText}>Set Notes without approval</Text>
            <Switch
              trackColor={{ false: '#3e3e5e', true: '#5A5A89' }}
              thumbColor={canSetNotes ? '#FFF' : '#f4f3f4'}
              ios_backgroundColor="#3e3e5e"
              onValueChange={setCanSetNotes}
              value={canSetNotes}
            />
          </View>

          <TouchableOpacity style={styles.blockItem}>
            <Ionicons name="ban-outline" size={22} color="#FFF" style={styles.icon} />
            <Text style={styles.blockText}>Block friend</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.blockItem}>
            <Ionicons name="person-remove-outline" size={22} color="#FFF" style={styles.icon} />
            <Text style={styles.blockText}>Remove friend</Text>
          </TouchableOpacity>
        </View>

        {/* History Section */}
        <View style={[styles.sectionContainer, styles.historySection]}>
          <Text style={styles.sectionTitle}>History</Text>

          {historyItems.map(item => (
            <View key={item.id} style={styles.historyItem}>
              <View style={styles.historyLeft}>
                <Ionicons name="time-outline" size={20} color="#CCC" style={styles.historyIcon} />
                <Text style={styles.historyText}>{item.title}</Text>
              </View>
              <Text style={styles.historyTime}>
                {item.date} - {item.time}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#1F1F35',
    // paddingBottom: 80,
  },
  profileContainer: {
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 15,
    marginBottom: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    paddingHorizontal: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#32324D',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '45%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 15,
  },
  sectionContainer: {
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  reminderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  reminderItem: {
    backgroundColor: '#32324D',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reminderText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  activityRowContainer: {
    marginBottom: 15,
  },
  activityRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  activityItem: {
    backgroundColor: '#32324D',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  blockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  icon: {
    marginRight: 10,
  },
  blockText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  historySection: {
    marginBottom: 130,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    marginRight: 10,
  },
  historyText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  historyTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
});

export default UserProfileScreen;
