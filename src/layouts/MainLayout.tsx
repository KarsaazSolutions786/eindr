import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '../components/common/Header';
import BottomBar from '../components/common/BottomBar';
import theme from '@theme/theme';
import { useSelector } from 'react-redux';
import { RootState,  } from '@store/index';

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
  headerProps,
}) => {

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  console.log('=========', isAuthenticated);
  return (
    <View style={styles.container}>
      {showHeader && <Header {...headerProps} />}
      <View style={styles.content}>{children}</View>
      {isAuthenticated && <BottomBar />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default MainLayout;
