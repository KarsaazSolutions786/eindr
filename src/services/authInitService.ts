import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '@store/index';
import { authSuccess, logout, setTokens } from '@store/slices/authSlice';
import { validateToken, refreshToken } from './authService';

/**
 * Clear authentication data from AsyncStorage
 */
const clearAuthStorage = async (): Promise<void> => {
  await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
};

/**
 * Logout user and clear all authentication data
 */
export const logoutUser = async (): Promise<void> => {
  store.dispatch(logout());
  await clearAuthStorage();
};

/**
 * Initialize authentication state on app startup
 * This function checks for stored tokens and validates them
 */
export const initializeAuth = async (): Promise<void> => {
  try {
    // Get stored tokens and user data
    const [storedToken, storedRefreshToken, storedUser] = await Promise.all([
      AsyncStorage.getItem('token'),
      AsyncStorage.getItem('refreshToken'),
      AsyncStorage.getItem('user')
    ]);

    // If no tokens are stored, user is not authenticated
    if (!storedToken || !storedRefreshToken) {
      console.log('No stored tokens found, user needs to login');
      return;
    }

    // Parse stored user data
    let userData = null;
    if (storedUser) {
      try {
        userData = JSON.parse(storedUser);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }

    // Validate the stored access token
    const isTokenValid = await validateToken(storedToken);
    
    if (isTokenValid && userData) {
      // Token is valid, restore authentication state
      console.log('Valid token found, restoring authentication state');
      store.dispatch(authSuccess({
        user: userData,
        token: storedToken,
        refreshToken: storedRefreshToken,
        tokenType: 'bearer',
        expiresIn: null // We don't store expiry time, will be handled by API interceptor
      }));
    } else {
      // Token is invalid, try to refresh it
      console.log('Token invalid, attempting to refresh...');
      try {
        const refreshResponse = await refreshToken(storedRefreshToken);
        
        // Update tokens in store and storage
        store.dispatch(setTokens({
          token: refreshResponse.access_token,
          refreshToken: refreshResponse.refresh_token
        }));
        
        // Update user data if available in refresh response
        if (refreshResponse.customer) {
          store.dispatch(authSuccess({
            user: refreshResponse.customer,
            token: refreshResponse.access_token,
            refreshToken: refreshResponse.refresh_token,
            tokenType: refreshResponse.token_type || 'bearer',
            expiresIn: refreshResponse.expires_in
          }));
          
          // Update stored user data
          await AsyncStorage.setItem('user', JSON.stringify(refreshResponse.customer));
        } else if (userData) {
          // Use existing user data if refresh doesn't return user info
          store.dispatch(authSuccess({
            user: userData,
            token: refreshResponse.access_token,
            refreshToken: refreshResponse.refresh_token,
            tokenType: refreshResponse.token_type || 'bearer',
            expiresIn: refreshResponse.expires_in
          }));
        }
        
        // Update stored tokens
        await AsyncStorage.setItem('token', refreshResponse.access_token);
        await AsyncStorage.setItem('refreshToken', refreshResponse.refresh_token);
        
        console.log('Token refreshed successfully');
      } catch (refreshError) {
        // Refresh failed, logout user
        console.error('Token refresh failed:', refreshError);
        await logoutUser();
      }
    }
  } catch (error) {
    console.error('Error initializing authentication:', error);
    // On any error, logout user to be safe
    await logoutUser();
  }
};

/**
 * Check if user should be automatically logged in
 * This is a simpler check that can be used for initial routing decisions
 */
export const shouldAutoLogin = async (): Promise<boolean> => {
  try {
    const [storedToken, storedRefreshToken] = await Promise.all([
      AsyncStorage.getItem('token'),
      AsyncStorage.getItem('refreshToken')
    ]);
    
    return !!(storedToken && storedRefreshToken);
  } catch (error) {
    console.error('Error checking auto-login status:', error);
    return false;
  }
};