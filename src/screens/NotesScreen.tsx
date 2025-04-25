import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const NotesScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.text}>Notes Screen</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1B1D2C',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1B1D2C',
    paddingBottom: 90,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});

export default NotesScreen;
