// screens/CongratulationsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/common';
import theme from '@theme/theme';
import { RootStackParamList } from '@navigation/RootNavigator';
import { useSelector } from 'react-redux';
import { RootState } from '@store/rootReducer';
import GradientBorder from '@components/common/GradientBorder';

type Props = NativeStackScreenProps<RootStackParamList, 'Registered'>;

const RegisteredScreen = ({ navigation }: Props) => {
  // Get user from the Redux store
  const { user } = useSelector((state: RootState) => state.auth);

  const handleConfirm = () => {
    // Check if user is new to determine where to navigate
    if (user?.isNew) {
      navigation.navigate('Welcome');
    } else {
      navigation.navigate('Home');
    }
  };

  const buttonContainerStyle = {
    marginVertical: 10,
    // This ensures shadows aren't clipped on iOS
    shadowColor: '#FF7D73',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.38,
    shadowRadius: 4,
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

        <View style={[styles.buttonWrapper, buttonContainerStyle]}>
          <GradientBorder
            colors={['rgba(178, 161, 255, 0.8)', 'rgba(255, 255, 255, 0.8)']}
            borderRadius={8}
            padding={1}
            angle={0}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}>
            <TouchableOpacity style={[styles.button, styles.buttonShadow]} onPress={handleConfirm}>
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </GradientBorder>
        </View>
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
  button: {
    backgroundColor: '#282958',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  buttonShadow: {
    // For iOS - first shadow
    shadowColor: '#FF7D73',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.38,
    shadowRadius: 4,

    // For Android
    elevation: 4,
  },
  buttonWrapper: {
    // This prevents the shadows from being clipped
    marginVertical: 10,
    alignSelf: 'center',
    width: '100%',
  },
});

export default RegisteredScreen;
