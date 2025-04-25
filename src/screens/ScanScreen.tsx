import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ScanScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Scan Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1B1D2C',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});

export default ScanScreen;
