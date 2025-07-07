import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import GradientBorder from '@components/common/GradientBorder';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';

type OnboardingFifthScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OnboardingFifth'
>;

const plans = [
  {
    key: 'starter',
    name: 'Starter Plan',
    description: 'Basic reminders and notes for individuals.',
  },
  {
    key: 'pro',
    name: 'Pro Plan',
    description: 'Advanced reminders, notes, and sharing for families.',
  },
  {
    key: 'elite',
    name: 'Elite Plan',
    description: 'All Pro features plus health tracking and premium support.',
  },
];

const OnboardingFifthScreen = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const isIOS = Platform.OS === 'ios';
  const navigation = useNavigation<OnboardingFifthScreenNavigationProp>();

  const buttonContainerStyle = {
    marginVertical: 10,
    shadowColor: '#FF7D73',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.38,
    shadowRadius: 4,
    width: isIOS ? 180 : 182,
  };

  const getButtonText = () => {
    return selectedPlan ? 'Continue' : 'View Plans';
  };

  const handleButtonPress = () => {
    if (selectedPlan) {
      navigation.navigate('Plans');
    } else {
      navigation.navigate('Plans');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Top GIF Animation */}
        <View style={styles.gifContainer}>
          <Image
            source={require('../../assets/images/gif.gif')}
            style={styles.gif}
            resizeMode="contain"
          />
        </View>

        {/* Quote */}
        <Text style={styles.quote}>"Choose the plan that fits you best!"</Text>

        {/* Plan Options */}
        <View style={styles.plansContainer}>
          {plans.map(plan => {
            const selected = selectedPlan === plan.key;
            return (
              <GradientBorder
                key={plan.key}
                colors={
                  selected
                    ? ['rgba(178, 161, 255, 1)', 'rgba(255, 255, 255, 1)']
                    : ['#23233A', '#23233A']
                }
                borderRadius={16}
                padding={1}
                angle={0}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.planGradient}>
                <TouchableOpacity
                  style={[styles.planRow, selected && styles.planRowSelected]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedPlan(plan.key)}>
                  <View style={styles.planTextContainer}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDescription}>{plan.description}</Text>
                  </View>
                  {selected ? (
                    <GradientBorder
                      colors={['rgba(127, 181, 233, 1)', 'rgba(91, 139, 185, 1)']}
                      borderRadius={16}
                      padding={1.5}
                      angle={0}
                      start={{ x: 1, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={styles.checkboxGradient}>
                      <View style={styles.checkboxSelected}>
                        <MaterialCommunityIcons name="check" size={18} color="#fff" />
                      </View>
                    </GradientBorder>
                  ) : (
                    <View style={styles.checkboxUnselected}>
                      <MaterialCommunityIcons
                        name="checkbox-blank-circle-outline"
                        size={25}
                        color="#3B82F6"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </GradientBorder>
            );
          })}
        </View>

        {/* View Plans Button */}
        <View style={[styles.buttonWrapper, buttonContainerStyle]}>
          <GradientBorder
            colors={['rgba(178, 161, 255, 0.5)', 'rgba(255, 255, 255, 0.5)']}
            borderRadius={8}
            padding={1}
            angle={0}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ alignSelf: 'center' }}>
            <TouchableOpacity
              style={[styles.button, styles.buttonShadow]}
              onPress={handleButtonPress}>
              <Text style={styles.buttonText}>{getButtonText()}</Text>
            </TouchableOpacity>
          </GradientBorder>
        </View>
      </View>
    </View>
  );
};

const gifSize = 700;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -180,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
    // paddingTop: -20,
  },
  gifContainer: {
    width: gifSize,
    height: gifSize,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -194,
  },
  gif: {
    width: '100%',
    height: '100%',
  },
  quote: {
    color: '#B2B2B2',
    fontSize: 15,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 30,
  },
  plansContainer: {
    width: '100%',
    marginBottom: 30,
  },
  planGradient: {
    marginBottom: 18,
    borderRadius: 16,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23233A',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    justifyContent: 'space-between',
    minHeight: 70,
  },
  planRowSelected: {
    // Optionally add a subtle shadow or glow for selected
    shadowColor: 'rgba(127, 181, 233, 1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  planTextContainer: {
    flex: 1,
  },
  planName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  planDescription: {
    color: '#B2B2B2',
    fontSize: 13,
    fontStyle: 'italic',
  },
  checkboxUnselected: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1.5,
    // borderColor: '#3B82F6', // blue
    backgroundColor: 'transparent',
  },
  checkboxGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(127, 181, 233, 1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonWrapper: {
    marginVertical: 10,
    alignSelf: 'center',
  },
  button: {
    backgroundColor: 'rgba(48, 48, 78, 1)',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
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

export default OnboardingFifthScreen;
