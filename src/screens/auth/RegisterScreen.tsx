import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { authStart, authSuccess, authFailure } from '@store/slices/authSlice';
import { RootState } from '@store/rootReducer';
import { AppDispatch } from '@store/index';
import { AuthStackParamList } from '@navigation/AuthNavigator';
import { registerUser } from '@services/authService';

// Common Component Imports
import { Input, Button } from '@components/common';
import theme from '@theme/theme';

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
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>

        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          editable={!isLoading}
          containerStyle={styles.input}
        />

        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
          containerStyle={styles.input}
        />

        <Input
          label="Password"
          placeholder="Enter password (min. 6 chars)"
          value={password}
          onChangeText={setPassword}
          isPassword={true}
          editable={!isLoading}
          containerStyle={styles.input}
        />

        <Input
          label="Confirm Password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword={true}
          editable={!isLoading}
          containerStyle={styles.input}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Button
          onPress={handleRegister}
          loading={isLoading}
          disabled={isLoading}
          fullWidth
          style={styles.button}
          variant="primary"
        >
          Register
        </Button>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={navigateToLogin} disabled={isLoading}>
            <Text style={[styles.linkText, styles.loginLink]}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

// Styles similar to LoginScreen
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.bold,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  input: {
    marginBottom: theme.spacing.lg,
  },
  button: {
    marginTop: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.danger,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    minHeight: theme.typography.lineHeight.sm,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  loginText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
  },
  linkText: {
    color: theme.colors.text.link,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
  },
  loginLink: {
    fontFamily: theme.typography.fontFamily.bold,
  }
});

export default RegisterScreen; 