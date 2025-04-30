import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface BackgroundScreenProps {
  children?: React.ReactNode;
}

const BackgroundScreen: React.FC<BackgroundScreenProps> = ({ children }) => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#16182A" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Main background with gradient */}
          <LinearGradient colors={['#2e2e49', '#121322']} style={styles.backgroundContainer} />

          {/* Spotlight effect using another gradient */}
          <LinearGradient
            colors={['rgba(166, 161, 246, 0.45)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.spotlight}
          />

          {/* Content container */}
          <View style={styles.content}>{children}</View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  spotlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: 4,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
});

export default BackgroundScreen;
