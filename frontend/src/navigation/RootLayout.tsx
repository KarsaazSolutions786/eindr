import React, { useState, useEffect } from 'react';
import { useNavigationState } from '@react-navigation/native';
import MainLayout from '../layouts/MainLayout';
import RootNavigator, { screenConfig } from './RootNavigator';
import Sidebar from '../components/common/Sidebar';

const RootLayout: React.FC = () => {
  // You can manage this with your auth system
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [showBottomBar, setShowBottomBar] = useState(true);

  // Get current route name to determine header visibility
  const navigationState = useNavigationState(state => state);

  useEffect(() => {
    if (navigationState && navigationState.routes.length > 0) {
      const currentRoute = navigationState.routes[navigationState.index];
      const currentRouteName = currentRoute.name as keyof typeof screenConfig;
      const screenOptions = screenConfig[currentRouteName] || {};

      // Check if header visibility has been explicitly set via params
      let headerVisible = screenOptions.showHeader !== false; // Default to true if not specified
      if (currentRoute.params && '__showHeader' in currentRoute.params) {
        headerVisible = Boolean(currentRoute.params.__showHeader);
      }

      // Update header and bottom bar visibility
      setShowHeader(headerVisible);
      setShowBottomBar(screenOptions.showBottomBar !== false); // Default to true if not specified
    }
  }, [navigationState]);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  // Header properties for the MainLayout
  const headerProps = {
    isLoggedIn,
    subtitle: 'Forget Forgetting',
    onMenuPress: toggleSidebar,
    onProfilePress: () => {
      /* Add your profile handler */
    },
  };

  return (
    <>
      <MainLayout headerProps={headerProps} showHeader={showHeader} showBottomBar={showBottomBar}>
        <RootNavigator />
      </MainLayout>

      <Sidebar
        isVisible={isSidebarVisible}
        onClose={() => setIsSidebarVisible(false)}
        userName="Kamran"
      />
    </>
  );
};

export default RootLayout;
