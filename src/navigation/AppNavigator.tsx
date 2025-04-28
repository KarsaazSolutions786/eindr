import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import Screens
import RemindersScreen from '@screens/app/RemindersScreen';
import NotesScreen from '@screens/app/NotesScreen';
import FriendsScreen from '@screens/app/FriendsScreen';
import SettingsScreen from '@screens/app/SettingsScreen';

// Import screens from RootLayout
import CalendarScreen from '@screens/CalendarScreen';
import ScanScreen from '@screens/ScanScreen';
import KeyboardScreen from '@screens/KeyboardScreen';
import HomeScreen from '@screens/home/HomeScreen';

// Define Param List
export type AppStackParamList = {
  Home: undefined;
  Reminders: undefined;
  Notes: undefined;
  Friends: undefined;
  Settings: undefined;
  Calendar: undefined;
  Scan: undefined;
  Keyboard: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Reminders" component={RemindersScreen} />
      <Stack.Screen name="Notes" component={NotesScreen} />
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen name="Scan" component={ScanScreen} />
      <Stack.Screen name="Keyboard" component={KeyboardScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
