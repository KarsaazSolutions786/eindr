import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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

const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      {/* Auth Screens */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
      <Stack.Screen name="PasswordResetSuccess" component={PasswordResetSuccessScreen} />
      <Stack.Screen name="Registered" component={RegisteredScreen} />

      {/* App Screens */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Reminders" component={RemindersScreen} />
      <Stack.Screen name="Notes" component={NotesScreen} />
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen name="Scan" component={ScanScreen} />
      <Stack.Screen name="Keyboard" component={KeyboardScreen} />
      <Stack.Screen name="NoteEdit" component={require('@screens/notes/NoteEdit').default} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
