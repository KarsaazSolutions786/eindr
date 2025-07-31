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
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@store/rootReducer';
import { getCurrentUser } from '@services/authService';
import { updateUser } from '@store/slices/authSlice';
import { StorageService } from '@services/storageService';
import { UserDataService, ReminderItem, ActivityItem, HistoryItem, UserDataSummary } from '@services/userDataService';

const { width } = Dimensions.get('window');

const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const [isTrustedFriend, setIsTrustedFriend] = useState<boolean>(true);
  const [canSetNotes, setCanSetNotes] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [userProfileData, setUserProfileData] = useState<UserDataSummary | null>(null);
  const [isLoadingProfileData, setIsLoadingProfileData] = useState(false);
  
  // Get user data from Redux store
  const { user, isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);

  // Hide header when component mounts
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Fetch latest user data from API
  const fetchUserData = async () => {
    if (!isAuthenticated) {
      console.log('ProfileScreen: Not authenticated, skipping fetch');
      return;
    }
    
    try {
      console.log('ProfileScreen: Fetching user data from API...');
      setIsRefreshing(true);
      const userData = await getCurrentUser();
      console.log('ProfileScreen: Received user data:', {
        id: userData.id,
        email: userData.email,
        firstName: userData.profile?.first_name,
        lastName: userData.profile?.last_name,
        displayName: userData.profile?.display_name
      });
      dispatch(updateUser(userData));
      await StorageService.updateUser(userData);
      console.log('ProfileScreen: User data updated in store and storage');
    } catch (error) {
      console.error('ProfileScreen: Error fetching user data:', error);
      // Don't show alert for network errors, just log them
      if (error instanceof Error && error.message.includes('Network')) {
        console.log('ProfileScreen: Network error, will retry later');
      } else {
        Alert.alert('Error', 'Failed to refresh profile data. Please try again.');
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch user profile data (reminders, activities, history)
  const fetchProfileData = async () => {
    if (!isAuthenticated) {
      console.log('ProfileScreen: Not authenticated, skipping profile data fetch');
      return;
    }

    try {
      console.log('ProfileScreen: Fetching profile data...');
      setIsLoadingProfileData(true);
      const profileData = await UserDataService.getUserProfileData();
      console.log('ProfileScreen: Received profile data:', {
        remindersCount: profileData.reminders.length,
        activitiesCount: profileData.activities.length,
        historyCount: profileData.history.length,
        stats: profileData.stats
      });
      setUserProfileData(profileData);
    } catch (error) {
      console.error('ProfileScreen: Error fetching profile data:', error);
      // Keep existing data on error, don't show alert for better UX
    } finally {
      setIsLoadingProfileData(false);
    }
  };

  // Combined refresh function
  const refreshAllData = async () => {
    await Promise.all([
      fetchUserData(),
      fetchProfileData()
    ]);
  };

  // Load user data when component mounts or when authentication state changes
  useEffect(() => {
    console.log('ProfileScreen: useEffect triggered', { 
      isAuthenticated, 
      isInitialized, 
      user: user ? 'User exists' : 'No user' 
    });
    
    // Only proceed if auth is initialized
    if (!isInitialized) {
      console.log('ProfileScreen: Auth not initialized yet, waiting...');
      return;
    }
    
    if (isAuthenticated) {
      // If we don't have user data, fetch it
      if (!user) {
        console.log('ProfileScreen: No user data found, fetching from API');
        fetchUserData();
      } else {
        console.log('ProfileScreen: User data already available');
      }
      
      // Always fetch profile data when authenticated
      if (!userProfileData) {
        console.log('ProfileScreen: No profile data found, fetching from API');
        fetchProfileData();
      }
    } else {
      console.log('ProfileScreen: User not authenticated');
    }
  }, [isAuthenticated, isInitialized, user]);

  // Debug user data changes
  useEffect(() => {
    console.log('🔍 ProfileScreen - User data changed:', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      profile: user?.profile ? {
        firstName: user.profile.first_name,
        lastName: user.profile.last_name,
        displayName: user.profile.display_name,
        bio: user.profile.bio,
        avatarUrl: user.profile.avatar_url
      } : null,
      displayName: getUserDisplayName(),
      bio: getUserBio(),
      avatarUrl: getUserAvatarUrl()
    });
  }, [user]);

  // Get data from state or use empty arrays as fallback
  const reminders = userProfileData?.reminders || [];
  const activities = userProfileData?.activities || [];
  const historyItems = userProfileData?.history || [];
  const stats = userProfileData?.stats || {
    totalReminders: 0,
    completedReminders: 0,
    totalLedgerAmount: 0,
    recentActivities: 0
  };
  
  // Get user's display name or fallback to first name + last name or email
  const getUserDisplayName = () => {
    console.log('ProfileScreen: Getting display name for user:', {
      hasUser: !!user,
      email: user?.email,
      firstName: user?.profile?.first_name,
      lastName: user?.profile?.last_name,
      displayName: user?.profile?.display_name
    });
    
    if (!user) {
      console.log('ProfileScreen: No user found, returning Guest User');
      return 'Guest User';
    }
    
    if (user.profile?.display_name && user.profile.display_name.trim() !== '') {
      console.log('ProfileScreen: Using display name:', user.profile.display_name);
      return user.profile.display_name;
    }
    
    if (user.profile?.first_name || user.profile?.last_name) {
      const fullName = `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.trim();
      if (fullName !== '') {
        console.log('ProfileScreen: Using full name:', fullName);
        return fullName;
      }
    }
    
    if (user.email) {
      const emailUsername = user.email.split('@')[0];
      console.log('ProfileScreen: Using email username:', emailUsername);
      return emailUsername; // Fallback to username part of email
    }
    
    console.log('ProfileScreen: No valid name found, returning Guest User');
    return 'Guest User';
  };

  // Get user's bio or return null
  const getUserBio = () => {
    if (user?.profile?.bio && user.profile.bio.trim() !== '') {
      return user.profile.bio;
    }
    return null;
  };

  // Get user's avatar URL or return default
  const getUserAvatarUrl = () => {
    if (user?.profile?.avatar_url && user.profile.avatar_url.trim() !== '') {
      return user.profile.avatar_url;
    }
    return 'https://randomuser.me/api/portraits/women/46.jpg';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F1F35" />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || isLoadingProfileData}
            onRefresh={refreshAllData}
            tintColor="#FFFFFF"
            colors={['#FFFFFF']}
          />
        }
      >
        <View style={styles.profileContainer}>
          {!isInitialized || isLoading || isRefreshing ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : !isAuthenticated ? (
            <>
              <Text style={styles.profileName}>Please log in to view your profile</Text>
            </>
          ) : (
            <>
              <Image
                source={{
                  uri: getUserAvatarUrl()
                }}
                style={styles.profileImage}
              />
              <Text style={styles.profileName}>{getUserDisplayName()}</Text>
              {getUserBio() && (
                <Text style={styles.profileBio}>{getUserBio()}</Text>
              )}
              {!user && (
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={fetchUserData}
                >
                  <Text style={styles.refreshButtonText}>Tap to refresh profile</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="people-outline" size={20} color="#FFF" />
              <Text style={styles.actionText}>Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('EditProfileScreen')}
            >
              <Ionicons name="pencil-outline" size={20} color="#FFF" />
              <Text style={styles.actionText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Interaction Summary */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Interaction Summary</Text>
          
          {/* Stats Overview */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalReminders || 0}</Text>
              <Text style={styles.statLabel}>Reminders</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalNotes || 0}</Text>
              <Text style={styles.statLabel}>Notes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalFriends || 0}</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.sectionHeader}>
            <Text style={styles.sectionSubtitle}>{stats.totalReminders} Shared Reminders</Text>
            <Ionicons name="chevron-forward" size={18} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.reminderContainer}>
            {reminders.length > 0 ? (
              reminders.map(reminder => (
                <View key={reminder.id} style={styles.reminderItem}>
                  <Text style={styles.reminderText}>{reminder.title}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>No shared reminders</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.sectionHeader}>
            <Text style={styles.sectionSubtitle}>{stats.recentActivities} Ledger Activity</Text>
            <Ionicons name="chevron-forward" size={18} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.activityRowContainer}>
            {activities.length > 0 ? (
              <>
                <View style={styles.activityRow}>
                  {activities[0] && (
                    <View style={styles.activityItem}>
                      <Text style={styles.activityText}>{activities[0].title}</Text>
                    </View>
                  )}
                  {activities[1] && (
                    <View style={styles.activityItem}>
                      <Text style={styles.activityText}>{activities[1].title}</Text>
                    </View>
                  )}
                </View>
                {activities[2] && (
                  <View style={styles.activityRow}>
                    <View style={styles.activityItem}>
                      <Text style={styles.activityText}>{activities[2].title}</Text>
                    </View>
                  </View>
                )}
                <View style={styles.activityRow}>
                  {activities[3] && (
                    <View style={styles.activityItem}>
                      <Text style={styles.activityText}>{activities[3].title}</Text>
                    </View>
                  )}
                  {activities[4] && (
                    <View style={styles.activityItem}>
                      <Text style={styles.activityText}>{activities[4].title}</Text>
                    </View>
                  )}
                </View>
              </>
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>No recent activities</Text>
              </View>
            )}
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

          {historyItems.length > 0 ? (
            historyItems.map(item => (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <Ionicons name="time-outline" size={20} color="#CCC" style={styles.historyIcon} />
                  <Text style={styles.historyText}>{item.title}</Text>
                </View>
                <Text style={styles.historyTime}>
                  {item.date} - {item.time}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No history available</Text>
            </View>
          )}
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
    marginBottom: 10,
  },
  profileBio: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginHorizontal: 20,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(50, 50, 77, 0.5)',
    borderRadius: 15,
    paddingVertical: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
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
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default UserProfileScreen;
