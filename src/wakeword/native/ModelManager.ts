import { loadTensorflowModel, type TensorflowModel } from 'react-native-fast-tflite';
import { ModelManager as IModelManager, ModelInputFeatures } from '../../types/wakeword';
import { MODEL_CONFIG } from '../../config/wakeword';

/**
 * TensorFlow Lite model manager for Mycroft Precise wake word detection
 * Handles model loading and inference using react-native-fast-tflite
 */
export class ModelManager implements IModelManager {
  private model: TensorflowModel | null = null;
  private isModelLoaded: boolean = false;
  private readonly modelConfig = MODEL_CONFIG;

  /**
   * Load the TensorFlow Lite model from app assets
   */
  async loadModel(modelPath: string): Promise<void> {
    try {
      console.log('Loading TensorFlow Lite model from:', modelPath);

      // Load model using react-native-fast-tflite
      // The modelPath should be a require() statement for bundled assets
      // e.g., require('../../assets/models/eindr_complete.tflite')
      this.model = await loadTensorflowModel(modelPath);

      this.isModelLoaded = true;
      console.log('Model loaded successfully');

      // Validate model input/output shapes
      await this.validateModel();
    } catch (error) {
      this.isModelLoaded = false;
      console.error('Failed to load TensorFlow Lite model:', error);
      throw new Error(`Model loading failed: ${error}`);
    }
  }

  /**
   * Run inference on audio features
   * @param features Processed audio features matching model input requirements
   * @returns Confidence score (0-1) for wake word detection
   */
  async predict(features: ModelInputFeatures): Promise<number> {
    if (!this.model || !this.isModelLoaded) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    try {
      // Expected input shape for eindr_complete.tflite: [1, 29, 13]
      const expectedShape = [1, 29, 13];

      // Ensure input shape matches model requirements
      if (!this.validateInputShape(features.shape, expectedShape)) {
        throw new Error(
          `Input shape mismatch. Expected: ${expectedShape.join('x')}, Got: ${features.shape.join(
            'x',
          )}`,
        );
      }

      // Run inference
      const outputs = await this.model.run([features.features]);

      // Extract confidence score from model output
      // Mycroft Precise models typically output a single confidence value
      const confidence = this.extractConfidence(outputs);

      return confidence;
    } catch (error) {
      console.error('Inference failed:', error);
      throw new Error(`Inference failed: ${error}`);
    }
  }

  /**
   * Run synchronous inference (faster, but blocks thread)
   * Use this for real-time wake word detection
   */
  predictSync(features: ModelInputFeatures): number {
    if (!this.model || !this.isModelLoaded) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    try {
      // Expected input shape for eindr_complete.tflite: [1, 29, 13]
      const expectedShape = [1, 29, 13];

      // Ensure input shape matches model requirements
      if (!this.validateInputShape(features.shape, expectedShape)) {
        throw new Error(
          `Input shape mismatch. Expected: ${expectedShape.join('x')}, Got: ${features.shape.join(
            'x',
          )}`,
        );
      }

      // Run synchronous inference
      const outputs = this.model.runSync([features.features]);

      // Extract confidence score from model output
      const confidence = this.extractConfidence(outputs);

      return confidence;
    } catch (error) {
      console.error('Synchronous inference failed:', error);
      throw new Error(`Synchronous inference failed: ${error}`);
    }
  }

  /**
   * Check if model is loaded and ready
   */
  isLoaded(): boolean {
    return this.isModelLoaded && this.model !== null;
  }

  /**
   * Unload the model and free resources
   */
  unload(): void {
    if (this.model) {
      // react-native-fast-tflite handles garbage collection automatically
      this.model = null;
    }
    this.isModelLoaded = false;
    console.log('Model unloaded');
  }

  /**
   * Get model information for debugging
   */
  getModelInfo(): {
    loaded: boolean;
    inputShape: number[];
    outputShape: number[];
  } {
    return {
      loaded: this.isModelLoaded,
      inputShape: [1, 29, 13], // eindr_complete.tflite input shape
      outputShape: [1, 1], // eindr_complete.tflite output shape
    };
  }

  /**
   * Validate that the loaded model has expected input/output shapes
   */
  private async validateModel(): Promise<void> {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    try {
      // Create dummy input to test model - eindr_complete.tflite expects [1, 29, 13]
      const inputSize = 1 * 29 * 13; // 377 features
      const dummyInput = new Float32Array(inputSize);
      dummyInput.fill(0); // Fill with zeros

      // Test inference with dummy data
      const outputs = await this.model.run([dummyInput]);

      if (!outputs || outputs.length === 0) {
        throw new Error('Model produced no outputs');
      }

      // Validate output shape - eindr_complete.tflite should output single value
      const output = outputs[0];
      if (output.length !== 1) {
        console.warn(
          `Output shape unexpected. Expected: 1, Got: ${output.length} (this may be okay)`,
        );
      }

      console.log('Model validation passed');
    } catch (error) {
      throw new Error(`Model validation failed: ${error}`);
    }
  }

  /**
   * Validate input feature shape
   */
  private validateInputShape(inputShape: number[], expectedShape: number[]): boolean {
    if (inputShape.length !== expectedShape.length) {
      return false;
    }

    for (let i = 0; i < inputShape.length; i++) {
      if (inputShape[i] !== expectedShape[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Extract confidence score from model outputs
   * Handles different output formats from Mycroft Precise models
   */
  private extractConfidence(outputs: Float32Array[]): number {
    if (!outputs || outputs.length === 0) {
      throw new Error('No model outputs');
    }

    const output = outputs[0];

    // Handle different output formats
    if (output.length === 1) {
      // Single confidence value (most common for Mycroft Precise)
      return Math.max(0, Math.min(1, output[0])); // Clamp to [0, 1]
    } else if (output.length === 2) {
      // Binary classification [not_wake_word, wake_word]
      return Math.max(0, Math.min(1, output[1])); // Take wake word probability
    } else {
      // For other formats, take the maximum value
      const maxValue = Math.max(...Array.from(output));
      return Math.max(0, Math.min(1, maxValue));
    }
  }

  /**
   * Warm up the model with dummy inference
   * Call this after loading to optimize first real inference
   */
  async warmUp(): Promise<void> {
    if (!this.model || !this.isModelLoaded) {
      throw new Error('Model not loaded');
    }

    console.log('Warming up model...');

    try {
      // Create dummy input
      const dummyFeatures: ModelInputFeatures = {
        features: new Float32Array(this.modelConfig.inputShape.reduce((a, b) => a * b, 1)),
        shape: this.modelConfig.inputShape,
      };

      // Run several warm-up inferences
      for (let i = 0; i < 3; i++) {
        await this.predict(dummyFeatures);
      }

      console.log('Model warm-up completed');
    } catch (error) {
      console.warn('Model warm-up failed:', error);
      // Don't throw - warm-up failure shouldn't prevent usage
    }
  }

  /**
   * Get model performance metrics
   */
  async benchmark(iterations: number = 100): Promise<{
    averageInferenceTime: number;
    minInferenceTime: number;
    maxInferenceTime: number;
  }> {
    if (!this.model || !this.isModelLoaded) {
      throw new Error('Model not loaded');
    }

    const times: number[] = [];
    const dummyFeatures: ModelInputFeatures = {
      features: new Float32Array(this.modelConfig.inputShape.reduce((a, b) => a * b, 1)),
      shape: this.modelConfig.inputShape,
    };

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      this.predictSync(dummyFeatures);
      const endTime = performance.now();
      times.push(endTime - startTime);
    }

    return {
      averageInferenceTime: times.reduce((a, b) => a + b, 0) / times.length,
      minInferenceTime: Math.min(...times),
      maxInferenceTime: Math.max(...times),
    };
  }
}
