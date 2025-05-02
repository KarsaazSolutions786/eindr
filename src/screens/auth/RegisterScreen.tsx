// RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Redux and Navigation imports
import { authStart, authSuccess, authFailure } from '@store/slices/authSlice';
import { RootState } from '@store/rootReducer';
import { AppDispatch } from '@store/index';
import { RootStackParamList } from '@navigation/RootNavigator';

// Service imports
import { registerUser } from '@services/authService';

// Component imports
import { Button, Input, SocialButton, Header } from '@components/common';
import theme from '@theme/theme';

interface Gender {
  label: string;
  value: string;
}

interface ApiError {
  message: string;
}

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: Props) => {
  // Redux state and dispatch
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  // Form validation states
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [genderError, setGenderError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Gender options
  const genderOptions: Gender[] = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
    { label: 'Prefer not to say', value: 'not_specified' },
  ];

  const handleRegister = async () => {
    // Reset all error states
    setFullNameError('');
    setEmailError('');
    setGenderError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Validate form
    let isValid = true;

    if (!fullName.trim()) {
      setFullNameError('Full name is required');
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }

    if (!gender) {
      setGenderError('Please select a gender');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    if (isValid) {
      navigation.navigate('Registered');
    }

    // if (isValid) {
    //   dispatch(authStart());
    //   try {
    //     const userData = { fullName, email, gender, password };
    //     const response = await registerUser(userData);
    //     dispatch(authSuccess({ user: response.user, token: response.token }));
    //     navigation.navigate('Registered');
    //   } catch (error) {
    //     const apiError = error as ApiError;
    //     const errorMessage = apiError.message || 'Registration failed. Please try again.';
    //     dispatch(authFailure(errorMessage));
    //     Alert.alert('Registration Failed', errorMessage);
    //   }
    // }
  };

  // const handleSocialRegister = (provider: 'google' | 'facebook' | 'apple') => {
  //   console.log(`Register with ${provider}`);
  //   // Implement social registration logic
  //   // This would follow similar patterns to the social login handlers
  // };

  const toggleGenderDropdown = () => {
    setShowGenderDropdown(!showGenderDropdown);
  };

  const selectGender = (selectedGender: Gender) => {
    setGender(selectedGender.label);
    setShowGenderDropdown(false);
    if (genderError) setGenderError('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={text => {
                setFullName(text);
                if (fullNameError) setFullNameError('');
              }}
              error={fullNameError}
              autoCapitalize="words"
            />

            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Gender dropdown field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Gender</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, genderError ? styles.inputError : null]}
                onPress={toggleGenderDropdown}
                disabled={isLoading}>
                <View style={styles.dropdownTextContainer}>
                  <Text style={[styles.dropdownText, !gender ? styles.placeholderText : null]}>
                    {gender || '--Select gender--'}
                  </Text>
                </View>
                {/* <Icon name="chevron-down" size={20} color={theme.colors.text.secondary} /> */}
              </TouchableOpacity>
              {genderError ? <Text style={styles.errorText}>{genderError}</Text> : null}

              {/* Dropdown options */}
              {showGenderDropdown && (
                <View style={styles.dropdownList}>
                  {genderOptions.map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.dropdownItem}
                      onPress={() => selectGender(option)}>
                      <Text style={styles.dropdownItemText}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <Input
              label="Password"
              placeholder="Enter password"
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              error={passwordError}
              isPassword
              secureTextEntry
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              error={confirmPasswordError}
              isPassword
              secureTextEntry
            />

            {error && <Text style={styles.globalErrorText}>{error}</Text>}

            <Button
              variant="primary"
              size="md"
              fullWidth
              onPress={handleRegister}
              style={styles.registerButton}>
              Register
            </Button>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or register in with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <SocialButton
                iconName="google"
                // onPress={() => handleSocialRegister('google')}
                disabled={isLoading}
              />
              <SocialButton
                iconName="facebook"
                // onPress={() => handleSocialRegister('facebook')}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: theme.colors.background.primary,
    paddingBottom: theme.spacing.xl,
    marginTop: 160,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: theme.spacing.xl, // To account for the back button
  },
  logo: {
    fontSize: theme.typography.fontSize['2xl'],
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.white,
  },
  tagline: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  form: {
    width: '100%',
  },
  registerButton: {
    // marginTop: theme.spacing.md,
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

  // Custom dropdown styles
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.medium,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.secondary,
  },
  dropdownTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownIcon: {
    marginRight: theme.spacing.md,
  },
  dropdownText: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.regular,
  },
  placeholderText: {
    color: theme.colors.text.placeholder,
  },
  dropdownList: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.secondary,
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  dropdownItemText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.regular,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.regular,
  },
  globalErrorText: {
    color: theme.colors.danger,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    minHeight: theme.typography.lineHeight?.sm || 20,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  loginText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
  },
  linkText: {
    color: theme.colors.text.link,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.bold,
  },
});

export default RegisterScreen;
