import React, { useRef, useEffect, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  View,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import theme from '@theme/theme';

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

// Animated Border Component
const AnimatedBorder = ({
  children,
  isPressed,
  borderRadius,
}: {
  children: React.ReactNode;
  isPressed: boolean;
  borderRadius: number;
}) => {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create an infinite loop animation with smooth transitions
    const animationLoop = Animated.loop(
      Animated.timing(animation, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear, // Linear easing ensures constant speed
        useNativeDriver: false,
      }),
      { iterations: -1 }, // Explicitly set to infinite iterations
    );

    // Start the animation
    animationLoop.start();

    // Proper cleanup
    return () => {
      animationLoop.stop();
      animation.setValue(0); // Reset value on unmount
    };
  }, []);

  // Create smoother color transitions with more interpolation points
  const colorInterpolation1 = animation.interpolate({
    inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    outputRange: [
      '#FFFFFF',
      '#F0EBFF',
      '#E2D8FF',
      '#D3C5FF',
      '#C4B3FF',
      '#B2A1FF',
      '#C4B3FF',
      '#D3C5FF',
      '#E2D8FF',
      '#F0EBFF',
      '#FFFFFF',
    ],
  });

  const colorInterpolation2 = animation.interpolate({
    inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    outputRange: [
      '#B2A1FF',
      '#C4B3FF',
      '#D3C5FF',
      '#E2D8FF',
      '#F0EBFF',
      '#FFFFFF',
      '#F0EBFF',
      '#E2D8FF',
      '#D3C5FF',
      '#C4B3FF',
      '#B2A1FF',
    ],
  });

  const borderWidth = isPressed ? 2.5 : 2;
  const opacity = isPressed ? 1 : 0.9; // Slightly higher default opacity for better visibility

  // Shadow styles based on user specifications
  const shadowStyle1 = {
    shadowColor: '#FF7D73',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.38,
    shadowRadius: 4,
    elevation: 4,
  };

  const shadowStyle2 = {
    shadowColor: '#FF7D73',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.24,
    shadowRadius: 7,
    elevation: 6,
  };

  // Apply more intense shadow when pressed
  const shadowStyle = isPressed ? shadowStyle2 : shadowStyle1;

  return (
    <View style={{ position: 'relative', borderRadius: borderRadius, overflow: 'visible' }}>
      {/* Top border */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: borderWidth,
          backgroundColor: colorInterpolation1,
          borderTopLeftRadius: borderRadius,
          borderTopRightRadius: borderRadius,
          opacity: opacity,
          zIndex: 1,
          ...shadowStyle,
        }}
      />

      {/* Right border */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: borderWidth,
          backgroundColor: colorInterpolation2,
          borderTopRightRadius: borderRadius,
          borderBottomRightRadius: borderRadius,
          opacity: opacity,
          zIndex: 1,
          ...shadowStyle,
        }}
      />

      {/* Bottom border */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: borderWidth,
          backgroundColor: colorInterpolation1,
          borderBottomLeftRadius: borderRadius,
          borderBottomRightRadius: borderRadius,
          opacity: opacity,
          zIndex: 1,
          ...shadowStyle,
        }}
      />

      {/* Left border */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: borderWidth,
          backgroundColor: colorInterpolation2,
          borderTopLeftRadius: borderRadius,
          borderBottomLeftRadius: borderRadius,
          opacity: opacity,
          zIndex: 1,
          ...shadowStyle,
        }}
      />

      {children}
    </View>
  );
};

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
  gradientBorder = true, // Default to true for the gradient effect
  ...props
}) => {
  const buttonStyles = getButtonStyles(variant, disabled);
  const sizeStyles = getSizeStyles(size);

  // Simple state for hover/press effect
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  // Get border radius value from theme - ensure it's a number
  const borderRadiusValue = 16; // Fallback to 16 if not defined

  // Simple button with animated borders or basic style
  return (
    <View style={[styles.buttonContainer, { width: fullWidth ? '100%' : 'auto' }]}>
      {gradientBorder ? (
        <AnimatedBorder isPressed={isPressed} borderRadius={borderRadiusValue}>
          <View
            style={[
              styles.innerButtonContainer,
              {
                backgroundColor: buttonStyles.backgroundColor,
                borderRadius: borderRadiusValue,
                // margin: 2, // Space for the border
              },
            ]}>
            <TouchableOpacity
              style={[
                styles.button,
                {
                  paddingVertical: sizeStyles.paddingVertical,
                  borderRadius: borderRadiusValue,
                },
                style,
              ]}
              disabled={disabled || loading}
              activeOpacity={0.9}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
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
        </AnimatedBorder>
      ) : (
        // Regular button without gradient
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: buttonStyles.backgroundColor,
              paddingVertical: sizeStyles.paddingVertical,
              borderRadius: borderRadiusValue,
              borderWidth: 1,
              borderColor: buttonStyles.borderColor,
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
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  buttonContainer: {
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  innerButtonContainer: {
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    fontFamily: theme.typography.fontFamily.medium,
    textAlign: 'center',
  },
});

export default Button;
