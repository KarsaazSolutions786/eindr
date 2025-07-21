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
import { PersistGate } from 'redux-persist/integration/react';
import RootLayout from './src/navigation/RootLayout';
import { store, persistor } from './src/store';
import { initializeAuth } from './src/services/authInitService';
import Toast from 'react-native-toast-message';
import ErrorBoundary from '@components/ErrorBoundary';

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
  // Google SignIn configuration and auth initialization
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.WEB_CLIENT_ID,
      iosClientId: Config.IOS_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

  // Handle authentication initialization after persist rehydration
  const handlePersistorReady = async () => {
    await initializeAuth();
  };

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor} onBeforeLift={handlePersistorReady}>
          <View style={styles.root}>
            <SafeAreaProvider>
              <NavigationContainer>
                <RootLayout />
              </NavigationContainer>
              <Toast />
            </SafeAreaProvider>
          </View>
        </PersistGate>
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
