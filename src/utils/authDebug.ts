import { store } from '@store/index';
import { StorageService } from '@services/storageService';

/**
 * Debug utility to check authentication state
 */
export const debugAuthState = async () => {
  console.log('🔍 === AUTH DEBUG START ===');
  
  // Check Redux state
  const authState = store.getState().auth;
  console.log('📱 Redux Auth State:', {
    isAuthenticated: authState.isAuthenticated,
    isInitialized: authState.isInitialized,
    hasUser: !!authState.user,
    hasToken: !!authState.token,
    hasRefreshToken: !!authState.refreshToken,
    tokenType: authState.tokenType,
    expiresIn: authState.expiresIn,
    userId: authState.user?.id,
    userEmail: authState.user?.email,
  });
  
  // Check stored auth data
  try {
    const storedAuthData = await StorageService.getAuthData();
    console.log('💾 Stored Auth Data:', {
      hasToken: !!storedAuthData.token,
      hasRefreshToken: !!storedAuthData.refreshToken,
      hasUser: !!storedAuthData.user,
      tokenPreview: storedAuthData.token ? `${storedAuthData.token.substring(0, 20)}...` : 'none',
      userEmail: storedAuthData.user?.email,
    });
  } catch (error) {
    console.error('❌ Error getting stored auth data:', error);
  }
  
  console.log('🔍 === AUTH DEBUG END ===');
};

/**
 * Check if user is properly authenticated
 */
export const isUserAuthenticated = (): boolean => {
  const authState = store.getState().auth;
  return authState.isAuthenticated && !!authState.token && !!authState.user;
};

/**
 * Get current auth token
 */
export const getCurrentToken = (): string | null => {
  return store.getState().auth.token;
};