import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import Screens
import RemindersScreen from '@screens/app/RemindersScreen';
import NotesScreen from '@screens/app/NotesScreen';
import FriendsScreen from '@screens/app/FriendsScreen';
import SettingsScreen from '@screens/app/SettingsScreen';

// Import Custom Tab Bar (We will create this next)
import CustomTabBar from './CustomTabBar'; 
import HomeScreen from '@screens/Home/HomeScreen';

// Define Param List
export type AppTabParamList = {
  Home: undefined;
  Reminders: undefined;
  Notes: undefined;
  Friends: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

const AppNavigator = () => {
  return (
    <Tab.Navigator
      // Use the custom tab bar component
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false, // Hide default header, we might add custom ones later
      }}
    >
      {/* These screens are part of the navigator state but won't all be directly shown in the custom bar */}
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Reminders" component={RemindersScreen} />
      <Tab.Screen name="Notes" component={NotesScreen} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator; 