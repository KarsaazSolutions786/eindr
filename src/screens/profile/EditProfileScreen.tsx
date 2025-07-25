import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@store/rootReducer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import theme from '@theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import {launchImageLibrary, ImagePickerResponse, MediaType, ImageLibraryOptions} from 'react-native-image-picker';
import { ProfileService, ProfileUpdateRequest } from '@services/profileService';
import { updateUser } from '@store/slices/authSlice';
import { debugAuthState, isUserAuthenticated } from '@utils/authDebug';
import { StorageService } from '@services/storageService';
import { getCurrentUser } from '@services/authService';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<ProfileUpdateRequest>({
  first_name: '',
  last_name: '',
  display_name: '',
  bio: '',
  phone_number: '',
  is_public: false,
});
  const [isDraftLoaded, setIsDraftLoaded] = useState<boolean>(false);
const [isFetching, setIsFetching] = useState<boolean>(true);

  // Fetch latest user data and load draft on component mount
useEffect(() => {
  const fetchAndLoadData = async () => {
    setIsFetching(true);
    try {
      const userData = await getCurrentUser();
      dispatch(updateUser(userData));
      setProfileData({
        first_name: userData.profile?.first_name || '',
        last_name: userData.profile?.last_name || '',
        display_name: userData.profile?.display_name || '',
        bio: userData.profile?.bio || '',
        phone_number: userData.profile?.phone_number || '',
        is_public: userData.profile?.is_public || false,
      });
      console.log('🔄 Fetched latest user data for edit profile');
    } catch (error) {
      console.error('❌ Error fetching latest user data:', error);
      // Fallback to existing user data if fetch fails
      setProfileData({
        first_name: user?.profile?.first_name || '',
        last_name: user?.profile?.last_name || '',
        display_name: user?.profile?.display_name || '',
        bio: user?.profile?.bio || '',
        phone_number: user?.profile?.phone_number || '',
        is_public: user?.profile?.is_public || false,
      });
    }

    try {
      const draftData = await StorageService.getProfileDraft();
      if (draftData) {
        setProfileData(prev => ({
          ...prev,
          first_name: draftData.first_name ?? prev.first_name,
          last_name: draftData.last_name ?? prev.last_name,
          display_name: draftData.display_name ?? prev.display_name,
          bio: draftData.bio ?? prev.bio,
          phone_number: draftData.phone_number ?? prev.phone_number,
          is_public: draftData.is_public ?? prev.is_public,
        }));
        console.log('📝 Profile draft loaded from storage');
      }
    } catch (error) {
      console.error('❌ Error loading profile draft:', error);
    }

    setIsDraftLoaded(true);
    setIsFetching(false);
  };

  fetchAndLoadData();
}, [dispatch]);

  // Save draft data when profile data changes
useEffect(() => {
  if (!isDraftLoaded || isFetching) return; // Don't save until initial load and fetch are complete

  const saveDraftData = async () => {
    try {
      await StorageService.storeProfileDraft({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        display_name: profileData.display_name || '',
        bio: profileData.bio || '',
        phone_number: profileData.phone_number || '',
        is_public: profileData.is_public || false,
      });
      console.log('💾 Profile draft auto-saved');
    } catch (error) {
      console.error('❌ Error saving profile draft:', error);
    }
  };

  // Debounce the save operation
  const timeoutId = setTimeout(saveDraftData, 1000);
  return () => clearTimeout(timeoutId);
}, [profileData, isDraftLoaded, isFetching]);
  
  // No need for explicit permission request with react-native-image-picker

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      // Optional: You could show a confirmation dialog here if there are unsaved changes
      console.log('📱 EditProfileScreen unmounted');
    };
  }, []);

  // Handle profile picture selection
  const handleChoosePhoto = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const imageUri = response.assets[0].uri;
        if (imageUri) {
          setIsLoading(true);
          ProfileService.uploadProfilePicture(imageUri)
            .then(() => {
              Alert.alert('Success', 'Profile picture updated successfully');
            })
            .catch((error) => {
              Alert.alert('Error', 'Failed to upload profile picture');
              console.error('Error uploading profile picture:', error);
            })
            .finally(() => {
              setIsLoading(false);
            });
        }
      }
    });
  };

  // Handle profile picture removal
  const handleRemoveProfilePicture = async () => {
    Alert.alert(
      'Remove Profile Picture',
      'Are you sure you want to remove your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await ProfileService.deleteProfilePicture();
              Alert.alert('Success', 'Profile picture removed successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove profile picture');
              console.error('Error removing profile picture:', error);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Handle input changes
  const handleInputChange = (field: keyof ProfileUpdateRequest, value: string | boolean) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form submission
  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      // Validate required fields
      const requiredFields = {
        first_name: 'First Name',
        display_name: 'Display Name',
        phone_number: 'Phone Number'
      };
      
      const emptyFields = [];
      for (const [field, label] of Object.entries(requiredFields)) {
        const value = profileData[field as keyof ProfileUpdateRequest];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          emptyFields.push(label);
        }
      }
      
      if (emptyFields.length > 0) {
        Alert.alert(
          'Validation Error',
          `Please fill in the following required fields: ${emptyFields.join(', ')}`
        );
        return;
      }
      
      // Debug: Check authentication state
      await debugAuthState();
      
      // Check if user is authenticated
      if (!isUserAuthenticated()) {
        Alert.alert('Authentication Error', 'You need to log in again to update your profile.');
        return;
      }
      
      // Debug: Log current auth state before making request
      console.log('🔍 EditProfile - Current user:', user);
      console.log('🔍 EditProfile - Profile data to send:', profileData);
      
      // Filter profileData to only include allowed fields for the API
      const filteredProfileData: ProfileUpdateRequest = {
        first_name: profileData.first_name?.trim() || '',
        last_name: profileData.last_name?.trim() || '', // Optional field
        display_name: profileData.display_name?.trim() || '',
        bio: profileData.bio?.trim() || '', // Optional field
        phone_number: profileData.phone_number?.trim() || '',
        is_public: profileData.is_public,
      };
      
      // Remove undefined and empty values (except for optional fields)
      Object.keys(filteredProfileData).forEach(key => {
        const value = filteredProfileData[key as keyof ProfileUpdateRequest];
        if (value === undefined || (typeof value === 'string' && value === '' && key !== 'last_name' && key !== 'bio')) {
          delete filteredProfileData[key as keyof ProfileUpdateRequest];
        }
      });
      
      console.log('🔍 EditProfile - Filtered data to send:', filteredProfileData);
      
      await ProfileService.updateProfile(filteredProfileData);
      
      // Clear draft data after successful save
      await StorageService.clearProfileDraft();
      console.log('🗑️ Profile draft cleared after successful save');
      
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryDark} />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={26} color={theme.colors.text.primary} />
        </TouchableOpacity>
        {isDraftLoaded && (
          <Text style={styles.headerTitle}>Edit Profile</Text>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture */}
        <View style={styles.profileImageContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#FFFFFF" style={styles.profileImage} />
          ) : (
            <Image
              source={{
                uri: user?.profile?.avatar_url || 'https://randomuser.me/api/portraits/men/75.jpg',
              }}
              style={styles.profileImage}
            />
          )}
          <View style={styles.profileImageActions}>
            <TouchableOpacity style={styles.cameraButton} onPress={handleChoosePhoto}>
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            {user?.profile?.avatar_url && (
              <TouchableOpacity style={styles.removeButton} onPress={handleRemoveProfilePicture}>
                <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <Input
            label="First Name *"
            value={profileData.first_name}
            onChangeText={(text) => handleInputChange('first_name', text)}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Last Name (Optional)"
            value={profileData.last_name}
            onChangeText={(text) => handleInputChange('last_name', text)}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Display Name *"
            value={profileData.display_name}
            onChangeText={(text) => handleInputChange('display_name', text)}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Bio (Optional)"
            value={profileData.bio}
            onChangeText={(text) => handleInputChange('bio', text)}
            containerStyle={styles.inputContainer}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={styles.bioInput}
          />

          <Input
            label="Phone Number *"
            value={profileData.phone_number}
            onChangeText={(text) => handleInputChange('phone_number', text)}
            keyboardType="phone-pad"
            containerStyle={styles.inputContainer}
          />

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Public Profile</Text>
            <TouchableOpacity 
              style={[styles.toggle, profileData.is_public ? styles.toggleActive : {}]}
              onPress={() => handleInputChange('is_public', !profileData.is_public)}
            >
              <View style={[styles.toggleCircle, profileData.is_public ? styles.toggleCircleActive : {}]} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.buttonContainer}>
        <Button 
          onPress={handleConfirm} 
          variant="primary" 
          fullWidth
          loading={isSaving}
          disabled={isSaving}
        >
          Save Changes
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginLeft: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 90,
    backgroundColor: '#333',
  },
  profileImageActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  cameraButton: {
    backgroundColor: 'rgba(60, 60, 100, 0.8)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  removeButton: {
    backgroundColor: 'rgba(200, 60, 60, 0.8)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  formContainer: {
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3e3e5e',
    justifyContent: 'center',
    padding: 5,
  },
  toggleActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f4f3f4',
  },
  toggleCircleActive: {
    backgroundColor: '#FFFFFF',
    transform: [{ translateX: 20 }],
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 30,
  },
});

export default EditProfileScreen;
