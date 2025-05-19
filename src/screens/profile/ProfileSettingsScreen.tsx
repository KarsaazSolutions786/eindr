import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import theme from '@theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';

interface ProfileSettingItemProps {
  label: string;
  value?: string | number;
  icon?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
}

const ProfileSettingItem: React.FC<ProfileSettingItemProps> = ({
  label,
  value,
  icon,
  onPress,
  showChevron = true,
}) => {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingItemContent}>
        {icon}
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <View style={styles.settingValueContainer}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {showChevron && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.text.primary}
            style={{ marginLeft: 10 }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const ProfileSettingsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Hide header when component mounts
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleEditProfile = () => {
    // Navigate to edit profile page
    navigation.navigate('EditProfileScreen');
  };

  const handleDeleteAccount = () => {
    // Show confirmation dialog for deleting account
    console.log('Delete account');
  };

  const hasCard = true; // Replace with actual logic to check if the user has a card

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryDark} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={26} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/women/90.jpg' }}
            style={styles.profileImage}
          />
          <Text style={styles.name}>Zara khan</Text>
          <Text style={styles.email}>zara.khan@example.com</Text>
        </View>

        <View style={styles.settingsSection}>
          <ProfileSettingItem
            label="Language preference"
            value="English"
            onPress={() => navigation.navigate('LanguageSettingsScreen')}
          />

          <ProfileSettingItem
            label="Subscription status"
            value="Free trial"
            onPress={() => navigation.navigate('Plans')}
          />

          <ProfileSettingItem
            label="Active reminder"
            value="5"
            onPress={() => navigation.navigate('Reminders')}
          />

          <ProfileSettingItem
            label="Active Notes"
            value="3"
            onPress={() => navigation.navigate('Notes')}
          />

          <ProfileSettingItem
            label="Friends list"
            value="10 Friend"
            onPress={() => navigation.navigate('Friends')}
          />

          <ProfileSettingItem
            label="Card details"
            value={hasCard ? '**********0009' : 'Add payment method'}
            onPress={() => navigation.navigate('CardDetailsScreen')}
          />
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
            <Ionicons
              name="create-outline"
              size={20}
              color={theme.colors.text.primary}
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}>Edit profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteAccount}>
            <MaterialIcons
              name="delete-outline"
              size={20}
              color={theme.colors.text.primary}
              style={styles.actionIcon}
            />
            <Text style={styles.actionText}>Delete account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
    marginRight: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 70,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: 15,
  },
  email: {
    fontSize: 16,
    color: '#ffffffff',
    marginTop: 5,
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginLeft: 10,
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 16,
    color: '#ffffffff',
    textAlign: 'right',
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    paddingHorizontal: 16,
    width: '48%',
    backgroundColor: 'rgba(90, 90, 137, 0.6)',
  },
  deleteButton: {
    backgroundColor: 'rgba(35, 35, 59, 0.7)',
  },
  actionIcon: {
    marginRight: 8,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
});

export default ProfileSettingsScreen;
