import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import GradientBorder from '@components/common/GradientBorder';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type OnboardingSecondScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OnboardingSecond'
>;
const OnboardingSecondScreen = () => {
  const navigation = useNavigation<OnboardingSecondScreenNavigationProp>();

  const isIOS = Platform.OS === 'ios';

  const buttonContainerStyle = {
    marginVertical: 10,
    shadowColor: '#FF7D73',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.38,
    shadowRadius: 4,
    width: isIOS ? 180 : 182,
  };

  const handleContinue = () => {
    navigation.navigate('OnboardingThird');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Eindr</Text>
          <Text style={styles.subtitle}>
            Your AI-powered to-do list that helps you complete tasks and manage reminders
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <GradientBorder
            colors={['rgba(178, 161, 255, 0.5)', 'rgba(255, 255, 255, 0.5)']}
            borderRadius={8}
            padding={1}
            angle={0}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}>
            <View style={styles.inputWrapper}>
              <Icon name="robot" size={20} color="#7E7E8F" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value="Ask AI to manage your tasks..."
                editable={false}
                placeholderTextColor="#7E7E8F"
              />
            </View>
          </GradientBorder>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Icon name="format-list-bulleted" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Create multiple tasks</Text>
              <Text style={styles.featureDescription}>
                "Call mother at 7, then grab a cup of coffee from starbucks"
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Icon name="card-bulleted-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Maintain Ledger</Text>
              <Text style={styles.featureDescription}>
                "Remind me to take back my money from Ahmed - 17/02/2025"
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Icon name="note-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Note keeping</Text>
              <Text style={styles.featureDescription}>
                "I have completed my tasks and submitted them on time"
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={[styles.buttonWrapper, buttonContainerStyle]}>
          <GradientBorder
            colors={['rgba(178, 161, 255, 0.5)', 'rgba(255, 255, 255, 0.5)']}
            borderRadius={8}
            padding={1}
            angle={0}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}>
            <TouchableOpacity style={[styles.button, styles.buttonShadow]} onPress={handleContinue}>
              <Text style={styles.buttonText}>Continue</Text>
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
  },
  scrollContent: {
    padding: 24,
    paddingTop: 160,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#B2B2B2',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    marginVertical: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(48, 48, 78, 1)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#7E7E8F',
    fontSize: 16,
  },
  featuresContainer: {
    marginTop: 16,
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(48, 48, 78, 1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#B2B2B2',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    // paddingBottom: 40,
  },
  buttonWrapper: {
    marginVertical: 10,
    alignSelf: 'center',
    width: '100%',
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
  buttonShadow: {
    shadowColor: '#FF7D73',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.38,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default OnboardingSecondScreen;
