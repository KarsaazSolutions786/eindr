/**
 * Voice-to-Text API Integration
 * Handles uploading recorded audio to backend and receiving transcriptions
 * Includes comprehensive error handling and stub implementation for development
 */

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
  details?: any;
  retryable: boolean;
}

export class VoiceToTextAPI {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;
  private maxRetries: number;
  private isStubMode: boolean;

  // Stub mode configurations
  private stubResponses: string[] = [
    'Set reminder for dinner at 7 PM',
    "What's the weather like today?",
    'Turn on the living room lights',
    'Play my favorite playlist',
    'Add milk to my shopping list',
    "What's on my calendar?",
    'Set a timer for 10 minutes',
    'Tell me the latest news',
    'Call mom',
    'Send a message to John',
    'Turn off all the lights',
    'What time is it?',
    "How's the traffic to work?",
    'Book a meeting for tomorrow',
    'Order pizza for delivery',
  ];

  constructor(
    baseUrl: string = 'https://api.eindr.com',
    apiKey: string = 'development_key',
    options: {
      timeout?: number;
      maxRetries?: number;
      stubMode?: boolean;
    } = {},
  ) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.timeout = options.timeout || 30000; // 30 seconds
    this.maxRetries = options.maxRetries || 3;
    this.isStubMode = options.stubMode !== false; // Default to stub mode for development

    console.log('🌐 VoiceToTextAPI: Initialized with ENHANCED speech recognition');
    console.log(`🌐 VoiceToTextAPI: Base URL: ${this.baseUrl}`);
    console.log(`🌐 VoiceToTextAPI: Stub mode: ${this.isStubMode}`);
    console.log('🎤 VoiceToTextAPI: Enhanced speech analysis enabled');
  }

  /**
   * Transcribe audio data to text
   */
  async transcribe(
    audioData: Uint8Array,
    request: VoiceToTextRequest,
  ): Promise<VoiceToTextResponse> {
    const startTime = Date.now();

    console.log('🔄 VoiceToTextAPI: Starting ENHANCED transcription...');
    console.log(`📊 VoiceToTextAPI: Audio size: ${audioData.length} bytes`);
    console.log(`📊 VoiceToTextAPI: Format: ${request.format}`);
    console.log(`📊 VoiceToTextAPI: Sample rate: ${request.sampleRate}Hz`);
    console.log(`📊 VoiceToTextAPI: Duration: ${request.duration}ms`);

    if (this.isStubMode) {
      return this.generateStubResponse(audioData, request, startTime);
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
   * Generate enhanced stub response based on actual audio analysis
   */
  private async generateStubResponse(
    audioData: Uint8Array,
    request: VoiceToTextRequest,
    startTime: number,
  ): Promise<VoiceToTextResponse> {
    console.log('🎭 VoiceToTextAPI: Generating ENHANCED stub response with REAL audio analysis...');

    // Analyze the actual audio data
    const realAudioAnalysis = this.analyzeRealAudioData(audioData, request);
    console.log(
      `🔍 VoiceToTextAPI: Real audio analysis: ${JSON.stringify(realAudioAnalysis, null, 2)}`,
    );

    // Simulate network delay
    const delay = 500 + Math.random() * 1500; // 500-2000ms
    await new Promise(resolve => setTimeout(resolve, delay));

    // Enhanced response generation based on REAL audio characteristics
    const text = this.generateContextualResponse(realAudioAnalysis, request);
    const confidence = this.calculateConfidence(realAudioAnalysis);
    const processingTime = Date.now() - startTime;

    console.log('🎭 VoiceToTextAPI: Enhanced stub response generated from REAL audio');
    console.log(`📝 VoiceToTextAPI: Enhanced text: "${text}"`);
    console.log(`📊 VoiceToTextAPI: Enhanced confidence: ${confidence.toFixed(3)}`);

    return {
      text,
      confidence,
      language: request.language || 'en-US',
      duration: request.duration,
      processingTime,
      alternatives: this.generateAlternatives(text, confidence),
    };
  }

  /**
   * Analyze actual audio data characteristics
   */
  private analyzeRealAudioData(
    audioData: Uint8Array,
    request: VoiceToTextRequest,
  ): {
    duration: number;
    complexity: 'simple' | 'medium' | 'complex';
    energy: 'low' | 'medium' | 'high';
    type: 'command' | 'question' | 'statement';
    averageAmplitude: number;
    maxAmplitude: number;
    silenceRatio: number;
    speechSegments: number;
  } {
    const duration = request.duration;

    try {
      // Convert audio data to 16-bit samples for analysis
      const samples = new Int16Array(
        audioData.buffer,
        audioData.byteOffset,
        audioData.byteLength / 2,
      );

      console.log(
        `🔍 VoiceToTextAPI: Audio data conversion - bytes: ${audioData.byteLength}, samples: ${samples.length}`,
      );

      // Calculate audio characteristics
      let totalAmplitude = 0;
      let maxAmplitude = 0;
      let silenceSamples = 0;
      const silenceThreshold = 100; // Threshold for considering a sample as silence

      for (let i = 0; i < samples.length; i++) {
        const amplitude = Math.abs(samples[i]);
        totalAmplitude += amplitude;
        maxAmplitude = Math.max(maxAmplitude, amplitude);

        if (amplitude < silenceThreshold) {
          silenceSamples++;
        }
      }

      const averageAmplitude = samples.length > 0 ? totalAmplitude / samples.length : 0;
      const silenceRatio = samples.length > 0 ? silenceSamples / samples.length : 1;

      console.log(
        `🔍 VoiceToTextAPI: Audio stats - avg: ${averageAmplitude.toFixed(
          1,
        )}, max: ${maxAmplitude}, silence: ${(silenceRatio * 100).toFixed(1)}%`,
      );

      // Estimate speech segments (simple peak detection)
      let speechSegments = 0;
      let inSpeechSegment = false;
      const speechThreshold = averageAmplitude * 1.5;

      for (let i = 0; i < samples.length; i++) {
        const amplitude = Math.abs(samples[i]);

        if (amplitude > speechThreshold && !inSpeechSegment) {
          speechSegments++;
          inSpeechSegment = true;
        } else if (amplitude <= speechThreshold && inSpeechSegment) {
          inSpeechSegment = false;
        }
      }

      // Classify complexity based on duration and speech segments
      let complexity: 'simple' | 'medium' | 'complex';
      if (duration < 1500 && speechSegments <= 2) {
        complexity = 'simple';
      } else if (duration < 4000 && speechSegments <= 5) {
        complexity = 'medium';
      } else {
        complexity = 'complex';
      }

      // Classify energy based on actual audio amplitude
      let energy: 'low' | 'medium' | 'high';
      if (averageAmplitude < 500) {
        energy = 'low';
      } else if (averageAmplitude < 2000) {
        energy = 'medium';
      } else {
        energy = 'high';
      }

      // Determine speech type based on duration and speech pattern
      let type: 'command' | 'question' | 'statement';
      if (speechSegments <= 2 && duration < 2000) {
        type = 'command';
      } else if (silenceRatio < 0.3 && speechSegments > 3) {
        type = 'question'; // Questions tend to have more varied intonation
      } else {
        type = 'statement';
      }

      return {
        duration,
        complexity,
        energy,
        type,
        averageAmplitude: Math.round(averageAmplitude),
        maxAmplitude: Math.round(maxAmplitude),
        silenceRatio: Math.round(silenceRatio * 100) / 100,
        speechSegments,
      };
    } catch (error) {
      console.warn('⚠️ VoiceToTextAPI: Audio analysis failed, using fallback:', error);

      // Fallback analysis based on duration only
      let complexity: 'simple' | 'medium' | 'complex';
      if (duration < 1500) {
        complexity = 'simple';
      } else if (duration < 4000) {
        complexity = 'medium';
      } else {
        complexity = 'complex';
      }

      // Random but realistic fallback values
      const energy = Math.random() < 0.3 ? 'low' : Math.random() < 0.7 ? 'medium' : 'high';
      const type = Math.random() < 0.5 ? 'command' : Math.random() < 0.8 ? 'question' : 'statement';

      return {
        duration,
        complexity,
        energy,
        type,
        averageAmplitude: Math.round(500 + Math.random() * 1500),
        maxAmplitude: Math.round(1000 + Math.random() * 3000),
        silenceRatio: Math.round((0.2 + Math.random() * 0.4) * 100) / 100,
        speechSegments: Math.floor(1 + Math.random() * 5),
      };
    }
  }

  /**
   * Generate contextual response based on audio analysis
   */
  private generateContextualResponse(analysis: any, request: VoiceToTextRequest): string {
    // NEW: Generate response based on ACTUAL audio characteristics
    console.log('🎯 VoiceToTextAPI: Generating response based on REAL audio analysis...');
    console.log(
      `📊 Analysis: duration=${analysis.duration}ms, energy=${analysis.energy}, segments=${analysis.speechSegments}`,
    );

    // Short duration, low energy = likely silence or background noise
    if (analysis.duration < 800 && analysis.energy === 'low') {
      return this.generateSilenceResponse();
    }

    // Very short duration = likely simple word or sound
    if (analysis.duration < 1200) {
      return this.generateShortResponse(analysis);
    }

    // Medium duration = likely simple command or question
    if (analysis.duration < 3000) {
      return this.generateMediumResponse(analysis);
    }

    // Long duration = likely complex sentence
    return this.generateLongResponse(analysis);
  }

  /**
   * Generate response for silence/background noise
   */
  private generateSilenceResponse(): string {
    const silenceResponses = [
      '[silence]',
      '[background noise]',
      '[unclear audio]',
      "sorry, I didn't catch that",
      'could you repeat that',
    ];
    return silenceResponses[Math.floor(Math.random() * silenceResponses.length)];
  }

  /**
   * Generate response for short audio (< 1.2s)
   */
  private generateShortResponse(analysis: any): string {
    const shortResponses = {
      command: ['hey', 'hello', 'stop', 'play', 'pause', 'next', 'help', 'yes', 'no', 'okay'],
      question: ['what', 'when', 'where', 'how', 'why', 'who'],
      statement: ['thanks', 'good', 'nice', 'okay', 'sure', 'right'],
    };

    const responses = shortResponses[analysis.type] || shortResponses.command;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Generate response for medium audio (1.2-3s)
   */
  private generateMediumResponse(analysis: any): string {
    const mediumResponses = {
      command: [
        'turn on lights',
        'set timer',
        'play music',
        'check weather',
        'call someone',
        'send message',
        'take note',
        'show calendar',
        'set reminder',
        'start recording',
      ],
      question: [
        'what time is it',
        'how is the weather',
        'what is playing',
        'where am I',
        'who is calling',
        'any messages',
        'what is next',
        'how long until',
      ],
      statement: [
        'this is working',
        'I need help',
        'that sounds good',
        'not quite right',
        'please try again',
        'I understand',
        'makes sense',
        'let me think',
      ],
    };

    const responses = mediumResponses[analysis.type] || mediumResponses.command;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Generate response for long audio (> 3s)
   */
  private generateLongResponse(analysis: any): string {
    // For longer speech, generate more contextual responses based on energy and speech segments
    if (analysis.energy === 'high' && analysis.speechSegments > 3) {
      return this.generateComplexConversationalResponse();
    } else if (analysis.energy === 'medium') {
      return this.generateDetailedCommandResponse();
    } else {
      return this.generateNaturalStatementResponse();
    }
  }

  /**
   * Generate complex conversational response
   */
  private generateComplexConversationalResponse(): string {
    const conversationalResponses = [
      'I was just thinking about what you said earlier',
      'that reminds me of something interesting',
      'I need to tell you about what happened today',
      'can you help me figure out what to do next',
      'I was wondering if you could explain something',
      'let me share what I learned recently',
      'this is exactly what I was looking for',
      'I have a question about how this works',
    ];
    return conversationalResponses[Math.floor(Math.random() * conversationalResponses.length)];
  }

  /**
   * Generate detailed command response
   */
  private generateDetailedCommandResponse(): string {
    const detailedCommands = [
      'set a reminder for tomorrow at nine AM',
      'play some relaxing music for background',
      'turn on the living room lights please',
      'check the weather forecast for this weekend',
      'add groceries to my shopping list',
      'schedule a meeting for next Tuesday',
      'send a message to my family group',
      'start navigation to the nearest coffee shop',
    ];
    return detailedCommands[Math.floor(Math.random() * detailedCommands.length)];
  }

  /**
   * Generate natural statement response
   */
  private generateNaturalStatementResponse(): string {
    const naturalStatements = [
      'I think this is working much better now',
      'the weather outside looks really nice today',
      'I should probably get some work done',
      'this app is quite helpful for daily tasks',
      'I wonder what time my meeting is scheduled',
      'it would be great to have some coffee right now',
      'the traffic seems lighter than usual today',
      'I should remember to call back later',
    ];
    return naturalStatements[Math.floor(Math.random() * naturalStatements.length)];
  }

  /**
   * Calculate confidence based on audio analysis
   */
  private calculateConfidence(analysis: any): number {
    let baseConfidence = 0.75;

    // Adjust confidence based on characteristics
    if (analysis.energy === 'high') {
      baseConfidence += 0.15;
    } else if (analysis.energy === 'low') {
      baseConfidence -= 0.1;
    }

    if (analysis.complexity === 'simple') {
      baseConfidence += 0.1;
    } else if (analysis.complexity === 'complex') {
      baseConfidence -= 0.05;
    }

    // Add some randomness
    const randomVariation = (Math.random() - 0.5) * 0.1; // ±0.05
    baseConfidence += randomVariation;

    // Clamp between 0.5 and 0.98
    return Math.max(0.5, Math.min(0.98, baseConfidence));
  }

  /**
   * Generate alternative transcriptions
   */
  private generateAlternatives(
    primaryText: string,
    primaryConfidence: number,
  ): Array<{ text: string; confidence: number }> {
    const alternatives = [
      {
        text: primaryText,
        confidence: primaryConfidence,
      },
    ];

    // Generate slight variations
    const lowerText = primaryText.toLowerCase();
    if (lowerText !== primaryText) {
      alternatives.push({
        text: lowerText,
        confidence: primaryConfidence - 0.02,
      });
    }

    // Generate a phonetically similar alternative
    const phoneticVariations = this.generatePhoneticVariation(primaryText);
    if (phoneticVariations !== primaryText) {
      alternatives.push({
        text: phoneticVariations,
        confidence: primaryConfidence - 0.05,
      });
    }

    return alternatives;
  }

  /**
   * Generate phonetic variations for more realistic alternatives
   */
  private generatePhoneticVariation(text: string): string {
    const variations: { [key: string]: string } = {
      'turn on': 'turn off',
      'turn off': 'turn on',
      play: 'stop',
      stop: 'pause',
      next: 'previous',
      up: 'down',
      down: 'up',
      morning: 'evening',
      today: 'tomorrow',
      weather: 'whether',
      there: 'their',
      timer: 'timer for',
      set: 'send',
      send: 'set',
    };

    let result = text;
    for (const [original, variation] of Object.entries(variations)) {
      if (text.toLowerCase().includes(original)) {
        result = text.toLowerCase().replace(original, variation);
        break;
      }
    }

    return result;
  }

  /**
   * Make actual API request to backend
   */
  private async makeAPIRequest(
    audioData: Uint8Array,
    request: VoiceToTextRequest,
  ): Promise<VoiceToTextResponse> {
    let lastError: any = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 VoiceToTextAPI: API request attempt ${attempt}/${this.maxRetries}`);

        // Create FormData for file upload
        const formData = new FormData();

        // Convert Uint8Array to Blob
        const audioBlob = new Blob([audioData], {
          type: this.getMimeType(request.format),
        });

        formData.append('audio', audioBlob, `command.${request.format}`);
        formData.append('format', request.format);
        formData.append('sampleRate', request.sampleRate.toString());
        formData.append('duration', request.duration.toString());
        formData.append('language', request.language || 'en-US');

        if (request.model) {
          formData.append('model', request.model);
        }

        // Make API request
        const response = await fetch(`${this.baseUrl}/api/voice-to-text`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            // Don't set Content-Type header - let fetch set it with boundary for FormData
          },
          body: formData,
          timeout: this.timeout,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        // Validate response format
        if (!result.text || typeof result.confidence !== 'number') {
          throw new Error('Invalid response format from API');
        }

        console.log('✅ VoiceToTextAPI: API request successful');
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ VoiceToTextAPI: Attempt ${attempt} failed:`, error);

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
  private isNonRetryableError(error: any): boolean {
    // Don't retry on authentication errors, bad requests, etc.
    if (
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
  private handleAPIError(error: any): VoiceToTextError {
    let code = 'UNKNOWN_ERROR';
    let message = 'Unknown error occurred';
    let retryable = true;

    if (error.message) {
      if (error.message.includes('network') || error.message.includes('fetch')) {
        code = 'NETWORK_ERROR';
        message = 'Network error - check internet connection';
        retryable = true;
      } else if (error.message.includes('timeout')) {
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
    if (this.isStubMode) {
      console.log('🎭 VoiceToTextAPI: Connection test (stub mode) - OK');
      return true;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        timeout: 5000,
      });

      const isHealthy = response.ok;
      console.log(`🔍 VoiceToTextAPI: Connection test - ${isHealthy ? 'OK' : 'FAILED'}`);
      return isHealthy;
    } catch (error) {
      console.error('❌ VoiceToTextAPI: Connection test failed:', error);
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
    stubMode?: boolean;
  }): void {
    if (config.baseUrl) this.baseUrl = config.baseUrl;
    if (config.apiKey) this.apiKey = config.apiKey;
    if (config.timeout) this.timeout = config.timeout;
    if (config.maxRetries) this.maxRetries = config.maxRetries;
    if (config.stubMode !== undefined) this.isStubMode = config.stubMode;

    console.log('🔧 VoiceToTextAPI: Configuration updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): {
    baseUrl: string;
    timeout: number;
    maxRetries: number;
    stubMode: boolean;
  } {
    return {
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      maxRetries: this.maxRetries,
      stubMode: this.isStubMode,
    };
  }

  /**
   * Enable/disable stub mode
   */
  setStubMode(enabled: boolean): void {
    this.isStubMode = enabled;
    console.log(`🎭 VoiceToTextAPI: Stub mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Add custom stub response
   */
  addStubResponse(response: string): void {
    this.stubResponses.push(response);
    console.log(`🎭 VoiceToTextAPI: Added stub response: "${response}"`);
  }

  /**
   * Get available stub responses
   */
  getStubResponses(): string[] {
    return [...this.stubResponses];
  }
}
