import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

export type OnVoiceCommand = (filePath: string) => void;

class VoiceCaptureService {
  private recorder = new AudioRecorderPlayer();
  private recording = false;
  private silenceMs = 0;
  private timer: NodeJS.Timeout | null = null;

  private readonly CHUNK_MS = 50; // meter every 50 ms
  private readonly SILENCE_MS_STOP = 800; // stop after 0.8 s silence

  start(onDone: OnVoiceCommand) {
    if (this.recording) return;

    const fileName = `cmd_${Date.now()}${Platform.OS === 'ios' ? '.m4a' : '.wav'}`;
    const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    const audioSet: any = {
      AudioEncoderAndroid: 3, // AAC
      AudioSourceAndroid: 6, // VOICE_RECOGNITION
      OutputFormatAndroid: 2, // MPEG_4
      AVEncoderAudioQualityKeyIOS: 'high',
      AVNumberOfChannelsKeyIOS: 1,
      AVFormatIDKeyIOS: 'wav',
      AVSampleRateKeyIOS: 16000,
      AudioSampleRateAndroid: 16000,
    };

    this.recorder.startRecorder(path, audioSet).then(() => {
      this.recording = true;
      this.timer = setInterval(() => this.tick(onDone), this.CHUNK_MS);
    });
  }

  private async tick(onDone: OnVoiceCommand) {
    try {
      const status: any = await this.recorder.getCurrentMetering();
      const level = status?.currentMetering ?? 0; // dBFS (iOS)
      if (level < -50) {
        this.silenceMs += this.CHUNK_MS;
      } else {
        this.silenceMs = 0;
      }
      if (this.silenceMs >= this.SILENCE_MS_STOP) {
        this.stop(onDone);
      }
    } catch {
      /* ignore metering failures */
    }
  }

  async stop(onDone?: OnVoiceCommand) {
    if (!this.recording) return;
    const filePath = await this.recorder.stopRecorder();
    if (this.timer) clearInterval(this.timer);
    this.recording = false;
    this.silenceMs = 0;
    onDone?.(filePath);
  }
}

export default new VoiceCaptureService();
