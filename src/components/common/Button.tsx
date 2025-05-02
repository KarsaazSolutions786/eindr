import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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

const getButtonStyles = (variant: ButtonVariant, disabled: boolean) => {
  const baseStyles = {
    primary: {
      backgroundColor: disabled ? theme.colors.gray[700] : theme.colors.background.secondary,
      borderColor: disabled ? theme.colors.gray[600] : theme.colors.border.primary,
      textColor: disabled ? theme.colors.gray[500] : theme.colors.text.primary,
    },
    outline: {
      backgroundColor: disabled ? theme.colors.gray[700] : theme.colors.background.primary,
      borderColor: disabled ? theme.colors.gray[600] : theme.colors.accentStroke,
      textColor: disabled ? theme.colors.gray[500] : theme.colors.text.secondary,
    },
  };

  return baseStyles[variant];
};

const getSizeStyles = (size: ButtonSize) => {
  const sizes = {
    sm: {
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.fontSize.sm,
    },
    md: {
      paddingVertical: theme.spacing.md,
      fontSize: theme.typography.fontSize.md,
    },
    lg: {
      paddingVertical: theme.spacing.lg,
      fontSize: theme.typography.fontSize.lg,
    },
  };

  return sizes[size];
};

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
  const buttonStyles = getButtonStyles(variant, disabled);
  const sizeStyles = getSizeStyles(size);

  // Define all color sets with high contrast colors
  const colorSets = [
    ['#f5f3ff', '#c4b7ff'],
    ['#c4b7ff', '#f5f3ff'],
  ];

  // State to track current color set
  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  useEffect(() => {
    // Setup timer for color changes
    const timer = setTimeout(() => {
      setCurrentColorIndex(prevIndex => (prevIndex + 1) % colorSets.length);
    }, 800); // Change color every 800ms for more visible change

    // Cleanup
    return () => clearTimeout(timer);
  }, [currentColorIndex]); // Depends on currentColorIndex to create continuous chain

  // Get current colors
  const currentColors = colorSets[currentColorIndex];

  return (
    <View style={[styles.buttonContainer, { width: fullWidth ? '100%' : 'auto' }]}>
      <LinearGradient
        colors={currentColors}
        start={{ x: 1, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradientBorder,
          { borderRadius: theme.borderRadius.md, shadowColor: '#c07ddf' },
        ]}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: buttonStyles.backgroundColor,
              paddingVertical: sizeStyles.paddingVertical,
              borderRadius: theme.borderRadius.md,
            },
            style,
          ]}
          disabled={disabled || loading}
          activeOpacity={0.7}
          {...props}>
          {loading ? (
            <ActivityIndicator color={buttonStyles.textColor} />
          ) : (
            <>
              {leftIcon}
              <Text
                style={[
                  styles.text,
                  {
                    color: buttonStyles.textColor,
                    fontSize: sizeStyles.fontSize,
                    marginLeft: leftIcon ? theme.spacing.sm : 0,
                    marginRight: rightIcon ? theme.spacing.sm : 0,
                  },
                  textStyle,
                ]}>
                {children}
              </Text>
              {rightIcon}
            </>
          )}
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginBottom: theme.spacing.sm,
  },
  gradientBorder: {
    padding: 1,
    borderRadius: theme.borderRadius.md,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.11,
    shadowRadius: 10,
    elevation: 3,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: theme.typography.fontFamily.medium,
    textAlign: 'center',
  },
});

export default Button;
