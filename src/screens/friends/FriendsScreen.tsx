import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// Mock data for friends list
const MOCK_FRIENDS = [
  {
    id: '1',
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/1.jpg',
    isTrusted: true,
  },
  {
    id: '2',
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/2.jpg',
    isTrusted: false,
  },
  {
    id: '3',
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/3.jpg',
    isTrusted: true,
  },
  {
    id: '4',
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/4.jpg',
    isTrusted: false,
  },
  {
    id: '5',
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/5.jpg',
    isTrusted: true,
  },
  {
    id: '6',
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/6.jpg',
    isTrusted: false,
  },
  {
    id: '7',
    name: 'Jenny Wilson',
    username: '@Jenny Wilson11',
    profilePic: 'https://randomuser.me/api/portraits/women/7.jpg',
    isTrusted: true,
  },
];

const FriendsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Friends' | 'Trusted'>('Friends');
  const [friends] = useState(MOCK_FRIENDS);

  // Filter friends based on active tab
  const filteredFriends =
    activeTab === 'Friends' ? friends : friends.filter(friend => friend.isTrusted);

  const handleUnfriend = (id: string) => {
    // Implementation for unfriending would go here
    console.log(`Unfriended user with id: ${id}`);
  };

  const renderFriendItem = ({ item }: { item: (typeof MOCK_FRIENDS)[0] }) => {
    return (
      <View style={styles.friendItem}>
        <View style={styles.friendInfo}>
          <Image source={{ uri: item.profilePic }} style={styles.avatar} />
          <View style={styles.textContainer}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.username}>{item.username}</Text>
          </View>
        </View>
        <LinearGradient
          colors={['rgba(196,183,255,0.5)', 'rgba(245,243,255,0.5)']}
          start={{ x: 1, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBorder}>
          <TouchableOpacity style={styles.unfriendButton} onPress={() => handleUnfriend(item.id)}>
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
    borderRadius:5
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
});

export default FriendsScreen;
