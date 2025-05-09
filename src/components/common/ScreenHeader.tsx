import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  SafeAreaView,
  Image,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import theme from '@theme/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onMenuPress?: () => void;
  onBackPress?: () => void;
  onProfilePress?: () => void;
  profileImage?: string;
  showBackButton?: boolean;
  actionButton?: React.ReactNode;
}

const isIos = Platform.OS === 'ios';

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onMenuPress,
  onBackPress,
  onProfilePress,
  profileImage,
  showBackButton = false,
  actionButton,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {showBackButton ? (
          <TouchableOpacity onPress={onBackPress} style={styles.menuButton}>
            <FontAwesome name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
            <FontAwesome name="bars" size={24} color="white" />
          </TouchableOpacity>
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {actionButton ? (
          actionButton
        ) : (
          <TouchableOpacity onPress={onProfilePress} style={styles.profileButton}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <FontAwesome name="user" size={20} color="rgba(255, 255, 255, 0.8)" />
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: isIos ? 10 : StatusBar.currentHeight || 0,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  profileButton: {
    padding: 8,
  },
  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  profilePlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ScreenHeader;
