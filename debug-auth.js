// Debug script to check authentication state
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 === Authentication Debug ===');

// Check if AsyncStorage files exist (React Native uses AsyncStorage)
const asyncStoragePath = path.join(__dirname, 'node_modules/@react-native-async-storage/async-storage');
if (fs.existsSync(asyncStoragePath)) {
  console.log('✅ AsyncStorage module found');
} else {
  console.log('❌ AsyncStorage module not found');
}

// Check if the app is running
try {
  const result = execSync('lsof -i :8081', { encoding: 'utf8' });
  if (result.includes('node')) {
    console.log('✅ React Native Metro server is running on port 8081');
  }
} catch (error) {
  console.log('❌ React Native Metro server is not running');
}

// Check if we can reach the auth service
try {
  const result = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/auth/health', { encoding: 'utf8' });
  console.log(`🌐 Auth service health check: HTTP ${result}`);
} catch (error) {
  console.log('❌ Cannot reach auth service');
}

// Check if we can reach the notes service
try {
  const result = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:8002/health', { encoding: 'utf8' });
  console.log(`📝 Notes service health check: HTTP ${result}`);
} catch (error) {
  console.log('❌ Cannot reach notes service');
}

console.log('🔍 === End Debug ===');