/**
 * Eindr App
 * A mobile application for managing notes, calendar, and more
 *
 * @format
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Config from 'react-native-config';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import RootLayout from './src/navigation/RootLayout';
import { store } from './src/store';
import Toast from 'react-native-toast-message';
import ErrorBoundary from '@components/ErrorBoundary';
import SpeechToText from '@screens/SpeechToText';
import VoiceReminder from '@screens/VoiceReminder';
import TestHabitDetection from '@screens/TestHabitDetection';

const { width, height } = Dimensions.get('window');

/**
 * App entry point
 *
 * Flow:
 * 1. App initializes with gradient background covering the entire application
 * 2. SafeAreaProvider handles safe area insets
 * 3. NavigationContainer manages navigation state
 * 4. RootLayout sets up main application structure
 */

const App = () => {
  // Gaoogle SignIn configuration
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.WEB_CLIENT_ID,
      iosClientId: Config.IOS_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

  return (
    <ErrorBoundary>
      {/* <Provider store={store}>
        <View style={styles.root}>
          <SafeAreaProvider>
            <NavigationContainer>
              <RootLayout />
            </NavigationContainer>
            <Toast />
          </SafeAreaProvider>
        </View>
      </Provider> */}
      {/* <TestHabitDetection /> */}
      <VoiceReminder />
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: width,
    height: height,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: -1, // Ensure gradient stays behind content
  },
});

export default App;
