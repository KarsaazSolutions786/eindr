import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '@theme/theme';

const LedgerScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ledger</Text>
      <Text style={styles.subTitle}>Your financial activities will appear here</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default LedgerScreen;
