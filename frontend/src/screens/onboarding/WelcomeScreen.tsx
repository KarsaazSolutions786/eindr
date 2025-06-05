import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import GradientBorder from '@components/common/GradientBorder';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const WelcomeScreen = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate('OnboardingSecond');
  };

  const buttonContainerStyle = {
    marginVertical: 10,
    shadowColor: '#FF7D73',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.38,
    shadowRadius: 4,
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/Logo/indr.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to Eindr</Text>
          <Text style={styles.description}>
            Your AI-powered to-do list that helps you complete tasks and manage reminders
          </Text>
        </View>

        <View style={[styles.buttonWrapper, buttonContainerStyle]}>
          <GradientBorder
            colors={['rgba(178, 161, 255, 0.5)', 'rgba(255, 255, 255, 0.5)']}
            borderRadius={8}
            padding={1}
            angle={0}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}>
            <TouchableOpacity
              style={[styles.button, styles.buttonShadow]}
              onPress={handleGetStarted}>
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </GradientBorder>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#282958',
  },
  logo: {
    width: 60,
    height: 60,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 34,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 12,
    color: '#B4B4B4',
    lineHeight: 24,
    width: 260,
    textAlign: 'center',
  },
  button: {
    backgroundColor: 'rgba(48, 48, 78, 1)',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: 180,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonWrapper: {
    marginVertical: 10,
    alignSelf: 'center',
  },
  buttonShadow: {
    shadowColor: '#FF7D73',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.38,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default WelcomeScreen;
