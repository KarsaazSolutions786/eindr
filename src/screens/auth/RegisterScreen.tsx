import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { authStart, authSuccess, authFailure } from '@store/slices/authSlice';
import { RootState } from '@store/rootReducer';
import { AppDispatch } from '@store/index';
import { AuthStackParamList } from '@navigation/AuthNavigator';
import { registerUser } from '@services/authService';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: Props) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleRegister = async () => {
    // Basic validation
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    // Basic password validation
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    dispatch(authStart());

    try {
      const response = await registerUser({ fullName, email, password });
      dispatch(authSuccess({ user: response.user, token: response.token }));
      // Navigation to the main app stack will happen automatically
      // because RootNavigator listens to the isAuthenticated state

    } catch (apiError: unknown) {
      let errorMessage = 'Registration failed. Please try again.';
      if (apiError instanceof Error) {
        errorMessage = apiError.message;
      } else if (typeof apiError === 'object' && apiError !== null && 'message' in apiError && typeof apiError.message === 'string') {
        errorMessage = apiError.message;
      }
      
      dispatch(authFailure(errorMessage));
      Alert.alert('Registration Failed', errorMessage);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View>
      {/* Name Input */}
      <TextInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
        editable={!isLoading}
      />

      {/* Email Input */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />

      {/* Password Input */}
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />

      {/* Confirm Password Input */}
      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        editable={!isLoading}
      />

      {/* Register Button */}
      <TouchableOpacity onPress={handleRegister} disabled={isLoading}>
        <Text>{isLoading ? 'Registering...' : 'Register'}</Text>
      </TouchableOpacity>

      {/* Login Link */}
      <TouchableOpacity onPress={navigateToLogin} disabled={isLoading}>
        <Text>Already have an account? Login</Text>
      </TouchableOpacity>

      {/* Display Error */}
      {error && <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text>}
    </View>
  );
};

export default RegisterScreen; 