import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NotesScreen from '../screens/NotesScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ScanScreen from '../screens/ScanScreen';
import KeyboardScreen from '../screens/KeyboardScreen';
import { useNavigationContainerRef } from '@react-navigation/native';
import MainLayout from '../layouts/MainLayout';

export type RootStackParamList = {
  notes: undefined;
  calendar: undefined;
  scan: undefined;
  keyboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootLayout: React.FC = () => {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [currentRoute, setCurrentRoute] = React.useState<string>('notes');
  const [isLoggedIn, setIsLoggedIn] = React.useState(true); // You can manage this with your auth system

  const handleTabPress = (tabKey: string) => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(tabKey as keyof RootStackParamList);
    }
  };

  const renderScreen = ({ children }: { children: React.ReactNode }) => (
    <MainLayout
      currentTab={currentRoute}
      onTabPress={handleTabPress}
      headerProps={{
        isLoggedIn,
        subtitle: 'Forget Forgetting',
        onMenuPress: () => {
          /* Add your menu handler */
        },
        onProfilePress: () => {
          /* Add your profile handler */
        },
      }}>
      {children}
    </MainLayout>
  );

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={() => {
        const currentRouteName = navigationRef.getCurrentRoute()?.name;
        if (currentRouteName) {
          setCurrentRoute(currentRouteName);
        }
      }}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}>
        <Stack.Screen name="notes">
          {() => renderScreen({ children: <NotesScreen /> })}
        </Stack.Screen>
        <Stack.Screen name="calendar">
          {() => renderScreen({ children: <CalendarScreen /> })}
        </Stack.Screen>
        <Stack.Screen name="scan">{() => renderScreen({ children: <ScanScreen /> })}</Stack.Screen>
        <Stack.Screen name="keyboard">
          {() => renderScreen({ children: <KeyboardScreen /> })}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootLayout;
