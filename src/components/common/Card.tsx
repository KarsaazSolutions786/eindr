import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import theme from '@theme/theme';

interface CardProps extends TouchableOpacityProps {
  variant?: 'elevated' | 'outlined' | 'flat';
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  children,
  style,
  onPress,
  ...props
}) => {
  const getCardStyle = () => {
    switch (variant) {
      case 'elevated':
        return styles.elevated;
      case 'outlined':
        return styles.outlined;
      case 'flat':
        return styles.flat;
      default:
        return styles.elevated;
    }
  };

  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      style={[styles.container, getCardStyle(), style]}
      onPress={onPress}
      activeOpacity={0.7}
      {...props}
    >
      {children}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.primary,
    overflow: 'hidden',
  },
  elevated: {
    ...theme.shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  flat: {
    backgroundColor: theme.colors.background.secondary,
  },
});

export default Card; 