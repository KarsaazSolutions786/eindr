/**
 * Friend Request Fix Utility
 * 
 * This utility provides specific fixes for friend request permission issues
 * and ensures proper data synchronization.
 */

import { Alert } from 'react-native';
import { store } from '../store';
import { getFriends, getFriendRequestHistory } from '../services/friendsService';
import { debugAuthState } from './authFix';

/**
 * Refresh friend requests and validate current user permissions
 */
export const refreshAndValidateFriendRequests = async (): Promise<boolean> => {
  try {
    console.log('🔄 Refreshing friend requests and validating permissions...');
    
    // Debug current auth state
    await debugAuthState();
    
    // Get current user info
    const authState = store.getState().auth;
    const currentUserId = authState.user?.id;
    
    if (!currentUserId) {
      console.log('❌ No current user ID found');
      Alert.alert(
        'Authentication Error',
        'Unable to identify current user. Please login again.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    // Fetch fresh friend requests
    try {
      const pendingRequests = await getFriends('pending');
      console.log('📋 Fresh pending requests:', {
        count: pendingRequests?.length || 0,
        requests: pendingRequests?.map(req => ({
          id: req.id,
          customer_id: req.customer_id,
          friend_id: req.friend_id,
          status: req.status
        }))
      });
      
      // Validate that pending requests are actually for the current user
      const validRequests = pendingRequests?.filter(req => {
        // The current user should be the friend_id (recipient) for incoming requests
        const isValidRecipient = req.friend_id === currentUserId.toString();
        if (!isValidRecipient) {
          console.log(`⚠️ Invalid request found: ${req.id} - current user ${currentUserId} is not the recipient (friend_id: ${req.friend_id})`);
        }
        return isValidRecipient;
      });
      
      console.log('✅ Valid requests for current user:', {
        validCount: validRequests?.length || 0,
        totalCount: pendingRequests?.length || 0
      });
      
      return true;
      
    } catch (error) {
      console.error('❌ Error fetching friend requests:', error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error in refreshAndValidateFriendRequests:', error);
    return false;
  }
};

/**
 * Validate specific friend request before accepting
 */
export const validateSpecificFriendRequest = async (friendshipId: string): Promise<boolean> => {
  try {
    console.log(`🔍 Validating specific friend request: ${friendshipId}`);
    
    // Get current user info
    const authState = store.getState().auth;
    const currentUserId = authState.user?.id;
    
    if (!currentUserId) {
      console.log('❌ No current user ID found');
      return false;
    }
    
    // Get friend request history and filter for incoming requests
    const historyData = await getFriendRequestHistory();
    const incomingRequests = historyData.filter(request => request.action === 'incoming');
    const targetRequest = incomingRequests?.find(req => req.id.toString() === friendshipId);
    
    if (!targetRequest) {
      console.log(`❌ Friend request ${friendshipId} not found in incoming requests`);
      Alert.alert(
        'Request Not Found',
        'This friend request may have already been processed or does not exist. Please refresh the list.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    // Validate that the current user is the recipient (requested_id should match current user)
    const isValidRecipient = targetRequest.requested_id === currentUserId;
    
    if (!isValidRecipient) {
      console.log(`❌ Permission denied: current user ${currentUserId} is not the recipient of request ${friendshipId}`);
      console.log('Request details:', {
        id: targetRequest.id,
        requester_id: targetRequest.requester_id,
        requested_id: targetRequest.requested_id,
        action: targetRequest.action
      });
      
      Alert.alert(
        'Permission Error',
        'You can only accept friend requests that were sent to you. This request may be outdated.',
        [
          {
            text: 'Refresh List',
            onPress: () => {
              // The calling component should handle the refresh
              console.log('User requested to refresh the list');
            }
          },
          { text: 'OK' }
        ]
      );
      return false;
    }
    
    console.log(`✅ Friend request ${friendshipId} is valid for current user`);
    return true;
    
  } catch (error) {
    console.error('❌ Error validating specific friend request:', error);
    return false;
  }
};

/**
 * Force refresh friend requests list using history API
 */
export const forceRefreshFriendRequests = async (): Promise<any[]> => {
  try {
    console.log('🔄 Force refreshing friend requests...');
    
    // Get friend request history and filter for incoming requests
    const historyData = await getFriendRequestHistory();
    const incomingRequests = historyData.filter(request => request.action === 'incoming');
    
    console.log('📋 Fresh friend requests loaded:', {
      count: incomingRequests?.length || 0
    });
    
    return incomingRequests || [];
    
  } catch (error) {
    console.error('❌ Error force refreshing friend requests:', error);
    return [];
  }
};