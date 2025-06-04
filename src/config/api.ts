import { Platform } from 'react-native';

// Production configuration
const PROD_CONFIG = {
  API_BASE_URL: 'https://backend-production-1f87.up.railway.app',
};

// Development configuration (now pointing to production)
const DEV_CONFIG = {
  // For all platforms, use the production endpoint
  API_BASE_URL: 'https://backend-production-1f87.up.railway.app',
};

// Auto-detect the correct URL
export const getApiBaseUrl = (): string => {
  // Always use production endpoint for now
  return PROD_CONFIG.API_BASE_URL;
};

export const API_BASE_URL = getApiBaseUrl();
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  REFRESH: '/api/v1/auth/refresh-token',
  LOGOUT: '/api/v1/auth/logout',
  ME: '/api/v1/auth/me',

  // Voice and AI
  TRANSCRIBE: '/api/v1/stt/transcribe',
  TRANSCRIBE_AND_RESPOND: '/api/v1/stt/transcribe-and-respond',
  VOICES: '/api/v1/stt/voices',
  INTENT_CLASSIFY: '/api/v1/stt/intent-classify',

  // Reminders
  REMINDERS: '/api/v1/reminders',

  // Notes
  NOTES: '/api/v1/notes',

  // Health
  HEALTH: '/health',
  MOBILE_TEST: '/mobile-test',
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  getApiBaseUrl,
};
