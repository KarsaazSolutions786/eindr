import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ViewStyle,
} from 'react-native';
import theme from '@theme/theme';
import MessageBubble from '../common/MessageBubble';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface MessageContainerProps {
  messages: Message[];
  style?: ViewStyle;
}

const MessageContainer: React.FC<MessageContainerProps> = ({ messages, style }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [headerOpacity] = useState(new Animated.Value(1));

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const newOpacity = Math.max(0, 1 - offsetY / 100); // Fade out over 100px scroll
    headerOpacity.setValue(newOpacity);
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [
              {
                translateY: headerOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}>
        <Text style={styles.headerText}>Say "Hey Eindr" to activate</Text>
      </Animated.View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}>
        {messages.map(message => (
          <MessageBubble
            key={message.id}
            message={message.text}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  headerText: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing['7xl'],
  },
});

export default MessageContainer;
