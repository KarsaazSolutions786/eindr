import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  Pressable,
  Animated,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { BlurView } from '@react-native-community/blur';
import theme from '@theme/theme';

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
  userName?: string;
  userImage?: string;
  onLanguageChange?: () => void;
  onRingPress?: () => void;
  onNotificationPress?: () => void;
  onRemindersPress?: () => void;
}

const { width } = Dimensions.get('window');

const Sidebar: React.FC<SidebarProps> = ({
  isVisible,
  onClose,
  userName = 'Kamran',
  userImage,
  onLanguageChange,
  onRingPress,
  onNotificationPress,
  onRemindersPress,
}) => {
  // Animation value for the sidebar sliding
  const slideAnim = useRef(new Animated.Value(-300)).current;

  // Format current date in DD-MM-YYYY format
  const formatDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  // Control animation when visibility changes
  useEffect(() => {
    if (isVisible) {
      // Slide in from left
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide out to left
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnim]);

  return (
    <Modal animationType="none" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <Animated.View
          style={[
            styles.sidebar,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={15}
            reducedTransparencyFallbackColor="rgba(30, 32, 58, 0.95)"
          />
          <View style={styles.overlay} />
          <View style={styles.sidebarContent}>
            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <FontAwesome name="times" size={24} color={theme.colors.white} />
            </TouchableOpacity>

            {/* User profile section */}
            <View style={styles.profileSection}>
              {userImage ? (
                <Image source={{ uri: userImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <FontAwesome name="user" size={24} color={theme.colors.white} />
                </View>
              )}
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.dateTime}>{formatDate()}</Text>
            </View>

            {/* Language selector */}
            <View style={styles.menuSection}>
              <Text style={styles.sectionLabel}>Language</Text>
              <TouchableOpacity style={styles.menuItem} onPress={onLanguageChange}>
                <Text style={styles.menuItemText}>English</Text>
                {/* <FontAwesome name="chevron-down" size={12} color={theme.colors.white} /> */}
              </TouchableOpacity>
            </View>

            {/* Menu options */}
            <View style={styles.menuSection}>
              <TouchableOpacity style={styles.menuItem} onPress={onRingPress}>
                <FontAwesome
                  name="bell-o"
                  size={20}
                  color={theme.colors.white}
                  style={styles.menuIcon}
                />
                <Text style={styles.menuItemText}>Ring</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={onNotificationPress}>
                <FontAwesome
                  name="bell"
                  size={20}
                  color={theme.colors.white}
                  style={styles.menuIcon}
                />
                <Text style={styles.menuItemText}>Notification</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={onRemindersPress}>
                <FontAwesome
                  name="clock-o"
                  size={20}
                  color={theme.colors.white}
                  style={styles.menuIcon}
                />
                <Text style={styles.menuItemText}>See All Reminder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <Pressable style={styles.dismissArea} onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  dismissArea: {
    flex: 1,
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    // width: width * 0.75,
    width: 1350,
    height: 1350,
    // height: height,
    overflow: 'hidden',
    borderRadius: 600,
    marginTop: -250,
    marginLeft: -1050,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: 'rgba(30, 32, 58, 0.5)',
  },
  sidebarContent: {
    flex: 1,
    padding: theme.spacing.lg,
    marginLeft:1060,
    marginTop:270
  },
  closeButton: {
    alignSelf: 'flex-start',
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  profileSection: {
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xl,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: theme.spacing.sm,
  },
  profileImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  userName: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.white,
    marginBottom: 2,
  },
  dateTime: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  menuSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionLabel: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  menuIcon: {
    marginRight: theme.spacing.md,
    width: 24,
    textAlign: 'center',
  },
  menuItemText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.white,
    flex: 1,
  },
});

export default Sidebar;
