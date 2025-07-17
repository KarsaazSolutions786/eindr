/**
 * Eindr App
 * A mobile application for managing notes, calendar, and more
 *
 * @format
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import Config from 'react-native-config';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import RootLayout from './src/navigation/RootLayout';
import { store } from './src/store';
import Toast from 'react-native-toast-message';
import ErrorBoundary from '@components/ErrorBoundary';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

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
  // Google SignIn configuration
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.WEB_CLIENT_ID,
      iosClientId: Config.IOS_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

  // Hide splash screen after app is ready
  useEffect(() => {
    const hideSplashScreen = async () => {
      // You can add any initialization logic here
      await SplashScreen.hideAsync();
    };
    
    hideSplashScreen();
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <View style={styles.root}>
          <SafeAreaProvider>
            <NavigationContainer>
              <RootLayout />
            </NavigationContainer>
            <StatusBar style="light" backgroundColor="#16182A" />
            <Toast />
          </SafeAreaProvider>
        </View>
      </Provider>
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
