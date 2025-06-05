#!/usr/bin/env node

/**
 * Wake Word Detection Setup Verification Script
 *
 * This script verifies that all dependencies and configurations
 * are properly set up for wake word detection functionality.
 */

const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(`✅ ${description}`, colors.green);
    return true;
  } else {
    log(`❌ ${description}`, colors.red);
    return false;
  }
}

function checkPackageJson() {
  const packagePath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packagePath)) {
    log('❌ package.json not found', colors.red);
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const requiredDeps = [
    'react-native-audio-record',
    'react-native-permissions',
    'react-native-fast-tflite',
    'react-native-haptic-feedback',
  ];

  log('\n📦 Checking Dependencies:', colors.blue);
  let allDepsPresent = true;

  requiredDeps.forEach(dep => {
    const exists = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
    if (exists) {
      log(`✅ ${dep} (${exists})`, colors.green);
    } else {
      log(`❌ ${dep} - Missing`, colors.red);
      allDepsPresent = false;
    }
  });

  return allDepsPresent;
}

function checkPermissions() {
  log('\n🔐 Checking Permissions:', colors.blue);

  // Check Android permissions
  const androidManifest = path.join(process.cwd(), 'android/app/src/main/AndroidManifest.xml');
  let androidPermission = false;
  if (fs.existsSync(androidManifest)) {
    const content = fs.readFileSync(androidManifest, 'utf8');
    androidPermission = content.includes('android.permission.RECORD_AUDIO');
    if (androidPermission) {
      log('✅ Android RECORD_AUDIO permission', colors.green);
    } else {
      log('❌ Android RECORD_AUDIO permission missing', colors.red);
    }
  } else {
    log('❌ Android manifest not found', colors.red);
  }

  // Check iOS permissions
  const iosInfoPlist = path.join(process.cwd(), 'ios/Eindr/Info.plist');
  let iosPermission = false;
  if (fs.existsSync(iosInfoPlist)) {
    const content = fs.readFileSync(iosInfoPlist, 'utf8');
    iosPermission = content.includes('NSMicrophoneUsageDescription');
    if (iosPermission) {
      log('✅ iOS NSMicrophoneUsageDescription permission', colors.green);
    } else {
      log('❌ iOS NSMicrophoneUsageDescription permission missing', colors.red);
    }
  } else {
    log('❌ iOS Info.plist not found', colors.red);
  }

  return androidPermission && iosPermission;
}

function checkAssets() {
  log('\n📁 Checking Assets:', colors.blue);

  const assetsDir = path.join(process.cwd(), 'assets');
  const modelsDir = path.join(assetsDir, 'models');
  const modelFile = path.join(modelsDir, 'gru.tflite');
  const readmeFile = path.join(modelsDir, 'README.md');

  const checks = [
    [assetsDir, 'Assets directory exists'],
    [modelsDir, 'Models directory exists'],
    [readmeFile, 'Model README.md exists'],
    [modelFile, 'gru.tflite model file exists'],
  ];

  let allPresent = true;
  checks.forEach(([path, desc]) => {
    if (!checkFile(path, desc)) {
      allPresent = false;
    }
  });

  return allPresent;
}

function checkSourceFiles() {
  log('\n🧩 Checking Source Files:', colors.blue);

  const srcFiles = [
    ['src/wakeword/index.ts', 'Wake word main export'],
    ['src/wakeword/WakeWordEngine.ts', 'Wake word engine'],
    ['src/wakeword/hooks/useWakeWord.ts', 'React hook'],
    ['src/wakeword/components/WakeWordInterface.tsx', 'Interface component'],
    ['src/wakeword/components/WakeWordButton.tsx', 'Button component'],
    ['src/wakeword/audio/AudioProcessor.ts', 'Audio processor'],
    ['src/wakeword/audio/RingBuffer.ts', 'Ring buffer'],
    ['src/wakeword/native/ModelManager.ts', 'Model manager'],
    ['src/wakeword/api/VoiceToTextAPI.ts', 'API service'],
    ['src/types/wakeword.ts', 'TypeScript types'],
    ['src/config/wakeword.ts', 'Configuration'],
    ['src/screens/demo/WakeWordDemoScreen.tsx', 'Demo screen'],
  ];

  let allPresent = true;
  srcFiles.forEach(([filePath, desc]) => {
    const fullPath = path.join(process.cwd(), filePath);
    if (!checkFile(fullPath, desc)) {
      allPresent = false;
    }
  });

  return allPresent;
}

function checkMetroConfig() {
  log('\n⚙️  Checking Metro Configuration:', colors.blue);

  const metroConfig = path.join(process.cwd(), 'metro.config.js');
  if (!fs.existsSync(metroConfig)) {
    log('❌ metro.config.js not found', colors.red);
    return false;
  }

  const content = fs.readFileSync(metroConfig, 'utf8');
  const hasTfliteSupport = content.includes('tflite');

  if (hasTfliteSupport) {
    log('✅ Metro config supports .tflite files', colors.green);
    return true;
  } else {
    log('❌ Metro config missing .tflite support', colors.red);
    return false;
  }
}

function main() {
  log(`${colors.bold}🎤 Wake Word Detection Setup Verification${colors.reset}\n`);

  const checks = [
    checkPackageJson(),
    checkPermissions(),
    checkAssets(),
    checkSourceFiles(),
    checkMetroConfig(),
  ];

  const allPassed = checks.every(check => check);

  log('\n' + '='.repeat(50));

  if (allPassed) {
    log('🎉 All checks passed! Wake word detection is ready to use.', colors.green);
    log('\nNext steps:', colors.blue);
    log('1. Place your gru.tflite model in assets/models/', colors.yellow);
    log('2. Configure your voice-to-text API endpoint', colors.yellow);
    log('3. Navigate to Settings → Development → Wake Word Demo', colors.yellow);
  } else {
    log('❌ Some checks failed. Please fix the issues above.', colors.red);
    log('\nRefer to the README.md for detailed setup instructions.', colors.yellow);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
