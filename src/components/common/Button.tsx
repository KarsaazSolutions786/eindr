import React, { useRef, useEffect } from 'react';
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
import LottieView from 'lottie-react-native';
import theme from '@theme/theme';

// Import the animation json file
import borderAnimationJson from './animations/borderAnimation.json';

// Types
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
  gradientBorder?: boolean;
  animatedBorder?: boolean;
}

// Define interface for ButtonContent props
interface ButtonContentProps {
  loading: boolean;
  buttonStyles: {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
  };
  sizeStyles: {
    paddingVertical: number;
    fontSize: number;
  };
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  textStyle?: TextStyle;
  children: React.ReactNode;
}

// Helper functions
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

// Button inner content component - extracted for reuse
const ButtonContent: React.FC<ButtonContentProps> = ({
  loading,
  buttonStyles,
  sizeStyles,
  leftIcon,
  rightIcon,
  textStyle,
  children,
}) => (
  <>
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
  </>
);

// Main Button component
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
  gradientBorder = false,
  animatedBorder = false,
  ...props
}) => {
  const buttonStyles = getButtonStyles(variant, disabled);
  const sizeStyles = getSizeStyles(size);
  const lottieRef = useRef<LottieView>(null);

  // Setup lottie animation to play properly
  useEffect(() => {
    if (lottieRef.current && animatedBorder) {
      // Ensure animation plays after component mounts
      setTimeout(() => {
        if (lottieRef.current) {
          lottieRef.current.play();
        }
      }, 100);
    }
  }, [animatedBorder]);

  // Static gradient colors
  const borderColors = ['#f5f3ff', '#c4b7ff'];

  // Render button with animated border
  if (animatedBorder) {
    return (
      <View style={[styles.buttonContainer, { width: fullWidth ? '100%' : 'auto' }]}>
        <View
          style={[
            styles.animatedBorderContainer,
            fullWidth && { width: '100%' },
            { backgroundColor: buttonStyles.backgroundColor },
          ]}>
          {/* Animated border with moving segment */}
          <LottieView
            ref={lottieRef}
            source={borderAnimationJson}
            style={styles.lottieAnimation}
            autoPlay
            loop
            speed={0.8} // Control the speed of the animation
            colorFilters={[
              {
                keypath: 'Moving Line.Line Stroke',
                color: '#FFFFFF', // Moving line color
              },
              {
                keypath: 'Border Path.Static Stroke',
                color: '#B2A1FF', // Static border color
              },
            ]}
          />

          {/* Button content */}
          <View style={styles.buttonContent}>
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: 'transparent',
                  paddingVertical: sizeStyles.paddingVertical,
                },
                style,
              ]}
              disabled={disabled || loading}
              activeOpacity={0.7}
              {...props}>
              <ButtonContent
                loading={loading}
                buttonStyles={buttonStyles}
                sizeStyles={sizeStyles}
                leftIcon={leftIcon}
                rightIcon={rightIcon}
                textStyle={textStyle}
                children={children}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Standard button with optional gradient border
  return (
    <View style={[styles.buttonContainer, { width: fullWidth ? '100%' : 'auto' }]}>
      {/* <LinearGradient
        colors={borderColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradientBorder,
          {
            borderRadius: theme.borderRadius.md,
            shadowColor: gradientBorder ? '#f5f3ff' : '#c07ddf',
            padding: gradientBorder ? 2 : 1,
          },
        ]}> */}
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: buttonStyles.backgroundColor,
              paddingVertical: sizeStyles.paddingVertical,
              borderRadius: theme.borderRadius.md - (gradientBorder ? 1 : 0),
            },
            style,
          ]}
          disabled={disabled || loading}
          activeOpacity={0.7}
          {...props}>
          <ButtonContent
            loading={loading}
            buttonStyles={buttonStyles}
            sizeStyles={sizeStyles}
            leftIcon={leftIcon}
            rightIcon={rightIcon}
            textStyle={textStyle}
            children={children}
          />
        </TouchableOpacity>
      {/* </LinearGradient> */}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  buttonContainer: {
    marginBottom: theme.spacing.md,
  },
  gradientBorder: {
    padding: 1,
    borderRadius: 0,
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
  animatedBorderContainer: {
    position: 'relative',
    borderRadius: 4,
    overflow: 'hidden',
    minHeight: 42, // Ensure minimum height for proper rendering
  },
  lottieAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  buttonContent: {
    flex: 1,
    margin: 5, // Give some space for the border
    zIndex: 2,
  },
});

export default Button;
