import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import FriendsScreen from './FriendsScreen';

const FriendsMain: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#161329" />
      <FriendsScreen />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161329',
  },
});

export default FriendsMain;
