import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthStackParamList } from '@navigation/AuthNavigator';
import { requestPasswordReset } from '@services/authService';

// Common Component Imports
import { Input, Button } from '@components/common';
import theme from '@theme/theme';

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
      // Keep alert for now, but also display inline
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your email address below and we'll send you a link to reset your password.</Text>

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

            {/* Display Success/Error Message Inline */}
            {message && <Text style={styles.successText}>{message}</Text>}
            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button
                onPress={handleResetPassword}
                loading={isLoading}
                disabled={isLoading}
                fullWidth
                style={styles.button}
                variant="primary"
            >
                Send Reset Link
            </Button>

            {/* Back to Login */}
            <TouchableOpacity 
                onPress={navigateToLogin} 
                disabled={isLoading} 
                style={styles.backLinkContainer}
            >
                <Text style={styles.linkText}>Back to Login</Text>
            </TouchableOpacity>
        </View>
    </ScrollView>
  );
};

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
    marginBottom: theme.spacing.md, // Less margin below title
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.regular,
    textAlign: 'center',
    marginBottom: theme.spacing.xl, // More margin below subtitle
  },
  input: {
    marginBottom: theme.spacing.lg,
  },
  button: {
    marginTop: theme.spacing.lg, // More space above button
  },
  successText: {
    color: theme.colors.success,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    minHeight: theme.typography.lineHeight.sm * 2, // Reserve space for multi-line msg
  },
  errorText: {
    color: theme.colors.danger,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    minHeight: theme.typography.lineHeight.sm * 2, // Reserve space for multi-line msg
  },
  backLinkContainer: {
      marginTop: theme.spacing.xl,
      alignItems: 'center',
      paddingBottom: theme.spacing.md, 
  },
  linkText: {
    color: theme.colors.text.link,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
  },
});

export default ForgotPasswordScreen; 