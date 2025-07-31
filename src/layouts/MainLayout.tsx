import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '../components/common/Header';
import BottomBar from '../components/common/BottomBar';
import theme from '@theme/theme';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import BackgroundScreen from '@components/BackgroundScreen';

interface MainLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showBottomBar?: boolean;
  headerProps?: {
    showBackArrow?: boolean;
    onBackPress?: () => void;
    subtitle?: string;
    isLoggedIn?: boolean;
    onMenuPress?: () => void;
    onProfilePress?: () => void;
    profileImage?: string;
  };
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showHeader = true,
  showBottomBar = true,
  headerProps,
}) => {
  const { isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);
  
  // Only render BottomBar if auth is initialized and user is authenticated
  const shouldShowBottomBar = isInitialized && isAuthenticated && showBottomBar;
  
  return (
    <View style={styles.container}>
      <BackgroundScreen>
        {showHeader && <Header {...headerProps} />}
        {children}
        {shouldShowBottomBar && <BottomBar />}
      </BackgroundScreen>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  contentNoHeader: {
    paddingTop: 0,
  },
});

export default MainLayout;
