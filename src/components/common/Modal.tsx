// components/Modal.tsx
import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal as RNModal,
  Platform,
  ViewStyle,
  TextStyle,
  Dimensions,
} from 'react-native';
import theme from '@theme/theme';
import BlurViewFix from './BlurViewFix';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  primaryButton?: {
    text: string;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
  };
  secondaryButton?: {
    text: string;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
  };
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  blurIntensity?: number;
  blurType?:
    | 'dark'
    | 'light'
    | 'xlight'
    | 'prominent'
    | 'regular'
    | 'extraDark'
    | 'chromeMaterial'
    | 'material'
    | 'thickMaterial'
    | 'thinMaterial'
    | 'ultraThinMaterial';
  closeOnBackdropPress?: boolean;
  showCloseButton?: boolean;
}

const { width, height } = Dimensions.get('window');

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  primaryButton,
  secondaryButton,
  containerStyle,
  titleStyle,
  blurIntensity = 10,
  blurType = Platform.OS === 'ios' ? 'regular' : 'dark',
  closeOnBackdropPress = true,
  showCloseButton = false,
}) => {
  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  return (
    <RNModal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.modalBackdrop}>
          <BlurViewFix
            style={StyleSheet.absoluteFill}
            blurType={blurType}
            blurAmount={blurIntensity}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.6)"></BlurViewFix>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.modalContainer, containerStyle]}>
              {showCloseButton && (
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              )}

              {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}

              <View style={styles.content}>{children}</View>

              {(primaryButton || secondaryButton) && (
                <View style={styles.buttonContainer}>
                  {secondaryButton && (
                    <TouchableOpacity
                      style={[styles.button, styles.secondaryButton, secondaryButton.style]}
                      onPress={secondaryButton.onPress}>
                      <Text
                        style={[
                          styles.buttonText,
                          styles.secondaryButtonText,
                          secondaryButton.textStyle,
                        ]}>
                        {secondaryButton.text}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {primaryButton && (
                    <TouchableOpacity
                      style={[styles.button, styles.primaryButton, primaryButton.style]}
                      onPress={primaryButton.onPress}>
                      <Text
                        style={[
                          styles.buttonText,
                          styles.primaryButtonText,
                          primaryButton.textStyle,
                        ]}>
                        {primaryButton.text}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fallback if BlurView doesn't work
  },
  modalContainer: {
    width: width * 0.85,
    maxHeight: height * 0.7,
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.secondary,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  content: {
    width: '100%',
    marginVertical: theme.spacing.md,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    minWidth: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.xs,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
  },
  primaryButtonText: {
    color: theme.colors.white,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
  },
});

export default Modal;
