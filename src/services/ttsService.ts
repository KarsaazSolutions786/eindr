import Tts from 'react-native-tts';

export const speak = (text: string) => {
  Tts.stop();
  Tts.speak(text);
};

export const stop = () => {
  Tts.stop();
};
