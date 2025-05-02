import theme from '@theme/theme';
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';

// Define Friend type
interface Friend {
  id: string;
  name: string;
  username: string;
  profilePic: string;
  isTrusted: boolean;
}

// Mock data for friends list
const MOCK_FRIENDS: Friend[] = [
  {
    id: '1',
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/1.jpg',
    isTrusted: true,
  },
  {
    id: '2',
    name: 'Robert Smith',
    username: '@RobertSmith44',
    profilePic: 'https://randomuser.me/api/portraits/men/2.jpg',
    isTrusted: false,
  },
  {
    id: '3',
    name: 'Emma Johnson',
    username: '@EmmaJ23',
    profilePic: 'https://randomuser.me/api/portraits/women/3.jpg',
    isTrusted: true,
  },
  {
    id: '4',
    name: 'Michael Brown',
    username: '@MikeBrown9',
    profilePic: 'https://randomuser.me/api/portraits/men/4.jpg',
    isTrusted: false,
  },
  {
    id: '5',
    name: 'Olivia Davis',
    username: '@OliviaDavis7',
    profilePic: 'https://randomuser.me/api/portraits/women/5.jpg',
    isTrusted: true,
  },
];

const FriendsScreen = () => {
  const [activeTab, setActiveTab] = useState<'Friends' | 'Trusted'>('Friends');
  const [friends] = useState<Friend[]>(MOCK_FRIENDS);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Friends'>>();

  // Filter friends based on active tab
  const filteredFriends =
    activeTab === 'Friends' ? friends : friends.filter(friend => friend.isTrusted);

  const handleUnfriend = (id: string) => {
    // Implementation for unfriending would go here
    console.log(`Unfriended user with id: ${id}`);
  };

  const navigateToProfile = (friend: Friend) => {
    navigation.navigate('ProfileScreen', { friend, isFriend: true });
  };

  const renderFriendItem = ({ item }: { item: Friend }) => {
    return (
      <View style={styles.friendItem}>
        <TouchableOpacity
          style={styles.friendInfoTouchable}
          onPress={() => {
            console.log('Navigating to profile', item.id); // Debug log
            navigateToProfile(item);
          }}
          activeOpacity={0.6} // More noticeable feedback
          delayPressIn={0} // Immediate response
        >
          <View style={styles.friendInfo}>
            <Image source={{ uri: item.profilePic }} style={styles.avatar} />
            <View style={styles.textContainer}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.username}>{item.username}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <LinearGradient
          colors={['rgba(196,183,255,0.5)', 'rgba(245,243,255,0.5)']}
          start={{ x: 1, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBorder}>
          <TouchableOpacity
            style={styles.unfriendButton}
            onPress={() => handleUnfriend(item.id)}
            activeOpacity={0.6}>
            <Text style={styles.unfriendText}>Unfriend</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab]} onPress={() => setActiveTab('Friends')}>
          {activeTab === 'Friends' ? (
            <LinearGradient
              colors={['rgba(196,183,255,0.5)', 'rgba(245,243,255,0.5)']}
              start={{ x: 1, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.activeTabGradient}>
              <View style={styles.activeTabContent}>
                <Text style={styles.activeTabText}>Friends</Text>
              </View>
            </LinearGradient>
          ) : (
            <Text style={styles.tabText}>Friends</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.tab]} onPress={() => setActiveTab('Trusted')}>
          {activeTab === 'Trusted' ? (
            <LinearGradient
              colors={['rgba(196,183,255,0.5)', 'rgba(245,243,255,0.5)']}
              start={{ x: 1, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.activeTabGradient}>
              <View style={styles.activeTabContent}>
                <Text style={styles.activeTabText}>Trusted</Text>
              </View>
            </LinearGradient>
          ) : (
            <Text style={styles.tabText}>Trusted</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Friends List */}
      <FlatList
        data={filteredFriends}
        renderItem={renderFriendItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161329',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 10,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    position: 'relative',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabGradient: {
    borderRadius: 16,
    padding: 1,
  },
  activeTabContent: {
    backgroundColor: 'rgba(196,183,255,0.12)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  friendInfoTouchable: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 8, // Increased touch target
    paddingHorizontal: 5,
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
});

export default FriendsScreen;
