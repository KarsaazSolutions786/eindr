import React, { useState, useEffect } from 'react';
import { useNavigationState } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import MainLayout from '../layouts/MainLayout';
import RootNavigator, { screenConfig } from './RootNavigator';
import Sidebar from '../components/common/Sidebar';
import { logout } from '@store/slices/authSlice';
import { logoutUser as logoutUserAPI } from '@services/authService';
import { logoutUser } from '@services/authInitService';
import { StorageService } from '@services/storageService';
import { AppDispatch } from '@store/index';

const RootLayout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
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

  // Handle logout
  const handleLogout = async () => {
    try {
      // Use performLogout from authAudit which handles refresh token properly
      const { performLogout } = await import('../utils/authAudit');
      await performLogout();
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggedIn(false);
    }
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
        onLogout={handleLogout}
      />
    </>
  );
};

export default RootLayout;
