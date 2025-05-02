import React from 'react';
import { View, TextInput, StyleSheet, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import theme from '@theme/theme';

const NoteEdit = () => {
  const route = useRoute();
  // Expecting params: { id, content }
  const { content } = route.params as { id: string; content: string };
  const [text, setText] = React.useState(content);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#141524" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <LinearGradient
            colors={['rgba(196,183,255,0.5)', 'rgba(245,243,255,0.5)']}
            start={{ x: 1, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBorder}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={text}
                onChangeText={setText}
                multiline
                placeholder="Start typing..."
                placeholderTextColor={theme.colors.text.placeholder}
                textAlignVertical="top"
              />
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor: '#141524',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    // backgroundColor: '#141524',
  },
  formContainer: {
    width: '100%',
    marginTop: 130,
    alignItems: 'center',
  },
  gradientBorder: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 2,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    backgroundColor: 'rgba(58, 56, 56, 0.95)',
    borderRadius: 16,
    minHeight: 320,
    justifyContent: 'center',
  },
  input: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    padding: 18,
    minHeight: 300,
    maxHeight: 500,
    width: '100%',
    backgroundColor: 'transparent',
  },
});

export default NoteEdit;
