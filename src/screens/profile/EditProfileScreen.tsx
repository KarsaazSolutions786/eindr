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

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<ProfileUpdateRequest>({
    first_name: user?.profile?.first_name || '',
    last_name: user?.profile?.last_name || '',
    display_name: user?.profile?.display_name || '',
    bio: user?.profile?.bio || '',
    phone_number: user?.profile?.phone_number || '',
    is_public: user?.profile?.is_public || false,
  });
  
  // No need for explicit permission request with react-native-image-picker

  const handleGoBack = () => {
    navigation.goBack();
  };

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
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        display_name: profileData.display_name,
        bio: profileData.bio,
        phone_number: profileData.phone_number,
        timezone: profileData.timezone,
        language: profileData.language,
        is_public: profileData.is_public,
        avatar_url: profileData.avatar_url
      };
      
      // Remove undefined values
      Object.keys(filteredProfileData).forEach(key => {
        if (filteredProfileData[key as keyof ProfileUpdateRequest] === undefined) {
          delete filteredProfileData[key as keyof ProfileUpdateRequest];
        }
      });
      
      console.log('🔍 EditProfile - Filtered data to send:', filteredProfileData);
      
      await ProfileService.updateProfile(filteredProfileData);
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
            label="First Name"
            value={profileData.first_name}
            onChangeText={(text) => handleInputChange('first_name', text)}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Last Name"
            value={profileData.last_name}
            onChangeText={(text) => handleInputChange('last_name', text)}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Display Name"
            value={profileData.display_name}
            onChangeText={(text) => handleInputChange('display_name', text)}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Bio"
            value={profileData.bio}
            onChangeText={(text) => handleInputChange('bio', text)}
            containerStyle={styles.inputContainer}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={styles.bioInput}
          />

          <Input
            label="Phone Number"
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
