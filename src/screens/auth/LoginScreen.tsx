import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { authStart, authSuccess, authFailure, clearError } from '@store/slices/authSlice';
import { RootState } from '@store/rootReducer'; // Corrected import path for RootState
import { AppDispatch } from '@store/index'; 

// --- TODO: Import navigation types ---
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { AuthStackParamList } from '@navigation/AuthNavigator';
// type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen = (/* { navigation }: Props */) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();

  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    dispatch(authStart());

    try {
      // --- TODO: Replace with actual API call ---
      console.log('Attempting login with:', email, password);
      // const response = await apiService.login(email, password);
      // MOCK SUCCESSFUL LOGIN RESPONSE (REMOVE LATER)
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1500)); // Corrected setTimeout usage again
      const mockUserData = { id: '123', name: 'Test User', email: email };
      const mockToken = 'mock-jwt-token-12345';
      // ---------------------------------------

      dispatch(authSuccess({ user: mockUserData, token: mockToken }));
      // Navigation to the main app stack will happen automatically
      // because RootNavigator listens to the isAuthenticated state.

    } catch (apiError: unknown) { // Use unknown for better type safety
      // --- TODO: Extract meaningful error message from apiError ---
      let errorMessage = 'Login failed. Please try again.';
      if (typeof apiError === 'object' && apiError !== null && 'message' in apiError && typeof apiError.message === 'string') {
        errorMessage = apiError.message;
      } else if (apiError instanceof Error) {
        errorMessage = apiError.message;
      }
      
      dispatch(authFailure(errorMessage));
      Alert.alert('Login Failed', errorMessage);
      // Optionally clear error after showing it
      // setTimeout(() => dispatch(clearError()), 3000);
    }
  };

  const navigateToRegister = () => {
    // navigation.navigate('Register'); // Requires Props type uncommented
    console.log("Navigate to Register"); // Placeholder
  }

  const navigateToForgotPassword = () => {
    // navigation.navigate('ForgotPassword'); // Requires Props type uncommented
    console.log("Navigate to Forgot Password"); // Placeholder
  }

  return (
    <View>
      {/* Email Input */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading} // Disable input when loading
      />

      {/* Password Input */}
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading} // Disable input when loading
      />

      {/* Login Button */}
      <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
        <Text>{isLoading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>

      {/* Forgot Password */}
      <TouchableOpacity onPress={navigateToForgotPassword} disabled={isLoading}>
        <Text>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Register Link */}
      <TouchableOpacity onPress={navigateToRegister} disabled={isLoading}>
        <Text>Don't have an account? Register</Text>
      </TouchableOpacity>

      {/* Display Error (optional) */}
      {error && <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text>}
    </View>
  );
};

export default LoginScreen; 