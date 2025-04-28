// screens/CongratulationsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/common';
import theme from '@theme/theme';
import { RootStackParamList } from '@navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Registered'>;

const RegisteredScreen = ({ navigation }: Props) => {

  const handleConfirm = () => {
    // No need to dispatch anything here since the auth state is already set
    // The RootNavigator will automatically switch to AppNavigator
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.contentContainer}>
        <View style={styles.messageContainer}>
          <Text style={styles.title}>Congratulations!</Text>
          <Text style={styles.message}>
            I'm ready to help you remember what matters!{'\n'}
            Let's get started with your first task.
          </Text>
        </View>

        <Button variant="primary" size="md" fullWidth onPress={handleConfirm}>
          Confirm
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
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

export default RegisteredScreen;
