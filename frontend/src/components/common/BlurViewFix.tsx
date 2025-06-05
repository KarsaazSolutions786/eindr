import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ViewStyle, Platform, AccessibilityInfo } from 'react-native';
import { BlurView as RNBlurView } from '@react-native-community/blur';

interface BlurViewFixProps {
  blurType?: 'xlight' | 'light' | 'dark' | 'regular' | 'prominent' | string;
  blurAmount?: number;
  reducedTransparencyFallbackColor?: string;
  style?: ViewStyle;
  children?: React.ReactNode;
  overlayColor?: string;
}

/**
 * A wrapper around React Native BlurView that fixes common iOS issues
 * and provides better fallbacks for iOS devices with reduced transparency.
 */
const BlurViewFix: React.FC<BlurViewFixProps> = ({
  blurType = 'light',
  blurAmount = 10,
  reducedTransparencyFallbackColor = 'rgba(35, 36, 58, 0.8)',
  style,
  children,
  overlayColor,
}) => {
  const [isReducedTransparencyEnabled, setIsReducedTransparencyEnabled] = useState(false);

  // Check if the user has reduced transparency enabled
  useEffect(() => {
    if (Platform.OS === 'ios') {
      const checkReducedTransparency = async () => {
        const isReduced = await AccessibilityInfo.isReduceTransparencyEnabled();
        setIsReducedTransparencyEnabled(isReduced);
      };

      checkReducedTransparency();

      // Listen for changes in accessibility settings
      const listener = AccessibilityInfo.addEventListener('reduceTransparencyChanged', event => {
        setIsReducedTransparencyEnabled(event);
      });

      return () => {
        listener.remove();
      };
    }
  }, []);

  // Get the iOS version (if on iOS)
  const isiOS = Platform.OS === 'ios';
  const isOlderiOS = isiOS && parseInt(Platform.Version.toString(), 10) < 15;

  // If reduced transparency is enabled or on older iOS, use solid background fallback
  if (isReducedTransparencyEnabled || isOlderiOS) {
    return (
      <View
        style={[
          styles.fallbackContainer,
          { backgroundColor: reducedTransparencyFallbackColor },
          style,
        ]}>
        {children}
      </View>
    );
  }

  // Use regular BlurView with proper error handling
  return (
    <View style={[styles.container, style]}>
      <RNBlurView
        style={StyleSheet.absoluteFill}
        blurType={blurType}
        blurAmount={blurAmount}
        reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
        overlayColor={overlayColor}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  fallbackContainer: {
    overflow: 'hidden',
  },
});

export default BlurViewFix;
