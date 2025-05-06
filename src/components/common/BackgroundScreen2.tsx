import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, ImageBackground } from 'react-native';

interface BackgroundScreenProps {
  children?: React.ReactNode;
}

const BackgroundScreen2: React.FC<BackgroundScreenProps> = ({ children }) => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#16182A" />
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground
          source={require('../../assets/images/background2.png')}
          style={styles.backgroundImage}
          resizeMode="cover">
          <View style={styles.content}>{children}</View>
        </ImageBackground>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#16182A',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 4,
    backgroundColor: 'transparent',
  },
});

export default BackgroundScreen2;
