import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from '@navigation/RootNavigator';
import Toast from 'react-native-toast-message';
import ErrorBoundary from '@components/ErrorBoundary';
import BackgroundScreen from '@components/BackgroundScreen';

const App = () => {
  return (
    <ErrorBoundary>
      <BackgroundScreen>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <Toast />
      </BackgroundScreen>
    </ErrorBoundary>
  );
};

export default App;
