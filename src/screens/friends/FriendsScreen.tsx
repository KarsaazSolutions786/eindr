import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SearchBar from '../../components/SearchBar';
import GradientBorder from '../../components/common/GradientBorder';
import { Friend, getAcceptedFriends, declineFriendRequest, UserSuggestion, sendFriendRequest, getAllUsers } from '../../services/friendsService';

interface FriendWithStatus extends Friend {
  name?: string;
  lastSeen?: string;
  isOnline?: boolean;
  profilePic?: string;
  username?: string;
  isTrusted?: boolean;
}

const FriendsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Friends' | 'Trusted' | 'Suggestions'>('Friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<FriendWithStatus[]>([]);
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingRequests, setSendingRequests] = useState<Set<string>>(new Set());

  const loadFriends = async () => {
    try {
      setLoading(true);
      const [friendsData, suggestionsData] = await Promise.all([
        getAcceptedFriends(),
        getAllUsers()
      ]);
      
      // Handle null responses from auth validation
      if (friendsData === null || suggestionsData === null) {
        console.log('⚠️ Authentication failed, skipping friends load');
        setFriends([]);
        setSuggestions([]);
        return;
      }
      
      // Transform backend data to include UI properties
      const transformedFriends: FriendWithStatus[] = (friendsData || []).map(friend => ({
        ...friend,
        name: friend.friend_name,
        username: `@${friend.friend_name?.replace(' ', '')}`,
        profilePic: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 50) + 1}.jpg`,
        isTrusted: Math.random() > 0.5,
      }));
      
      setFriends(transformedFriends);
      
      // Process suggestions and filter out current user and existing friends
      let processedSuggestions: UserSuggestion[] = [];
      if (Array.isArray(suggestionsData)) {
        processedSuggestions = suggestionsData;
      } else if (suggestionsData && typeof suggestionsData === 'object') {
        // Handle case where API returns an object with data property
        const dataObj = suggestionsData as any;
        processedSuggestions = Array.isArray(dataObj.data) ? dataObj.data : [];
      }
      
      // Filter out existing friends and current user from suggestions
      const friendEmails = new Set((friendsData || []).map(friend => friend.friend_email));
      const filteredSuggestions = processedSuggestions.filter(user => {
        // Don't suggest existing friends
        if (friendEmails.has(user.email)) {
          return false;
        }
        // Additional filtering can be added here (e.g., current user)
        return true;
      });
      
      setSuggestions(filteredSuggestions);
      console.log('✅ Loaded suggestions:', filteredSuggestions.length, 'users (filtered from', processedSuggestions.length, 'total)');
    } catch (error) {
      console.error('Error loading friends:', error);
      // Ensure arrays are initialized even on error
      setFriends([]);
      setSuggestions([]);
      Alert.alert('Error', 'Failed to load friends. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  };

  const handleSendFriendRequest = async (userEmail: string, userId: string) => {
    try {
      setSendingRequests(prev => new Set(prev).add(userId));
      const result = await sendFriendRequest({ friend_email: userEmail });
      if (result) {
        Alert.alert('Success', 'Friend request sent successfully!');
        // Remove the user from suggestions after sending request
        setSuggestions(prev => Array.isArray(prev) ? prev.filter(user => user.id !== userId) : []);
      }
      // If result is null, the auth error was already handled by withAuthValidation
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send friend request');
    } finally {
      setSendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  // Filter friends based on active tab and search
  const filteredFriends = (friends || []).filter(friend => {
    const matchesSearch = (friend.friend_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'Friends' || (activeTab === 'Trusted' && friend.isTrusted);
    return matchesSearch && matchesTab;
  });

  const filteredSuggestions = Array.isArray(suggestions) ? suggestions.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleUnfriend = (id: string) => {
    Alert.alert(
      'Unfriend',
      'Are you sure you want to remove this friend?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfriend',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await declineFriendRequest(id);
              if (result) {
                setFriends((friends || []).filter(friend => friend.id !== id));
                Alert.alert('Success', 'Friend removed successfully.');
              }
              // If result is null, the auth error was already handled by withAuthValidation
            } catch (error) {
              console.error('Error removing friend:', error);
              Alert.alert('Error', 'Failed to remove friend. Please try again.');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadFriends();
  }, []);

  const renderFriendItem = ({ item }: { item: FriendWithStatus }) => {
    return (
      <View style={styles.friendItem}>
        <View style={styles.friendInfo}>
          <Image source={{ uri: item.profilePic }} style={styles.avatar} />
          <View style={styles.textContainer}>
            <Text style={styles.name}>{item.friend_name}</Text>
            <Text style={styles.username}>{item.username}</Text>
          </View>
        </View>
        <GradientBorder
          colors={['rgba(196,183,255,0.5)', 'rgba(245,243,255,0.5)']}
          start={{ x: 1, y: 1 }}
          end={{ x: 1, y: 0 }}
          borderRadius={8}
          style={styles.gradientBorder}>
          <TouchableOpacity style={styles.unfriendButton} onPress={() => handleUnfriend(item.id)}>
            <Text style={styles.unfriendText}>Unfriend</Text>
          </TouchableOpacity>
        </GradientBorder>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#92B7FF" />
        <Text style={styles.loadingText}>Loading friends...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search friends..."
      />
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Friends' && styles.activeTab]}
          onPress={() => setActiveTab('Friends')}>
          <Text style={[styles.tabText, activeTab === 'Friends' && styles.activeTabText]}>
            Friends
          </Text>
          {activeTab === 'Friends' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'Trusted' && styles.activeTab]}
          onPress={() => setActiveTab('Trusted')}>
          <Text style={[styles.tabText, activeTab === 'Trusted' && styles.activeTabText]}>
            Trusted
          </Text>
          {activeTab === 'Trusted' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'Suggestions' && styles.activeTab]}
          onPress={() => setActiveTab('Suggestions')}>
          <Text style={[styles.tabText, activeTab === 'Suggestions' && styles.activeTabText]}>
            Suggestions
          </Text>
          {activeTab === 'Suggestions' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Friends List */}
      {activeTab === 'Friends' || activeTab === 'Trusted' ? (
        <FlatList
          data={filteredFriends}
          renderItem={renderFriendItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#92B7FF']}
              tintColor="#92B7FF"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
              <Text style={styles.emptyText}>No friends found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try adjusting your search' : 'Start adding friends to see them here'}
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredSuggestions}
          renderItem={({ item }) => (
            <View style={styles.friendItem}>
              <View style={styles.friendInfo}>
                <Image source={{ uri: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 50) + 1}.jpg` }} style={styles.avatar} />
                <View style={styles.textContainer}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.username}>{item.email}</Text>
                </View>
              </View>
              <GradientBorder
                colors={['rgba(196,183,255,0.5)', 'rgba(245,243,255,0.5)']}
                start={{ x: 1, y: 1 }}
                end={{ x: 1, y: 0 }}
                borderRadius={8}
                style={styles.gradientBorder}>
                <TouchableOpacity 
                  style={styles.unfriendButton} 
                  onPress={() => handleSendFriendRequest(item.email, item.id)}
                  disabled={sendingRequests.has(item.id)}
                >
                  {sendingRequests.has(item.id) ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.unfriendText}>Add Friend</Text>
                  )}
                </TouchableOpacity>
              </GradientBorder>
            </View>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#92B7FF']}
              tintColor="#92B7FF"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="person-add-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
              <Text style={styles.emptyText}>No suggestions available</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try adjusting your search' : 'Check back later for new suggestions'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    // borderBottomWidth: 1,
    // borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 10,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    position: 'relative',
  },
  activeTab: {
    // Active tab styling
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#92B7FF',
    fontSize: 16,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 1,
    right: 1,
    height: 2,
    backgroundColor: '#92B7FF',
    borderRadius: 5,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Fallback color if image fails to load
  },
  textContainer: {
    marginLeft: 12,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  username: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  gradientBorder: {
    padding: 1,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.11,
    shadowRadius: 10,
    elevation: 3,
    shadowColor: '#c07ddf',
  },
  unfriendButton: {
    backgroundColor: '#30304E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 19,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unfriendText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default FriendsScreen;
