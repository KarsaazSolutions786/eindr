import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Modal, Pressable } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-community/blur';
import theme from '@theme/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import LinearGradient from 'react-native-linear-gradient';
import Menu from '../../assets/Icons/Menu';
import ReminderIcon from '../../assets/Icons/ReminderIcon';
import GradientBorder from '../../components/common/GradientBorder';
import BlurViewFix from './BlurViewFix';

const BottomBar: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Get current route name safely with fallback
  let currentScreen = 'Home';
  try {
    const route = useRoute();
    currentScreen = route.name;
    console.log('Current screen detected:', currentScreen);
  } catch (error) {
    console.log('Navigation context error:', error);
    // Handle the case when not in a navigation context
    console.log('Navigation context not available, using default route');
  }

  // Explicitly set flags for clearer conditionals
  const isHomeActive = currentScreen === 'Home';
  const isRemindersActive = currentScreen === 'Reminders';

  console.log('Is Home active?', isHomeActive);
  console.log('Is Reminders active?', isRemindersActive);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuOptionClick = (screen: keyof RootStackParamList) => {
    try {
      // Type-safe navigation approach
      switch (screen) {
        case 'Ledger':
          navigation.navigate('Ledger');
          break;
        case 'Notes':
          navigation.navigate('Notes');
          break;
        case 'Friends':
          navigation.navigate('FriendRequests');
          break;
        default:
          // Handle other screens if needed
          break;
      }
      setIsMenuOpen(false);
    } catch (e) {
      console.log('Navigation error:', e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Menu Modal */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsMenuOpen(false)}>
          <View style={styles.modalContainer}>
            <BlurViewFix
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="#292A38"></BlurViewFix>
            <View style={styles.menuContent}>
              <TouchableOpacity
                style={[styles.menuOption, currentScreen === 'Ledger' && styles.activeMenuOption]}
                onPress={() => handleMenuOptionClick('Ledger')}>
                <Text style={styles.menuText}>Ledger</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={[styles.menuOption, currentScreen === 'Notes' && styles.activeMenuOption]}
                onPress={() => handleMenuOptionClick('Notes')}>
                <Text style={styles.menuText}>Notes</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={[styles.menuOption, currentScreen === 'Friends' && styles.activeMenuOption]}
                onPress={() => handleMenuOptionClick('Friends')}>
                <Text style={styles.menuText}>Friends</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Main tabs container with its own background */}
      <View style={styles.mainBackground}>
        <View style={styles.blurBackground}>
          <BlurViewFix
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={15}
            reducedTransparencyFallbackColor="#292A38"></BlurViewFix>
        </View>

        <View style={styles.leftSide}>
          {/* Home Button */}
          {currentScreen === 'Home' ? (
            <TouchableOpacity
              style={styles.activeTabContainer}
              onPress={() => {
                try {
                  navigation.navigate('Home');
                } catch (e) {
                  console.log('Navigation error:', e);
                }
              }}>
              <GradientBorder
                colors={['rgba(157, 157, 255, 0.5)', 'rgba(39, 39, 54, 0.62)']}
                borderRadius={8}
                style={styles.activeTab}>
                <View style={styles.activeTabContent}>
                  <MaterialIcons
                    name="home"
                    size={24}
                    color={theme.colors.white}
                    style={styles.tabIcon}
                  />
                  <Text style={styles.tabLabel}>Home</Text>
                </View>
              </GradientBorder>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.iconTab}
              onPress={() => {
                try {
                  navigation.navigate('Home');
                } catch (e) {
                  console.log('Navigation error:', e);
                }
              }}>
              <MaterialIcons name="home" size={24} color={theme.colors.white} />
            </TouchableOpacity>
          )}

          {/* Reminder Button */}
          {currentScreen === 'Reminders' ? (
            <TouchableOpacity
              style={styles.activeTabContainer}
              onPress={() => {
                try {
                  navigation.navigate('Dashboard');
                } catch (e) {
                  console.log('Navigation error:', e);
                }
              }}>
              <GradientBorder
                colors={['rgba(157, 157, 255, 0.5)', 'rgba(39, 39, 54, 0.62)']}
                borderRadius={8}
                style={styles.activeTab}>
                <View style={styles.activeTabContent}>
                  <ReminderIcon width={24} height={24} color={theme.colors.white} />
                  <Text style={styles.tabLabel}>Reminder</Text>
                </View>
              </GradientBorder>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.iconTab}
              onPress={() => {
                try {
                  navigation.navigate('Dashboard');
                } catch (e) {
                  console.log('Navigation error:', e);
                }
              }}>
              <ReminderIcon width={24} height={24} color={theme.colors.white} />
            </TouchableOpacity>
          )}

          {/* Menu Button */}
          <TouchableOpacity
            style={[styles.iconTab, isMenuOpen && styles.activeIconTab]}
            onPress={handleMenuClick}>
            <Menu width={37} height={26} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Keyboard button with blur effect */}
      <TouchableOpacity
        style={styles.keyboardButton}
        onPress={() => {
          try {
            navigation.navigate('Keyboard');
          } catch (e) {
            console.log('Navigation error:', e);
          }
        }}>
        <BlurViewFix
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={15}
          reducedTransparencyFallbackColor="#ffffff"></BlurViewFix>
        <MaterialIcons name="keyboard" size={31} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 90,
    paddingBottom: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainBackground: {
    height: 75,
    borderRadius: 50,
    overflow: 'hidden',
    marginRight: 29,
    width: 240,
    // backgroundColor: '#FFFFFF1A',
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 1,
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  activeTabContainer: {
    width: 100,
    height: 50,
    borderRadius: 25,
    position: 'relative',
  },
  activeTab: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeTabContent: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  iconTab: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 45,
    height: 45,
    borderRadius: 22,
    marginHorizontal: 5,
  },
  activeIconTab: {
    // // backgroundColor: 'rgba(157, 157, 255, 0.3)',
    // // iOS shadow
    // shadowColor: '#ffffff',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.3,
    // shadowRadius: 6,
    // // Android shadow
    // elevation: 8,
  },
  tabIcon: {
    marginRight: 8,
  },
  tabLabel: {
    color: theme.colors.white,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
  },
  keyboardButton: {
    width: 75,
    height: 75,
    borderRadius: 37,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 120,
    right: '50%',
    marginRight: -65,
    width: 160,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuContent: {
    paddingVertical: 10,
  },
  menuOption: {
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 20,
    // alignItems: 'center',
  },
  activeMenuOption: {
    // backgroundColor: 'rgba(157, 157, 255, 0.2)',
  },
  menuText: {
    color: theme.colors.white,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 15,
  },
});

export default BottomBar;
