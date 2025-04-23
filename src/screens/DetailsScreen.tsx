import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/RootNavigator';

// Define props type for DetailsScreen
type DetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'Details'>;

const DetailsScreen: React.FC<DetailsScreenProps> = ({ route, navigation }) => {
  // Get the params
  const { itemId, otherParam } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Details Screen</Text>
      <Text style={styles.text}>itemId: {itemId}</Text>
      <Text style={styles.text}>otherParam: {otherParam}</Text>
      <Button title="Go back" onPress={() => navigation.goBack()} />
      <Button
        title="Go back to home"
        onPress={() => navigation.navigate('Home')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default DetailsScreen; 