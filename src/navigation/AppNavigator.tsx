import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Assume these screens exist or will be created
import HomeScreen from '@screens/HomeScreen'; 
import DetailsScreen from '@screens/DetailsScreen';

// Define the type for the stack parameters
export type AppStackParamList = {
  Home: undefined; 
  Details: { itemId: number; otherParam?: string };
  // Add other main app screens here (e.g., Settings, Profile)
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Overview' }} />
      <Stack.Screen name="Details" component={DetailsScreen} />
      {/* Add other main app screens here */}
    </Stack.Navigator>
  );
};

export default AppNavigator; 