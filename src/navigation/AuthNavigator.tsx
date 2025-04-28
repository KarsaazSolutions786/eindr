// navigation/AuthNavigator.tsx
// Update to include NewPassword screen in the navigation

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterScreen from '@screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@screens/auth/ForgotPasswordScreen';
import OtpVerificationScreen from '@screens/auth/OtpVerificationScreen';
import NewPasswordScreen from '@screens/auth/NewPasswordScreen';
import PasswordResetSuccessScreen from '@screens/auth/PasswordResetSuccessScreen';
import RegisteredScreen from '@screens/auth/RegisteredScreen';
import LoginScreen from '@screens/auth/LoginScreen';

// Import your screens

// Update your AuthStackParamList type
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OtpVerification: undefined;
  NewPassword: undefined;
  PasswordResetSuccess: undefined;
  Registered: undefined;
  // Home: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
      <Stack.Screen name="PasswordResetSuccess" component={PasswordResetSuccessScreen} />
      <Stack.Screen name="Registered" component={RegisteredScreen} />
      {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
    </Stack.Navigator>
  );
};

export default AuthNavigator;
