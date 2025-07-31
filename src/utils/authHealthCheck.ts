import { store } from '../store';
import { StorageService } from '../services/storageService';
import { validateToken, refreshToken, getCurrentUser } from '../services/authService';
import { authSuccess, logout, setTokens } from '../store/slices/authSlice';
import { Alert } from 'react-native';

/**
 * Comprehensive authentication health check and repair utility
 * This utility diagnoses and fixes common authentication issues
 */

export interface AuthHealthReport {
  isHealthy: boolean;
  issues: string[];
  fixes: string[];
  recommendations: string[];
}

/**
 * Perform a comprehensive authentication health check
 */
export const performAuthHealthCheck = async (): Promise<AuthHealthReport> => {
  const report: AuthHealthReport = {
    isHealthy: true,
    issues: [],
    fixes: [],
    recommendations: []
  };

  console.log('🏥 Starting authentication health check...');

  try {
    // 1. Check Redux state
    const authState = store.getState().auth;
    console.log('📊 Redux Auth State:', {
      isAuthenticated: authState.isAuthenticated,
      isInitialized: authState.isInitialized,
      hasUser: !!authState.user,
      hasToken: !!authState.token,
      hasRefreshToken: !!authState.refreshToken,
      userEmail: authState.user?.email
    });

    // 2. Check AsyncStorage
    const storageAuth = await StorageService.getAuthData();
    console.log('💾 AsyncStorage Auth Data:', {
      hasStoredToken: !!storageAuth.token,
      hasStoredRefreshToken: !!storageAuth.refreshToken,
      hasStoredUser: !!storageAuth.user,
      storedUserEmail: storageAuth.user?.email
    });

    // 3. Check for state inconsistencies
    if (authState.isAuthenticated && (!authState.token || !authState.user)) {
      report.isHealthy = false;
      report.issues.push('Redux state shows authenticated but missing token or user data');
    }

    if (authState.token !== storageAuth.token) {
      report.isHealthy = false;
      report.issues.push('Token mismatch between Redux and AsyncStorage');
    }

    if (authState.user?.email !== storageAuth.user?.email) {
      report.isHealthy = false;
      report.issues.push('User data mismatch between Redux and AsyncStorage');
    }

    // 4. Check token validity
    if (authState.token) {
      const isTokenExpired = await StorageService.isTokenExpired();
      if (isTokenExpired) {
        report.issues.push('Access token is expired');
        report.recommendations.push('Token refresh needed');
      }

      // Test token with backend
      try {
        const isValid = await validateToken(authState.token);
        if (!isValid) {
          report.isHealthy = false;
          report.issues.push('Token validation failed with backend');
        }
      } catch (error) {
        report.isHealthy = false;
        report.issues.push('Token validation request failed');
      }
    }

    // 5. Check refresh token
    if (authState.isAuthenticated && !authState.refreshToken) {
      report.isHealthy = false;
      report.issues.push('Missing refresh token for authenticated user');
    }

    // 6. Test API connectivity
    if (authState.isAuthenticated && authState.token) {
      try {
        await getCurrentUser();
        console.log('✅ API connectivity test passed');
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          report.isHealthy = false;
          report.issues.push('API authentication failed - token may be invalid');
        } else {
          report.issues.push('API connectivity issue');
        }
      }
    }

    console.log('🏥 Health check completed');
    console.log('📋 Issues found:', report.issues.length);
    
    return report;

  } catch (error) {
    console.error('❌ Health check failed:', error);
    report.isHealthy = false;
    report.issues.push('Health check process failed');
    return report;
  }
};

/**
 * Attempt to fix common authentication issues
 */
export const repairAuthenticationIssues = async (): Promise<boolean> => {
  console.log('🔧 Starting authentication repair...');

  try {
    const authState = store.getState().auth;
    const storageAuth = await StorageService.getAuthData();

    // Fix 1: Sync Redux and AsyncStorage
    if (authState.token !== storageAuth.token && storageAuth.token) {
      console.log('🔧 Syncing tokens from AsyncStorage to Redux');
      store.dispatch(setTokens({
        token: storageAuth.token,
        refreshToken: storageAuth.refreshToken || ''
      }));
    }

    // Fix 2: Refresh expired tokens
    if (authState.refreshToken && await StorageService.isTokenExpired()) {
      console.log('🔧 Refreshing expired token');
      try {
        const refreshResponse = await refreshToken(authState.refreshToken);
        
        // Update both Redux and AsyncStorage
        store.dispatch(authSuccess({
          customer: authState.user!,
          access_token: refreshResponse.access_token,
          refresh_token: refreshResponse.refresh_token,
          token_type: refreshResponse.token_type,
          expires_in: refreshResponse.expires_in
        }));

        await StorageService.updateTokens(
          refreshResponse.access_token,
          refreshResponse.refresh_token
        );

        console.log('✅ Token refreshed successfully');
        return true;
      } catch (error) {
        console.error('❌ Token refresh failed during repair');
        return false;
      }
    }

    // Fix 3: Clear invalid authentication state
    if (authState.isAuthenticated && (!authState.token || !authState.user)) {
      console.log('🔧 Clearing invalid authentication state');
      store.dispatch(logout());
      await StorageService.clearAuthData();
      return false;
    }

    console.log('✅ Authentication repair completed');
    return true;

  } catch (error) {
    console.error('❌ Authentication repair failed:', error);
    return false;
  }
};

/**
 * Force a complete authentication reset
 */
export const forceAuthReset = async (): Promise<void> => {
  console.log('🔄 Forcing complete authentication reset...');
  
  try {
    // Clear Redux state
    store.dispatch(logout());
    
    // Clear AsyncStorage
    await StorageService.clearAuthData();
    
    console.log('✅ Authentication reset completed');
  } catch (error) {
    console.error('❌ Error during auth reset:', error);
  }
};

/**
 * Quick authentication diagnostic for debugging
 */
export const quickAuthDiagnostic = async (): Promise<void> => {
  console.log('🔍 === Quick Auth Diagnostic ===');
  
  const authState = store.getState().auth;
  const storageAuth = await StorageService.getAuthData();
  const isTokenExpired = await StorageService.isTokenExpired();
  
  console.log('Redux:', {
    authenticated: authState.isAuthenticated,
    hasToken: !!authState.token,
    hasUser: !!authState.user
  });
  
  console.log('Storage:', {
    hasToken: !!storageAuth.token,
    hasRefreshToken: !!storageAuth.refreshToken,
    hasUser: !!storageAuth.user
  });
  
  console.log('Token Status:', {
    expired: isTokenExpired,
    tokensMatch: authState.token === storageAuth.token
  });
  
  console.log('🔍 === End Diagnostic ===');
};

/**
 * Show authentication health report to user
 */
export const showAuthHealthReport = async (): Promise<void> => {
  const report = await performAuthHealthCheck();
  
  if (report.isHealthy) {
    Alert.alert(
      'Authentication Health ✅',
      'Your authentication is working properly.',
      [{ text: 'OK' }]
    );
  } else {
    const issuesList = report.issues.join('\n• ');
    Alert.alert(
      'Authentication Issues Found ⚠️',
      `Issues detected:\n• ${issuesList}\n\nWould you like to attempt automatic repair?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Repair', 
          onPress: async () => {
            const success = await repairAuthenticationIssues();
            if (success) {
              Alert.alert('Repair Complete ✅', 'Authentication issues have been fixed.');
            } else {
              Alert.alert('Repair Failed ❌', 'Could not fix all issues. You may need to log in again.');
            }
          }
        }
      ]
    );
  }
};