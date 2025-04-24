import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle, TouchableOpacityProps } from 'react-native';
import theme from '@theme/theme';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface SocialButtonProps extends TouchableOpacityProps {
  iconName: string; // e.g., 'google', 'facebook', 'apple'
  size?: number;
  iconSize?: number;
  style?: ViewStyle; // Style for the TouchableOpacity container
  iconColor?: string;
  borderColor?: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  iconName,
  size = 50, // Default size for the button circle
  iconSize, // Default icon size will be derived from button size
  style,
  iconColor = theme.colors.text.primary, // Default to primary text color (white in dark theme)
  borderColor = theme.colors.text.secondary, // Default to secondary text color (light gray/lavender)
  onPress,
  ...props
}) => {
  const defaultIconSize = size * 0.5; // Calculate a default icon size based on button size

  return (
    <TouchableOpacity onPress={onPress} style={style} activeOpacity={0.7} {...props}>
      <View
        style={[
          styles.iconWrapper,
          {
            width: size,
            height: size,
            borderRadius: size / 2, // Make it circular
            borderColor: borderColor,
          },
        ]}>
        <FontAwesome
          name={iconName}
          size={iconSize ?? defaultIconSize} // Use provided iconSize or default
          color={iconColor}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1, // Border width as seen in image
    backgroundColor: 'transparent', // No background color needed for this style
  },
});

export default SocialButton;
