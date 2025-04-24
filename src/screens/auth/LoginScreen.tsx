import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { authStart, authSuccess, authFailure, clearError } from '@store/slices/authSlice';
import { RootState } from '@store/rootReducer'; // Corrected import path for RootState
import { AppDispatch } from '@store/index'; 
import { AuthStackParamList } from '@navigation/AuthNavigator';
import { loginUser, loginWithGoogle, loginWithFacebook, loginWithApple } from '@services/authService';

// Social Login SDK Imports
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import appleAuth, { AppleButton, AppleRequestOperation, AppleRequestScope } from '@invertase/react-native-apple-authentication';

// Common Component Imports
import { Input, Button, SocialButton } from '@components/common';
import theme from '@theme/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();

  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  // --- Google Sign-In Configuration ---
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com', // *** REPLACE THIS ***
      offlineAccess: false, // Set to true if you need server auth code
    });
  }, []);

  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    dispatch(authStart());

    try {
      const response = await loginUser({ email, password });
      dispatch(authSuccess({ user: response.user, token: response.token }));
      // Navigation to the main app stack will happen automatically
      // because RootNavigator listens to the isAuthenticated state.

    } catch (apiError: unknown) {
      let errorMessage = 'Login failed. Please try again.';
      if (apiError instanceof Error) {
        errorMessage = apiError.message;
      } else if (typeof apiError === 'object' && apiError !== null && 'message' in apiError && typeof apiError.message === 'string') {
        errorMessage = apiError.message;
      }
      
      dispatch(authFailure(errorMessage));
      Alert.alert('Login Failed', errorMessage);
    }
  };

  // --- Google Login Handler ---
  const handleGoogleLogin = async () => {
    dispatch(authStart());
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn(); // Get the full user info object
      const idToken = userInfo.idToken; // Try accessing idToken from the top level again, let's see if previous fix was wrong
      
      if (idToken) {
        console.log('Google Sign-In Success, ID Token:', idToken);
        const response = await loginWithGoogle(idToken);
        dispatch(authSuccess({ user: response.user, token: response.token }));
      } else {
        // If top-level fails, maybe it's nested? (Less likely but covering bases)
        // const nestedIdToken = userInfo.user?.idToken;
        // if (nestedIdToken) {
        //    console.log('Google Sign-In Success (nested), ID Token:', nestedIdToken);
        //    const response = await loginWithGoogle(nestedIdToken);
        //    dispatch(authSuccess({ user: response.user, token: response.token }));
        // } else {
             throw new Error('Google Sign-In failed: No ID token received in response');
        // }
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
          errorMessage = `Google Sign-In Error (${gError.code}): ${gError.message || 'Unknown error'}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      if (errorMessage && !(errorMessage.includes('cancelled') || errorMessage.includes('in progress'))) {
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

  // --- Facebook Login Handler ---
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
      const response = await loginWithFacebook(data.accessToken);
      dispatch(authSuccess({ user: response.user, token: response.token }));
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

  // --- Apple Login Handler ---
  const handleAppleLogin = async () => {
    if (Platform.OS !== 'ios') return;
    dispatch(authStart());
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: AppleRequestOperation.LOGIN,
        requestedScopes: [AppleRequestScope.EMAIL, AppleRequestScope.FULL_NAME],
      });

      const { identityToken } = appleAuthRequestResponse;

      if (!identityToken) {
        throw new Error('Apple Sign-In failed: No identity token received');
      }

      console.log('Apple Sign-In Success, Identity Token:', identityToken);
      const response = await loginWithApple(identityToken);
      dispatch(authSuccess({ user: response.user, token: response.token }));

    } catch (error: unknown) {
       let errorMessage = 'Apple Sign-In failed.';
        if (typeof error === 'object' && error !== null && 'code' in error) {
             const appleError = error as { code: string; message?: string };
            if (appleError.code === appleAuth.Error.CANCELED) {
                errorMessage = 'Apple Sign-In cancelled.';
                dispatch(authFailure(''));
                 console.log(errorMessage);
                 return; 
            } else {
                 errorMessage = `Apple Sign-In Error (${appleError.code}): ${appleError.message || 'Unknown error'}`;
            }
        } else if (error instanceof Error) {
           errorMessage = error.message;
        } else {
             errorMessage = 'An unknown Apple Sign-In error occurred.';
        }
       
      if (errorMessage && !errorMessage.includes('cancelled')) {
          dispatch(authFailure(errorMessage));
          Alert.alert('Login Failed', errorMessage);
      } else if (errorMessage) {
          console.log(errorMessage);
      } else {
          dispatch(authFailure('An unknown login error occurred.'));
          Alert.alert('Login Failed', 'An unknown error occurred.');
      }
      console.error('Apple Sign-In Error:', error);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <Input
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
        containerStyle={styles.input}
      />

      <Input
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        isPassword={true}
        editable={!isLoading}
        containerStyle={styles.input}
      />

      <TouchableOpacity 
        onPress={navigateToForgotPassword} 
        disabled={isLoading} 
        style={styles.forgotPasswordContainer}
      >
        <Text style={styles.linkText}>Forgot Password?</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Button
        onPress={handleLogin}
        loading={isLoading}
        disabled={isLoading}
        fullWidth
        style={styles.loginButton}
        variant="primary"
      >
        Login
      </Button>

      <Text style={styles.socialText}>Or continue with</Text>
      <View style={styles.socialContainer}>
        <SocialButton iconName="google" onPress={handleGoogleLogin} disabled={isLoading} />
        <SocialButton iconName="facebook" onPress={handleFacebookLogin} disabled={isLoading} />
        {Platform.OS === 'ios' && (
             <SocialButton iconName="apple" onPress={handleAppleLogin} disabled={isLoading} />
        )}
      </View>

      <View style={styles.registerContainer}> 
        <Text style={styles.registerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={navigateToRegister} disabled={isLoading}>
            <Text style={[styles.linkText, styles.registerLink]}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.bold,
    textAlign: 'center',
    marginBottom: theme.spacing['3xl'],
  },
  input: {
    marginBottom: theme.spacing.lg,
  },
  forgotPasswordContainer: {
      alignSelf: 'flex-end',
      marginBottom: theme.spacing.xl,
      marginTop: -theme.spacing.sm,
  },
  loginButton: {
    marginTop: theme.spacing.md,
  },
  linkText: {
    color: theme.colors.text.link,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
  },
  errorText: {
    color: theme.colors.danger,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    minHeight: theme.typography.lineHeight.sm,
  },
  socialText: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
    marginVertical: theme.spacing.xl,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  registerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing.xl,
      paddingBottom: theme.spacing.md,
  },
  registerText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
  },
  registerLink: {
      fontFamily: theme.typography.fontFamily.bold, 
  }
});

export default LoginScreen; 