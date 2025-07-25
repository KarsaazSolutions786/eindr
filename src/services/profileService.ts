import { customerApi } from './api';
import { StorageService } from './storageService';
import { store } from '@store/index';
import { updateUser } from '@store/slices/authSlice';

// Types for profile updates
export interface ProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  display_name?: string;
  bio?: string;
  phone_number?: string;
  timezone?: string;
  language?: string;
  is_public?: boolean;
  is_new?: boolean;
  avatar_url?: string;
}

/**
 * Profile Service for managing user profile data
 */
export class ProfileService {
  /**
   * Update user profile
   * @param profileData - The profile data to update
   */
  static async updateProfile(profileData: ProfileUpdateRequest): Promise<void> {
    try {
      console.log('🔄 Updating profile data...', profileData);
      
      // Debug: Check current auth state
      const authState = store.getState().auth;
      console.log('🔍 Current auth state:', {
        isAuthenticated: authState.isAuthenticated,
        hasToken: !!authState.token,
        tokenLength: authState.token?.length,
        hasUser: !!authState.user,
        userId: authState.user?.id
      });
      
      // Make API call to update profile - use PUT method like onboarding completion
      // First get current user data to preserve required fields
const currentUser = await customerApi.get('/customers/me');
const currentProfile = currentUser.data.profile || {};

// Create update payload with current data + new profile data
const updatePayload = {
  email: currentUser.data.email,
  is_active: currentUser.data.is_active,
  is_verified: currentUser.data.is_verified,
  is_new: profileData.is_new ?? currentUser.data.is_new ?? false,
  first_name: profileData.first_name ?? currentProfile.first_name ?? '',
  last_name: profileData.last_name ?? currentProfile.last_name ?? '',
  display_name: profileData.display_name ?? currentProfile.display_name ?? '',
  bio: profileData.bio ?? currentProfile.bio ?? '',
  phone_number: profileData.phone_number ?? currentProfile.phone_number ?? '',
  timezone: profileData.timezone ?? currentProfile.timezone ?? 'UTC',
  language: profileData.language ?? currentProfile.language ?? 'en',
  is_public: profileData.is_public ?? currentProfile.is_public ?? false
};

console.log('📤 Sending profile update:', JSON.stringify(updatePayload, null, 2));

const response = await customerApi.put('/customers/me', updatePayload);
      
      console.log('✅ Profile updated successfully');
      console.log('📋 Update response:', JSON.stringify(response.data, null, 2));
      
      // Get the full updated user data
      const userData = await customerApi.get('/customers/me');
      
      // Update Redux store
      store.dispatch(updateUser(userData.data));
      
      // Update local storage
      await StorageService.updateUser(userData.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      
      // Log more detailed error information
      if (error.response) {
        console.error('📋 Error response status:', error.response.status);
        console.error('📋 Error response data:', JSON.stringify(error.response.data, null, 2));
      }
      
      throw new Error(error.response?.data?.detail || 'Failed to update profile');
    }
  }
  
  /**
   * Upload profile picture
   * @param imageUri - The local URI of the image to upload
   */
  static async uploadProfilePicture(imageUri: string): Promise<string> {
    try {
      console.log('🔄 Uploading profile picture...');
      
      // Create form data for file upload
      const formData = new FormData();
      
      // Extract filename from URI
      const uriParts = imageUri.split('/');
      const fileName = uriParts[uriParts.length - 1];
      
      // Append file to form data
      formData.append('avatar', {
        uri: imageUri,
        name: fileName,
        type: 'image/jpeg', // Adjust based on your image type
      } as any);
      
      // Make API call to upload image
      const response = await customerApi.post('/customers/me/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Profile picture uploaded successfully');
      console.log('📋 Upload response:', JSON.stringify(response.data, null, 2));
      
      // Get the avatar URL from response
      const avatarUrl = response.data.avatar_url;
      
      // Update profile with new avatar URL
      await this.updateProfile({ avatar_url: avatarUrl });
      
      return avatarUrl;
    } catch (error: any) {
      console.error('❌ Error uploading profile picture:', error);
      
      // Log more detailed error information
      if (error.response) {
        console.error('📋 Error response status:', error.response.status);
        console.error('📋 Error response data:', JSON.stringify(error.response.data, null, 2));
      }
      
      throw new Error(error.response?.data?.detail || 'Failed to upload profile picture');
    }
  }
  
  /**
   * Delete profile picture
   */
  static async deleteProfilePicture(): Promise<void> {
    try {
      console.log('🔄 Deleting profile picture...');
      
      // Make API call to delete profile picture
      await customerApi.delete('/customers/me/profile/avatar');
      
      console.log('✅ Profile picture deleted successfully');
      
      // Get the full updated user data
      const userData = await customerApi.get('/customers/me');
      
      // Update Redux store
      store.dispatch(updateUser(userData.data));
      
      // Update local storage
      await StorageService.updateUser(userData.data);
    } catch (error: any) {
      console.error('❌ Error deleting profile picture:', error);
      
      // Log more detailed error information
      if (error.response) {
        console.error('📋 Error response status:', error.response.status);
        console.error('📋 Error response data:', JSON.stringify(error.response.data, null, 2));
      }
      
      throw new Error(error.response?.data?.detail || 'Failed to delete profile picture');
    }
  }
}

// Export convenience functions for backward compatibility
export const updateProfile = ProfileService.updateProfile.bind(ProfileService);
export const uploadProfilePicture = ProfileService.uploadProfilePicture.bind(ProfileService);
export const deleteProfilePicture = ProfileService.deleteProfilePicture.bind(ProfileService);