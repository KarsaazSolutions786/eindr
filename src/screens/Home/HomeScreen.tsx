import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@navigation/AuthNavigator';
import { Header } from '@components/common';

// Define props type for HomeScreen using the RootStackParamList
type Props = NativeStackScreenProps<AuthStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {

  return (
    <View>
      {/* <Header
        isLoggedIn={true}
        onMenuPress={handleMenuPress}
        onProfilePress={handleProfilePress}
        profileImage={userProfile.image}
      /> */}
    </View>
  );
};


export default HomeScreen;
