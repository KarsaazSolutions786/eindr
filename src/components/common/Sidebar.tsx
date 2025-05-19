import React, { useEffect, useRef, useState } from 'react';
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
  ScrollView,
  TextStyle,
  Platform,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import theme from '@theme/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import GradientBorder from '../../components/common/GradientBorder';
import BlurViewFix from './BlurViewFix';
import Svg, {
  Path,
  LinearGradient as SvgLinearGradient,
  Stop,
  Defs,
  ClipPath,
  ForeignObject,
} from 'react-native-svg';

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
  userImage?: string;
  onLogout?: () => void;
}

const { width } = Dimensions.get('window');

// Gradient Text component
const GradientText = ({
  text,
  colors,
  style,
}: {
  text: string;
  colors: string[];
  style?: TextStyle | TextStyle[];
}) => {
  return (
    <MaskedView maskElement={<Text style={style}>{text}</Text>}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <Text style={[style, { opacity: 0 }]}>{text}</Text>
      </LinearGradient>
    </MaskedView>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  isVisible,
  onClose,
  userName = 'Ahmad Ali',
  userEmail = 'kamran@gmail.com',
  userImage,
  onLogout,
}) => {
  // Animation value for the sidebar sliding
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Collapsible section states
  const [chatsExpanded, setChatsExpanded] = useState(true);
  const [settingsExpanded, setSettingsExpanded] = useState(true);
  const [todayExpanded, setTodayExpanded] = useState(true);
  const [oneWeekExpanded, setOneWeekExpanded] = useState(false);
  const [oneMonthExpanded, setOneMonthExpanded] = useState(false);
  const [reminderSettingsExpanded, setReminderSettingsExpanded] = useState(true);
  const [supportExpanded, setSupportExpanded] = useState(false);

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

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    onClose();
  };

  // New function to handle navigation - fixed with proper typing
  const navigateToScreen = (screenName: keyof RootStackParamList) => {
    onClose();
    // Fix the typing by passing the screen name directly
    if (screenName === 'NotificationSettingsScreen') {
      navigation.navigate('NotificationSettingsScreen');
    } else if (screenName === 'NotificationsScreen') {
      navigation.navigate('NotificationsScreen');
    } else if (screenName === 'Settings') {
      navigation.navigate('Settings');
    } else if (screenName === 'LanguageSettingsScreen') {
      navigation.navigate('LanguageSettingsScreen');
    } else if (screenName === 'ChangePasswordScreen') {
      navigation.navigate('ChangePasswordScreen');
    } else if (screenName === 'SupportAndAboutScreen') {
      navigation.navigate('SupportAndAboutScreen');
    } else if (screenName === 'PrivacyPolicyScreen') {
      navigation.navigate('PrivacyPolicyScreen');
    } else if (screenName === 'ProfileSettingsScreen') {
      navigation.navigate('ProfileSettingsScreen');
    }
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      statusBarTranslucent={true}>
      <View style={styles.modalContainer}>
        <Animated.View
          style={[
            styles.sidebar,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}>
          {/* Background with SVG curved shape */}
          <View style={[StyleSheet.absoluteFill, styles.sidebarBackground]}>
            {/* First add BlurViewFix with a mask */}
            <MaskedView
              style={{ position: 'absolute', top: 0, left: -20, right: 0, bottom: 0 }}
              maskElement={
                <Svg width="100%" height="100%" viewBox="0 0 251 824">
                  <Path
                    d="M210.083 -2H-2V824H210.083C282.376 528.839 240.205 150.349 210.083 -2Z"
                    fill="white"
                  />
                </Svg>
              }>
              <BlurViewFix
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                blurType="dark"
                blurAmount={6}
                reducedTransparencyFallbackColor="rgba(30, 32, 58, 0.6)"
              />
            </MaskedView>

            {/* Then the SVG with the gradients */}
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 251 824"
              fill="none"
              preserveAspectRatio="xMidYMid slice"
              style={{ position: 'absolute', left: -20 }}>
              <Defs>
                <SvgLinearGradient
                  id="paint0_linear"
                  x1="186.241"
                  y1="-2"
                  x2="124.875"
                  y2="824.065"
                  gradientUnits="userSpaceOnUse">
                  <Stop stopColor="rgba(0, 0, 0, 0.3)" offset="0.0056" />
                  <Stop offset="0.9889" stopColor="rgba(61, 61, 61, 0.3)" />
                </SvgLinearGradient>
                <SvgLinearGradient
                  id="paint1_linear"
                  x1="166.5"
                  y1="15.7236"
                  x2="260.72"
                  y2="753.403"
                  gradientUnits="userSpaceOnUse">
                  {/* <Stop stopColor="black" stopOpacity="0" /> */}
                  {/* <Stop offset="1" stopColor="white" stopOpacity="0.3" /> */}
                </SvgLinearGradient>
                <ClipPath id="sidebarClipper">
                  <Path d="M210.083 -2H-2V824H210.083C282.376 528.839 240.205 150.349 210.083 -2Z" />
                </ClipPath>
              </Defs>

              <Path
                d="M210.083 -2H-2V824H210.083C282.376 528.839 240.205 150.349 210.083 -2Z"
                fill="url(#paint0_linear)"
                fillOpacity="0.10"
                // stroke="url(#paint1_linear)"
                clipPath="url(#sidebarClipper)"
              />
            </Svg>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.sidebarContent}>
              {/* Close button */}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <FontAwesome name="times" size={24} color={theme.colors.white} />
              </TouchableOpacity>

              {/* User profile section */}
              <TouchableOpacity
                onPress={() => navigation.navigate('ProfileSettingsScreen')}
                style={styles.profileSection}>
                {userImage ? (
                  <Image source={{ uri: userImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <FontAwesome name="user" size={24} color={theme.colors.white} />
                  </View>
                )}

                <View style={styles.profileTextContainer}>
                  <GradientText
                    text={userName}
                    colors={['#B2A1FF', '#C07DDF']}
                    style={styles.userName}
                  />
                  <Text style={styles.userEmail}>{userEmail}</Text>
                </View>
              </TouchableOpacity>

              {/* Chats Section */}
              <View style={styles.sectionContainer}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => setChatsExpanded(!chatsExpanded)}>
                  <GradientText
                    text="Chats"
                    colors={['#B2A1FF', '#C07DDF']}
                    style={styles.sectionTitle}
                  />
                  <MaterialIcons
                    name={chatsExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
                    size={24}
                    color={theme.colors.white}
                    style={{ position: 'absolute', left: 200 }}
                  />
                </TouchableOpacity>

                {chatsExpanded && (
                  <View style={styles.sectionContent}>
                    {/* Today subsection */}
                    <TouchableOpacity
                      style={styles.subsectionHeader}
                      onPress={() => setTodayExpanded(!todayExpanded)}>
                      <MaterialIcons
                        name={todayExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
                        size={20}
                        color={theme.colors.white}
                      />
                      <Text style={styles.subsectionTitle}>Today</Text>
                    </TouchableOpacity>

                    {todayExpanded && (
                      <View style={styles.subsectionContent}>
                        <TouchableOpacity style={styles.menuItem}>
                          <Text style={styles.menuItemText}>Dad's Appointment</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* 1 Week ago subsection */}
                    <TouchableOpacity
                      style={styles.subsectionHeader}
                      onPress={() => setOneWeekExpanded(!oneWeekExpanded)}>
                      <MaterialIcons
                        name={oneWeekExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
                        size={20}
                        color={theme.colors.white}
                      />
                      <Text style={styles.subsectionTitle}>1 Week ago</Text>
                    </TouchableOpacity>

                    {/* 1 Month ago subsection */}
                    <TouchableOpacity
                      style={styles.subsectionHeader}
                      onPress={() => setOneMonthExpanded(!oneMonthExpanded)}>
                      <MaterialIcons
                        name={oneMonthExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
                        size={20}
                        color={theme.colors.white}
                      />
                      <Text style={styles.subsectionTitle}>1 Month ago</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Settings Section */}
              <View style={styles.sectionContainer}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => setSettingsExpanded(!settingsExpanded)}>
                  <GradientText
                    text="Settings"
                    colors={['#B2A1FF', '#C07DDF']}
                    style={styles.sectionTitle}
                  />
                  <MaterialIcons
                    name={settingsExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
                    size={24}
                    color={theme.colors.white}
                    style={{ position: 'absolute', left: 200 }}
                  />
                </TouchableOpacity>

                {settingsExpanded && (
                  <View style={styles.sectionContent}>
                    {/* Reminder Settings subsection */}
                    <TouchableOpacity
                      style={styles.subsectionHeader}
                      onPress={() => setReminderSettingsExpanded(!reminderSettingsExpanded)}>
                      <MaterialIcons
                        name={
                          reminderSettingsExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'
                        }
                        size={20}
                        color={theme.colors.white}
                      />
                      <Text style={styles.subsectionTitle}>Reminder Settings</Text>
                    </TouchableOpacity>

                    {reminderSettingsExpanded && (
                      <View style={styles.subsectionContent}>
                        <TouchableOpacity
                          style={styles.menuItem}
                          onPress={() => navigateToScreen('NotificationSettingsScreen')}>
                          <GradientText
                            text="Notification Sound"
                            colors={['#FFFFFF', '#CCD2FF']}
                            style={styles.menuItemText}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.menuItem}
                          onPress={() => navigateToScreen('LanguageSettingsScreen')}>
                          <GradientText
                            text="Language Settings"
                            colors={['#FFFFFF', '#CCD2FF']}
                            style={styles.menuItemText}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.menuItem}
                          onPress={() => navigateToScreen('ChangePasswordScreen')}>
                          <GradientText
                            text="Change Password"
                            colors={['#FFFFFF', '#CCD2FF']}
                            style={styles.menuItemText}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem}>
                          <GradientText
                            text="Account Management"
                            colors={['#FFFFFF', '#CCD2FF']}
                            style={styles.menuItemText}
                          />
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Support & Abouts subsection */}
                    <TouchableOpacity
                      style={styles.subsectionHeader}
                      onPress={() => setSupportExpanded(!supportExpanded)}>
                      <MaterialIcons
                        name={supportExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
                        size={20}
                        color={theme.colors.white}
                      />
                      <Text style={styles.subsectionTitle}>Support & Abouts</Text>
                    </TouchableOpacity>

                    {supportExpanded && (
                      <>
                        <View style={styles.subsectionContent}>
                          <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => navigateToScreen('SupportAndAboutScreen')}>
                            <Text style={styles.menuItemText}>About App</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.subsectionContent}>
                          <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => navigateToScreen('PrivacyPolicyScreen')}>
                            <Text style={styles.menuItemText}>Terms of policy</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                )}
              </View>

              {/* Logout Button */}
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <GradientText
                  text="Logout"
                  colors={['#B2A1FF', '#C07DDF']}
                  style={styles.logoutText}
                />
                <MaterialIcons
                  name="logout"
                  size={20}
                  color="#9E6CFF"
                  style={[
                    styles.logoutIcon,
                    { position: 'absolute', left: Platform.OS === 'ios' ? 200 : 100 },
                  ]}
                />
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dismissArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  sidebar: {
    width: width * 0.7,
    height: '100%',
    overflow: 'hidden',
  },
  sidebarBackground: {
    // No background color needed as SVG and BlurViewFix provide it
  },
  scrollView: {
    flex: 1,
  },
  sidebarContent: {
    flex: 1,
    padding: 16,
    paddingBottom: 40,
  },
  closeButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 16,
    marginTop: 56,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingLeft: 8,
    paddingRight: 8,
  },
  profileTextContainer: {
    flex: 1,
    marginRight: 20,
  },
  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  profileImagePlaceholder: {
    marginRight: 5,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(84, 84, 124, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.white,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: '400',
    color: theme.colors.white,
  },
  sectionContent: {
    paddingLeft: 8,
  },
  subsectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  subsectionTitle: {
    fontSize: 14,
    color: theme.colors.white,
    marginLeft: 8,
  },
  subsectionContent: {
    paddingLeft: 28,
  },
  menuItem: {
    paddingVertical: 8,
    paddingRight: 8,
  },
  menuItemText: {
    fontSize: 14,
    color: theme.colors.white,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  logoutText: {
    fontSize: 20,
    fontWeight: '400',
    color: '#9E6CFF',
  },
  logoutIcon: {
    marginLeft: 4,
  },
});

export default Sidebar;
