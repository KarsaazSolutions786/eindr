import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { useDispatch } from 'react-redux';
import GradientBorder from '@components/common/GradientBorder';

type OnboardingThirdScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OnboardingThird'
>;

const OnboardingThirdScreen = () => {
  const navigation = useNavigation<OnboardingThirdScreenNavigationProp>();
  const isIOS = Platform.OS === 'ios';

  const buttonContainerStyle = {
    marginVertical: 10,
    shadowColor: '#FF7D73',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.38,
    shadowRadius: 4,
    width: isIOS ? 180 : 182,
  };

  const handleNext = () => {
    // Navigate to the fourth onboarding screen
    navigation.navigate('OnboardingFourth');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.videoContainer}>
          <Image
            source={require('../../assets/Logo/indr.png')}
            style={styles.fallbackImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>AI-Voice based smart reminder app!</Text>
          <Text style={styles.description}>
            "Ensure your loved ones never miss a important things. Stay on top of health with timely
            reminders!"
          </Text>
        </View>

        <View style={styles.paginationContainer}>
          <View style={[styles.paginationDot, styles.activeDot]} />
          <View style={[styles.paginationDot, styles.inactiveDot]} />
        </View>

        <View style={[styles.buttonWrapper, buttonContainerStyle]}>
          <GradientBorder
            colors={['rgba(178, 161, 255, 0.5)', 'rgba(255, 255, 255, 0.5)']}
            borderRadius={8}
            padding={1}
            angle={0}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}>
            <TouchableOpacity style={[styles.button, styles.buttonShadow]} onPress={handleNext}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </GradientBorder>
        </View>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');
const videoSize = width * 0.65;

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
    paddingTop: 40,
  },
  videoContainer: {
    width: videoSize,
    height: videoSize,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: videoSize / 2,
    overflow: 'hidden',
    // backgroundColor: 'rgba(96, 57, 203, 0.3)',
  },
  fallbackImage: {
    width: videoSize * 0.5,
    height: videoSize * 0.5,
    tintColor: 'rgba(255, 255, 255, 0.9)',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#B2B2B2',
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  paginationContainer: {
    flexDirection: 'row',
    marginBottom: 30,
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

export default OnboardingThirdScreen;
