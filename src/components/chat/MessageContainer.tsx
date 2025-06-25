import React from 'react';
import { View, StyleSheet } from 'react-native';

interface MessageContainerProps {
  children?: React.ReactNode;
  style?: object;
}

/**
 * Minimal placeholder to satisfy existing imports after demo cleanup.
 * Replace with real chat UI when ready.
 */
const MessageContainer: React.FC<MessageContainerProps> = ({ children, style }) => {
  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MessageContainer;
