import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GradientBorder from '../../components/common/GradientBorder';
import { Friend, FriendRequestHistoryResponse, getPendingRequests, acceptFriendRequest, declineFriendRequest, getFriends, getFriendRequestHistory } from '../../services/friendsService';
import { validateFriendRequestPermissions } from '../../utils/authFix';
import { validateSpecificFriendRequest, forceRefreshFriendRequests } from '../../utils/friendRequestFix';

interface FriendRequestWithUI extends FriendRequestHistoryResponse {
  profilePic?: string;
  username?: string;
}

const RequestList: React.FC = () => {
  const [requests, setRequests] = useState<FriendRequestWithUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const loadRequests = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      
      // Get friend request history and filter for incoming requests only
      const historyData = await getFriendRequestHistory();
      const incomingRequests = historyData.filter(request => request.action === 'incoming');
      
      // Transform backend data to include UI properties
      const transformedRequests: FriendRequestWithUI[] = incomingRequests.map(request => {
        // Extract username from email (part before @)
        const username = request.requester_email?.split('@')[0] || 'unknown';
        
        return {
          ...request,
          profilePic: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 50) + 1}.jpg`,
          username: `@${username}`,
        };
      });
      
      setRequests(transformedRequests);
      
      if (forceRefresh) {
        console.log('✅ Friend requests refreshed successfully');
      }
    } catch (error) {
      console.error('Error loading friend requests:', error);
      Alert.alert('Error', 'Failed to load friend requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRequests(true);
    setRefreshing(false);
  };

  const handleAcceptRequest = async (requestId: number) => {
    const requestIdStr = requestId.toString();
    if (processingIds.has(requestIdStr)) return;
    
    // Find the request being accepted for debugging
    const requestToAccept = requests.find(req => req.id === requestId);
    console.log('🔍 Attempting to accept friend request:', {
      requestId,
      requestDetails: requestToAccept,
      currentUserId: 'Will be validated by backend'
    });
    
    // Validate permissions before attempting to accept
    const hasPermission = await validateSpecificFriendRequest(requestIdStr);
    if (!hasPermission) {
      // Error handling is done inside validateSpecificFriendRequest
      return;
    }
    
    setProcessingIds(prev => new Set(prev).add(requestIdStr));
    try {
      const result = await acceptFriendRequest(requestIdStr);
      if (result) {
        setRequests(prev => prev.filter(request => request.id !== requestId));
        Alert.alert('Success', 'Friend request accepted!');
        console.log('✅ Friend request accepted successfully');
      }
      // If result is null, the auth error was already handled by withAuthValidation
    } catch (error) {
      console.error('❌ Error accepting friend request:', error);
      // Don't show generic error alert here - let authFix handle it
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestIdStr);
        return newSet;
      });
    }
  };

  const handleDeclineRequest = async (requestId: number) => {
    const requestIdStr = requestId.toString();
    if (processingIds.has(requestIdStr)) return;
    
    setProcessingIds(prev => new Set(prev).add(requestIdStr));
    try {
      const result = await declineFriendRequest(requestIdStr);
      if (result) {
        setRequests(prev => prev.filter(request => request.id !== requestId));
        Alert.alert('Success', 'Friend request declined.');
      }
      // If result is null, the auth error was already handled by withAuthValidation
    } catch (error) {
      console.error('Error declining friend request:', error);
      Alert.alert('Error', 'Failed to decline friend request. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestIdStr);
        return newSet;
      });
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#92B7FF" />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={requests}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => {
        const isProcessing = processingIds.has(item.id.toString());
        // Extract name from email for display
        const displayName = item.requester_email?.split('@')[0].replace(/[._]/g, ' ') || 'Unknown User';
        // Format the request time
        const requestTime = new Date(item.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        return (
          <>
            <View style={styles.userRow}>
              <Image source={{ uri: item.profilePic }} style={styles.avatar} />
              <View style={styles.info}>
                <Text style={styles.name}>{displayName}</Text>
                <Text style={styles.username}>{item.requester_email}</Text>
                <Text style={styles.requestTime}>{requestTime}</Text>
              </View>
              <GradientBorder
                colors={['rgba(196,183,255,0.5)', 'rgba(245,243,255,0.5)']}
                start={{ x: 1, y: 1 }}
                end={{ x: 1, y: 0 }}
                borderRadius={8}
                style={styles.gradientBorder}>
                <TouchableOpacity 
                  style={[styles.confirmBtn, isProcessing && styles.disabledBtn]} 
                  onPress={() => handleAcceptRequest(item.id)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#ffff" style={{ marginRight: 6 }} />
                  ) : (
                    <Ionicons
                      name="checkmark-outline"
                      size={22}
                      color="#ffff"
                      style={{ marginRight: 6 }}
                    />
                  )}
                  <Text style={styles.confirmText}>Confirm</Text>
                </TouchableOpacity>
              </GradientBorder>
              <TouchableOpacity 
                style={[styles.cancelBtn, isProcessing && styles.disabledBtn]} 
                onPress={() => handleDeclineRequest(item.id)}
                disabled={isProcessing}
              >
                <Ionicons name="close" size={22} color="#fff" />
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
          <Ionicons name="mail-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
          <Text style={styles.emptyText}>No friend requests</Text>
          <Text style={styles.emptySubtext}>You're all caught up!</Text>
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
    color: '#ffff',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '300',
  },
  requestTime: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '300',
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
  confirmBtn: {
    backgroundColor: '#30304E',
    borderRadius: 17,
    paddingVertical: 4,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmText: {
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
  cancelText: {
    color: '#fff',
    fontSize: 18,
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

export default RequestList;
