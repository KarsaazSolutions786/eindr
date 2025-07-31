/**
 * Quick Authentication Fix Utility
 * 
 * This utility provides immediate fixes for the authentication issues
 * identified in the error logs.
 */

import { store } from '../store';
import { logout } from '../store/slices/authSlice';
import { StorageService } from '../services/storageService';
import { Alert } from 'react-native';

/**
 * Force clear all authentication data and reset to login state
 */
export const forceAuthReset = async (): Promise<void> => {
  try {
    console.log('🔄 Forcing authentication reset...');
    
    // Clear Redux state
    store.dispatch(logout());
    
    // Clear AsyncStorage
    await StorageService.clearAuthData();
    
    console.log('✅ Authentication reset complete');
    
    // Show user-friendly message
    Alert.alert(
      'Session Reset',
      'Your session has been reset. Please login again.',
      [{ text: 'OK' }]
    );
    
  } catch (error) {
    console.error('❌ Error during auth reset:', error);
  }
};

/**
 * Check if user is properly authenticated before making API calls
 */
export const validateAuthentication = async (): Promise<boolean> => {
  try {
    const authState = store.getState().auth;
    
    // Check Redux state
    if (!authState.isAuthenticated || !authState.token) {
      console.log('❌ User not authenticated in Redux state');
      return false;
    }
    
    // Check AsyncStorage
    const authData = await StorageService.getAuthData();
    if (!authData.token || !authData.refreshToken) {
      console.log('❌ Missing tokens in AsyncStorage');
      return false;
    }
    
    // Check token expiry
    const isExpired = await StorageService.isTokenExpired();
    if (isExpired) {
      console.log('❌ Token is expired');
      return false;
    }
    
    console.log('✅ Authentication validation passed');
    return true;
    
  } catch (error) {
    console.error('❌ Error validating authentication:', error);
    return false;
  }
};

/**
 * Handle authentication errors gracefully
 */
export const handleAuthError = async (error: any, context: string = 'API call'): Promise<void> => {
  console.log(`🔍 Handling auth error in ${context}:`, error);
  
  const isAuthError = 
    error?.response?.status === 401 || 
    error?.message?.includes('Token validation failed') ||
    error?.message?.includes('No auth token available') ||
    error?.message?.includes('No refresh token available');
  
  // Handle 403 errors more specifically
  const is403PermissionError = 
    error?.response?.status === 403 && 
    error?.response?.data?.detail?.includes('You can only accept friend requests sent to you');
  
  const is403AuthError = 
    error?.response?.status === 403 && 
    (error?.response?.data?.detail?.includes('Not authenticated') ||
     error?.response?.data?.detail?.includes('Invalid token') ||
     error?.response?.data?.detail?.includes('insufficient permissions'));
  
  if (isAuthError || is403AuthError) {
    console.log('🚨 Authentication error detected, forcing reset');
    await forceAuthReset();
    
    // Show specific error message
    Alert.alert(
      'Authentication Error',
      'Your session has expired or is invalid. Please login again to continue.',
      [{ text: 'OK' }]
    );
  } else if (is403PermissionError) {
    // Handle permission-specific 403 errors
    console.log('⚠️ Permission error: User trying to accept request not sent to them');
    Alert.alert(
      'Permission Error',
      'You can only accept friend requests that were sent to you. Please refresh the list and try again.',
      [{ text: 'OK' }]
    );
  } else {
    // Handle other errors
    console.log('⚠️ Non-auth error:', error.message);
    Alert.alert(
      'Error',
      error.message || 'An unexpected error occurred. Please try again.',
      [{ text: 'OK' }]
    );
  }
};

/**
 * Wrapper for API calls that includes authentication validation
 */
export const withAuthValidation = async <T>(
  apiCall: () => Promise<T>,
  context: string = 'API call'
): Promise<T | null> => {
  try {
    // Validate authentication first
    const isValid = await validateAuthentication();
    if (!isValid) {
      await forceAuthReset();
      return null;
    }
    
    // Make the API call
    return await apiCall();
    
  } catch (error) {
    await handleAuthError(error, context);
    return null;
  }
};

/**
 * Debug authentication state
 */
export const debugAuthState = async (): Promise<void> => {
  try {
    console.log('🔍 === Authentication Debug Info ===');
    
    // Redux state
    const authState = store.getState().auth;
    console.log('Redux Auth State:', {
      isAuthenticated: authState.isAuthenticated,
      hasToken: !!authState.token,
      hasRefreshToken: !!authState.refreshToken,
      hasUser: !!authState.user,
      userId: authState.user?.id
    });
    
    // AsyncStorage state
    const authData = await StorageService.getAuthData();
    console.log('AsyncStorage Auth Data:', {
      hasToken: !!authData.token,
      hasRefreshToken: !!authData.refreshToken,
      hasUser: !!authData.user,
      tokenExpired: await StorageService.isTokenExpired()
    });
    
    // Token preview (first 20 chars)
    if (authData.token) {
      console.log('Token Preview:', authData.token.substring(0, 20) + '...');
    }
    
    console.log('🔍 === End Debug Info ===');
    
  } catch (error) {
    console.error('❌ Error debugging auth state:', error);
  }
};

/**
 * Validate friend request permissions before accepting
 */
export const validateFriendRequestPermissions = async (friendshipId: string): Promise<boolean> => {
  try {
    console.log(`🔍 Validating permissions for friend request ${friendshipId}`);
    
    // Get current user info from Redux
    const authState = store.getState().auth;
    const currentUserId = authState.user?.id;
    
    console.log('Current user info:', {
      userId: currentUserId,
      isAuthenticated: authState.isAuthenticated,
      hasToken: !!authState.token
    });
    
    if (!currentUserId) {
      console.log('❌ No current user ID found');
      return false;
    }
    
    // Additional validation can be added here
    // For now, just ensure we have basic auth info
    return true;
    
  } catch (error) {
    console.error('❌ Error validating friend request permissions:', error);
    return false;
  }
};

/**
 * Quick fix for immediate testing
 */
export const quickFix = async (): Promise<void> => {
  console.log('🚀 Running quick authentication fix...');
  
  // Debug current state
  await debugAuthState();
  
  // Force reset if needed
  const isValid = await validateAuthentication();
  if (!isValid) {
    console.log('🔧 Authentication invalid, forcing reset...');
    await forceAuthReset();
  } else {
    console.log('✅ Authentication appears valid');
  }
};