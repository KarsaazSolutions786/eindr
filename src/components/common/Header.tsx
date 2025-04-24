import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import theme from '@theme/theme';

interface HeaderProps {
  showBackArrow?: boolean;
  onBackPress?: () => void;
  title?: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({
  showBackArrow = false,
  onBackPress,
  title = 'Eindr',
  subtitle = 'Forget Forgetting',
}) => {
  return (
    <View style={styles.header}>
      {showBackArrow && (
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={theme.colors.white} />
        </TouchableOpacity>
      )}
      <View style={[styles.titleContainer, !showBackArrow && styles.titleContainerCenter]}>
        <Text style={styles.logo}>{title}</Text>
        <Text style={styles.tagline}>{subtitle}</Text>
      </View>
      {/* Add empty view for proper spacing when back arrow is shown */}
      {showBackArrow && <View style={styles.backButtonPlaceholder} />}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  backButtonPlaceholder: {
    width: 44, // Same width as backButton including padding
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  titleContainerCenter: {
    marginLeft: 0, // No margin needed when back arrow is not shown
  },
  logo: {
    fontSize: theme.typography.fontSize['4xl'],
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.white,
    marginTop: theme.spacing.lg,
  },
  tagline: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
});

export default Header;
