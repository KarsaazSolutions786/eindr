import Toast from 'react-native-toast-message';

export const showToast = (type: 'success' | 'error' | 'info', message: string, title?: string) => {
  Toast.show({
    type,
    text1: title || (type.charAt(0).toUpperCase() + type.slice(1)),
    text2: message,
    position: 'bottom',
    visibilityTime: 3000,
  });
}; 