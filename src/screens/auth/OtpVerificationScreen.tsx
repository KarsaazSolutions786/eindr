// screens/OtpVerificationScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import { RootStackParamList } from '@navigation/RootNavigator';
import { Button, Header } from '@components/common';
import OtpInput from '@components/common/OtpInput';
import theme from '@theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'OtpVerification'>;

const RESEND_TIMER_SECONDS = 30;
const INITIAL_OTP = ['', '', '', ''] as string[];

const OtpVerificationScreen = ({ navigation }: Props) => {
  const [otp, setOtp] = useState<string[]>(INITIAL_OTP);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(RESEND_TIMER_SECONDS);
  const [canResend, setCanResend] = useState(false);
  //   const timerRef = useRef<number>();

  // Timer effect
  //   useEffect(() => {
  //     if (timer > 0) {
  //       timerRef.current = setInterval(() => {
  //         setTimer((prevTimer: number) => prevTimer - 1);
  //       }, 1000) as unknown as number;
  //     } else {
  //       setCanResend(true);
  //     }

  //     return () => {
  //       if (timerRef.current) {
  //         clearInterval(timerRef.current);
  //       }
  //     };
  //   }, [timer]);

  // Handle resend OTP
  //   const handleResend = () => {
  //     if (!canResend) return;

  //     // Reset timer and canResend state
  //     setTimer(RESEND_TIMER_SECONDS);
  //     setCanResend(false);

  //     // Reset OTP fields
  //     setOtp(INITIAL_OTP);

  //     // TODO: Add API call to resend OTP
  //     console.log('Resending OTP');
  //   };

  // Handle OTP completion
  const handleOtpComplete = (completedOtp: string) => {
    console.log('OTP completed:', completedOtp);
    setIsLoading(false);
    handleConfirm();
  };

  // Handle confirm button press
  const handleConfirm = async () => {
    const otpValue = otp.join('');

    if (otpValue.length !== 4) {
      // TODO: Show error toast if OTP is incomplete
      console.log('Please enter the complete OTP');
      return;
    }
    navigation.navigate('NewPassword');

    // try {
    //   // TODO: Add API call to verify OTP
    //   // For demo, we'll simulate an API call with a timeout
    //   await new Promise<void>(resolve => setTimeout(resolve, 1500));
    //   navigation.navigate('Login');
    // } catch (error) {
    //   // TODO: Show error toast
    //   console.error('OTP verification failed:', error);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Enter your 4 digit OTP</Text>

          <OtpInput
            code={otp}
            setCode={setOtp}
            maxLength={4}
            autoFocus
            containerStyle={styles.otpContainer}
            onComplete={handleOtpComplete}
          />

          <View style={styles.resendContainer}>
            {!canResend ? (
              <Text style={styles.timerText}>
                Resend OTP in {timer} second{timer !== 1 ? 's' : ''}
              </Text>
            ) : (
              <View style={styles.resendButtonContainer}>
                <TouchableOpacity
                  style={styles.resendButton}
                  //   onPress={handleResend}
                  disabled={isLoading}>
                  <Text style={styles.resendText}>Resend</Text>
                  <Icon name="refresh" size={16} color={theme.colors.text.link} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        <View style={styles.bottomSection}>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onPress={handleConfirm}
            loading={isLoading}
            // disabled={isLoading || otp.join('').length !== 4}
          >
            Confirm
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    paddingTop: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.lg,
  },
  content: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  bottomSection: {
    paddingBottom: 60,
    width: '100%',
  },
  otpContainer: {
    marginBottom: theme.spacing.xl,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  resendButtonContainer: {
    alignItems: 'center',
  },
  timerText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  resendText: {
    color: theme.colors.text.link,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    marginRight: theme.spacing.xs,
  },
});

export default OtpVerificationScreen;
