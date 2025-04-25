import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthStackParamList } from '@navigation/AuthNavigator';
import { requestPasswordReset } from '@services/authService';

// Common Component Imports
import { Input, Button, Header } from '@components/common';
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

    navigation.navigate('OtpVerification');

    // try {
    //   await requestPasswordReset({ email });
    //   setMessage('If an account exists for this email, a password reset link has been sent.');
    // } catch (apiError: unknown) {
    //   let errorMessage = 'Failed to send reset link. Please try again.';
    //   if (apiError instanceof Error) {
    //     errorMessage = apiError.message;
    //   } else if (
    //     typeof apiError === 'object' &&
    //     apiError !== null &&
    //     'message' in apiError &&
    //     typeof apiError.message === 'string'
    //   ) {
    //     errorMessage = apiError.message;
    //   }
    //   setError(errorMessage);
    //   // Keep alert for now, but also display inline
    //   Alert.alert('Error', errorMessage);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header fixed at the top */}
      <Header
        showBackArrow={true}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.contentContainer}>
        {/* Top Section with Email Input */}
        <View style={styles.topSection}>
          <Text style={styles.label}>Email</Text>
          <Input
            placeholder="Enter Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />

          {/* Display Success/Error Message Inline */}
          {message && <Text style={styles.successText}>{message}</Text>}
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {/* Bottom Section with Button */}
        <View style={styles.bottomSection}>
          <Button
            onPress={handleResetPassword}
            loading={isLoading}
            disabled={isLoading}
            fullWidth
            variant="primary">
            Confirm
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    paddingTop:40
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  topSection: {
    paddingTop: 70,
  },
  label: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    marginBottom: 10,
    fontFamily: theme.typography.fontFamily.medium,
  },
  bottomSection: {
    paddingBottom: 60,
    width: '100%',
  },
  successText: {
    color: theme.colors.success,
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
  },
  errorText: {
    color: theme.colors.danger,
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
  },
});

export default ForgotPasswordScreen;
