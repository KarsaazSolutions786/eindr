import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GradientBorder from '../../components/common/GradientBorder';
import { searchUsers, sendFriendRequest } from '../../services/friendsService';

interface UserSuggestion {
  id: string;
  name: string;
  email: string;
  profilePic?: string;
  username?: string;
  mutualFriends?: number;
}

const SuggestionList: React.FC = () => {
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const suggestionsData = await searchUsers('');
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      Alert.alert('Error', 'Failed to load suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSuggestions();
    setRefreshing(false);
  };

  const handleSendRequest = async (user: UserSuggestion) => {
    if (processingIds.has(user.id)) return;
    
    setProcessingIds(prev => new Set(prev).add(user.id));
    try {
      await sendFriendRequest({ friend_email: user.email });
      setSuggestions(prev => prev.filter(suggestion => suggestion.id !== user.id));
      Alert.alert('Success', `Friend request sent to ${user.name}!`);
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', 'Failed to send friend request. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(user.id);
        return newSet;
      });
    }
  };

  const handleDismiss = (userId: string) => {
    setSuggestions(prev => prev.filter(suggestion => suggestion.id !== userId));
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#92B7FF" />
        <Text style={styles.loadingText}>Loading suggestions...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={suggestions}
      keyExtractor={item => item.id}
      renderItem={({ item }) => {
        const isProcessing = processingIds.has(item.id);
        return (
          <>
            <View style={styles.userRow}>
              <Image source={{ uri: item.profilePic }} style={styles.avatar} />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.username}>{item.username || `@${item.name.replace(/\s+/g, '')}`}</Text>
                {item.mutualFriends && item.mutualFriends > 0 && (
                  <Text style={styles.mutualFriends}>{item.mutualFriends} mutual friends</Text>
                )}
              </View>
              <GradientBorder
                colors={['rgba(196,183,255,0.5)', 'rgba(245,243,255,0.5)']}
                start={{ x: 1, y: 1 }}
                end={{ x: 1, y: 0 }}
                borderRadius={8}
                style={styles.gradientBorder}>
                <TouchableOpacity 
                  style={[styles.addBtn, isProcessing && styles.disabledBtn]} 
                  onPress={() => handleSendRequest(item)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#ffff" style={{ marginRight: 6 }} />
                  ) : (
                    <MaterialIcons name="person-add" size={20} color="#ffff" style={{ marginRight: 6 }} />
                  )}
                  <Text style={styles.addText}>Add</Text>
                </TouchableOpacity>
              </GradientBorder>
              <TouchableOpacity 
                style={[styles.cancelBtn, isProcessing && styles.disabledBtn]} 
                onPress={() => handleDismiss(item.id)}
                disabled={isProcessing}
              >
                <MaterialIcons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
          </>
        );
      }}
      contentContainerStyle={{ paddingBottom: 20 }}
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
          <Text style={styles.emptyText}>No suggestions available</Text>
          <Text style={styles.emptySubtext}>Check back later for new friend suggestions</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  username: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '300',
    marginTop: 2,
  },
  mutualFriends: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '300',
    marginTop: 2,
  },
  gradientBorder: {
    padding: 1,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.11,
    shadowRadius: 10,
    elevation: 3,
    shadowColor: '#c07ddf',
    marginRight: 8,
  },
  addBtn: {
    backgroundColor: '#30304E',
    borderRadius: 17,
    paddingVertical: 4,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addText: {
    color: '#ffff',
    fontWeight: '600',
    fontSize: 15,
  },
  cancelBtn: {
    padding: 4,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  divider: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginLeft: 10,
    marginRight: 0,
    width: 375,
    height: 0.5,
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
  },
});

export default SuggestionList;
