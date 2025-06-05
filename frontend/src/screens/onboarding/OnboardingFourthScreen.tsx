import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/RootNavigator';
import { useDispatch } from 'react-redux';
import { authSuccess } from '@store/slices/authSlice';
import GradientBorder from '@components/common/GradientBorder';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type OnboardingFourthScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'OnboardingFourth'
>;

const OnboardingFourthScreen = () => {
  const navigation = useNavigation<OnboardingFourthScreenNavigationProp>();
  const dispatch = useDispatch();
  const isIOS = Platform.OS === 'ios';

  // Animation values
  const userChatOpacity = useRef(new Animated.Value(0)).current;
  const userChatTranslateX = useRef(new Animated.Value(-50)).current;
  const botChatOpacity = useRef(new Animated.Value(0)).current;
  const botChatTranslateX = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animate user chat bubble after component mounts
    Animated.sequence([
      Animated.parallel([
        Animated.timing(userChatOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(userChatTranslateX, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Delay before bot chat appears
      Animated.delay(800),
      // Animate bot chat bubble
      Animated.parallel([
        Animated.timing(botChatOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(botChatTranslateX, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const buttonContainerStyle = {
    marginVertical: 10,
    shadowColor: '#FF7D73',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.38,
    shadowRadius: 4,
    width: isIOS ? 180 : 182,
  };

  const handleGetStarted = () => {
    // Mark user as not new anymore
    const user = {
      // Include necessary user data here
      isNew: false,
    };

    // Update the auth state to reflect that user has completed onboarding
    dispatch(
      authSuccess({
        user: user,
        token: 'dummy-token', // Replace with actual token if available
      }),
    );

    // Navigate to the fifth onboarding screen
    navigation.navigate('OnboardingFifth');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.waveContainer}>
          <Image
            source={require('@assets/Logo/indr.png')}
            style={styles.waveImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.chatContainer}>
          {/* User chat bubble */}
          <View style={styles.userRow}>
            <Animated.View
              style={[
                styles.userChatBubble,
                {
                  opacity: userChatOpacity,
                  transform: [{ translateX: userChatTranslateX }],
                },
              ]}>
              <Text style={styles.chatText}>
                Hey Eindr! Set a reminder for father to take his medicine at 8PM today.
              </Text>
            </Animated.View>
            <Animated.View
              style={[
                styles.userAvatar,
                {
                  opacity: userChatOpacity,
                  transform: [{ translateX: userChatTranslateX }],
                },
              ]}>
              <Image source={require('../../assets/images/user.png')} style={styles.avatarImage} />
            </Animated.View>
          </View>

          {/* Bot chat bubble, styled like user chat card but mirrored */}
          <View style={styles.botRow}>
            <Animated.View
              style={[
                styles.botAvatar,
                {
                  opacity: botChatOpacity,
                  transform: [{ translateX: botChatTranslateX }],
                },
              ]}>
              <MaterialCommunityIcons name="robot" size={20} color="#FFF" />
            </Animated.View>
            <Animated.View
              style={[
                styles.botChatBubble,
                {
                  opacity: botChatOpacity,
                  transform: [{ translateX: botChatTranslateX }],
                },
              ]}>
              <Text style={styles.chatText}>
                Sure! Reminder set for father "Take Medicine" - 8PM today.
              </Text>
            </Animated.View>
          </View>
        </View>

        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>
            "Setting reminders and managing tasks was never this easy!"
          </Text>
        </View>

        <View style={styles.paginationContainer}>
          <View style={[styles.paginationDot, styles.inactiveDot]} />
          <View style={[styles.paginationDot, styles.activeDot]} />
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
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </GradientBorder>
        </View>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');
const chatBubbleWidth = width * 0.7;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  logoContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    tintColor: 'rgba(255, 255, 255, 0.9)',
  },
  waveContainer: {
    width: '100%',
    height: 60,
    marginBottom: 20,
    alignItems: 'center',
  },
  waveImage: {
    width: '100%',
    height: '100%',
  },
  chatContainer: {
    width: '100%',
    marginBottom: 20,
    marginTop: 140,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 10,
    justifyContent: 'flex-end',
  },
  userChatBubble: {
    backgroundColor: '#30304E',
    borderRadius: 16,
    padding: 16,
    maxWidth: chatBubbleWidth,
    borderWidth: 1,
    borderColor: 'rgba(178, 161, 255, 0.3)',
    marginRight: 6,
  },
  chatText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  avatarImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  botRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 10,
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#6039CB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: -50,
  },
  botAvatarImage: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  botChatBubble: {
    backgroundColor: '#30304E',
    borderRadius: 16,
    padding: 16,
    maxWidth: chatBubbleWidth,
    borderWidth: 1,
    borderColor: 'rgba(178, 161, 255, 0.3)',
    marginLeft: 6,
  },
  quoteContainer: {
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  quoteText: {
    color: '#B2B2B2',
    fontSize: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  paginationContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    marginTop: 70,
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

export default OnboardingFourthScreen;
 