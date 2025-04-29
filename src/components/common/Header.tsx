import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import theme from '@theme/theme';
import { RootState } from '@store/index';
import { useSelector } from 'react-redux';

interface HeaderProps {
  showBackArrow?: boolean;
  onBackPress?: () => void;
  subtitle?: string;
  isLoggedIn?: boolean;
  onMenuPress?: () => void;
  onProfilePress?: () => void;
  profileImage?: string; // URL for profile image
}

const Header: React.FC<HeaderProps> = ({
  showBackArrow = false,
  onBackPress,
  subtitle = 'Forget Forgetting',
  isLoggedIn = false,
  onMenuPress,
  onProfilePress,
  profileImage,
}) => {
  // Render left side of header
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const renderLeftSide = () => {
    if (isAuthenticated) {
      return (
        <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
          <FontAwesome name="bars" size={20} color={theme.colors.white} />
        </TouchableOpacity>
      );
    }

    if (showBackArrow) {
      return (
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={theme.colors.white} />
        </TouchableOpacity>
      );
    }

    return <View style={styles.backButtonPlaceholder} />;
  };

  // Render right side of header
  const renderRightSide = () => {
    if (isAuthenticated) {
      return (
        <TouchableOpacity onPress={onProfilePress} style={styles.profileButton}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <FontAwesome name="user" size={20} color={theme.colors.white} />
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return <View style={styles.backButtonPlaceholder} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.header}>
        {renderLeftSide()}

        <View
          style={[
            styles.titleContainer,
            !showBackArrow && !isLoggedIn && styles.titleContainerCenter,
          ]}>
          {/* Logo Image */}
          <Image
            source={require('../../assets/Logo/indr.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          {!isLoggedIn && <Text style={styles.tagline}>{subtitle}</Text>}
        </View>

        {renderRightSide()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
    zIndex: 10,
    shadowOpacity: 0,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    padding: theme.spacing.sm,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    padding: theme.spacing.sm,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    padding: theme.spacing.sm,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPlaceholder: {
    width: 44, // Same width as backButton
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  titleContainerCenter: {
    // Center styling when no back button and not logged in
  },
  logoImage: {
    width: 170,
    height: 80,
    marginBottom: 4,
  },
  tagline: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  profilePlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
});

export default Header;
