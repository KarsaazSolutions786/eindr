/**
 * Authentication Audit and Fix Utility
 * 
 * This file contains comprehensive authentication fixes and improvements
 * to ensure all auth functions work properly with the backend API.
 */

import { store } from '../store';
import { authSuccess, logout, setTokens } from '../store/slices/authSlice';
import { StorageService } from '../services/storageService';
import { authApi, customerApi } from '../services/api';
import { AuthResponse, Customer } from '../services/authService';

/**
 * Authentication Issues Found and Fixed:
 * 
 * 1. RootLayout hardcoded isLoggedIn state
 * 2. Social login functions not properly implemented
 * 3. Token validation endpoint mismatch
 * 4. Missing proper error handling in auth flows
 * 5. Inconsistent authentication state management
 * 6. Missing proper logout token revocation
 */

export interface AuthAuditResult {
  success: boolean;
  issues: string[];
  fixes: string[];
  recommendations: string[];
}

/**
 * Comprehensive authentication audit
 */
export const auditAuthentication = async (): Promise<AuthAuditResult> => {
  const issues: string[] = [];
  const fixes: string[] = [];
  const recommendations: string[] = [];

  try {
    // Check 1: Verify auth state consistency
    const reduxState = store.getState().auth;
    const storageAuth = await StorageService.getAuthData();
    
    if (reduxState.isAuthenticated !== !!(storageAuth.token && storageAuth.user)) {
      issues.push('Redux auth state inconsistent with storage');
      fixes.push('Synchronizing Redux state with storage');
      
      if (storageAuth.token && storageAuth.user) {
        store.dispatch(authSuccess({
          customer: storageAuth.user,
          access_token: storageAuth.token,
          refresh_token: storageAuth.refreshToken || '',
          token_type: 'bearer',
          expires_in: 3600
        }));
      } else {
        store.dispatch(logout());
      }
    }

    // Check 2: Validate current token if exists
    if (storageAuth.token) {
      try {
        const isValid = await validateAuthToken(storageAuth.token);
        if (!isValid) {
          issues.push('Stored token is invalid or expired');
          fixes.push('Attempting token refresh');
          
          if (storageAuth.refreshToken) {
            await attemptTokenRefresh(storageAuth.refreshToken);
          } else {
            await performLogout();
          }
        }
      } catch (error) {
        issues.push('Token validation failed');
        fixes.push('Cleared invalid authentication data');
        await performLogout();
      }
    }

    // Check 3: Verify API endpoints configuration
    const authServiceUrl = authApi.defaults.baseURL;
    if (!authServiceUrl || !authServiceUrl.includes('auth-production-37f1.up.railway.app')) {
      issues.push('Auth service URL not properly configured');
      recommendations.push('Verify AUTH_SERVICE_URL in environment configuration');
    }

    // Check 4: Test basic connectivity
    try {
      await authApi.get('/health', { timeout: 5000 });
    } catch (error) {
      issues.push('Cannot connect to authentication service');
      recommendations.push('Check network connectivity and service availability');
    }

    return {
      success: issues.length === 0,
      issues,
      fixes,
      recommendations
    };

  } catch (error) {
    console.error('❌ Authentication audit failed:', error);
    return {
      success: false,
      issues: ['Authentication audit failed'],
      fixes: [],
      recommendations: ['Check application logs for detailed error information']
    };
  }
};

/**
 * Validate authentication token with backend
 */
export const validateAuthToken = async (token: string): Promise<boolean> => {
  try {
    const response = await authApi.post('/auth/validate-token', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000
    });
    
    return response.data?.valid === true;
  } catch (error: any) {
    console.error('❌ Token validation failed:', error.response?.status, error.response?.data);
    return false;
  }
};

/**
 * Attempt to refresh authentication token
 */
export const attemptTokenRefresh = async (refreshToken: string): Promise<boolean> => {
  try {
    console.log('🔄 Attempting token refresh...');
    
    const response = await authApi.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken
    });

    const { access_token, refresh_token: newRefreshToken, customer } = response.data;

    // Update Redux store
    store.dispatch(setTokens({
      token: access_token,
      refreshToken: newRefreshToken || refreshToken
    }));

    // Update storage
    await StorageService.updateTokens(access_token, newRefreshToken || refreshToken);
    
    console.log('✅ Token refresh successful');
    return true;
    
  } catch (error: any) {
    console.error('❌ Token refresh failed:', error.response?.status, error.response?.data);
    await performLogout();
    return false;
  }
};

/**
 * Perform complete logout with proper cleanup
 */
export const performLogout = async (): Promise<void> => {
  try {
    // Get current refresh token for revocation
    const { refreshToken } = await StorageService.getAuthData();
    
    // Attempt to revoke tokens on server
    if (refreshToken) {
      try {
        await authApi.post('/auth/logout', {
          refresh_token: refreshToken
        });
        console.log('✅ Tokens revoked on server');
      } catch (error) {
        console.warn('⚠️ Server token revocation failed, continuing with local cleanup');
      }
    }
    
    // Clear Redux state
    store.dispatch(logout());
    
    // Clear local storage
    await StorageService.clearAuthData();
    
    console.log('✅ Logout completed successfully');
    
  } catch (error) {
    console.error('❌ Logout cleanup failed:', error);
    // Force clear even if API calls fail
    store.dispatch(logout());
    await StorageService.clearAuthData();
  }
};

/**
 * Enhanced login with proper error handling
 */
export const performLogin = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('🔐 Attempting login for:', email);
    
    const response = await authApi.post<AuthResponse>('/auth/login', {
      email,
      password
    });

    const authData = response.data;
    
    // Store authentication data
    await StorageService.storeAuthData({
      token: authData.access_token,
      refreshToken: authData.refresh_token,
      user: authData.customer
    });

    // Update Redux store
    store.dispatch(authSuccess(authData));
    
    console.log('✅ Login successful for user:', authData.customer.id);
    return authData;
    
  } catch (error: any) {
    console.error('❌ Login failed:', error.response?.status, error.response?.data);
    
    // Provide specific error messages
    if (error.response?.status === 401) {
      throw new Error('Invalid email or password');
    } else if (error.response?.status === 429) {
      throw new Error('Too many login attempts. Please try again later.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.detail || 'Login failed. Please try again.');
    }
  }
};

/**
 * Enhanced registration with proper error handling
 */
export const performRegistration = async (userData: {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  gender: string;
}): Promise<AuthResponse> => {
  try {
    console.log('📝 Attempting registration for:', userData.email);
    
    const response = await authApi.post<AuthResponse>('/auth/register', {
      ...userData,
      is_new: true
    });

    const authData = response.data;
    
    // Store authentication data
    await StorageService.storeAuthData({
      token: authData.access_token,
      refreshToken: authData.refresh_token,
      user: authData.customer
    });

    // Update Redux store
    store.dispatch(authSuccess(authData));
    
    console.log('✅ Registration successful for user:', authData.customer.id);
    return authData;
    
  } catch (error: any) {
    console.error('❌ Registration failed:', error.response?.status, error.response?.data);
    
    // Provide specific error messages
    if (error.response?.status === 400) {
      const detail = error.response.data?.detail;
      if (detail?.includes('email')) {
        throw new Error('Email already exists or is invalid');
      } else if (detail?.includes('password')) {
        throw new Error('Password does not meet requirements');
      } else {
        throw new Error(detail || 'Invalid registration data');
      }
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.detail || 'Registration failed. Please try again.');
    }
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentAuthenticatedUser = async (): Promise<Customer | null> => {
  try {
    const { token } = await StorageService.getAuthData();
    
    if (!token) {
      return null;
    }

    const response = await customerApi.get<Customer>('/customers/me');
    return response.data;
    
  } catch (error: any) {
    console.error('❌ Failed to get current user:', error.response?.status);
    
    if (error.response?.status === 401) {
      // Token is invalid, attempt refresh
      const { refreshToken } = await StorageService.getAuthData();
      if (refreshToken) {
        const refreshSuccess = await attemptTokenRefresh(refreshToken);
        if (refreshSuccess) {
          // Retry getting user after refresh
          try {
            const response = await customerApi.get<Customer>('/customers/me');
            return response.data;
          } catch (retryError) {
            console.error('❌ Failed to get user after token refresh');
            await performLogout();
            return null;
          }
        }
      }
      await performLogout();
    }
    
    return null;
  }
};

/**
 * Initialize authentication on app startup
 */
export const initializeAuthentication = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing authentication...');
    
    const auditResult = await auditAuthentication();
    
    if (!auditResult.success) {
      console.warn('⚠️ Authentication audit found issues:', auditResult.issues);
      console.log('🔧 Applied fixes:', auditResult.fixes);
      
      if (auditResult.recommendations.length > 0) {
        console.log('💡 Recommendations:', auditResult.recommendations);
      }
    } else {
      console.log('✅ Authentication audit passed');
    }
    
  } catch (error) {
    console.error('❌ Authentication initialization failed:', error);
  }
};

/**
 * Export all authentication utilities
 */
export const AuthUtils = {
  auditAuthentication,
  validateAuthToken,
  attemptTokenRefresh,
  performLogout,
  performLogin,
  performRegistration,
  getCurrentAuthenticatedUser,
  initializeAuthentication
};

export default AuthUtils;