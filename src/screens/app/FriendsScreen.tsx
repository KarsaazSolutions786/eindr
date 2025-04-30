import theme from '@theme/theme';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FriendsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Friends Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.xl,
  },
});

export default FriendsScreen;
