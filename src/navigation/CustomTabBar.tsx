import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Using MaterialCommunityIcons for more options
import { AppTabParamList } from './AppNavigator'; // Import the ParamList
import theme from '@theme/theme';

// Define the structure for the popup menu items
interface PopupItem {
  label: string;
  iconName: string;
  targetRoute: keyof AppTabParamList; // Use keys from the actual ParamList
}

// Define the items for the popup
const popupItems: PopupItem[] = [
  { label: 'Notes', iconName: 'note-text-outline', targetRoute: 'Notes' },
  { label: 'Friends', iconName: 'account-group-outline', targetRoute: 'Friends' },
  { label: 'Settings', iconName: 'cog-outline', targetRoute: 'Settings' },
  // Add other items here if needed
];

// Helper to determine if a route belongs to the 'More' category
const isMoreRoute = (routeName: string) => {
  return popupItems.some(item => item.targetRoute === routeName);
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const [isPopupVisible, setPopupVisible] = useState(false);

  // Find the active route name
  const focusedRouteName = state.routes[state.index].name;

  // Determine if the 'More' section is currently active
  const isMoreSectionActive = isMoreRoute(focusedRouteName);

  const onMorePress = () => {
    setPopupVisible(!isPopupVisible);
  };

  const onPopupItemPress = (targetRoute: string) => {
    navigation.navigate(targetRoute);
    setPopupVisible(false);
  };

  return (
    <View style={styles.outerContainer}>
        {/* Optional: Add a subtle glow effect using shadow or a blurred view underneath */}
        <View style={styles.tabBarContainer}>
          {/* Hardcoded Tab Items for Home, Reminders, More */}
          
          {/* Home Button */}
          <TabButton
            routeName="Home"
            iconName="home-variant-outline"
            isFocused={focusedRouteName === 'Home'}
            onPress={() => navigation.navigate('Home')}
            label="Home"
          />

          {/* Reminders Button */}
          <TabButton
            routeName="Reminders"
            iconName="calendar-check-outline" // Using calendar-check
            isFocused={focusedRouteName === 'Reminders'}
            onPress={() => navigation.navigate('Reminders')}
            label="Reminders" // Label for focused state
          />

          {/* More Button */}
          <TabButton
            routeName="More" // This is a logical route name for the button
            iconName="dots-grid"
            isFocused={isMoreSectionActive} // Focused if any popup route is active
            onPress={onMorePress}
            label="More" // Label for focused state
          />
        </View>

        {/* Popup Modal for More */}
        <Modal
          transparent={true}
          visible={isPopupVisible}
          animationType="fade"
          onRequestClose={() => setPopupVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setPopupVisible(false)}>
            <View style={styles.popupOverlay} >
                {/* Position the popup content above the More button */}
                {/* Calculation might need adjustment based on actual layout */}
                <View style={styles.popupContent}>
                  {popupItems.map((item) => (
                    <TouchableOpacity
                      key={item.targetRoute}
                      style={styles.popupItem}
                      onPress={() => onPopupItemPress(item.targetRoute)}
                    >
                      <Icon name={item.iconName} size={22} color={theme.colors.text.primary} />
                      <Text style={styles.popupItemText}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
        </Modal>
    </View>
  );
};

// Reusable Tab Button Component within the file
interface TabButtonProps {
    routeName: string;
    iconName: string;
    isFocused: boolean;
    onPress: () => void;
    label?: string; // Label is optional, shown when focused
}

const TabButton: React.FC<TabButtonProps> = ({ routeName, iconName, isFocused, onPress, label }) => {
    return (
        <TouchableOpacity
            style={styles.tabButton}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, isFocused && styles.iconContainerFocused]}>
                <Icon 
                    name={iconName} 
                    size={26} 
                    color={isFocused ? theme.colors.text.primary : theme.colors.text.secondary}
                />
                {isFocused && label && (
                    <Text style={styles.labelText}>{label}</Text>
                )}
            </View>
        </TouchableOpacity>
    );
};


const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // Add padding or margin if needed to lift the bar slightly
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.lg : theme.spacing.md, 
    paddingHorizontal: theme.spacing.md,
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary, // Dark background
    borderRadius: theme.borderRadius.full, // Highly rounded corners for the bar
    paddingVertical: theme.spacing.sm, // Vertical padding for the bar
    paddingHorizontal: theme.spacing.sm,
    // Shadow/Glow effect (adjust as needed)
    shadowColor: theme.colors.accentStroke, 
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10, // For Android shadow
    borderWidth: 1,
    borderColor: theme.colors.accentStroke + '30', // Subtle border with opacity
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    minWidth: 50, // Minimum width for touch area
  },
  iconContainerFocused: {
    backgroundColor: theme.colors.background.tertiary, // Pill background color
    paddingHorizontal: theme.spacing.md,
  },
  labelText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    marginLeft: theme.spacing.xs,
  },
  // Popup Styles
  popupOverlay: {
      flex: 1,
      // Semi-transparent background if needed, but positioning is key
      // backgroundColor: 'rgba(0, 0, 0, 0.1)', 
  },
  popupContent: {
    position: 'absolute',
    bottom: 100, // Adjust this value based on tab bar height + desired spacing
    right: theme.spacing.md, // Position near the More button
    backgroundColor: theme.colors.background.tertiary, // Popup background
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    ...theme.shadows.lg,
    elevation: 15, // Ensure popup is above bar
    width: 150, // Adjust width as needed
  },
  popupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  popupItemText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
    marginLeft: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.medium,
  },
});

export default CustomTabBar; 