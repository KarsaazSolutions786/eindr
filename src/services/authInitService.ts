import { store } from '../store';
import { authSuccess, logout, setInitialized } from '../store/slices/authSlice';
import { StorageService } from './storageService';
import { refreshToken as refreshTokenAPI } from './authService';

/**
 * Logout user and clear all authentication data
 */
export const logoutUser = async (): Promise<void> => {
  store.dispatch(logout());
  await StorageService.clearAuthData();
};

/**
 * Initialize authentication state on app startup
 * This function checks for stored tokens and validates them
 */
export const initializeAuth = async (): Promise<void> => {
  try {
    console.log('🔄 Initializing authentication...');
    
    // Check if we have stored auth data
    const hasAuth = await StorageService.hasValidAuth();
    
    if (!hasAuth) {
      console.log('❌ No valid auth data found');
      store.dispatch(logout());
      store.dispatch(setInitialized(true));
      return;
    }

    // Get stored auth data
    const { token, refreshToken, user } = await StorageService.getAuthData();
    
    if (!token || !refreshToken || !user) {
      console.log('❌ Incomplete auth data found');
      await StorageService.clearAuthData();
      store.dispatch(logout());
      store.dispatch(setInitialized(true));
      return;
    }

    // Check if token is expired locally first
    const isTokenExpired = await StorageService.isTokenExpired();
    
    if (!isTokenExpired) {
      // Token is not expired, use it without API validation
       console.log('✅ Token is not expired, user authenticated');
       console.log('🔍 User data being set in store:', {
         id: user.id,
         email: user.email,
         firstName: user.profile?.first_name,
         lastName: user.profile?.last_name,
         displayName: user.profile?.display_name
       });
       store.dispatch(authSuccess({ 
         customer: user, 
         access_token: token, 
         refresh_token: refreshToken,
         token_type: 'bearer',
         expires_in: 3600
       }));
      return;
    }

    console.log('⚠️ Token appears to be expired, attempting refresh...');

    try {
       // Try to refresh the token
       console.log('🔄 Attempting to refresh token...');
       const refreshResponse = await refreshTokenAPI(refreshToken);
       
       if (refreshResponse.access_token && refreshResponse.refresh_token) {
          console.log('✅ Token refreshed successfully');
          
          // Update stored tokens
          await StorageService.updateTokens(refreshResponse.access_token, refreshResponse.refresh_token);
          
          // Update Redux state
          store.dispatch(authSuccess({ 
            customer: user, 
            access_token: refreshResponse.access_token, 
            refresh_token: refreshResponse.refresh_token,
            token_type: refreshResponse.token_type || 'bearer',
            expires_in: refreshResponse.expires_in || 3600
          }));
          return;
        }
     } catch (refreshError) {
       console.log('❌ Token refresh failed:', refreshError);
     }

    // If we reach here, refresh failed
    console.log('❌ Authentication failed, clearing data');
    await StorageService.clearAuthData();
    store.dispatch(logout());
    store.dispatch(setInitialized(true));
    
  } catch (error) {
    console.error('❌ Error during auth initialization:', error);
    await StorageService.clearAuthData();
    store.dispatch(logout());
    store.dispatch(setInitialized(true));
  }
};

/**
 * Store authentication data after successful login
 */
export const storeLoginData = async (authResponse: {
  customer: any;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}): Promise<void> => {
  await StorageService.storeAuthData({
    token: authResponse.access_token,
    refreshToken: authResponse.refresh_token,
    user: authResponse.customer
  });
};

/**
 * Check if user should be automatically logged in
 * This is a simpler check that can be used for initial routing decisions
 */
export const shouldAutoLogin = async (): Promise<boolean> => {
  try {
    return await StorageService.hasValidAuth();
  } catch (error) {
    console.error('Error checking auto-login status:', error);
    return false;
  }
};