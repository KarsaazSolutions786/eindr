import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys constants
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  SETTINGS: 'settings',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  LAST_LOGIN: 'last_login',
  TOKEN_EXPIRY: 'token_expiry',
} as const;

// Type definitions
export interface StoredUser {
  id: number;
  email: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  login_attempts: number;
  locked_until: string | null;
  profile: {
    first_name: string | null;
    last_name: string | null;
    display_name: string | null;
    bio: string | null;
    phone_number: string | null;
    timezone: string;
    language: string;
    is_public: boolean;
    id: number;
    customer_id: number;
    avatar_url: string | null;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
    is_new: boolean;
  };
}

export interface AuthData {
  token: string;
  refreshToken: string;
  user: StoredUser;
}

/**
 * Centralized AsyncStorage service for consistent data management
 */
export class StorageService {
  /**
   * Store authentication data (token, refresh token, and user)
   */
  static async storeAuthData(authData: AuthData): Promise<void> {
    try {
      // Calculate token expiry (assuming 24 hours for access token)
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      const operations = [
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, authData.token),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authData.user)),
        AsyncStorage.setItem(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString()),
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, tokenExpiry),
      ];
      
      await Promise.all(operations);
      console.log('✅ Auth data stored successfully');
    } catch (error) {
      console.error('❌ Error storing auth data:', error);
      throw new Error('Failed to store authentication data');
    }
  }

  /**
   * Retrieve authentication data
   */
  static async getAuthData(): Promise<{
    token: string | null;
    refreshToken: string | null;
    user: StoredUser | null;
  }> {
    try {
      const [token, refreshToken, userJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);

      let user: StoredUser | null = null;
      if (userJson) {
        try {
          user = JSON.parse(userJson);
        } catch (parseError) {
          console.error('❌ Error parsing stored user data:', parseError);
          // Clear corrupted user data
          await AsyncStorage.removeItem(STORAGE_KEYS.USER);
        }
      }

      return { token, refreshToken, user };
    } catch (error) {
      console.error('❌ Error retrieving auth data:', error);
      return { token: null, refreshToken: null, user: null };
    }
  }

  /**
   * Update stored tokens
   */
  static async updateTokens(token: string, refreshToken: string): Promise<void> {
    try {
      // Calculate new token expiry (assuming 24 hours for access token)
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, tokenExpiry),
      ]);
      console.log('✅ Tokens updated successfully');
    } catch (error) {
      console.error('❌ Error updating tokens:', error);
      throw new Error('Failed to update tokens');
    }
  }

  /**
   * Update stored user data
   */
  static async updateUser(user: StoredUser): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      console.log('✅ User data updated successfully');
    } catch (error) {
      console.error('❌ Error updating user data:', error);
      throw new Error('Failed to update user data');
    }
  }

  /**
   * Update specific user profile fields
   */
  static async updateUserProfile(profileUpdates: Partial<StoredUser['profile']>): Promise<void> {
    try {
      const { user } = await this.getAuthData();
      if (!user) {
        throw new Error('No user data found to update');
      }

      const updatedUser: StoredUser = {
        ...user,
        profile: {
          ...user.profile,
          ...profileUpdates
        }
      };

      await this.updateUser(updatedUser);
      console.log('✅ User profile updated successfully');
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  /**
   * Clear all authentication data
   */
  static async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.LAST_LOGIN,
        STORAGE_KEYS.TOKEN_EXPIRY,
      ]);
      console.log('✅ Auth data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
      throw new Error('Failed to clear authentication data');
    }
  }

  /**
   * Check if user has valid stored authentication
   */
  static async hasValidAuth(): Promise<boolean> {
    try {
      const { token, refreshToken, user } = await this.getAuthData();
      return !!(token && refreshToken && user);
    } catch (error) {
      console.error('❌ Error checking auth validity:', error);
      return false;
    }
  }

  /**
   * Check if stored token is expired
   */
  static async isTokenExpired(): Promise<boolean> {
    try {
      const tokenExpiry = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
      if (!tokenExpiry) {
        return true; // If no expiry stored, consider it expired
      }
      
      const expiryDate = new Date(tokenExpiry);
      const now = new Date();
      
      // Add 5 minute buffer to avoid edge cases
      const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
      return now.getTime() >= (expiryDate.getTime() - bufferTime);
    } catch (error) {
      console.error('❌ Error checking token expiry:', error);
      return true; // If error, consider it expired for safety
    }
  }

  /**
   * Check if user has valid and non-expired authentication
   */
  static async hasValidNonExpiredAuth(): Promise<boolean> {
    try {
      const hasAuth = await this.hasValidAuth();
      if (!hasAuth) {
        return false;
      }
      
      const isExpired = await this.isTokenExpired();
      return !isExpired;
    } catch (error) {
      console.error('❌ Error checking non-expired auth validity:', error);
      return false;
    }
  }

  /**
   * Store app settings
   */
  static async storeSettings(settings: Record<string, any>): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      console.log('✅ Settings stored successfully');
    } catch (error) {
      console.error('❌ Error storing settings:', error);
      throw new Error('Failed to store settings');
    }
  }

  /**
   * Retrieve app settings
   */
  static async getSettings(): Promise<Record<string, any> | null> {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settingsJson ? JSON.parse(settingsJson) : null;
    } catch (error) {
      console.error('❌ Error retrieving settings:', error);
      return null;
    }
  }

  /**
   * Mark onboarding as completed
   */
  static async markOnboardingCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
      console.log('✅ Onboarding marked as completed');
    } catch (error) {
      console.error('❌ Error marking onboarding as completed:', error);
      throw new Error('Failed to mark onboarding as completed');
    }
  }

  /**
   * Check if onboarding is completed
   */
  static async isOnboardingCompleted(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      return completed === 'true';
    } catch (error) {
      console.error('❌ Error checking onboarding status:', error);
      return false;
    }
  }

  /**
   * Get last login timestamp
   */
  static async getLastLogin(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOGIN);
    } catch (error) {
      console.error('❌ Error retrieving last login:', error);
      return null;
    }
  }

  /**
   * Clear all app data (for debugging or reset purposes)
   */
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('✅ All app data cleared');
    } catch (error) {
      console.error('❌ Error clearing all data:', error);
      throw new Error('Failed to clear all data');
    }
  }

  /**
   * Get storage usage information
   */
  static async getStorageInfo(): Promise<{
    keys: string[];
    totalItems: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return {
        keys: [...keys], // Convert readonly array to mutable array
        totalItems: keys.length,
      };
    } catch (error) {
      console.error('❌ Error getting storage info:', error);
      return { keys: [], totalItems: 0 };
    }
  }
}

// Export convenience functions for backward compatibility
export const storeAuthData = StorageService.storeAuthData.bind(StorageService);
export const getAuthData = StorageService.getAuthData.bind(StorageService);
export const updateTokens = StorageService.updateTokens.bind(StorageService);
export const updateUser = StorageService.updateUser.bind(StorageService);
export const updateUserProfile = StorageService.updateUserProfile.bind(StorageService);
export const clearAuthData = StorageService.clearAuthData.bind(StorageService);
export const hasValidAuth = StorageService.hasValidAuth.bind(StorageService);
export const isTokenExpired = StorageService.isTokenExpired.bind(StorageService);
export const hasValidNonExpiredAuth = StorageService.hasValidNonExpiredAuth.bind(StorageService);