import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '@theme/theme';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  text: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.xl,
  },
});

export default HomeScreen; 