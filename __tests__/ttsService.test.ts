import { speak, stop } from '../src/services/ttsService';
import Tts from 'react-native-tts';

jest.mock('react-native-tts', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
}));

describe('ttsService', () => {
  it('calls Tts.speak with provided text', () => {
    speak('hello');
    expect(Tts.speak).toHaveBeenCalledWith('hello');
  });

  it('stops speech', () => {
    stop();
    expect(Tts.stop).toHaveBeenCalled();
  });
});
