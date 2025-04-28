import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import AppNavigator from './AppNavigator';
import Sidebar from '../components/common/Sidebar';

const RootLayout: React.FC = () => {
  // You can manage this with your auth system
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

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
      <MainLayout headerProps={headerProps}>
        <AppNavigator />
      </MainLayout>

      <Sidebar
        isVisible={isSidebarVisible}
        onClose={() => setIsSidebarVisible(false)}
        userName="Kamran"
        onLanguageChange={() => console.log('Language change pressed')}
        onRingPress={() => console.log('Ring pressed')}
        onNotificationPress={() => console.log('Notification pressed')}
        onRemindersPress={() => console.log('Reminders pressed')}
      />
    </>
  );
};

export default RootLayout;
