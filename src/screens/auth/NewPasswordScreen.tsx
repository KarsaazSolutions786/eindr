// screens/NewPasswordScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthStackParamList } from '@navigation/AuthNavigator';
// import { resetPassword } from '@services/authService';

// Common Component Imports
import { Input, Button, Header } from '@components/common';
import theme from '@theme/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'NewPassword'>;

const NewPasswordScreen = ({ navigation }: Props) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // This would be passed from the OTP screen
  // const { email, token } = route.params;

  const handleResetPassword = async () => {
    // Reset errors
    setNewPasswordError('');
    setConfirmPasswordError('');

    // Validate passwords
    let isValid = true;

    if (!newPassword) {
      setNewPasswordError('New password is required');
      isValid = false;
    } else if (newPassword.length < 8) {
      setNewPasswordError('Password must be at least 8 characters');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

       if (isValid) {
         navigation.navigate('PasswordResetSuccess');
       }

    // setIsLoading(true);

    // try {
    //   // In a real app, you would send the new password to the server
    //   // await resetPassword({ token, newPassword });

    //   // For demo purposes, we'll just navigate to the success screen
    //   setTimeout(() => {
    //     setIsLoading(false);
    //     navigation.navigate('PasswordResetSuccess');
    //   }, 1500);
    // } catch (error) {
    //   setIsLoading(false);
    //   Alert.alert('Error', 'Failed to reset password. Please try again.');
    // }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />

      <View style={styles.container}>
        <View style={styles.inputsContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>New password</Text>
            <Input
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={text => {
                setNewPassword(text);
                if (newPasswordError) setNewPasswordError('');
              }}
              secureTextEntry
              isPassword
              error={newPasswordError}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Confirm password</Text>
            <Input
              placeholder="Enter confirm password"
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              secureTextEntry
              isPassword
              error={confirmPasswordError}
              editable={!isLoading}
            />
          </View>
        </View>

        <Button
          variant="primary"
          size="md"
          fullWidth
          onPress={handleResetPassword}
          loading={isLoading}
          disabled={isLoading}>
          Confirm
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    paddingTop:50
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  inputsContainer: {
    marginTop: 20,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: 8,
    fontFamily: theme.typography.fontFamily.medium,
  },
});

export default NewPasswordScreen;
