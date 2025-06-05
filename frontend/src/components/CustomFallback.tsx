import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

interface CustomFallbackProps {
  error?: Error;
  resetError: () => void;
}

const CustomFallback: React.FC<CustomFallbackProps> = ({ error, resetError }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Oops! Something went wrong.</Text>
      <Text style={styles.message}>{error?.message || 'An unexpected error occurred.'}</Text>
      <Button title="Try Again" onPress={resetError} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#d32f2f',
  },
  message: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default CustomFallback;
