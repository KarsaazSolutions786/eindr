// screens/PasswordResetSuccessScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/common';
import theme from '@theme/theme';
import { RootStackParamList } from '@navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PasswordResetSuccess'>;

const PasswordResetSuccessScreen = ({ navigation }: Props) => {
  const handleConfirm = () => {
    // Navigate to Login screen after password reset
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.contentContainer}>
        <View style={styles.messageContainer}>
          <Text style={styles.title}>Congratulations!</Text>
          <Text style={styles.message}>Your password has been changed successfully</Text>
        </View>

        <Button variant="primary" size="md" fullWidth onPress={handleConfirm}>
          Proceed to Login
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: theme.colors.background.primary,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.white,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight?.lg || 24,
  },
});

export default PasswordResetSuccessScreen;
