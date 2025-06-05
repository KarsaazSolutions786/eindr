# CORS Setup Guide for React Native Backend

## ✅ CORS Integration Complete!

**Status**: CORS integration is working successfully with platform-specific URL configuration.

**Backend Response Confirmed**:

```json
{
  "message": "Mobile API connection successful! 📱",
  "platform": "React Native compatible",
  "development_tips": {
    "android_emulator": "Use http://10.0.2.2:8000 as base URL",
    "ios_simulator": "Use http://localhost:8000 as base URL",
    "physical_device": "Use http://192.168.100.137:8000 as base URL"
  }
}
```

## Platform-Specific URLs ✅

The React Native app now uses backend-confirmed URLs:

- **iOS Simulator**: `http://localhost:8000` ✅
- **Android Emulator**: `http://10.0.2.2:8000` ✅
- **Physical Device**: `http://192.168.100.137:8000` ✅

## Backend Requirements ✅

**Your backend is correctly configured with:**

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Verification**:

- ✅ Listening on all interfaces (`*:8000`)
- ✅ CORS middleware properly configured
- ✅ OPTIONS requests supported
- ✅ React Native compatibility confirmed

## Overview

Cross-Origin Resource Sharing (CORS) configuration is required for your React Native app to communicate with your backend server running on a different origin/port.

## Frontend Integration ✅

The React Native app now includes:

- CORS-aware request headers
- Preflight request handling
- CORS-specific error detection
- Automatic CORS testing during initialization

## Backend Configuration Required

### 1. FastAPI (Python) - Recommended

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",      # React Native Metro
        "http://127.0.0.1:8081",     # Alternative localhost
        "http://10.0.2.2:8081",      # Android emulator
        "http://192.168.100.137:8081", # Your network IP
        "*"                           # Allow all (development only)
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "Cache-Control",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
    ],
)

# Start with: uvicorn main:app --host 0.0.0.0 --port 8000
```

### 2. Express.js (Node.js)

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:8081',
    'http://127.0.0.1:8081',
    'http://10.0.2.2:8081',
    'http://192.168.100.137:8081',
  ],
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Authorization',
    'Content-Type',
    'Accept',
    'Cache-Control',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],
};

app.use(cors(corsOptions));

// Start with: node server.js --host 0.0.0.0 --port 8000
```

### 3. Django (Python)

```python
# settings.py
INSTALLED_APPS = [
    # ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... other middleware
]

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://10.0.2.2:8081",
    "http://192.168.100.137:8081",
]

CORS_ALLOW_CREDENTIALS = False

CORS_ALLOW_METHODS = [
    'GET',
    'POST',
    'OPTIONS',
]

CORS_ALLOW_HEADERS = [
    'authorization',
    'content-type',
    'accept',
    'cache-control',
    'access-control-request-method',
    'access-control-request-headers',
]

# Start with: python manage.py runserver 0.0.0.0:8000
```

### 4. Flask (Python)

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# CORS configuration
CORS(app, origins=[
    'http://localhost:8081',
    'http://127.0.0.1:8081',
    'http://10.0.2.2:8081',
    'http://192.168.100.137:8081'
],
methods=['GET', 'POST', 'OPTIONS'],
allow_headers=[
    'Authorization',
    'Content-Type',
    'Accept',
    'Cache-Control',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
])

# Start with: flask run --host=0.0.0.0 --port=8000
```

## Network Configuration

### Start Backend on All Interfaces

Your backend must listen on `0.0.0.0` instead of `localhost`:

```bash
# Instead of: uvicorn main:app --port 8000
# Use:
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Platform-Specific URLs

The React Native app automatically uses:

- **iOS Simulator**: `http://localhost:8000`
- **Android Emulator**: `http://10.0.2.2:8000`
- **Physical Device**: `http://192.168.100.137:8000`

#### For Physical Devices:

1. **Find your computer's IP address:**

   ```bash
   # macOS/Linux:
   ifconfig | grep "inet " | grep -v 127.0.0.1

   # Windows:
   ipconfig | findstr "IPv4"
   ```

2. **Update the URL in VoiceToTextAPI.ts:**

   ```typescript
   // Replace this line with your actual IP:
   return 'http://192.168.1.100:8000'; // Your computer's IP
   ```

3. **Ensure both devices are on the same WiFi network**

4. **Start backend on all interfaces:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

## Testing CORS ✅

The app automatically tests CORS during initialization and should show:

```
🌐 VoiceToTextAPI: Initialized for dynamic speech recognition
🌐 VoiceToTextAPI: Base URL: http://localhost:8000
🌐 VoiceToTextAPI: Platform: ios, Development: true
🌐 VoiceToTextAPI: 📱 iOS Simulator: Using localhost:8000 (backend must run on 0.0.0.0:8000)
🔍 HomeScreen: Testing CORS configuration...
📋 VoiceToTextAPI: CORS Headers Response:
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, POST, OPTIONS
   Access-Control-Allow-Headers: Authorization, Content-Type
✅ HomeScreen: CORS configuration verified
✅ WakeWordEngine: Always-listening mode activated
```

**Backend API Response**:

```json
{
  "message": "Mobile API connection successful! 📱",
  "platform": "React Native compatible"
}
```

## Troubleshooting

### Common CORS Errors:

1. **"Network request failed"** → Backend not accessible or CORS blocked
2. **"CORS preflight failed"** → Missing OPTIONS method support
3. **"Access-Control-Allow-Origin missing"** → CORS middleware not configured

### Debug Steps:

1. Check backend is running on `0.0.0.0:8000`
2. Verify CORS middleware is installed and configured
3. Test manually: `curl -I http://10.0.2.2:8000/api/v1/stt/transcribe-and-respond`
4. Check app logs for CORS test results

## Security Notes

- For **development**: Use `*` for origins (allows all)
- For **production**: Specify exact origins/domains
- Never use `allow_credentials=True` with `origins=["*"]`
- Consider rate limiting for production APIs
