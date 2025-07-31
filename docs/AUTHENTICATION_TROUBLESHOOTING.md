# Authentication Troubleshooting Guide

## Problem Summary

Based on the error logs in `erroe.txt`, the application is experiencing authentication failures when trying to access friend-related endpoints. The main issues are:

1. **401 Unauthorized errors** when accessing `/friends/requests/2/accept`
2. **403 Forbidden errors** when accessing `/friends/`
3. **Token refresh failures** with 401 errors
4. **Missing or invalid authentication tokens**

## Root Cause Analysis

The error pattern suggests:

1. **Token Expiry**: Access tokens are expiring and refresh attempts are failing
2. **Authentication State Mismatch**: Redux store and AsyncStorage may be out of sync
3. **Invalid Refresh Tokens**: Refresh tokens may be expired or invalid
4. **User Session Loss**: Users are being automatically logged out due to auth failures

## Error Flow Analysis

```
1. User tries to accept friend request
2. API call includes expired/invalid token
3. Server returns 401 Unauthorized
4. App attempts automatic token refresh
5. Refresh token is also invalid/expired
6. Refresh fails with 401
7. App automatically logs out user
8. Subsequent API calls fail with 403 (no auth)
```

## Solutions

### 1. Immediate Fix: Authentication State Reset

```typescript
// Clear all auth data and force re-login
import { StorageService } from '../services/storageService';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const resetAuthentication = async () => {
  // Clear Redux state
  store.dispatch(logout());
  
  // Clear AsyncStorage
  await StorageService.clearAuthData();
  
  // Force app to show login screen
  // User will need to login again
};
```

### 2. Debug Authentication State

Use the debug test we created:

```typescript
import { debugAuthenticationFlow } from '../tests/authDebugTest';

// Run this in your app to diagnose auth issues
debugAuthenticationFlow();
```

### 3. Improve Token Refresh Logic

Update the API interceptor to handle edge cases:

```typescript
// In src/services/api.ts - Response Interceptor Enhancement
if (error.response?.status === 401) {
  const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');
  
  if (isRefreshEndpoint) {
    // Refresh token is invalid - force logout
    console.error('❌ Refresh token invalid, forcing logout');
    store.dispatch(logout());
    await StorageService.clearAuthData();
    // Redirect to login screen
    return Promise.reject(new Error('Session expired. Please login again.'));
  }
  
  // Try refresh only once per request
  if (!originalRequest._retry) {
    originalRequest._retry = true;
    
    try {
      const authData = await StorageService.getAuthData();
      if (!authData.refreshToken) {
        throw new Error('No refresh token available');
      }
      
      // Attempt refresh...
      // (existing refresh logic)
      
    } catch (refreshError) {
      // Refresh failed - logout user
      console.error('❌ Token refresh failed, logging out');
      store.dispatch(logout());
      await StorageService.clearAuthData();
      return Promise.reject(new Error('Session expired. Please login again.'));
    }
  }
}
```

### 4. Add Authentication Guards

Add checks before making friend API calls:

```typescript
// In src/services/friendsService.ts
const ensureAuthenticated = async () => {
  const authState = store.getState().auth;
  
  if (!authState.isAuthenticated || !authState.token) {
    throw new Error('User not authenticated. Please login first.');
  }
  
  // Check if token is expired
  const isExpired = await StorageService.isTokenExpired();
  if (isExpired) {
    throw new Error('Session expired. Please login again.');
  }
};

// Use before each API call
export const acceptFriendRequest = async (requestId: number) => {
  await ensureAuthenticated();
  
  try {
    const response = await friendApi.put(`/friends/requests/${requestId}/accept`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('Authentication failed. Please login again.');
    }
    throw error;
  }
};
```

### 5. Improve Error Handling in UI

Update friend request components to handle auth errors gracefully:

```typescript
// In src/screens/friends/RequestList.tsx
const handleAcceptRequest = async (requestId: number) => {
  try {
    await acceptFriendRequest(requestId);
    // Success handling...
  } catch (error: any) {
    if (error.message.includes('login') || error.message.includes('Authentication')) {
      Alert.alert(
        'Session Expired',
        'Your session has expired. Please login again.',
        [
          {
            text: 'Login',
            onPress: () => {
              // Navigate to login screen
              navigation.navigate('Login');
            }
          }
        ]
      );
    } else {
      Alert.alert('Error', 'Failed to accept friend request. Please try again.');
    }
  }
};
```

## Testing Steps

1. **Clear App Data**:
   ```bash
   # For iOS Simulator
   npx react-native run-ios --reset-cache
   
   # For Android
   npx react-native run-android --reset-cache
   ```

2. **Test Authentication Flow**:
   - Launch app
   - Login with valid credentials
   - Navigate to Friends screen
   - Try to send/accept friend requests
   - Monitor console for auth-related logs

3. **Test Token Refresh**:
   - Login and wait for token to expire (or manually expire it)
   - Try to make API calls
   - Verify automatic refresh works

4. **Test Error Handling**:
   - Simulate network errors
   - Test with invalid tokens
   - Verify graceful fallback to login

## Prevention Measures

1. **Token Validation**: Add periodic token validation
2. **Proactive Refresh**: Refresh tokens before they expire
3. **Better Error Messages**: Provide clear feedback to users
4. **Offline Handling**: Handle network connectivity issues
5. **Session Monitoring**: Track session health and warn users

## Quick Fix for Current Issue

To immediately resolve the current authentication errors:

1. **Force logout and clear data**:
   ```typescript
   import { debugAuthenticationFlow, quickAuthFix } from '../tests/authDebugTest';
   
   // Debug current state
   await debugAuthenticationFlow();
   
   // If needed, manually authenticate
   await quickAuthFix('user@example.com', 'password');
   ```

2. **Restart the app** to ensure clean state

3. **Login again** with valid credentials

4. **Test friend functionality** to verify it's working

## Monitoring

Add these logs to monitor authentication health:

```typescript
// Add to app startup
console.log('🔐 Auth Health Check:', {
  isAuthenticated: store.getState().auth.isAuthenticated,
  hasToken: !!store.getState().auth.token,
  tokenExpiry: await StorageService.isTokenExpired()
});
```

This will help identify authentication issues early and prevent the 401/403 errors from occurring.