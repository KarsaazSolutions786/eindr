import { friendApi, customerApi } from './api';
import { AxiosResponse } from 'axios';
import { withAuthValidation, handleAuthError } from '../utils/authFix';

// Types based on the backend friend service schemas
export interface Friend {
  id: string;
  customer_id: string;
  friend_id: string;
  friend_name: string;
  friend_email: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  accepted_at?: string;
}

export interface FriendRequest {
  friend_email: string;
  message?: string;
}

export interface UserSuggestion {
  id: string;
  name: string;
  email: string;
  profilePic?: string;
  username?: string;
  mutualFriends: number;
}

export interface FriendshipStats {
  total_friends: number;
  pending_requests: number;
  sent_requests: number;
  shared_reminders: number;
  shared_notes: number;
}

export interface FriendRequestHistoryResponse {
  id: number;
  requester_id: number;
  requested_id: number;
  action: string;
  message?: string;
  created_at: string;
  requester_email?: string;
  requested_email?: string;
}

export interface FriendsListResponse {
  friends: Friend[];
  total: number;
}

class FriendsService {
  /**
   * Send a friend request
   */
  static async sendFriendRequest(requestData: FriendRequest): Promise<Friend | null> {
    return withAuthValidation(async () => {
      const response: AxiosResponse<Friend> = await friendApi.post('/friends/requests', requestData);
      return response.data;
    }, 'sending friend request');
  }

  /**
   * Get friends list with optional status filter
   */
  static async getFriends(status?: 'pending' | 'accepted' | 'blocked'): Promise<Friend[]> {
    const result = await withAuthValidation(async () => {
      const params = status ? { status } : {};
      const response: AxiosResponse<Friend[]> = await friendApi.get('/friends/', { params });
      return response.data;
    }, 'fetching friends list');
    
    return result || [];
  }

  /**
   * Accept a friend request
   */
  static async acceptFriendRequest(friendshipId: string): Promise<{ message: string } | null> {
    return withAuthValidation(async () => {
      const response: AxiosResponse<{ message: string }> = await friendApi.put(`/friends/requests/${friendshipId}/accept`);
      return response.data;
    }, 'accepting friend request');
  }

  /**
   * Decline a friend request or remove a friend
   */
  static async declineFriendRequest(friendshipId: string): Promise<{ message: string } | null> {
    return withAuthValidation(async () => {
      const response: AxiosResponse<{ message: string }> = await friendApi.delete(`/friends/requests/${friendshipId}`);
      return response.data;
    }, 'declining friend request');
  }

  /**
   * Get friendship statistics
   */
  static async getFriendshipStats(): Promise<FriendshipStats> {
    const result = await withAuthValidation(async () => {
      const response: AxiosResponse<FriendshipStats> = await friendApi.get('/friends/stats');
      return response.data;
    }, 'fetching friendship stats');
    
    // Return default stats if auth validation fails
    return result || {
      total_friends: 0,
      pending_requests: 0,
      sent_requests: 0,
      shared_reminders: 0,
      shared_notes: 0
    };
  }

  /**
   * Get pending friend requests (received)
   */
  static async getPendingRequests(): Promise<Friend[]> {
    return this.getFriends('pending');
  }

  /**
   * Get accepted friends
   */
  static async getAcceptedFriends(): Promise<Friend[] | null> {
    return withAuthValidation(async () => {
      return this.getFriends('accepted');
    }, 'fetching accepted friends');
  }

  /**
   * Search for users by email (for friend suggestions)
   */
  static async searchUsers(query: string): Promise<any[]> {
    const result = await withAuthValidation(async () => {
      const response: AxiosResponse<any> = await customerApi.get('/customers/', {
        params: {
          search: query,
          limit: 20
        }
      });
      
      // Transform customer service response to suggestion format
      const customers = response.data.customers || [];
      return customers.map((customer: any) => {
        const displayName = customer.profile?.display_name || 
              `${customer.profile?.first_name || ''} ${customer.profile?.last_name || ''}`.trim() || 
              customer.email.split('@')[0];
        return {
          id: customer.id.toString(),
          name: displayName,
          email: customer.email,
          username: `@${displayName.replace(/\s+/g, '')}`,
          profilePic: customer.profile?.avatar_url || 
                     `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 50) + 1}.jpg`,
          mutualFriends: 0 // Would need to calculate from friend service
        };
      });
    }, 'searching users');
    
    return result || [];
  }

  /**
   * Get all users for friend suggestions
   * Calls the customer service to get all users
   */
  static async getAllUsers(): Promise<UserSuggestion[]> {
    const result = await withAuthValidation(async () => {
      // Call customer service to get all users
      const response: AxiosResponse<any> = await customerApi.get('/customers/', {
        params: {
          limit: 50, // Get up to 50 users for suggestions
          is_active: true // Only get active users
        }
      });
      
      // Transform customer service response to UserSuggestion format
      const customers = response.data.customers || [];
      const suggestions: UserSuggestion[] = customers.map((customer: any) => {
        const displayName = customer.profile?.display_name || 
              `${customer.profile?.first_name || ''} ${customer.profile?.last_name || ''}`.trim() || 
              customer.email.split('@')[0];
        return {
          id: customer.id.toString(),
          name: displayName,
          email: customer.email,
          username: `@${displayName.replace(/\s+/g, '')}`,
          profilePic: customer.profile?.avatar_url || 
                     `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 50) + 1}.jpg`,
          mutualFriends: Math.floor(Math.random() * 10) // Mock mutual friends for now
        };
      });
      
      console.log('✅ Fetched customer suggestions from service:', suggestions.length);
      return suggestions;
    }, 'fetching user suggestions');
    
    return result || [];
  }

  /**
   * Get friend request history
   */
  static async getFriendRequestHistory(): Promise<FriendRequestHistoryResponse[]> {
    const result = await withAuthValidation(async () => {
      const response: AxiosResponse<FriendRequestHistoryResponse[]> = await friendApi.get('/friends/history');
      return response.data;
    }, 'fetching friend request history');
    
    return result || [];
  }








}

// Export individual functions for convenience
export const sendFriendRequest = FriendsService.sendFriendRequest.bind(FriendsService);
export const getFriends = FriendsService.getFriends.bind(FriendsService);
export const acceptFriendRequest = FriendsService.acceptFriendRequest.bind(FriendsService);
export const declineFriendRequest = FriendsService.declineFriendRequest.bind(FriendsService);
export const getFriendshipStats = FriendsService.getFriendshipStats.bind(FriendsService);
export const getPendingRequests = FriendsService.getPendingRequests.bind(FriendsService);
export const getAcceptedFriends = FriendsService.getAcceptedFriends.bind(FriendsService);
export const searchUsers = FriendsService.searchUsers.bind(FriendsService);
export const getAllUsers = FriendsService.getAllUsers.bind(FriendsService);
export const getFriendRequestHistory = FriendsService.getFriendRequestHistory.bind(FriendsService);

export default FriendsService;