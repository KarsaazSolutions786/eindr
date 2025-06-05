// components/OtpInput.tsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Keyboard,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import theme from '@theme/theme';

interface OtpInputProps {
  code: string[];
  setCode: (code: string[]) => void;
  maxLength: number;
  cellStyle?: TextStyle;
  containerStyle?: ViewStyle;
  autoFocus?: boolean;
  onComplete?: (code: string) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({
  code,
  setCode,
  maxLength,
  cellStyle,
  containerStyle,
  autoFocus = false,
  onComplete,
}) => {
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    // Focus first input on mount if autoFocus is true
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    // Check if code is complete
    if (code.length === maxLength && !code.includes('') && onComplete) {
      onComplete(code.join(''));
    }
  }, [code, maxLength, onComplete]);

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste event
      const pastedText = text.split('');
      const newCode = [...code];

      for (let i = 0; i < Math.min(pastedText.length, maxLength - index); i++) {
        if (/^\d+$/.test(pastedText[i])) {
          newCode[index + i] = pastedText[i];
        }
      }
      setCode(newCode);

      // Focus on appropriate input after paste
      const focusIndex = Math.min(index + pastedText.length, maxLength - 1);
      if (inputRefs.current[focusIndex]) {
        inputRefs.current[focusIndex].focus();
      } else {
        Keyboard.dismiss();
      }
      return;
    }

    // Handle single digit input
    if (/^\d*$/.test(text)) {
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);

      // Move to next input if current input is filled
      if (text && index < maxLength - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Dismiss keyboard if last input is filled
      if (text && index === maxLength - 1) {
        setTimeout(() => Keyboard.dismiss(), 100);
      }
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      // Move focus to previous input on backspace when current input is empty
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {Array.from({ length: maxLength }).map((_, index) => (
        <TextInput
          key={index}
          ref={ref => {
            inputRefs.current[index] = ref;
          }}
          style={[styles.cell, cellStyle]}
          value={code[index] || ''}
          onChangeText={text => handleChange(text, index)}
          onKeyPress={e => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          textContentType="oneTimeCode"
          returnKeyType="next"
          selectionColor={theme.colors.accentStroke}
          cursorColor={theme.colors.accentStroke}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  cell: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: theme.colors.border.primary,
    borderRadius: theme.borderRadius.md,
    textAlign: 'center',
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.secondary,
  },
});

export default OtpInput;
