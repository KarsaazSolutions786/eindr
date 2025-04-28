import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeScreenMiddleSection from './HomeScreenMiddleSection';
import theme from '@theme/theme';

// Define props type for HomeScreen using the RootStackParamList
type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const [listening, setListening] = useState(false);

  const handleOrbPress = () => {
    setListening(true);
    // Simulate listening and then stop after 3 seconds
    setTimeout(() => {
      setListening(false);
    }, 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.middleContainer}>
        <HomeScreenMiddleSection onOrbPress={handleOrbPress} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'transparent',
    backgroundColor: theme.colors.background.primary,
  },
  middleContainer: {
    flex: 1,
    paddingBottom: 70, // Add space for the bottom navigation bar
  },
});

export default HomeScreen;
