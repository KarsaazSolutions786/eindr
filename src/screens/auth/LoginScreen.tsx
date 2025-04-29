// LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Config from 'react-native-config';

// Redux and Navigation
import { authStart, authSuccess, authFailure, clearError } from '@store/slices/authSlice';
import { AppDispatch, RootState, useAppDispatch, useAppSelector } from '@store/index';
import { RootStackParamList } from '@navigation/RootNavigator';

// Components
import { Input, Button, SocialButton, Header } from '@components/common';
import theme from '@theme/theme';
import { AccessToken } from 'react-native-fbsdk-next';
import { LoginManager } from 'react-native-fbsdk-next';
import { loginWithFacebook } from '@services/authService';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  // Redux state and dispatch
  const dispatch = useDispatch<AppDispatch>();
  // const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const { error } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Google SignIn configuration
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.WEB_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

  // Clear any previous auth errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleLogin = async () => {
    // Form validation
    let valid = true;

    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (valid) {
      // dispatch(authStart());
      // try {
      //   const response = await loginUser({ email, password });
      //   dispatch(authSuccess({ user: response.user, token: response.token }));
      // } catch (error: any) {
      //   const errorMessage = error.message || 'Login failed. Please try again.';
      //   dispatch(authFailure(errorMessage));
      // }
      navigation.navigate('Home');
    }
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    dispatch(authStart());
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo?.data?.idToken;
      if (idToken) {
        console.log('idToken', idToken);
        // const response = await loginWithGoogle(idToken);
        // dispatch(authSuccess({ user: response.user, token: response.token }));
      } else {
        throw new Error('Google Sign-In failed: No ID token received in response');
      }
    } catch (error: unknown) {
      let errorMessage = 'Google Sign-In failed.';
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const gError = error as { code: string | number; message?: string };
        if (gError.code === statusCodes.SIGN_IN_CANCELLED) {
          errorMessage = 'Google Sign-In cancelled.';
          dispatch(authFailure(''));
          console.log(errorMessage);
          return;
        } else if (gError.code === statusCodes.IN_PROGRESS) {
          errorMessage = 'Google Sign-In is already in progress.';
          dispatch(authFailure(''));
          console.log(errorMessage);
          return;
        } else if (gError.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          errorMessage = 'Google Play Services not available or outdated.';
        } else {
          errorMessage = `Google Sign-In Error (${gError.code}): ${
            gError.message || 'Unknown error'
          }`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      if (
        errorMessage &&
        !(errorMessage.includes('cancelled') || errorMessage.includes('in progress'))
      ) {
        dispatch(authFailure(errorMessage));
        Alert.alert('Login Failed', errorMessage);
      } else if (errorMessage) {
        console.log(errorMessage);
      } else {
        dispatch(authFailure('An unknown login error occurred.'));
        Alert.alert('Login Failed', 'An unknown error occurred.');
      }
      console.error('Google Sign-In Error:', error);
    }
  };

  // Google Logout Handler
  const handleGoogleLogout = async () => {
    try {
      await GoogleSignin.signOut();
      console.log('Google Sign-Out Success');
      dispatch(authFailure(''));
    } catch (error) {
      console.error('Google Sign-Out Error:', error);
    }
  };

  // Facebook Login Handler
  const handleFacebookLogin = async () => {
    dispatch(authStart());
    try {
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      if (result.isCancelled) {
        console.log('Facebook Login cancelled');
        dispatch(authFailure(''));
        return;
      }
      const data = await AccessToken.getCurrentAccessToken();
      if (!data?.accessToken) {
        throw new Error('Something went wrong obtaining the Facebook access token');
      }
      console.log('Facebook Login Success, Access Token:', data.accessToken);
      // const response = await loginWithFacebook(data.accessToken);
      // dispatch(authSuccess({ user: response.user, token: response.token }));
    } catch (error: unknown) {
      let errorMessage = 'Facebook Login failed.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = 'An unknown Facebook login error occurred.';
      }
      dispatch(authFailure(errorMessage));
      Alert.alert('Login Failed', errorMessage);
      console.error('Facebook Login Error:', error);
    }
  };

  // Apple Login Handler
  // const handleAppleLogin = async () => {
  //   if (Platform.OS !== 'ios') return;
  //   dispatch(authStart());
  //   try {
  //     const appleAuthRequestResponse = await appleAuth.performRequest({
  //       requestedOperation: AppleRequestOperation.LOGIN,
  //       requestedScopes: [AppleRequestScope.EMAIL, AppleRequestScope.FULL_NAME],
  //     });

  //     const { identityToken } = appleAuthRequestResponse;

  //     if (!identityToken) {
  //       throw new Error('Apple Sign-In failed: No identity token received');
  //     }

  //     console.log('Apple Sign-In Success, Identity Token:', identityToken);
  //     const response = await loginWithApple(identityToken);
  //     dispatch(authSuccess({ user: response.user, token: response.token }));
  //   } catch (error: unknown) {
  //     let errorMessage = 'Apple Sign-In failed.';
  //     if (typeof error === 'object' && error !== null && 'code' in error) {
  //       const appleError = error as { code: string; message?: string };
  //       if (appleError.code === appleAuth.Error.CANCELED) {
  //         errorMessage = 'Apple Sign-In cancelled.';
  //         dispatch(authFailure(''));
  //         console.log(errorMessage);
  //         return;
  //       } else {
  //         errorMessage = `Apple Sign-In Error (${appleError.code}): ${
  //           appleError.message || 'Unknown error'
  //         }`;
  //       }
  //     } else if (error instanceof Error) {
  //       errorMessage = error.message;
  //     } else {
  //       errorMessage = 'An unknown Apple Sign-In error occurred.';
  //     }

  //     if (errorMessage && !errorMessage.includes('cancelled')) {
  //       dispatch(authFailure(errorMessage));
  //       Alert.alert('Login Failed', errorMessage);
  //     } else if (errorMessage) {
  //       console.log(errorMessage);
  //     } else {
  //       dispatch(authFailure('An unknown login error occurred.'));
  //       Alert.alert('Login Failed', 'An unknown error occurred.');
  //     }
  //     console.error('Apple Sign-In Error:', error);
  //   }
  // };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
              editable={!isLoading}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              error={passwordError}
              isPassword
              secureTextEntry
              editable={!isLoading}
            />

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
              disabled={isLoading}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button
              variant="primary"
              size="md"
              fullWidth
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}>
              Login
            </Button>

            <Button
              variant="outline"
              size="md"
              fullWidth
              onPress={navigateToRegister}
              disabled={isLoading}
              style={styles.registerButton}>
              Register
            </Button>

            {/* <Button
              variant="outline"
              size="md"
              fullWidth
              onPress={handleGoogleLogout}
              disabled={isLoading}
              // style={styles.logoutButton}
            >
              Logout
            </Button> */}

            <View style={{ marginTop: theme.spacing.xl }}>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or sign in with</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtons}>
                <SocialButton iconName="google" onPress={handleGoogleLogin} disabled={isLoading} />
                <SocialButton
                  iconName="facebook"
                  onPress={handleFacebookLogin}
                  disabled={isLoading}
                />
                {Platform.OS === 'ios' && (
                  <SocialButton
                    iconName="apple"
                    //  onPress={handleAppleLogin}
                    disabled={isLoading}
                  />
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  containerHeader: {
    paddingTop: 50,
  },

  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  formContainer: {
    width: '100%',
    marginTop: theme.spacing.xl,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.md,
  },
  forgotPasswordText: {
    color: theme.colors.text.link,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
  },
  registerButton: {
    // marginTop: theme.spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border.primary,
  },
  dividerText: {
    color: theme.colors.text.secondary,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.danger,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    minHeight: theme.typography.lineHeight?.sm || 20,
  },
});

export default LoginScreen;
