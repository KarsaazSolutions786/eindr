const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: ['bin', 'txt', 'jpg', 'png', 'gif', 'json', 'tflite', 'pb', 'onnx'],
    alias: {
      '@components': './src/components',
      '@screens': './src/screens',
      '@navigation': './src/navigation',
      '@store': './src/store',
      '@services': './src/services',
      '@theme': './src/theme',
      '@utils': './src/utils',
      '@assets': './src/assets',
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
