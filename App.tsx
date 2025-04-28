/**
 * Eindr App
 * A mobile application for managing notes, calendar, and more
 *
 * @format
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import RootLayout from './src/navigation/RootLayout';
import LinearGradient from 'react-native-linear-gradient';
import { store } from './src/store';
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
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <View style={styles.root}>
          {/* Root level gradient background */}
          <LinearGradient
            colors={['#1E203A', '#161830', '#121225', '#161830', '#1E203A']}
            style={[StyleSheet.absoluteFillObject, styles.gradient]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            locations={[0, 0.25, 0.5, 0.75, 1]}
          />

          <SafeAreaProvider>
            <NavigationContainer>
              <RootLayout />
            </NavigationContainer>
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
