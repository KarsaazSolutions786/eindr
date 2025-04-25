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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

// Redux and Navigation
import { authStart, authSuccess, authFailure, clearError } from '@store/slices/authSlice';
import { RootState } from '@store/rootReducer';
import { AppDispatch } from '@store/index';
import { AuthStackParamList } from '@navigation/AuthNavigator';

// Components
import { Input, Button, SocialButton, Header } from '@components/common';
import theme from '@theme/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  // Redux state and dispatch
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
      navigation.navigate('Home');
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header is placed outside the KeyboardAvoidingView to stay at top */}
      <View style={styles.containerHeader}>
        <Header />
      </View>
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

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or sign in with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <SocialButton iconName="google" disabled={isLoading} />
              <SocialButton iconName="facebook" disabled={isLoading} />
              {Platform.OS === 'ios' && <SocialButton iconName="apple" disabled={isLoading} />}
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
  paddingTop:50
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
    marginTop: theme.spacing.sm,
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
