// LinearGradientBackground.tsx
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import theme, { gradients } from './theme';

type GradientType = keyof typeof gradients;

interface LinearGradientBackgroundProps {
  gradientType?: GradientType;
  style?: ViewStyle;
  children?: React.ReactNode;
}

const LinearGradientBackground: React.FC<LinearGradientBackgroundProps> = ({
  gradientType = 'primary',
  style,
  children,
}) => {
  const gradientConfig = gradients[gradientType];

  return (
    <LinearGradient
      colors={gradientConfig.colors}
      locations={gradientConfig.locations}
      start={gradientConfig.start}
      end={gradientConfig.end}
      style={[styles.gradient, style]}>
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default LinearGradientBackground;
