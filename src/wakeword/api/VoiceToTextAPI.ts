/**
 * Voice-to-Text API Integration
 * Handles uploading recorded audio to backend and receiving transcriptions
 * Completely API-driven with no hardcoded responses
 */

import { Platform } from 'react-native';

// Helper function to detect if running on physical device
const isPhysicalDevice = (): boolean => {
  // This is a heuristic - react-native doesn't provide a direct way to detect this
  // In practice, you'd typically handle this via environment variables or build configs
  // For now, assume physical device if we're on Android (since most development is on physical devices)
  return Platform.OS === 'android'; // Assume physical device for Android for now
};

// Helper function to get network configuration instructions
const getNetworkInstructions = (): string => {
  if (Platform.OS === 'ios') {
    return isPhysicalDevice()
      ? "📱 Physical iOS Device: Use your computer's IP (e.g., http://192.168.1.100:8000)"
      : '📱 iOS Simulator: Using 192.168.100.137:8000 (backend must run on 0.0.0.0:8000)';
  } else if (Platform.OS === 'android') {
    return isPhysicalDevice()
      ? "📱 Physical Android Device: Use your computer's IP (e.g., http://192.168.1.100:8000)"
      : '📱 Android Emulator: Using 10.0.2.2:8000 (backend must run on 0.0.0.0:8000)';
  } else {
    return '📱 Unknown Platform: Configure baseUrl manually';
  }
};

// Platform-aware backend URL configuration
const getDefaultBaseUrl = (): string => {
  if (__DEV__) {
    // Development mode - handle different platforms
    // Backend confirmed working URLs:
    if (Platform.OS === 'ios') {
      // iOS Simulator: Backend recommends localhost:8000
      // For physical iOS device: Use your computer's IP address
      return 'http://192.168.100.137:8000';
    } else if (Platform.OS === 'android') {
      // Android Physical Device: Use host machine's IP address
      // Android Emulator: Use 10.0.2.2:8000 (but this is a physical device)
      return 'http://192.168.100.137:8000';
    } else {
      // Physical devices: Use your computer's IP address
      // Backend confirmed: http://192.168.100.137:8000
      console.log('🔧 Physical Device: Using verified IP address');
      return 'http://192.168.100.137:8000';
    }
  } else {
    // Production mode - use your production API URL
    return 'https://your-production-api.com';
  }
};

export interface VoiceToTextRequest {
  format: 'wav' | 'mp3' | 'opus';
  sampleRate: number;
  duration: number;
  language?: string;
  model?: string;
}

export interface VoiceToTextResponse {
  text: string;
  confidence: number;
  language: string;
  duration: number;
  processingTime: number;
  alternatives?: Array<{
    text: string;
    confidence: number;
  }>;
}

export interface VoiceToTextError {
  code: string;
  message: string;
  details?: Error | unknown;
  retryable: boolean;
}

export class VoiceToTextAPI {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;
  private maxRetries: number;

  // Audio data tracking for duplicate detection
  private lastAudioData: Uint8Array | null = null;
  private lastAudioHash: number = 0;
  private requestCount: number = 0;

  constructor(
    baseUrl: string = getDefaultBaseUrl(),
    apiKey: string = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImJhYTY0ZWZjMTNlZjIzNmJlOTIxZjkyMmUzYTY3Y2M5OTQxNWRiOWIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI1OTI0NjU1OTMzMC1uaWl0bTQzdDV0ZGtjaDdmaGRiamN1Zmo0bmgxM2hxdS5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6IjU5MjQ2NTU5MzMwLTM2Z3EwcGtkb29qa3FiYWdoZ29vMWUwZDVtY2pmcDk4LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTAxMzAyMzM4ODI4OTIxNjEzODMwIiwiZW1haWwiOiJ0NjgzMDU5OTZAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJUZXN0IiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0toRU1XZHFqTy1wR215eG5sVk5TQjlvY2VHYUFHY3dzYlREdWpxRy1tWTJvRUI9czk2LWMiLCJnaXZlbl9uYW1lIjoiVGVzdCIsImlhdCI6MTc0ODQxNDU3OCwiZXhwIjoxNzQ4NDE4MTc4fQ.NhKsBFa6bmJehwNKF67_FhxM13IRKL-cKrtHchcMQIuSb7cqYOr65GdOMh2pwc_oLgWxHmPo8qIWYUaTy-_H7VnP6qwQDo1wUV8g1_ez-H2dwoA1mA7FIJjazl7BXncwBC8YoGrkzAWJbS4e83kL3s9-KmY1YFJUSyJJ_PKCLJb09I6GPLhUDAcYCT2kIIkd0GUORv3G6YrzJzuBAa_Mj6iHS1CoTGSn7gUD9K6gpZvM9lXNSOvPDz0G1U-I5_do6IV5FimS_ENfAskUWWLOV7aY4L16BTzz8Du-IALOScYNlrFuukgh2J6UbJW0ihxXA5g2fNZbuOI_8u-c-7WJsw',
    options: {
      timeout?: number;
      maxRetries?: number;
    } = {},
  ) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.timeout = options.timeout || 30000; // 30 seconds
    this.maxRetries = options.maxRetries || 3;

    console.log('🌐 VoiceToTextAPI: Initialized for dynamic speech recognition');
    console.log(`🌐 VoiceToTextAPI: Base URL: ${this.baseUrl}`);
    console.log(`🌐 VoiceToTextAPI: Platform: ${Platform.OS}, Development: ${__DEV__}`);
    console.log(`🌐 VoiceToTextAPI: ${getNetworkInstructions()}`);
    console.log('🎤 VoiceToTextAPI: API-driven mode - no hardcoded responses');

    // Device diagnostic information
    console.log('📱 Device Diagnostics:');
    console.log(`   Platform OS: ${Platform.OS}`);
    console.log(`   Platform Version: ${Platform.Version}`);
    console.log(`   Is Physical Device: ${isPhysicalDevice()}`);
    console.log(`   Development Mode: ${__DEV__}`);

    if (Platform.OS === 'android') {
      console.log('🤖 Android Configuration:');
      console.log('   Network Security: Cleartext traffic enabled for 192.168.100.137');
      console.log(
        '   URL Priority: 192.168.100.137:8000 (physical device) → 10.0.2.2:8000 (emulator)',
      );
      console.log(
        '   Expected to work: Physical Android device should connect to 192.168.100.137:8000',
      );

      // Auto-test Android connectivity and update baseUrl if needed
      this.testAndroidEmulatorConnectivity()
        .then(success => {
          if (success) {
            console.log('✅ Android connectivity test passed');
          } else {
            console.error(
              '❌ Android connectivity test failed - manual intervention may be required',
            );
          }
        })
        .catch(error => {
          console.error('❌ Android connectivity test error:', error);
        });
    }
  }

  /**
   * Transcribe audio data to text using API
   */
  async transcribe(
    audioData: Uint8Array,
    request: VoiceToTextRequest,
  ): Promise<VoiceToTextResponse> {
    const startTime = Date.now();
    this.requestCount++;

    console.log('🔄 VoiceToTextAPI: Starting API transcription...');
    console.log(`📊 VoiceToTextAPI: Request #${this.requestCount}`);
    console.log(`📊 VoiceToTextAPI: Audio size: ${audioData.length} bytes`);
    console.log(`📊 VoiceToTextAPI: Format: ${request.format}`);
    console.log(`📊 VoiceToTextAPI: Sample rate: ${request.sampleRate}Hz`);
    console.log(`📊 VoiceToTextAPI: Duration: ${request.duration}ms`);

    // 🚨 CRITICAL: Check if this is the same audio data as last time
    const currentAudioHash = Array.from(audioData).reduce((hash, byte) => {
      return ((hash << 5) - hash + byte) & 0xffffffff;
    }, 0);

    console.log('🔍 VoiceToTextAPI: WAV File Analysis:');
    console.log(`   - Current audio hash: ${currentAudioHash}`);
    console.log(`   - Previous audio hash: ${this.lastAudioHash}`);
    console.log(`   - First 50 bytes: [${Array.from(audioData.slice(0, 50)).join(', ')}]`);
    console.log(`   - Last 20 bytes: [${Array.from(audioData.slice(-20)).join(', ')}]`);

    // Check WAV header
    if (audioData.length >= 44) {
      const wavHeader = Array.from(audioData.slice(0, 44));
      const riffHeader = String.fromCharCode(...wavHeader.slice(0, 4));
      const waveHeader = String.fromCharCode(...wavHeader.slice(8, 12));
      const fmtHeader = String.fromCharCode(...wavHeader.slice(12, 16));

      console.log('🎵 WAV Header Analysis:');
      console.log(`   - RIFF header: "${riffHeader}" (should be "RIFF")`);
      console.log(`   - WAVE header: "${waveHeader}" (should be "WAVE")`);
      console.log(`   - FMT header: "${fmtHeader}" (should be "fmt ")`);
      console.log(
        `   - File size in header: ${
          wavHeader[4] | (wavHeader[5] << 8) | (wavHeader[6] << 16) | (wavHeader[7] << 24)
        }`,
      );
      console.log(`   - Audio format: ${wavHeader[20] | (wavHeader[21] << 8)}`);
      console.log(`   - Channels: ${wavHeader[22] | (wavHeader[23] << 8)}`);
      console.log(
        `   - Sample rate: ${
          wavHeader[24] | (wavHeader[25] << 8) | (wavHeader[26] << 16) | (wavHeader[27] << 24)
        }`,
      );
    }

    // 🚨 DUPLICATE DETECTION
    if (this.lastAudioData && currentAudioHash === this.lastAudioHash) {
      console.error('🚨 VoiceToTextAPI: DUPLICATE AUDIO DETECTED!');
      console.error('   THE EXACT SAME WAV FILE IS BEING SENT REPEATEDLY!');
      console.error(`   This is request #${this.requestCount} with identical audio data`);
      console.error('   This explains why you always get the same transcription!');

      // Compare byte-by-byte to be absolutely sure
      if (this.lastAudioData.length === audioData.length) {
        let identicalBytes = 0;
        for (let i = 0; i < audioData.length; i++) {
          if (this.lastAudioData[i] === audioData[i]) {
            identicalBytes++;
          }
        }
        const similarity = (identicalBytes / audioData.length) * 100;
        console.error(`   Byte-level similarity: ${similarity.toFixed(2)}%`);

        if (similarity > 99) {
          console.error('   💀 CONFIRMED: Files are 99%+ identical!');
          console.error('   💀 The recording system is broken - not capturing new audio!');
        }
      }
    } else if (this.lastAudioData) {
      console.log('✅ VoiceToTextAPI: New audio data detected - different from previous recording');
      console.log(`   Hash changed: ${this.lastAudioHash} → ${currentAudioHash}`);
    } else {
      console.log('📝 VoiceToTextAPI: First audio recording for this session');
    }

    // Store current audio for next comparison
    this.lastAudioData = new Uint8Array(audioData);
    this.lastAudioHash = currentAudioHash;

    // 🎵 AUDIO CONTENT ANALYSIS
    console.log('🎵 Audio Content Analysis:');

    // Skip WAV header (44 bytes) and analyze actual audio data
    const audioContent = audioData.slice(44);
    if (audioContent.length > 0) {
      const totalSamples = audioContent.length / 2; // 16-bit = 2 bytes per sample
      let nonZeroSamples = 0;
      let maxAmplitude = 0;
      let amplitudeSum = 0;

      // Analyze 16-bit PCM samples
      for (let i = 0; i < audioContent.length - 1; i += 2) {
        const sample = audioContent[i] | (audioContent[i + 1] << 8);
        const signedSample = sample > 32767 ? sample - 65536 : sample;
        const amplitude = Math.abs(signedSample);

        if (amplitude > 0) nonZeroSamples++;
        if (amplitude > maxAmplitude) maxAmplitude = amplitude;
        amplitudeSum += amplitude;
      }

      const avgAmplitude = amplitudeSum / totalSamples;
      const silenceRatio = 1 - nonZeroSamples / totalSamples;
      const dynamicRange = maxAmplitude / 32768; // Normalize to 0-1

      console.log(`   - Total audio samples: ${totalSamples}`);
      console.log(`   - Non-zero samples: ${nonZeroSamples}`);
      console.log(`   - Silence ratio: ${(silenceRatio * 100).toFixed(1)}%`);
      console.log(
        `   - Max amplitude: ${maxAmplitude}/32768 (${(dynamicRange * 100).toFixed(1)}%)`,
      );
      console.log(`   - Average amplitude: ${avgAmplitude.toFixed(1)}`);

      if (silenceRatio > 0.99) {
        console.error('💀 CRITICAL: Audio is 99%+ silence!');
        console.error('   The microphone is not capturing any sound!');
      } else if (silenceRatio > 0.95) {
        console.warn('⚠️ WARNING: Audio is mostly silence (95%+)');
        console.warn('   Very little actual audio content detected');
      } else if (dynamicRange < 0.01) {
        console.warn('⚠️ WARNING: Very low audio levels detected');
        console.warn('   Audio might be too quiet or microphone gain too low');
      } else {
        console.log('✅ Audio content looks good - contains actual sound data');
      }

      // Show sample waveform (first 10 samples)
      const sampleWaveform = [];
      for (let i = 0; i < Math.min(20, audioContent.length - 1); i += 2) {
        const sample = audioContent[i] | (audioContent[i + 1] << 8);
        const signedSample = sample > 32767 ? sample - 65536 : sample;
        sampleWaveform.push(signedSample);
      }
      console.log(`   - First 10 samples: [${sampleWaveform.slice(0, 10).join(', ')}]`);
    }

    try {
      const response = await this.makeAPIRequest(audioData, request);
      const processingTime = Date.now() - startTime;

      console.log('✅ VoiceToTextAPI: Transcription completed');
      console.log(`📝 VoiceToTextAPI: Result: "${response.text}"`);
      console.log(`⏱️ VoiceToTextAPI: Processing time: ${processingTime}ms`);

      return {
        ...response,
        processingTime,
      };
    } catch (error) {
      console.error('❌ VoiceToTextAPI: Transcription failed:', error);
      throw this.handleAPIError(error);
    }
  }

  /**
   * Make API request to backend
   */
  private async makeAPIRequest(
    audioData: Uint8Array,
    request: VoiceToTextRequest,
  ): Promise<VoiceToTextResponse> {
    let lastError: Error | null = null;

    // For Android, try physical device URL first, then emulator URL as fallback
    const urlsToTry =
      Platform.OS === 'android'
        ? [
            'http://192.168.100.137:8000', // Direct IP for physical devices (try first)
            'http://10.0.2.2:8000', // Android emulator host mapping (fallback)
          ]
        : [this.baseUrl]; // Other platforms use configured baseUrl

    for (const baseUrl of urlsToTry) {
      console.log(`🔄 VoiceToTextAPI: Trying base URL: ${baseUrl}`);

      for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
        try {
          console.log(
            `🔄 VoiceToTextAPI: API request attempt ${attempt}/${this.maxRetries} to ${baseUrl}`,
          );

          // Generate unique request ID for cache-busting
          const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Analyze audio data before sending
          console.log('🔍 VoiceToTextAPI: Audio data analysis:');
          console.log(`   - Size: ${audioData.length} bytes`);
          console.log(`   - First 20 bytes: [${Array.from(audioData.slice(0, 20)).join(', ')}]`);
          console.log(`   - Last 20 bytes: [${Array.from(audioData.slice(-20)).join(', ')}]`);

          // Check if audio is all zeros (silence/empty)
          const nonZeroBytes = Array.from(audioData.slice(0, 1000)).filter(
            byte => byte !== 0,
          ).length;
          const silenceRatio = 1 - nonZeroBytes / Math.min(1000, audioData.length);
          console.log(`   - Non-zero bytes in first 1000: ${nonZeroBytes}`);
          console.log(`   - Silence ratio: ${(silenceRatio * 100).toFixed(1)}%`);

          // Generate audio fingerprint to detect duplicate audio
          const audioHash = Array.from(audioData.slice(0, 100)).reduce((hash, byte) => {
            return ((hash << 5) - hash + byte) & 0xffffffff;
          }, 0);
          console.log(`   - Audio fingerprint: ${audioHash}`);

          if (silenceRatio > 0.95) {
            console.warn(
              '⚠️ VoiceToTextAPI: Audio appears to be mostly silence - backend may return mock data',
            );
          }

          // Create FormData for file upload
          const formData = new FormData();

          // 🚨 CRITICAL FIX: Proper audio file creation for React Native
          try {
            console.log('🔧 VoiceToTextAPI: Creating audio file for upload...');

            // For React Native, we need to create a proper file object
            const audioFile = {
              uri: `data:audio/wav;base64,${this.uint8ArrayToBase64(audioData)}`,
              type: 'audio/wav',
              name: `audio_${Date.now()}_${Math.random().toString(36).substr(2, 8)}.wav`,
            };

            // Add the file to FormData - React Native specific format
            formData.append('audio_file', audioFile as unknown as Blob);

            // Add cache-busting metadata to prevent server-side caching
            formData.append('timestamp', Date.now().toString());
            formData.append('request_id', requestId);
            formData.append('client_id', 'react_native_app');
            formData.append('audio_hash', audioHash.toString());

            console.log('✅ VoiceToTextAPI: Audio file added to FormData');
            console.log(
              `📊 File details: ${audioFile.name}, ${audioFile.type}, ${audioData.length} bytes`,
            );
            console.log(
              `🔒 Cache-busting: timestamp=${Date.now()}, requestId=${requestId}, hash=${audioHash}`,
            );
          } catch (error) {
            console.error('❌ VoiceToTextAPI: Failed to create audio file:', error);
            throw new Error(`Failed to create audio file for upload: ${error}`);
          }

          console.log('📤 VoiceToTextAPI: Prepared FormData with audio_file field');

          // Create AbortController with longer timeout for Android
          const controller = new AbortController();
          const timeoutDuration = Platform.OS === 'android' ? 25000 : this.timeout; // 25s for Android, normal for others
          const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

          // Make API request to the endpoint - with cache-busting
          console.log(
            `📤 VoiceToTextAPI: Making request with ID: ${requestId} to ${baseUrl} (timeout: ${timeoutDuration}ms)`,
          );

          // Prepare headers for the request
          const headers: Record<string, string> = {
            Accept: 'application/json',
            'X-Request-ID': requestId,
          };

          // Add Firebase auth token if available
          if (this.apiKey && this.apiKey !== 'default') {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
          }

          // Make the request with proper CORS handling
          let response;
          try {
            response = await fetch(`${baseUrl}/api/v1/stt/transcribe-and-respond`, {
              method: 'POST',
              headers,
              body: formData,
              signal: controller.signal,
              mode: 'cors',
            });
          } catch (corsError) {
            console.warn(
              `⚠️ VoiceToTextAPI: Request failed for ${baseUrl}, trying test endpoint:`,
              corsError,
            );

            // Clear the original timeout
            clearTimeout(timeoutId);

            // Try the test endpoint first to verify CORS is working
            try {
              const testController = new AbortController();
              const testTimeoutId = setTimeout(() => testController.abort(), 10000); // 10s for test

              const testResponse = await fetch(`${baseUrl}/api/v1/stt/test-upload`, {
                method: 'POST',
                body: formData,
                signal: testController.signal,
                mode: 'cors',
              });

              clearTimeout(testTimeoutId);

              if (testResponse.ok) {
                const testData = await testResponse.json();
                console.log('✅ VoiceToTextAPI: Test upload successful:', testData);

                // If test works, the issue is likely authentication
                throw new Error(
                  'CORS is working but authentication may be required. Check Firebase token.',
                );
              }
            } catch (testError) {
              console.error('❌ VoiceToTextAPI: Test endpoint also failed:', testError);
            }

            throw corsError;
          }

          clearTimeout(timeoutId);

          console.log(`📡 VoiceToTextAPI: API response received from ${baseUrl}`);
          console.log(`📊 Response status: ${response.status} ${response.statusText}`);
          console.log(`📊 Response headers:`, {
            'content-type': response.headers.get('content-type'),
            'content-length': response.headers.get('content-length'),
            server: response.headers.get('server'),
            date: response.headers.get('date'),
          });

          if (!response.ok) {
            console.error(
              `❌ VoiceToTextAPI: HTTP error ${response.status}: ${response.statusText}`,
            );

            // Try to get error details from response
            try {
              const errorText = await response.text();
              console.error(`❌ VoiceToTextAPI: Error response body:`, errorText);
              throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            } catch (textError) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
          }

          const result = await response.json();

          // Log the complete API response
          console.log('📋 VoiceToTextAPI: Complete API Response:');
          console.log('📋 ===================================');
          console.log(JSON.stringify(result, null, 2));
          console.log('📋 ===================================');

          // Validate response format - handle actual backend response
          if (!result.success || !result.transcription) {
            console.error('❌ VoiceToTextAPI: Invalid response format:', result);
            throw new Error('Invalid response format from API');
          }

          console.log(`✅ VoiceToTextAPI: API request successful to ${baseUrl}`);
          console.log(`📝 Transcription: "${result.transcription}"`);
          console.log(`📊 Confidence: ${result.intent_result?.confidence || 'N/A'}`);
          console.log(`🌐 Language: ${result.language || 'N/A'}`);
          console.log(`⏱️ Duration: ${result.duration || 'N/A'}ms`);
          console.log(`💬 Response: "${result.response_text}"`);

          if (result.alternatives && result.alternatives.length > 0) {
            console.log('🔄 Alternatives:');
            result.alternatives.forEach(
              (alt: { text: string; confidence: number }, index: number) => {
                console.log(`   ${index + 1}. "${alt.text}" (${alt.confidence.toFixed(3)})`);
              },
            );
          }

          // Convert backend response to expected format
          return {
            text: result.transcription,
            confidence: result.intent_result?.confidence || 0.95,
            language: result.language || 'en-US',
            duration: result.duration || 0,
            processingTime: 0, // Will be set by caller
            alternatives: result.alternatives || [],
          };
        } catch (error) {
          lastError = error as Error;
          console.warn(`⚠️ VoiceToTextAPI: Attempt ${attempt} failed for ${baseUrl}:`, error);

          // Enhanced error logging for network issues
          if (error instanceof TypeError && error.message.includes('Network request failed')) {
            console.error('🌐 VoiceToTextAPI: Network connectivity issue detected');
            console.error(`🌐 Target URL: ${baseUrl}/api/v1/stt/transcribe-and-respond`);
            console.error('🌐 Possible causes:');
            console.error('   - Backend server is not running');
            console.error('   - Wrong URL or port');
            console.error('   - CORS issues (backend not configured for cross-origin requests)');
            console.error('   - Network connectivity problems');
            console.error('   - Mobile device cannot reach localhost');
            console.error('🔧 CORS Fix: Ensure backend has proper CORS headers:');
            console.error('   - Access-Control-Allow-Origin: *');
            console.error('   - Access-Control-Allow-Methods: POST, OPTIONS');
            console.error('   - Access-Control-Allow-Headers: Authorization, Content-Type');
          }

          // Handle CORS preflight and other CORS-related errors
          if (
            error instanceof TypeError &&
            (error.message.includes('CORS') ||
              error.message.includes('preflight') ||
              error.message.includes('Access-Control'))
          ) {
            console.error('🚫 VoiceToTextAPI: CORS error detected');
            console.error('🔧 Backend CORS configuration required');
          }

          // Don't retry on certain errors
          if (this.isNonRetryableError(error)) {
            break;
          }

          // Wait before retry (exponential backoff)
          if (attempt < this.maxRetries) {
            const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
            console.log(`⏳ VoiceToTextAPI: Waiting ${backoffDelay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
          }
        }
      }

      // If we got here, all retries for this URL failed, try next URL
      if (urlsToTry.length > 1) {
        console.log(`❌ VoiceToTextAPI: All retries failed for ${baseUrl}, trying next URL...`);
      }
    }

    // If we got here, all URLs failed
    console.error('❌ VoiceToTextAPI: All URLs failed:', urlsToTry);
    throw lastError;
  }

  /**
   * Get MIME type for audio format
   */
  private getMimeType(format: string): string {
    switch (format.toLowerCase()) {
      case 'wav':
        return 'audio/wav';
      case 'mp3':
        return 'audio/mpeg';
      case 'opus':
        return 'audio/opus';
      default:
        return 'audio/wav';
    }
  }

  /**
   * Check if error is non-retryable
   */
  private isNonRetryableError(error: unknown): boolean {
    // Don't retry on authentication errors, bad requests, etc.
    if (
      error instanceof Error &&
      error.message &&
      (error.message.includes('401') ||
        error.message.includes('400') ||
        error.message.includes('403'))
    ) {
      return true;
    }

    return false;
  }

  /**
   * Handle and format API errors
   */
  private handleAPIError(error: unknown): VoiceToTextError {
    let code = 'UNKNOWN_ERROR';
    let message = 'Unknown error occurred';
    let retryable = true;

    if (error instanceof Error && error.message) {
      if (error.message.includes('network') || error.message.includes('fetch')) {
        code = 'NETWORK_ERROR';
        message = 'Network error - check internet connection';
        retryable = true;
      } else if (error.message.includes('timeout') || error.name === 'AbortError') {
        code = 'TIMEOUT_ERROR';
        message = 'Request timed out - server may be busy';
        retryable = true;
      } else if (error.message.includes('401')) {
        code = 'AUTHENTICATION_ERROR';
        message = 'Authentication failed - check API key';
        retryable = false;
      } else if (error.message.includes('400')) {
        code = 'BAD_REQUEST';
        message = 'Invalid request format';
        retryable = false;
      } else if (error.message.includes('429')) {
        code = 'RATE_LIMITED';
        message = 'Rate limit exceeded - try again later';
        retryable = true;
      } else if (error.message.includes('500')) {
        code = 'SERVER_ERROR';
        message = 'Server error - try again later';
        retryable = true;
      }
    }

    return {
      code,
      message,
      details: error,
      retryable,
    };
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const isHealthy = response.ok;
      console.log(`🔍 VoiceToTextAPI: Connection test - ${isHealthy ? 'OK' : 'FAILED'}`);
      return isHealthy;
    } catch (error) {
      console.error('❌ VoiceToTextAPI: Connection test failed:', error);
      return false;
    }
  }

  /**
   * Test CORS configuration by making a preflight request
   */
  async testCORS(): Promise<boolean> {
    try {
      console.log('🔍 VoiceToTextAPI: Testing CORS configuration...');

      // For Android, try physical device URL first, then emulator URL as fallback
      const urlsToTry =
        Platform.OS === 'android'
          ? [
              'http://192.168.100.137:8000', // Direct IP for physical devices (try first)
              'http://10.0.2.2:8000', // Android emulator host mapping (fallback)
            ]
          : [this.baseUrl]; // Other platforms use configured baseUrl

      // Define timeout duration outside the loop to fix scope issue
      const timeoutDuration = Platform.OS === 'android' ? 25000 : 10000; // 25s for Android, 10s for others

      for (const baseUrl of urlsToTry) {
        try {
          console.log(`🔍 Testing CORS with POST to: ${baseUrl}`);

          // Create AbortController with longer timeout for Android
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

          const testFormData = new FormData();
          testFormData.append('test', 'cors-connectivity-test');

          const postResponse = await fetch(`${baseUrl}/api/v1/stt/transcribe-and-respond`, {
            method: 'POST',
            body: testFormData,
            signal: controller.signal,
            mode: 'cors',
          });

          clearTimeout(timeoutId);

          console.log(
            `📋 POST Test Response from ${baseUrl}: ${postResponse.status} ${postResponse.statusText}`,
          );
          console.log(`📋 POST Response Type: ${postResponse.type}`);
          console.log(`📋 POST Response OK: ${postResponse.ok}`);

          // Log response headers from the POST request
          console.log(`📋 POST Response Headers from ${baseUrl}:`);
          postResponse.headers.forEach((value, key) => {
            console.log(`   ${key}: ${value}`);
          });

          // Consider it successful if we get any response (even 400 is fine, means CORS is working)
          const isCorsWorking = postResponse.status !== 0 && postResponse.type !== 'opaque';

          if (isCorsWorking) {
            console.log(
              `✅ VoiceToTextAPI: CORS is working correctly with ${baseUrl} (POST request successful)`,
            );
            console.log('✅ Backend CORS configuration is properly handling React Native requests');

            // Try to read response body if possible
            try {
              if (postResponse.ok) {
                const responseData = await postResponse.json();
                console.log('📋 POST Response Data:', responseData);
              } else {
                const errorText = await postResponse.text();
                console.log('📋 POST Error Response:', errorText);
              }
            } catch (bodyError) {
              console.log('📋 Could not read POST response body:', bodyError);
            }

            return true;
          } else {
            console.log(
              `❌ VoiceToTextAPI: POST request failed for ${baseUrl} - Response status: ${postResponse.status}, type: ${postResponse.type}`,
            );
            // Continue to next URL
          }
        } catch (postError) {
          console.error(`❌ VoiceToTextAPI: POST request failed for ${baseUrl}:`, postError);

          // Detailed error analysis
          if (postError instanceof Error) {
            console.error(`   Error name: ${postError.name}`);
            console.error(`   Error message: ${postError.message}`);

            if (postError.name === 'AbortError') {
              console.error(
                `   🕐 Timeout: ${baseUrl} took longer than ${
                  timeoutDuration / 1000
                } seconds to respond`,
              );
              if (baseUrl.includes('10.0.2.2')) {
                console.error(
                  `   🔧 Android Emulator: Make sure backend is running on 0.0.0.0:8000`,
                );
                console.error(`   🔧 Check: uvicorn main:app --host 0.0.0.0 --port 8000`);
                console.error(`   🔧 Emulator is slow - tried ${timeoutDuration / 1000}s timeout`);
              } else {
                console.error(`   🔧 Network: ${baseUrl} not reachable from this device`);
              }
            } else if (postError.message.includes('Network request failed')) {
              console.error(`   🌐 Network failure: Device cannot reach ${baseUrl}`);
              if (baseUrl.includes('192.168.100.137')) {
                console.error(`   🔧 Try using your computer's actual IP address instead`);
              }
            } else if (postError.message.includes('CORS')) {
              console.error(`   🚫 CORS error: Backend CORS config issue with ${baseUrl}`);
            } else {
              console.error(`   ❓ Unknown error type for ${baseUrl}`);
            }
          } else {
            console.error(`   ❓ Non-Error exception:`, typeof postError, postError);
          }

          // Continue to next URL
        }
      }

      // If we get here, all URLs failed
      console.error('❌ VoiceToTextAPI: CORS test failed for all URLs');
      console.error('🔧 Android Emulator Troubleshooting:');
      console.error('   1. Check backend: uvicorn main:app --host 0.0.0.0 --port 8000');
      console.error('   2. Verify backend: curl http://192.168.100.137:8000/mobile-test');
      console.error('   3. Try physical device instead of emulator');
      console.error('   4. Check firewall settings allowing port 8000');
      return false;
    } catch (error) {
      console.error('❌ VoiceToTextAPI: CORS test failed:', error);

      // Provide specific error guidance
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('Aborted')) {
          console.error('🌐 VoiceToTextAPI: Connection timeout - Backend not accessible');
          console.error('🔧 Android Emulator Issue: Backend must listen on 0.0.0.0:8000');
          console.error('   Fix: uvicorn main:app --host 0.0.0.0 --port 8000');
          console.error('   Check: lsof -i :8000 (should show 0.0.0.0:8000)');
        } else if (error.message.includes('Network request failed')) {
          console.error('🌐 VoiceToTextAPI: Network connectivity issue');
          console.error('🔧 Ensure backend is running and accessible');
        } else {
          console.error('🔧 Unexpected error during CORS test');
        }
      } else {
        console.error('🔧 Unexpected error during CORS test');
      }

      return false;
    }
  }

  /**
   * Update API configuration
   */
  updateConfig(config: {
    baseUrl?: string;
    apiKey?: string;
    timeout?: number;
    maxRetries?: number;
  }): void {
    if (config.baseUrl) this.baseUrl = config.baseUrl;
    if (config.apiKey) this.apiKey = config.apiKey;
    if (config.timeout) this.timeout = config.timeout;
    if (config.maxRetries) this.maxRetries = config.maxRetries;

    console.log('🔧 VoiceToTextAPI: Configuration updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): {
    baseUrl: string;
    timeout: number;
    maxRetries: number;
  } {
    return {
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      maxRetries: this.maxRetries,
    };
  }

  /**
   * Convert Uint8Array to base64 string for React Native compatibility
   * Improved version with proper padding and error handling
   */
  private uint8ArrayToBase64(array: Uint8Array): string {
    if (!array || array.length === 0) {
      console.warn('⚠️ VoiceToTextAPI: Empty audio array provided to base64 conversion');
      return '';
    }

    try {
      let base64 = '';
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

      for (let i = 0; i < array.length; i += 3) {
        const byte1 = array[i] || 0;
        const byte2 = array[i + 1] || 0;
        const byte3 = array[i + 2] || 0;

        const triplet = (byte1 << 16) | (byte2 << 8) | byte3;

        const char1 = (triplet >> 18) & 63;
        const char2 = (triplet >> 12) & 63;
        const char3 = (triplet >> 6) & 63;
        const char4 = triplet & 63;

        base64 +=
          chars.charAt(char1) + chars.charAt(char2) + chars.charAt(char3) + chars.charAt(char4);
      }

      // Add proper padding
      const remainder = array.length % 3;
      if (remainder === 1) {
        base64 = base64.slice(0, -2) + '==';
      } else if (remainder === 2) {
        base64 = base64.slice(0, -1) + '=';
      }

      console.log(
        `🔧 VoiceToTextAPI: Base64 conversion: ${array.length} bytes → ${base64.length} chars`,
      );

      return base64;
    } catch (error) {
      console.error('❌ VoiceToTextAPI: Base64 conversion failed:', error);
      throw new Error(`Base64 conversion failed: ${error}`);
    }
  }

  /**
   * Simple network connectivity test without complex headers
   */
  async testSimpleConnectivity(): Promise<boolean> {
    try {
      console.log('🔍 VoiceToTextAPI: Testing simple connectivity...');

      // For Android, try multiple URLs like in the main API request
      const urlsToTry =
        Platform.OS === 'android'
          ? [
              'http://192.168.100.137:8000', // Direct IP for physical devices (try first)
              'http://10.0.2.2:8000', // Android emulator host mapping (fallback)
            ]
          : [this.baseUrl]; // Other platforms use configured baseUrl

      for (const baseUrl of urlsToTry) {
        try {
          console.log(`🔍 Testing connectivity to: ${baseUrl}`);

          // Test 1: Simple GET request to mobile-test endpoint
          const response = await fetch(`${baseUrl}/mobile-test`, {
            method: 'GET',
            mode: 'cors',
          });

          console.log(
            `✅ VoiceToTextAPI: Simple connectivity test response from ${baseUrl}: ${response.status}`,
          );
          console.log(`📊 Response headers:`, {
            'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
            'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
            'content-type': response.headers.get('content-type'),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('📋 Mobile test response:', data.message);
            console.log(`✅ VoiceToTextAPI: Connectivity successful to ${baseUrl}`);
            return true;
          }
        } catch (error) {
          console.log(`❌ Connectivity test failed for ${baseUrl}:`, error);
          // Continue to next URL
        }
      }

      console.error('❌ VoiceToTextAPI: All connectivity tests failed');
      return false;
    } catch (error) {
      console.error('❌ VoiceToTextAPI: Simple connectivity test failed:', error);
      return false;
    }
  }

  /**
   * Test connectivity by bypassing CORS entirely using a different endpoint
   */
  async testConnectivityBypass(): Promise<boolean> {
    try {
      console.log('🔍 VoiceToTextAPI: Testing connectivity bypass...');

      // For Android, try multiple URLs like in the main API request
      const urlsToTry =
        Platform.OS === 'android'
          ? [
              'http://192.168.100.137:8000', // Direct IP for physical devices (try first)
              'http://10.0.2.2:8000', // Android emulator host mapping (fallback)
            ]
          : [this.baseUrl]; // Other platforms use configured baseUrl

      for (const baseUrl of urlsToTry) {
        console.log(`🔍 Testing bypass connectivity to: ${baseUrl}`);

        // Try multiple approaches for each URL
        const tests = [
          // Test 1: Simple fetch without mode specification
          async () => {
            const response = await fetch(`${baseUrl}/mobile-test`, {
              method: 'GET',
            });
            return { name: 'Simple GET', status: response.status, ok: response.ok };
          },

          // Test 2: Fetch with no-cors mode (bypasses CORS but limited response access)
          async () => {
            const response = await fetch(`${baseUrl}/mobile-test`, {
              method: 'GET',
              mode: 'no-cors',
            });
            return { name: 'No-CORS GET', status: 'opaque', ok: response.type === 'opaque' };
          },

          // Test 3: Try the root endpoint which might have different CORS
          async () => {
            const response = await fetch(`${baseUrl}/`, {
              method: 'GET',
              mode: 'cors',
            });
            return { name: 'Root endpoint', status: response.status, ok: response.ok };
          },
        ];

        for (const test of tests) {
          try {
            console.log(`🔍 ${baseUrl}: Trying ${test.name || 'test'}...`);
            const result = await test();
            console.log(
              `📋 ${baseUrl} - ${result.name}: Status ${result.status}, OK: ${result.ok}`,
            );
            if (result.ok) {
              console.log(`✅ ${result.name} succeeded to ${baseUrl} - connectivity working`);
              return true;
            }
          } catch (error) {
            console.log(`❌ ${baseUrl} - ${test.name || 'test'} failed:`, error);

            // Analyze the error for this specific URL and test
            if (error instanceof Error) {
              if (error.name === 'AbortError') {
                console.log(`   🕐 ${baseUrl}: Request timed out`);
              } else if (error.message.includes('Network request failed')) {
                console.log(`   🌐 ${baseUrl}: Network unreachable`);
              } else if (error.message.includes('CORS')) {
                console.log(`   🚫 ${baseUrl}: CORS issue`);
              } else {
                console.log(`   ❓ ${baseUrl}: ${error.message}`);
              }
            }
          }
        }

        console.log(`❌ All tests failed for ${baseUrl}`);
      }

      console.error('❌ VoiceToTextAPI: All bypass connectivity tests failed');
      return false;
    } catch (error) {
      console.error('❌ VoiceToTextAPI: Connectivity bypass test failed:', error);
      return false;
    }
  }

  /**
   * Test if the device can make HTTP requests at all
   */
  async testBasicHTTPCapability(): Promise<boolean> {
    try {
      console.log('🔍 VoiceToTextAPI: Testing basic HTTP capability...');

      // Test with a public HTTP endpoint to verify HTTP requests work
      const publicTestUrl = 'http://httpbin.org/get';

      console.log(`🔍 Testing basic HTTP request to: ${publicTestUrl}`);

      const response = await fetch(publicTestUrl, {
        method: 'GET',
        mode: 'cors',
      });

      console.log(`📋 Public HTTP test: ${response.status} ${response.statusText}`);

      if (response.ok) {
        console.log('✅ Device can make HTTP requests - network capability confirmed');
        return true;
      } else {
        console.error('❌ Device HTTP request failed with status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ VoiceToTextAPI: Basic HTTP test failed:', error);

      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          console.error('🚫 Android device cannot make HTTP requests at all');
          console.error('🔧 Possible causes:');
          console.error('   - Android security policy blocking HTTP');
          console.error('   - Network connectivity issues');
          console.error('   - Cleartext traffic not properly enabled');
        }
      }

      return false;
    }
  }

  /**
   * Experimental test with different fetch configurations
   */
  async testExperimentalFetch(): Promise<boolean> {
    try {
      console.log('🔍 VoiceToTextAPI: Testing experimental fetch configurations...');

      const testUrl = 'http://192.168.100.137:8000/mobile-test';

      // Test 1: Minimal fetch configuration
      try {
        console.log('🔍 Test 1: Minimal fetch (no options)');
        const response1 = await fetch(testUrl);
        console.log(`📋 Minimal fetch: ${response1.status} ${response1.statusText}`);
        if (response1.ok) {
          console.log('✅ Minimal fetch succeeded!');
          return true;
        }
      } catch (error) {
        console.log('❌ Minimal fetch failed:', error);
      }

      // Test 2: No-cors mode
      try {
        console.log('🔍 Test 2: No-CORS mode');
        const response2 = await fetch(testUrl, { mode: 'no-cors' });
        console.log(
          `📋 No-CORS fetch: ${response2.status} ${response2.statusText}, type: ${response2.type}`,
        );
        if (response2.type === 'opaque') {
          console.log('✅ No-CORS fetch succeeded (opaque response)!');
          return true;
        }
      } catch (error) {
        console.log('❌ No-CORS fetch failed:', error);
      }

      // Test 3: Same-origin mode
      try {
        console.log('🔍 Test 3: Same-origin mode');
        const response3 = await fetch(testUrl, { mode: 'same-origin' });
        console.log(`📋 Same-origin fetch: ${response3.status} ${response3.statusText}`);
        if (response3.ok) {
          console.log('✅ Same-origin fetch succeeded!');
          return true;
        }
      } catch (error) {
        console.log('❌ Same-origin fetch failed:', error);
      }

      // Test 4: With explicit headers
      try {
        console.log('🔍 Test 4: With explicit headers');
        const response4 = await fetch(testUrl, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });
        console.log(`📋 Headers fetch: ${response4.status} ${response4.statusText}`);
        if (response4.ok) {
          console.log('✅ Headers fetch succeeded!');
          return true;
        }
      } catch (error) {
        console.log('❌ Headers fetch failed:', error);
      }

      // Test 5: XMLHttpRequest fallback
      try {
        console.log('🔍 Test 5: XMLHttpRequest fallback');
        const xhr = new XMLHttpRequest();

        return new Promise((resolve, reject) => {
          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              console.log(`📋 XHR result: ${xhr.status} ${xhr.statusText}`);
              if (xhr.status === 200) {
                console.log('✅ XMLHttpRequest succeeded!');
                resolve(true);
              } else {
                console.log('❌ XMLHttpRequest failed with status:', xhr.status);
                resolve(false);
              }
            }
          };

          xhr.onerror = error => {
            console.log('❌ XMLHttpRequest error:', error);
            resolve(false);
          };

          xhr.open('GET', testUrl, true);
          xhr.send();
        });
      } catch (error) {
        console.log('❌ XMLHttpRequest setup failed:', error);
      }

      console.error('❌ All experimental fetch methods failed');
      return false;
    } catch (error) {
      console.error('❌ VoiceToTextAPI: Experimental fetch test failed:', error);
      return false;
    }
  }

  /**
   * Comprehensive network diagnostics
   */
  async testComprehensiveNetworkDiagnostics(): Promise<void> {
    console.log('🔍 === COMPREHENSIVE NETWORK DIAGNOSTICS ===');

    // Test 1: Platform and environment info
    console.log('📱 Platform Information:');
    console.log(`   OS: ${Platform.OS}`);
    console.log(`   Version: ${Platform.Version}`);
    console.log(`   Dev Mode: ${__DEV__}`);

    // Test 2: Test public HTTPS endpoint (should work)
    try {
      console.log('🔍 Test 2: Public HTTPS endpoint');
      const httpsResponse = await fetch('https://httpbin.org/get', {
        method: 'GET',
        headers: { 'User-Agent': 'EindrApp/1.0' },
      });
      console.log(`   ✅ HTTPS: ${httpsResponse.status} - React Native can make HTTPS requests`);
    } catch (error) {
      console.log(`   ❌ HTTPS failed: ${error} - React Native networking broken`);
    }

    // Test 3: Test public HTTP endpoint (might fail due to security)
    try {
      console.log('🔍 Test 3: Public HTTP endpoint');
      const httpResponse = await fetch('http://httpbin.org/get', {
        method: 'GET',
        headers: { 'User-Agent': 'EindrApp/1.0' },
      });
      console.log(
        `   ✅ HTTP: ${httpResponse.status} - React Native allows HTTP to external hosts`,
      );
    } catch (error) {
      console.log(`   ❌ HTTP failed: ${error} - React Native blocking HTTP or network issue`);
    }

    // Test 4: Test local HTTPS (will fail but shows connection attempt)
    try {
      console.log('🔍 Test 4: Local HTTPS (will fail, but shows if connection is attempted)');
      const localHttpsResponse = await fetch('https://192.168.100.137:8000/mobile-test');
      console.log(`   ✅ Local HTTPS: ${localHttpsResponse.status}`);
    } catch (error) {
      console.log(`   ❌ Local HTTPS failed: ${error} - Expected (no SSL cert)`);
    }

    // Test 5: Test local HTTP with different configurations
    const localUrls = [
      'http://192.168.100.137:8000/mobile-test',
      'http://10.0.2.2:8000/mobile-test',
    ];

    for (const url of localUrls) {
      console.log(`🔍 Test 5: Local HTTP - ${url}`);

      // Test 5a: Minimal fetch
      try {
        const response = await fetch(url);
        console.log(`   ✅ Minimal: ${response.status} - Success!`);
        return; // If we get here, we found a working URL
      } catch (error) {
        console.log(`   ❌ Minimal: ${error}`);
      }

      // Test 5b: No-CORS fetch
      try {
        const response = await fetch(url, { mode: 'no-cors' });
        console.log(`   ✅ No-CORS: type=${response.type} - Partial success (can't read response)`);
      } catch (error) {
        console.log(`   ❌ No-CORS: ${error}`);
      }

      // Test 5c: With timeout
      try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 3000);
        const response = await fetch(url, { signal: controller.signal });
        console.log(`   ✅ Timeout: ${response.status} - Success with timeout!`);
        return;
      } catch (error) {
        console.log(`   ❌ Timeout: ${error}`);
      }
    }

    console.log('🔧 DIAGNOSIS COMPLETE - Check results above for root cause');
    console.log('🔧 If HTTPS works but HTTP fails: Android security policy blocking HTTP');
    console.log('🔧 If all external requests fail: React Native networking broken');
    console.log('🔧 If external works but local fails: Network routing issue');
  }

  /**
   * Alternative HTTP request using XMLHttpRequest
   */
  private async makeXHRRequest(
    url: string,
    formData: FormData,
    timeout: number = this.timeout,
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      console.log(`🔄 VoiceToTextAPI: Trying XMLHttpRequest to ${url}`);

      const xhr = new XMLHttpRequest();

      // Set up timeout
      const timeoutId = setTimeout(() => {
        xhr.abort();
        reject(new Error('XHR timeout'));
      }, timeout);

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          clearTimeout(timeoutId);

          console.log(`📋 XHR Response: ${xhr.status} ${xhr.statusText}`);
          console.log(`📋 XHR Response Headers: ${xhr.getAllResponseHeaders()}`);

          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              console.log('✅ XHR Success:', result);
              resolve(result);
            } catch (parseError) {
              console.error('❌ XHR JSON parse error:', parseError);
              reject(parseError);
            }
          } else {
            console.error(`❌ XHR HTTP error: ${xhr.status} ${xhr.statusText}`);
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        }
      };

      xhr.onerror = error => {
        clearTimeout(timeoutId);
        console.error('❌ XHR Network error:', error);
        reject(new Error('XHR Network request failed'));
      };

      xhr.onabort = () => {
        clearTimeout(timeoutId);
        console.error('❌ XHR Request aborted');
        reject(new Error('XHR Request aborted'));
      };

      try {
        xhr.open('POST', url, true);

        // Don't set Content-Type header - let the browser set it for FormData
        xhr.send(formData);

        console.log('📤 XHR Request sent');
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('❌ XHR Send error:', error);
        reject(error);
      }
    });
  }

  /**
   * Enhanced network diagnostics specifically for Android emulator issues
   */
  async testAndroidEmulatorConnectivity(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.log('🔍 Not Android - skipping Android emulator connectivity test');
      return true;
    }

    console.log('🔍 === ANDROID EMULATOR CONNECTIVITY DIAGNOSTICS ===');

    // Test URLs in order of likelihood to work
    const testUrls = [
      'http://192.168.100.137:8000', // Direct IP for physical devices
      'http://10.0.2.2:8000', // Android emulator host mapping
      'http://127.0.0.1:8000', // Local loopback
      'http://localhost:8000', // Local hostname
    ];

    for (const testUrl of testUrls) {
      console.log(`🔍 Testing: ${testUrl}`);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout for consistency

        const response = await fetch(`${testUrl}/mobile-test`, {
          method: 'GET',
          signal: controller.signal,
          mode: 'cors',
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ SUCCESS: ${testUrl} - ${data.message}`);
          console.log(`🔧 Use this URL in your app: ${testUrl}`);

          // Update the baseUrl to the working one
          this.baseUrl = testUrl;
          console.log(`🔄 Updated baseUrl to: ${this.baseUrl}`);

          return true;
        } else {
          console.log(`❌ HTTP Error: ${testUrl} - ${response.status}`);
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.log(`⏰ Timeout: ${testUrl} - took too long`);
          } else if (error.message.includes('Network request failed')) {
            console.log(`🌐 Network: ${testUrl} - unreachable`);
          } else {
            console.log(`❌ Error: ${testUrl} - ${error.message}`);
          }
        } else {
          console.log(`❌ Unknown: ${testUrl} - ${error}`);
        }
      }
    }

    console.log('❌ All Android URLs failed - backend connectivity issue');
    console.log('🔧 Possible solutions:');
    console.log('   1. Make sure backend runs: uvicorn main:app --host 0.0.0.0 --port 8000');
    console.log('   2. Check firewall settings on your computer');
    console.log('   3. Try restarting the Android emulator');
    console.log('   4. Use a physical Android device instead');

    return false;
  }
}

// Add this method for testing backend responses
export const testBackendResponse = async (): Promise<void> => {
  console.log('🧪 Testing backend response with different test data...');

  const api = new VoiceToTextAPI();

  // Create test audio files with different content
  const createTestAudio = (pattern: number): Uint8Array => {
    const headerSize = 44;
    const audioSize = 1000;
    const testAudio = new Uint8Array(headerSize + audioSize);

    // Fill with pattern
    for (let i = headerSize; i < testAudio.length; i++) {
      testAudio[i] = pattern + (i % 10);
    }

    return testAudio;
  };

  // Test with 3 different audio patterns
  const testPatterns = [100, 150, 200];

  for (let i = 0; i < testPatterns.length; i++) {
    const testAudio = createTestAudio(testPatterns[i]);
    console.log(`🧪 Test ${i + 1}: Sending audio with pattern ${testPatterns[i]}`);

    try {
      const response = await api.transcribe(testAudio, {
        format: 'wav',
        sampleRate: 16000,
        duration: 1000,
      });

      console.log(`🧪 Test ${i + 1} Response: "${response.text}"`);
    } catch (error) {
      console.error(`🧪 Test ${i + 1} Failed:`, error);
    }

    // Wait 1 second between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('🧪 Backend response test complete');
};
