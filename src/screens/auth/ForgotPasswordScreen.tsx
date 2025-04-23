import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/AuthNavigator';
import { requestPasswordReset } from '@services/authService';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async () => {
    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      await requestPasswordReset({ email });
      setMessage('If an account exists for this email, a password reset link has been sent.');

    } catch (apiError: unknown) {
      let errorMessage = 'Failed to send reset link. Please try again.';
      if (apiError instanceof Error) {
        errorMessage = apiError.message;
      } else if (typeof apiError === 'object' && apiError !== null && 'message' in apiError && typeof apiError.message === 'string') {
        errorMessage = apiError.message;
      }
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View>
      <Text>Enter your email to reset your password.</Text>

      {/* Email Input */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />

      {/* Reset Password Button */}
      <TouchableOpacity onPress={handleResetPassword} disabled={isLoading}>
        <Text>{isLoading ? 'Sending...' : 'Reset Password'}</Text>
      </TouchableOpacity>

      {/* Back to Login */}
      <TouchableOpacity onPress={navigateToLogin} disabled={isLoading}>
        <Text>Back to Login</Text>
      </TouchableOpacity>

      {/* Display Success/Error Message */}
      {message && <Text style={{ color: 'green', marginTop: 10 }}>{message}</Text>}
      {error && <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text>}
    </View>
  );
};

export default ForgotPasswordScreen; 