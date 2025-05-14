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
  // Create a new Animated.Value specifically for JS-driven animations
  const gradientPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // The key to a truly infinite animation is to use Animated.loop with correct configuration
    const animation = Animated.loop(
      Animated.timing(gradientPosition, {
        toValue: 1,
        duration: 4000, // 2 seconds for one cycle - faster for smoother perceived motion
        easing: Easing.linear, // Linear easing is essential for seamless looping
        useNativeDriver: false, // Must be false for translateX percentage animations
        isInteraction: false, // Prevent interaction tracking which can cause pauses
      }),
      { iterations: -1 }, // Infinite iterations
    );

    // Start the animation immediately
    animation.start();

    // Cleanup function
    return () => {
      animation.stop();
    };
  }, []);

  // Interpolate for a perfect continuous loop
  const translateX = gradientPosition.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '-100%'],
    extrapolate: 'clamp',
  });

  // Define the border width
  const borderWidth = 1;

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
    <View
      style={[
        {
          position: 'relative',
          borderRadius: borderRadius,
          overflow: 'hidden',
          padding: borderWidth,
        },
        shadowStyle,
      ]}>
      {/* The animated gradient layer */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: [{ translateX }],
          opacity: 0.5,
        }}>
        <LinearGradient
          colors={['#B2A1FF', '#FFFFFF', '#B2A1FF', '#FFFFFF', '#B2A1FF']}
          locations={[0, 0.25, 0.5, 0.75, 1]} // Evenly spaced for smooth transition
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ width: '200%', height: '100%', opacity: 0.95 }}
        />
      </Animated.View>

      {/* Button content container */}
      <View
        style={{
          overflow: 'hidden',
          borderRadius: Math.max(0, borderRadius - borderWidth),
          backgroundColor: theme.colors.background.primary,
        }}>
        {children}
      </View>
    </View>
  );
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
  gradientBorder = true, // Default to true for the gradient effect
  ...props
}) => {
  const buttonStyles = getButtonStyles(variant, disabled);
  const sizeStyles = getSizeStyles(size);

  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const borderRadiusValue = 16; // Fallback to 16 if not defined

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
