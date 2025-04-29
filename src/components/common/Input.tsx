import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import theme from '@theme/theme';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  isPassword?: boolean;
  secureTextEntry?: boolean;
  leftIcon?: React.ReactNode;
  style?: ViewStyle | TextStyle;
  backgroundColor?: string;
  borderRadius?: number;
  fontSize?: number;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  isPassword = false,
  secureTextEntry: initialSecureTextEntry = false,
  leftIcon,
  style,
  backgroundColor = theme.colors.background.secondary,
  borderRadius = theme.borderRadius.sm,
  fontSize = theme.typography.fontSize.md,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!initialSecureTextEntry);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prev => !prev);
  };

  const effectiveSecureTextEntry = isPassword && !isPasswordVisible;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <LinearGradient
        colors={['#6c6c85', '#2c2d3c']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradientBorder, error && styles.gradientBorderError, { borderRadius }]}>
        <View
          style={[
            styles.inputContainer,
            error && styles.inputContainerError,
            { backgroundColor, borderRadius },
          ]}>
          {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
          <TextInput
            style={[styles.input, leftIcon ? styles.inputWithIcon : null, { fontSize }, style]}
            placeholderTextColor={`${theme.colors.text.placeholder}33`}
            secureTextEntry={effectiveSecureTextEntry}
            {...props}
          />
          {isPassword && (
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.iconContainer}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon
                name={isPasswordVisible ? 'eye' : 'eye-slash'}
                size={theme.typography.fontSize.xl}
                color={theme.colors.text.secondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
      {error && <Text style={[styles.error, errorStyle]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  gradientBorder: {
    borderRadius: theme.borderRadius.sm,
    padding: 1,
    backgroundColor: 'transparent',
  },
  gradientBorderError: {
    opacity: 0.5,
  },
  label: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.secondary,
    paddingHorizontal: theme.spacing.md,
  },
  inputContainerError: {
    borderColor: theme.colors.danger,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.regular,
  },
  inputWithIcon: {
    paddingLeft: theme.spacing.sm,
  },
  iconContainer: {
    padding: theme.spacing.sm,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.regular,
  },
});

export default Input;
