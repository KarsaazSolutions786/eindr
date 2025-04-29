import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeScreenMiddleSection from './HomeScreenMiddleSection';
import theme from '@theme/theme';
import LinearGradient from 'react-native-linear-gradient';

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
    <View style={styles.container}>
      {/* <LinearGradient
        colors={['#FFFFFF', '#B2A1FF']}
        style={StyleSheet.absoluteFill}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0 }}
      /> */}
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={styles.middleContainer}>
          <HomeScreenMiddleSection onOrbPress={handleOrbPress} />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16182A',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.20)',
  },
  safeArea: {
    flex: 1,
  },
  middleContainer: {
    flex: 1,
    paddingBottom: 70, // Add space for the bottom navigation bar
  },
});

export default HomeScreen;
