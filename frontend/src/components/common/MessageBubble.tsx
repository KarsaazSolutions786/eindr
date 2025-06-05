import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import theme from '@theme/theme';

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isUser }) => {
  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      {!isUser && (
        <View style={styles.aiProfileContainer}>
          <Image source={require('../../assets/Logo/ai.png')} style={styles.profilePicture} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={styles.messageText}>{message}</Text>
      </View>
      {isUser && (
        <View style={styles.userProfileContainer}>
          <Image source={require('../../assets/Logo/user.png')} style={styles.profilePicture} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 5,
    alignItems: 'flex-end',
    width: '100%',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 9,
    marginHorizontal: 8,
  },
  userBubble: {
    backgroundColor: theme.colors.accentStroke,
    borderBottomRightRadius: 0,
  },
  aiBubble: {
    backgroundColor: 'rgba(45, 47, 70, 0.8)',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.regular,
    lineHeight: 22,
  },
  timestamp: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 4,
    fontFamily: theme.typography.fontFamily.regular,
  },
  profilePicture: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: theme.colors.accentStroke,
    backgroundColor: theme.colors.background.secondary,
  },
  userProfileContainer: {
    marginLeft: 8,
  },
  aiProfileContainer: {
    marginRight: 8,
  },
});

export default MessageBubble;
