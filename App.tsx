/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootLayout from './src/navigation/RootLayout';

const App = () => {
  return (
    <SafeAreaProvider>
      <RootLayout />
    </SafeAreaProvider>
  );
};

export default App;
