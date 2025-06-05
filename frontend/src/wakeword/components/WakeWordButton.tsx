import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { WakeWordState } from '../../types/wakeword';

interface WakeWordButtonProps {
  /** Current wake word state */
  state: WakeWordState;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Custom size for the button */
  size?: number;
  /** Callback for button press */
  onPress?: () => void;
  /** Custom styles */
  style?: any;
  /** Show state text */
  showStateText?: boolean;
}

/**
 * Wake word button component with animated visual feedback
 */
export const WakeWordButton: React.FC<WakeWordButtonProps> = ({
  state,
  disabled = false,
  size = 80,
  onPress,
  style,
  showStateText = true,
}) => {
  const animatedValue = React.useRef(new Animated.Value(1)).current;

  // Animate based on state
  React.useEffect(() => {
    let animation: Animated.CompositeAnimation;

    switch (state) {
      case WakeWordState.LISTENING:
        // Pulsing animation
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1.2,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        );
        animation.start();
        break;

      case WakeWordState.DETECTED:
        // Quick flash animation
        animation = Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1.3,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]);
        animation.start();
        break;

      case WakeWordState.RECORDING:
        // Faster pulsing
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1.1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        );
        animation.start();
        break;

      default:
        // Reset to normal
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
        break;
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [state, animatedValue]);

  const getButtonColor = (): string => {
    switch (state) {
      case WakeWordState.LISTENING:
        return '#4CAF50'; // Green
      case WakeWordState.DETECTED:
        return '#FF9800'; // Orange
      case WakeWordState.RECORDING:
        return '#F44336'; // Red
      case WakeWordState.PROCESSING:
        return '#2196F3'; // Blue
      case WakeWordState.ERROR:
        return '#9E9E9E'; // Gray
      default:
        return '#6200EE'; // Purple
    }
  };

  const getStateText = (): string => {
    switch (state) {
      case WakeWordState.IDLE:
        return 'Tap to Start';
      case WakeWordState.LISTENING:
        return 'Listening...';
      case WakeWordState.DETECTED:
        return 'Wake Word Detected!';
      case WakeWordState.RECORDING:
        return 'Recording...';
      case WakeWordState.PROCESSING:
        return 'Processing...';
      case WakeWordState.ERROR:
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getStateIcon = (): string => {
    switch (state) {
      case WakeWordState.IDLE:
        return '🎤';
      case WakeWordState.LISTENING:
        return '👂';
      case WakeWordState.DETECTED:
        return '✨';
      case WakeWordState.RECORDING:
        return '🔴';
      case WakeWordState.PROCESSING:
        return '⚡';
      case WakeWordState.ERROR:
        return '❌';
      default:
        return '🎤';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: getButtonColor(),
            opacity: disabled ? 0.5 : 1,
          },
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}>
        <Animated.View
          style={[
            styles.innerButton,
            {
              transform: [{ scale: animatedValue }],
            },
          ]}>
          <Text style={[styles.icon, { fontSize: size / 3 }]}>{getStateIcon()}</Text>
        </Animated.View>
      </TouchableOpacity>

      {showStateText && (
        <Text style={[styles.stateText, { marginTop: size / 8 }]}>{getStateText()}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  innerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  icon: {
    textAlign: 'center',
  },
  stateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
});
