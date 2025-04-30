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
  Reminders: undefined;
  Notes: undefined;
  Friends: undefined;
  Settings: undefined;
  Calendar: undefined;
  Scan: undefined;
  Keyboard: undefined;
  NoteEdit: { id: string; content: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Wrapper component to add BackgroundScreen to each screen
const withBackground = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => (
    <BackgroundScreen>
      <Component {...props} />
    </BackgroundScreen>
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
      <Stack.Screen name="Reminders" component={withBackground(RemindersScreen)} />
      <Stack.Screen name="Notes" component={withBackground(NotesScreen)} />
      <Stack.Screen name="NoteEdit" component={withBackground(NoteEdit)} />
      <Stack.Screen name="Friends" component={withBackground(FriendsScreen)} />
      <Stack.Screen name="Settings" component={withBackground(SettingsScreen)} />
      <Stack.Screen name="Calendar" component={withBackground(CalendarScreen)} />
      <Stack.Screen name="Scan" component={withBackground(ScanScreen)} />
      <Stack.Screen name="Keyboard" component={withBackground(KeyboardScreen)} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
