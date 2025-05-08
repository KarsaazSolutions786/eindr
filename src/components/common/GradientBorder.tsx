import React from 'react';
import { View, StyleSheet, Platform, ViewStyle, StyleProp } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface GradientBorderProps {
  children: React.ReactNode;
  colors: string[];
  borderRadius?: number;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  angle?: number;
  locations?: number[];
}

/**
 * A cross-platform component for creating gradient borders that work on both iOS and Android.
 * On iOS, it uses a different technique to ensure all four sides of the border are visible.
 */
const GradientBorder: React.FC<GradientBorderProps> = ({
  children,
  colors,
  borderRadius = 8,
  padding = 1,
  style,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  angle = 45,
  locations = [0, 1],
}) => {
  // iOS-specific implementation
  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.iosBorderContainer, { borderRadius }, style]}>
        <LinearGradient
          colors={colors}
          useAngle={true}
          angle={angle}
          locations={locations}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.innerContainer,
            {
              borderRadius: borderRadius - padding,
              margin: padding,
            },
          ]}>
          {children}
        </View>
      </View>
    );
  }

  // Android implementation
  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      locations={locations}
      style={[styles.gradientBorder, { borderRadius, padding }, style]}>
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBorder: {
    padding: 1,
    backgroundColor: 'transparent',
  },
  iosBorderContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  innerContainer: {
    overflow: 'hidden',
  },
});

export default GradientBorder;
