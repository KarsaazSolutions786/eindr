import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-community/blur';
import theme from '@theme/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';

type TabItem = {
  key: keyof RootStackParamList;
  icon: string;
  label?: string;
  isMain?: boolean;
};

const TABS: TabItem[] = [
  { key: 'ProfileScreen', icon: 'calendar-today' },
  { key: 'FriendRequests', icon: 'crop-free' },
  { key: 'Notes', icon: 'edit', label: 'Notes', isMain: true },
];

const BottomBar: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const renderTab = (tab: TabItem) => {
    const isMain = tab.isMain;

    return (
      <TouchableOpacity
        key={tab.key}
        style={[styles.tab, isMain && styles.mainTab]}
        onPress={() => navigation.navigate(tab.key)}>
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
          blurType="light"
          blurAmount={5}
          reducedTransparencyFallbackColor="rgba(20, 20, 35, 0.9)"
        />

        <View style={styles.leftSide}>{TABS.map(tab => renderTab(tab))}</View>
      </View>

      {/* Keyboard button with blur effect */}
      <TouchableOpacity
        style={styles.keyboardButton}
        onPress={() => navigation.navigate('Keyboard')}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="rgba(20, 20, 35, 0.9)"
        />
        <MaterialIcons name="keyboard" size={24} color="#ffffff" />
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
    height: 80,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  mainBackground: {
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    marginRight: 59,
    width: 250,
    backgroundColor: 'transparent',
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 15,
  },
  tab: {
    justifyContent: 'center',
    width: 34,
    height: 44,
    borderRadius: 22,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  mainTab: {
    backgroundColor: 'rgba(50, 52, 70, 0.95)',
    flexDirection: 'row',
    borderRadius: 25,
    width: 120,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
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
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BottomBar;
