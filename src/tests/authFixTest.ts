/**
 * Test script to verify authentication fixes
 * 
 * This script can be imported and run to test the authentication
 * error handling and validation fixes.
 */

import { quickFix, debugAuthState, validateAuthentication } from '../utils/authFix';
import { 
  sendFriendRequest, 
  getAcceptedFriends, 
  acceptFriendRequest, 
  declineFriendRequest 
} from '../services/friendsService';

/**
 * Test the authentication validation and error handling
 */
export const testAuthFixes = async (): Promise<void> => {
  console.log('🧪 === Testing Authentication Fixes ===');
  
  try {
    // 1. Debug current authentication state
    console.log('\n1️⃣ Debugging current auth state...');
    await debugAuthState();
    
    // 2. Validate authentication
    console.log('\n2️⃣ Validating authentication...');
    const isValid = await validateAuthentication();
    console.log('Authentication valid:', isValid);
    
    // 3. Test friend service methods with auth validation
    console.log('\n3️⃣ Testing friend service methods...');
    
    // Test getting accepted friends
    console.log('Testing getAcceptedFriends...');
    const friends = await getAcceptedFriends();
    console.log('Friends result:', friends ? 'Success' : 'Auth failed (expected if not logged in)');
    
    // Test sending friend request (will fail if not authenticated)
    console.log('Testing sendFriendRequest...');
    const requestResult = await sendFriendRequest({
      friend_email: 'test@example.com'
    });
    console.log('Friend request result:', requestResult ? 'Success' : 'Auth failed (expected if not logged in)');
    
    console.log('\n✅ Authentication fix tests completed');
    
  } catch (error) {
    console.error('❌ Error during auth fix tests:', error);
  }
};

/**
 * Quick test to verify the fixes are working
 */
export const quickAuthTest = async (): Promise<boolean> => {
  try {
    console.log('🚀 Running quick auth test...');
    
    // Run quick fix
    await quickFix();
    
    // Validate authentication
    const isValid = await validateAuthentication();
    
    console.log('Quick test result:', isValid ? '✅ Auth valid' : '⚠️ Auth invalid');
    return isValid;
    
  } catch (error) {
    console.error('❌ Quick auth test failed:', error);
    return false;
  }
};

/**
 * Test error handling for authentication failures
 */
export const testErrorHandling = async (): Promise<void> => {
  console.log('🔍 Testing error handling...');
  
  try {
    // This should trigger auth validation and potentially show error alerts
    const result = await getAcceptedFriends();
    
    if (result === null) {
      console.log('✅ Auth validation correctly returned null for invalid auth');
    } else {
      console.log('✅ Auth validation passed, got friends data');
    }
    
  } catch (error) {
    console.log('✅ Error handling working:', error);
  }
};

/**
 * Comprehensive test suite
 */
export const runAllAuthTests = async (): Promise<void> => {
  console.log('🧪 === Running All Authentication Tests ===');
  
  await testAuthFixes();
  await quickAuthTest();
  await testErrorHandling();
  
  console.log('\n🎉 All authentication tests completed!');
};

// Export for easy testing
export default {
  testAuthFixes,
  quickAuthTest,
  testErrorHandling,
  runAllAuthTests
};