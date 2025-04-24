import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import theme from '@theme/theme';

type ButtonVariant = 'primary' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  children,
  ...props
}) => {
  const getPrimaryStyles = () => ({
    backgroundColor: disabled ? theme.colors.gray[700] : theme.colors.background.secondary,
    borderColor: disabled ? theme.colors.gray[600] : theme.colors.border.primary,
    textColor: disabled ? theme.colors.gray[500] : theme.colors.text.primary,
  });

  const getOutlineStyles = () => ({
    backgroundColor: 'transparent',
    borderColor: disabled ? theme.colors.gray[600] : theme.colors.accentStroke,
    textColor: disabled ? theme.colors.gray[500] : theme.colors.text.secondary,
  });

  const currentStyles = variant === 'primary' ? getPrimaryStyles() : getOutlineStyles();

  const getPaddingVertical = () => {
    switch (size) {
      case 'sm':
        return theme.spacing.sm;
      case 'lg':
        return theme.spacing.lg;
      default:
        return theme.spacing.md;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return theme.typography.fontSize.sm;
      case 'lg':
        return theme.typography.fontSize.lg;
      default:
        return theme.typography.fontSize.md;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: currentStyles.backgroundColor,
          borderColor: currentStyles.borderColor,
          paddingVertical: getPaddingVertical(),
          borderRadius: theme.borderRadius.sm,
          width: fullWidth ? '100%' : 'auto',
        },
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={currentStyles.textColor} />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.text,
              {
                color: currentStyles.textColor,
                fontSize: getFontSize(),
                marginLeft: leftIcon ? theme.spacing.sm : 0,
                marginRight: rightIcon ? theme.spacing.sm : 0,
              },
              textStyle,
            ]}
          >
            {children}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  text: {
    fontFamily: theme.typography.fontFamily.medium,
    textAlign: 'center',
  },
});

export default Button; 