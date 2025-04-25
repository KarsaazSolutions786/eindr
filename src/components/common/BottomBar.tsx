import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-community/blur';
import theme from '@theme/theme';

type TabItem = {
  key: string;
  icon: string;
  label?: string;
  isMain?: boolean;
};

interface BottomBarProps {
  activeTab: string;
  onTabPress: (tabKey: string) => void;
}

const TABS: TabItem[] = [
  { key: 'calendar', icon: 'calendar-today' },
  { key: 'scan', icon: 'crop-free' },
  { key: 'notes', icon: 'edit', label: 'Notes', isMain: true },
];

const BottomBar: React.FC<BottomBarProps> = ({ activeTab, onTabPress }) => {
  const renderTab = (tab: TabItem) => {
    const isActive = activeTab === tab.key;
    const isMain = tab.isMain;

    return (
      <TouchableOpacity
        key={tab.key}
        style={[
          styles.tab,
          isMain && styles.mainTab,
          isActive && (isMain ? styles.activeMainTab : styles.activeTab),
        ]}
        onPress={() => onTabPress(tab.key)}>
        <MaterialIcons
          name={tab.icon}
          size={24}
          color={theme.colors.white}
          style={isMain && styles.mainTabIcon}
        />
        {tab.label && <Text style={styles.mainTabLabel}>{tab.label}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Main tabs container with its own background */}
      <View style={styles.mainBackground}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="dark"
          blurAmount={10}
          reducedTransparencyFallbackColor="rgba(20, 20, 35, 0.9)"
        />

        <View style={styles.leftSide}>{TABS.map(tab => renderTab(tab))}</View>
      </View>

      {/* Keyboard button with its own background */}
      <TouchableOpacity style={styles.keyboardButton} onPress={() => onTabPress('keyboard')}>
        <MaterialIcons name="keyboard" size={24} color="#333" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    height: 80,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainBackground: {
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'rgba(25, 25, 40, 0.75)',
    marginRight: 20,
    width: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 20,
  },
  tab: {
    justifyContent: 'center',
    width: 34,
    height: 44,
    borderRadius: 22,
    marginHorizontal: 10,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  mainTab: {
    backgroundColor: 'rgba(50, 52, 70, 0.95)',
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderRadius: 25,
    width: 120,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  activeMainTab: {
    backgroundColor: 'rgba(60, 62, 80, 0.95)',
  },
  mainTabIcon: {
    marginRight: 8,
  },
  mainTabLabel: {
    color: theme.colors.white,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
  },
  keyboardButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default BottomBar;
