import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '../components/common/Header';
import BottomBar from '../components/common/BottomBar';
import theme from '@theme/theme';

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
  currentTab?: string;
  onTabPress?: (tabKey: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showHeader = true,
  showBottomBar = true,
  headerProps,
  currentTab = 'notes',
  onTabPress,
}) => {
  return (
    <View style={styles.container}>
      {showHeader && <Header {...headerProps} />}

      <View style={styles.content}>{children}</View>

      {showBottomBar && <BottomBar activeTab={currentTab} onTabPress={onTabPress || (() => {})} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
  },
});

export default MainLayout;
