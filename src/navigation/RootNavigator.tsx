import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
// Import Redux hook (or context) to get auth state later
import { useSelector } from 'react-redux'; 
import { RootState } from '@store/rootReducer'; // Import RootState

import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

const RootNavigator = () => {
  // --- Get Authentication State from Redux ---
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  // -----------------------------------------

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator; 