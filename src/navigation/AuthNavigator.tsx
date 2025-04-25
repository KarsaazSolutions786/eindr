// navigation/AuthNavigator.tsx
// Update to include NewPassword screen in the navigation

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '@screens/Auth/LoginScreen';
import RegisterScreen from '@screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '@screens/Auth/ForgotPasswordScreen';
import OtpVerificationScreen from '@screens/Auth/OtpVerificationScreen';
import NewPasswordScreen from '@screens/Auth/NewPasswordScreen';
import PasswordResetSuccessScreen from '@screens/Auth/PasswordResetSuccessScreen';
import RegisteredScreen from '@screens/Auth/RegisteredScreen';

// Import your screens

// Update your AuthStackParamList type
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OtpVerification: undefined;
  NewPassword: undefined; // Add this line
  PasswordResetSuccess: undefined;
  Registered: undefined;
  Home: undefined;
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
    </Stack.Navigator>
  );
};

export default AuthNavigator;
