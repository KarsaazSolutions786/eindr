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
    <Provider store={store}>
        {/* Root level gradient background */}
        <LinearGradient
          colors={['#16182A', '#A6A1F6']}
          style={StyleSheet.absoluteFill}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
        />
      <View style={styles.root}>

        <SafeAreaProvider>
          <NavigationContainer>
            <RootLayout />
          </NavigationContainer>
        </SafeAreaProvider>
      </View>
    </Provider>
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
