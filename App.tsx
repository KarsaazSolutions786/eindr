/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import RootNavigator from '@navigation/RootNavigator';
import { store, persistor } from '@store/index'; // Import store and persistor

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    // Provide the Redux store
    <Provider store={store}>
      {/* Delay rendering until persisted state is retrieved */}
      <PersistGate loading={null} persistor={persistor}>
        {/* Gesture handler setup */}
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <RootNavigator />
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
}

export default App;
