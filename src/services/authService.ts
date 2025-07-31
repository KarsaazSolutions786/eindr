import axios from 'axios';
import api, { authApi, customerApi } from './api';

// --- Define Types ---
// Aligned with the actual backend API response/request structures

interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  gender: string;
  is_new?: boolean;
}

export interface Customer {
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

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  customer: Customer;
}

interface ForgotPasswordRequest {
  email: string;
}

// --- API Service Functions ---

/**
 * Check if the current user is new and should see onboarding
 * @returns Promise that resolves to { isNew: boolean }
 */
export const checkUserStatus = async (): Promise<{ isNew: boolean }> => {
  try {
    // Get current user info from customer service
    const response = await customerApi.get('/customers/me');
    return { isNew: response.data.profile?.is_new || false };
  } catch (error) {
    console.error('Error checking user status:', error);
    return { isNew: false }; // Default to false if there's an error
  }
};

/**
 * Mark that the user has completed onboarding
 * Updates the backend profile to set is_new: false
 */
export const completeOnboarding = async (): Promise<void> => {
  try {
    console.log('🔄 Completing onboarding...');
    
    // Check authentication status for debugging
    const { store } = require('@store/index');
    const authState = store.getState().auth;
    const { token, refreshToken: currentRefreshToken, isAuthenticated, user } = authState;
    
    console.log('🔑 Authentication status:', {
      hasToken: !!token,
      hasRefreshToken: !!currentRefreshToken,
      isAuthenticated,
      hasUser: !!user
    });
    
    if (token) {
      console.log('🔑 Token preview:', token.substring(0, 20) + '...');
    }
    
    // Proceed with API call - let the API handle authentication
    console.log('📡 Attempting to update backend...');
    
    // Get current user data first to ensure we have the latest info
    const currentUser = await customerApi.get('/customers/me');
    console.log('👤 Current user data:', JSON.stringify(currentUser.data, null, 2));
    
    // Create the correct request body structure based on the API specification
    // The API expects a flat customer object with is_new at the root level
    const updatePayload = {
      email: currentUser.data.email,
      is_active: currentUser.data.is_active,
      is_verified: currentUser.data.is_verified,
      is_new: false // This is the key change - set to false to complete onboarding
    };
    
    console.log('📤 Sending customer update:', JSON.stringify(updatePayload, null, 2));
    
    // Use PUT method with the correct payload structure
    const updateResponse = await customerApi.put('/customers/me', updatePayload);
    
    console.log('✅ Onboarding completed successfully via API');
    console.log('📋 Update response:', JSON.stringify(updateResponse.data, null, 2));
    
  } catch (error: any) {
    console.error('❌ Error during onboarding completion:', error);
    
    // Log more detailed error information
    if (error.response) {
      console.error('📋 Error response status:', error.response.status);
      console.error('📋 Error response data:', JSON.stringify(error.response.data, null, 2));
      console.error('📋 Error response headers:', JSON.stringify(error.response.headers, null, 2));
      
      // Handle specific authentication errors with token refresh
      if ((error.response.status === 401 || error.response.status === 403) && 
          error.response.data?.detail === 'Not authenticated') {
        console.warn('🔐 Authentication token appears to be invalid or expired');
        
        // Attempt token refresh as per authentication flow documentation
        const { store } = require('@store/index');
        const currentRefreshToken = store.getState().auth.refreshToken;
        
        if (currentRefreshToken) {
          try {
            console.log('🔄 Attempting token refresh...');
            const refreshResponse = await refreshToken(currentRefreshToken);
            
            // Update tokens in store
            const { setTokens } = require('@store/slices/authSlice');
            store.dispatch(setTokens({
              token: refreshResponse.access_token,
              refreshToken: refreshResponse.refresh_token || currentRefreshToken
            }));
            
            console.log('✅ Token refreshed successfully, retrying onboarding update...');
            
            // Retry the original request with new token
            const retryUser = await customerApi.get('/customers/me');
            const retryPayload = {
              email: retryUser.data.email,
              is_active: retryUser.data.is_active,
              is_verified: retryUser.data.is_verified,
              is_new: false
            };
            
            const retryResponse = await customerApi.put('/customers/me', retryPayload);
            console.log('✅ Onboarding completed successfully after token refresh');
            console.log('📋 Retry response:', JSON.stringify(retryResponse.data, null, 2));
            return;
            
          } catch (refreshError: any) {
            console.error('❌ Token refresh failed:', refreshError);
            console.log('🚪 User needs to re-authenticate');
            
            // Clear invalid tokens and logout user
            const { logout } = require('@store/slices/authSlice');
            store.dispatch(logout());
          }
        } else {
          console.warn('⚠️ No refresh token available for token refresh');
        }
      }
    }
    
    // Don't throw the error - allow the app to continue
    // The local state will still be updated in PlansScreen
    console.log('ℹ️ Local onboarding state will be updated in PlansScreen');
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
  const response = await authApi.post<AuthResponse>('/auth/refresh', {
    refresh_token: refreshToken
  });
  return response.data;
};

/**
 * Get current user information
 */
export const getCurrentUser = async (): Promise<Customer> => {
  const response = await customerApi.get<Customer>('/customers/me');
  return response.data;
};

export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
  // Send login request to auth service
  const response = await authApi.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData: RegisterRequest): Promise<AuthResponse> => {
  // Send registration request to auth service
  const response = await authApi.post<AuthResponse>('/auth/register', userData);
  return response.data;
};

export const requestPasswordReset = async (data: ForgotPasswordRequest): Promise<void> => {
  // Send password reset request to auth service
  await authApi.post('/auth/forgot-password', data);
  // No specific data needed in response for this example
};

// --- Social Login Functions ---

// Google Login
export const loginWithGoogle = async (idToken: string): Promise<AuthResponse> => {
  console.log('Sending Google ID Token to backend...');
  // TODO: Replace '/auth/google' with your actual backend endpoint
  const response = await api.post<AuthResponse>('/auth/google', { idToken });
  console.log('Backend response for Google login:', response.data);
  return response.data;
};

// Facebook Login
export const loginWithFacebook = async (accessToken: string): Promise<AuthResponse> => {
  console.log('Sending Facebook Access Token to backend...');
  // TODO: Replace '/auth/facebook' with your actual backend endpoint
  const response = await api.post<AuthResponse>('/auth/facebook', { accessToken });
  console.log('Backend response for Facebook login:', response.data);
  return response.data;
};

// Apple Login
export const loginWithApple = async (identityToken: string): Promise<AuthResponse> => {
  console.log('Sending Apple Identity Token to backend...');
  // TODO: Replace '/auth/apple' with your actual backend endpoint
  const response = await api.post<AuthResponse>('/auth/apple', { identityToken });
  console.log('Backend response for Apple login:', response.data);
  return response.data;
};

/**
 * Logout user and revoke tokens
 */
export const logoutUser = async (refreshToken: string): Promise<void> => {
  try {
    await authApi.post('/auth/logout', { refresh_token: refreshToken });
  } catch (error) {
    console.error('Error during logout:', error);
    // Continue with logout even if API call fails
  }
};

/**
 * Revoke a specific token
 */
export const revokeToken = async (token: string): Promise<void> => {
  await authApi.post('/auth/revoke-token', { token });
};

/**
 * Validate if a token is still valid
 */
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    // Create a temporary axios instance without interceptors to avoid double token sending
    const tempApi = axios.create({
      baseURL: authApi.defaults.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000
    });
    
    await tempApi.post('/auth/validate-token');
    return true;
  } catch (error) {
    return false;
  }
};

// --- TODO: Add other auth-related API calls as needed ---
// e.g., resetPassword, verifyEmail, etc.
