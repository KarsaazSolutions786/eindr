import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BackgroundScreen from '@components/BackgroundScreen';

// Auth Screens
import LoginScreen from '@screens/auth/LoginScreen';
import RegisterScreen from '@screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@screens/auth/ForgotPasswordScreen';
import OtpVerificationScreen from '@screens/auth/OtpVerificationScreen';
import NewPasswordScreen from '@screens/auth/NewPasswordScreen';
import PasswordResetSuccessScreen from '@screens/auth/PasswordResetSuccessScreen';
import RegisteredScreen from '@screens/auth/RegisteredScreen';

// App Screens
import HomeScreen from '@screens/home/HomeScreen';
import RemindersScreen from '@screens/app/RemindersScreen';
import NotesScreen from '@screens/notes/NotesScreen';
import FriendsScreen from '@screens/app/FriendsScreen';
import SettingsScreen from '@screens/app/SettingsScreen';
import CalendarScreen from '@screens/CalendarScreen';
import ScanScreen from '@screens/ScanScreen';
import KeyboardScreen from '@screens/KeyboardScreen';
import NoteEdit from '@screens/notes/NoteEdit';
import FriendRequests from '@screens/friends/FriendRequests';
import { ProfileScreen } from '@screens/profile';
import ChangePasswordScreen from '@screens/profile/ChangePasswordScreen';
import SupportAndAboutScreen from '@screens/app/SupportAndAboutScreen';
import PrivacyPolicyScreen from '@screens/app/PrivacyPolicyScreen';
import LedgerScreen from '@screens/app/LedgerScreen';
import NotificationsScreen from '@screens/notification/NotificationsScreen';
import NotificationSettingsScreen from '@screens/notification/NotificationSettingsScreen';
import LanguageSettingsScreen from '@screens/notification/LanguageSettingsScreen';
import BackgroundScreen2 from '@components/common/BackgroundScreen2';
import DashboardScreen from '@screens/dashboard/DashboardScreen';

// Define Friend type
interface Friend {
  id: string;
  name: string;
  username: string;
  profilePic: string;
  bio?: string;
  followers?: number;
  following?: number;
  isTrusted?: boolean;
}

// Navigation Options Type
export type NavigationOptions = {
  showHeader?: boolean;
  showBottomBar?: boolean;
};

// Define combined Param List
export type RootStackParamList = {
  // Auth Screens
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OtpVerification: undefined;
  NewPassword: undefined;
  PasswordResetSuccess: undefined;
  Registered: undefined;

  // App Screens
  Home: undefined;
  Dashboard: undefined;
  Ledger: undefined;
  Reminders: undefined;
  Notes: undefined;
  Friends: undefined;
  Settings: undefined;
  Calendar: undefined;
  Scan: undefined;
  Keyboard: undefined;
  FriendRequests: undefined;
  NoteEdit: { id: string; content: string };
  ProfileScreen: { friend: Friend; isFriend: boolean };
  ChangePasswordScreen: undefined;
  SupportAndAboutScreen: undefined;
  PrivacyPolicyScreen: undefined;
  NotificationsScreen: undefined;
  NotificationSettingsScreen: undefined;
  LanguageSettingsScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Screen configuration with navigation options
export const screenConfig: Record<keyof RootStackParamList, NavigationOptions> = {
  // Auth Screens
  Login: {},
  Register: {},
  ForgotPassword: {},
  OtpVerification: {},
  NewPassword: {},
  PasswordResetSuccess: {},
  Registered: {},

  // App Screens
  Home: { showHeader: true, showBottomBar: true },
  Dashboard: { showHeader: true, showBottomBar: true },
  Ledger: { showHeader: true, showBottomBar: true },
  Reminders: { showHeader: true, showBottomBar: true },
  Notes: { showHeader: true, showBottomBar: true },
  Friends: { showHeader: true, showBottomBar: true },
  Settings: { showHeader: true, showBottomBar: true },
  Calendar: { showHeader: true, showBottomBar: true },
  Scan: { showHeader: true, showBottomBar: true },
  Keyboard: { showHeader: true, showBottomBar: true },
  FriendRequests: { showHeader: true, showBottomBar: true },
  NoteEdit: { showHeader: true, showBottomBar: true },
  ProfileScreen: { showHeader: true, showBottomBar: true },
  ChangePasswordScreen: { showHeader: false, showBottomBar: true },
  SupportAndAboutScreen: { showHeader: false, showBottomBar: true },
  PrivacyPolicyScreen: { showHeader: false, showBottomBar: true },
  NotificationsScreen: { showHeader: true, showBottomBar: true },
  NotificationSettingsScreen: { showHeader: false, showBottomBar: true },
  LanguageSettingsScreen: { showHeader: false, showBottomBar: true },
};

// Wrapper component to add BackgroundScreen to each screen
const withBackground = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => (
    <BackgroundScreen>
      <Component {...props} />
    </BackgroundScreen>
  );
};

const withBackground2 = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => (
    <BackgroundScreen2>
      <Component {...props} />
    </BackgroundScreen2>
  );
};

const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      {/* Auth Screens */}
      <Stack.Screen name="Login" component={withBackground(LoginScreen)} />
      <Stack.Screen name="Register" component={withBackground(RegisterScreen)} />
      <Stack.Screen name="ForgotPassword" component={withBackground(ForgotPasswordScreen)} />
      <Stack.Screen name="OtpVerification" component={withBackground(OtpVerificationScreen)} />
      <Stack.Screen name="NewPassword" component={withBackground(NewPasswordScreen)} />
      <Stack.Screen
        name="PasswordResetSuccess"
        component={withBackground(PasswordResetSuccessScreen)}
      />
      <Stack.Screen name="Registered" component={withBackground(RegisteredScreen)} />

      {/* App Screens */}
      <Stack.Screen name="Home" component={withBackground(HomeScreen)} />
      <Stack.Screen name="Dashboard" component={withBackground2(DashboardScreen)} />
      <Stack.Screen name="Ledger" component={withBackground(LedgerScreen)} />
      <Stack.Screen name="Reminders" component={withBackground(RemindersScreen)} />
      <Stack.Screen name="Notes" component={withBackground(NotesScreen)} />
      <Stack.Screen name="NoteEdit" component={withBackground(NoteEdit)} />
      <Stack.Screen name="Friends" component={withBackground(FriendsScreen)} />
      <Stack.Screen name="Settings" component={withBackground(SettingsScreen)} />
      <Stack.Screen name="Calendar" component={withBackground(CalendarScreen)} />
      <Stack.Screen name="Scan" component={withBackground(ScanScreen)} />
      <Stack.Screen name="Keyboard" component={withBackground(KeyboardScreen)} />
      <Stack.Screen name="FriendRequests" component={withBackground(FriendRequests)} />
      <Stack.Screen name="ProfileScreen" component={withBackground(ProfileScreen)} />
      <Stack.Screen name="ChangePasswordScreen" component={withBackground(ChangePasswordScreen)} />
      <Stack.Screen
        name="SupportAndAboutScreen"
        component={withBackground(SupportAndAboutScreen)}
      />
      <Stack.Screen name="PrivacyPolicyScreen" component={withBackground(PrivacyPolicyScreen)} />
      <Stack.Screen name="NotificationsScreen" component={withBackground(NotificationsScreen)} />
      <Stack.Screen
        name="NotificationSettingsScreen"
        component={withBackground(NotificationSettingsScreen)}
      />
      <Stack.Screen
        name="LanguageSettingsScreen"
        component={withBackground(LanguageSettingsScreen)}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
