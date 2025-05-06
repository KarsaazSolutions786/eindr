// src/services/WakeWordService.ts
import { PorcupineManager, BuiltInKeywords } from '@picovoice/porcupine-react-native';
import { VoiceProcessor } from '@picovoice/react-native-voice-processor';
import { Platform } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Config from 'react-native-config';

// Built-in wake words available immediately
export enum WakeWord {
  ALEXA = 'alexa',
  HEY_GOOGLE = 'hey google',
  PORCUPINE = 'porcupine', // Isko temporarily "eindr" samajh sakte hain
}

class WakeWordService {
  private isInitialized: boolean = false;
  private isListening: boolean = false;
  private wakeWordCallback: (() => void) | null = null;
  private porcupineManager: PorcupineManager | null = null;
  
  // Access key from .env file
  private readonly ACCESS_KEY = Config.PORCPINE_ACCESS_KEY || '';
  
  // Request microphone permission
  async requestPermissions(): Promise<boolean> {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.MICROPHONE 
        : PERMISSIONS.ANDROID.RECORD_AUDIO;
        
      const result = await request(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return false;
    }
  }
  
  // Initialize wake word detection
  async initialize(): Promise<boolean> {
    try {
      // Check if access key is available
      if (!this.ACCESS_KEY) {
        console.error('Porcupine access key not found in .env file');
        return false;
      }
      
      // Make sure we have permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.error('Microphone permission denied');
        return false;
      }
      
      // Initialize with wake word - select any built-in word here
      // HEY_GOOGLE ya ALEXA ya PORCUPINE use kar sakte hain
      this.porcupineManager = await PorcupineManager.fromBuiltInKeywords(
        this.ACCESS_KEY,
        [BuiltInKeywords.HEY_GOOGLE], // Change as needed
        this.onWakeWordDetected.bind(this)
      );
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize wake word detection:', error);
      return false;
    }
  }
  
  // Wake word detection callback
  private onWakeWordDetected(keywordIndex: number): void {
    console.log(`Wake word detected! Index: ${keywordIndex}`);
    
    if (this.wakeWordCallback) {
      this.wakeWordCallback();
    }
  }
  
  // Start listening for wake word
  async startListening(): Promise<boolean> {
    if (!this.isInitialized || !this.porcupineManager) {
      console.error('WakeWordService not initialized');
      return false;
    }
    
    if (this.isListening) {
      return true; // Already listening
    }
    
    try {
      await this.porcupineManager.start();
      this.isListening = true;
      console.log('Wake word detection started');
      return true;
    } catch (error) {
      console.error('Failed to start wake word detection:', error);
      return false;
    }
  }
  
  // Stop listening for wake word
  async stopListening(): Promise<boolean> {
    if (!this.isListening || !this.porcupineManager) {
      return true; // Already stopped
    }
    
    try {
      await this.porcupineManager.stop();
      this.isListening = false;
      console.log('Wake word detection stopped');
      return true;
    } catch (error) {
      console.error('Failed to stop wake word detection:', error);
      return false;
    }
  }
  
  // Set callback function for wake word detection
  setWakeWordCallback(callback: () => void): void {
    this.wakeWordCallback = callback;
  }
  
  // Clean up resources
  async cleanup(): Promise<void> {
    try {
      if (this.isListening && this.porcupineManager) {
        await this.stopListening();
      }
      
      if (this.porcupineManager) {
        await this.porcupineManager.delete();
        this.porcupineManager = null;
      }
      this.isInitialized = false;
    } catch (error) {
      console.error('Error cleaning up wake word service:', error);
    }
  }
  
  // Check if wake word detection is active
  isActive(): boolean {
    return this.isListening;
  }
}

// Singleton instance
export default new WakeWordService();