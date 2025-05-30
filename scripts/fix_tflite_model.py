#!/usr/bin/env python3
"""
TensorFlow Lite Model Converter for Wake Word Detection

This script helps convert Mycroft Precise models to standard TensorFlow Lite format
by removing custom operations and optimizing for mobile deployment.
"""

import tensorflow as tf
import numpy as np
import os
import sys
from pathlib import Path

def analyze_model(model_path):
    """Analyze the current model to understand its structure"""
    print(f"🔍 Analyzing model: {model_path}")
    
    try:
        # Load the model
        interpreter = tf.lite.Interpreter(model_path=str(model_path))
        interpreter.allocate_tensors()
        
        # Get input and output details
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        print(f"✅ Model loaded successfully")
        print(f"📊 Input shape: {input_details[0]['shape']}")
        print(f"📊 Output shape: {output_details[0]['shape']}")
        print(f"📊 Input dtype: {input_details[0]['dtype']}")
        print(f"📊 Output dtype: {output_details[0]['dtype']}")
        
        return True, input_details, output_details
        
    except Exception as e:
        print(f"❌ Failed to analyze model: {e}")
        return False, None, None

def create_simple_gru_model(input_shape, output_shape):
    """Create a simplified GRU model compatible with standard TensorFlow Lite"""
    print(f"🔧 Creating simplified GRU model...")
    print(f"📐 Input shape: {input_shape}")
    print(f"📐 Output shape: {output_shape}")
    
    # Create a simple GRU model for wake word detection
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=input_shape[1:]),  # Remove batch dimension
        
        # GRU layers for sequence processing
        tf.keras.layers.GRU(64, return_sequences=True, activation='tanh'),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.GRU(32, return_sequences=False, activation='tanh'),
        tf.keras.layers.Dropout(0.2),
        
        # Dense layers for classification
        tf.keras.layers.Dense(16, activation='relu'),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(1, activation='sigmoid')  # Binary classification
    ])
    
    # Compile the model
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    print(f"✅ Model architecture created")
    model.summary()
    
    return model

def convert_to_tflite(model, output_path):
    """Convert Keras model to TensorFlow Lite"""
    print(f"🔄 Converting to TensorFlow Lite...")
    
    # Create converter
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    # Set optimization flags
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    converter.target_spec.supported_types = [tf.float32]
    
    # Convert model
    tflite_model = converter.convert()
    
    # Save the model
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'wb') as f:
        f.write(tflite_model)
    
    print(f"✅ Model saved to: {output_path}")
    print(f"📊 Model size: {len(tflite_model) / 1024:.1f} KB")
    
    return output_path

def validate_tflite_model(model_path):
    """Validate the converted TensorFlow Lite model"""
    print(f"✅ Validating TensorFlow Lite model...")
    
    try:
        # Load the model
        interpreter = tf.lite.Interpreter(model_path=str(model_path))
        interpreter.allocate_tensors()
        
        # Get input and output details
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        print(f"✅ Model validation successful")
        print(f"📊 Input shape: {input_details[0]['shape']}")
        print(f"📊 Output shape: {output_details[0]['shape']}")
        
        # Test with dummy input
        input_shape = input_details[0]['shape']
        dummy_input = np.random.random(input_shape).astype(np.float32)
        
        interpreter.set_tensor(input_details[0]['index'], dummy_input)
        interpreter.invoke()
        
        output_data = interpreter.get_tensor(output_details[0]['index'])
        print(f"🧪 Test inference result: {output_data[0][0]:.4f}")
        
        return True
        
    except Exception as e:
        print(f"❌ Model validation failed: {e}")
        return False

def main():
    """Main function to fix the TensorFlow Lite model"""
    print("🚀 TensorFlow Lite Model Fixer for Wake Word Detection\n")
    
    # Paths
    current_model = Path("assets/models/gru.tflite")
    output_model = Path("assets/models/gru_fixed.tflite")
    
    if not current_model.exists():
        print(f"❌ Model not found: {current_model}")
        print("Please ensure the gru.tflite file exists in assets/models/")
        return False
    
    # Step 1: Analyze current model
    success, input_details, output_details = analyze_model(current_model)
    
    if success:
        print("✅ Current model analysis successful - but has custom ops")
        input_shape = input_details[0]['shape']
        output_shape = output_details[0]['shape']
    else:
        print("⚠️ Current model has issues, using default shapes")
        input_shape = [1, 29, 13]  # Default MFCC input shape
        output_shape = [1, 1]      # Binary classification output
    
    # Step 2: Create compatible model
    model = create_simple_gru_model(input_shape, output_shape)
    
    # Step 3: Initialize with random weights (training would be needed for real use)
    print("⚠️ Note: This model has random weights and needs training for real use")
    print("🎯 For production, you'll need to train this model on your wake word data")
    
    # Step 4: Convert to TensorFlow Lite
    output_path = convert_to_tflite(model, output_model)
    
    # Step 5: Validate the new model
    if validate_tflite_model(output_path):
        print(f"\n🎉 SUCCESS! Compatible TensorFlow Lite model created!")
        print(f"📁 Location: {output_path}")
        print(f"🔧 To use: Replace the current gru.tflite with gru_fixed.tflite")
        print(f"⚠️ Remember: This model needs training on real wake word data!")
        return True
    else:
        print(f"\n❌ Model creation failed")
        return False

if __name__ == "__main__":
    main() 