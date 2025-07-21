import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { store } from '@store/index'; // Import the store to access the token
import { logout, setTokens } from '@store/slices/authSlice';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Microservices API endpoints
const API_ENDPOINTS = {
  AUTH_SERVICE: Config.AUTH_SERVICE_URL || 'https://auth-production-37f1.up.railway.app',
  CUSTOMER_SERVICE: Config.CUSTOMER_SERVICE_URL || 'https://customers-production-c75c.up.railway.app',
  REMINDER_SERVICE: Config.REMINDER_SERVICE_URL || 'https://reminder-service-production.up.railway.app',
  NOTE_SERVICE: Config.NOTE_SERVICE_URL || 'https://note-service-production.up.railway.app',
  LEDGER_SERVICE: Config.LEDGER_SERVICE_URL || 'https://ledger-service-production.up.railway.app',
  CHAT_SERVICE: Config.CHAT_SERVICE_URL || 'https://scheduler-service-production-4dd1.up.railway.app',
  INTENT_SERVICE: Config.INTENT_SERVICE_URL || 'https://friend-service-production.up.railway.app',
  STT_SERVICE: Config.STT_SERVICE_URL || 'https://history-service-production.up.railway.app',
  TTS_SERVICE: Config.TTS_SERVICE_URL || 'https://tts-production-37f1.up.railway.app',
  AI_PIPELINE_SERVICE: Config.AI_PIPELINE_SERVICE_URL || 'https://ai-pipeline-production-37f1.up.railway.app',
};

// Create axios instance with dynamic base URL
const createApiInstance = (baseURL: string) => {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
  });
};

// Default API instance (for backward compatibility)
const api = createApiInstance(Config.API_URL || API_ENDPOINTS.AUTH_SERVICE);

// Service-specific API instances
export const authApi = createApiInstance(API_ENDPOINTS.AUTH_SERVICE);
export const customerApi = createApiInstance(API_ENDPOINTS.CUSTOMER_SERVICE);
export const reminderApi = createApiInstance(API_ENDPOINTS.REMINDER_SERVICE);
export const noteApi = createApiInstance(API_ENDPOINTS.NOTE_SERVICE);
export const ledgerApi = createApiInstance(API_ENDPOINTS.LEDGER_SERVICE);
export const chatApi = createApiInstance(API_ENDPOINTS.CHAT_SERVICE);
export const intentApi = createApiInstance(API_ENDPOINTS.INTENT_SERVICE);
export const sttApi = createApiInstance(API_ENDPOINTS.STT_SERVICE);
export const ttsApi = createApiInstance(API_ENDPOINTS.TTS_SERVICE);
export const aiPipelineApi = createApiInstance(API_ENDPOINTS.AI_PIPELINE_SERVICE);

// Function to add interceptors to an API instance
const addInterceptors = (apiInstance: any) => {
  // Request Interceptor: Add auth token to headers
  apiInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = store.getState().auth.token; // Get token from Redux state
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor: Handle common errors and token refresh
  apiInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            // Handle unauthorized access - try to refresh token
            if (!originalRequest._retry) {
              originalRequest._retry = true;
              
              try {
                const refreshToken = await AsyncStorage.getItem('refreshToken');
                if (refreshToken) {
                  // Try to refresh the token
                  const refreshResponse = await authApi.post('/auth/refresh', {
                    refresh_token: refreshToken
                  });
                  
                  const { access_token, refresh_token: newRefreshToken } = refreshResponse.data;
                  
                  // Update tokens in store and storage
                  store.dispatch(setTokens({ 
                    token: access_token, 
                    refreshToken: newRefreshToken 
                  }));
                  await AsyncStorage.setItem('token', access_token);
                  await AsyncStorage.setItem('refreshToken', newRefreshToken);
                  
                  // Retry the original request with new token
                  if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                  }
                  return apiInstance(originalRequest);
                }
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // If refresh fails, logout user
                store.dispatch(logout());
                await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
                return Promise.reject(refreshError);
              }
            }
            
            // If retry failed or no refresh token, logout
            store.dispatch(logout());
            await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
            break;
            
          case 403:
            // Handle forbidden access
            console.error('Access forbidden - insufficient permissions');
            break;
            
          case 404:
            // Handle not found
            console.error('Resource not found:', error.config?.url);
            break;
            
          case 422:
            // Handle validation errors
            console.error('Validation error:', error.response.data);
            break;
            
          case 429:
            // Handle rate limiting
            console.error('Too many requests - rate limited');
            break;
            
          case 500:
            // Handle server error
            console.error('Internal server error');
            break;
            
          case 502:
          case 503:
          case 504:
            // Handle service unavailable
            console.error('Service temporarily unavailable');
            break;
            
          default:
            console.error(`HTTP Error ${error.response.status}:`, error.response.data);
        }
      } else if (error.request) {
        // Handle network errors
        console.error('Network error - no response received:', error.request);
      } else {
        // Handle other errors
        console.error('Request setup error:', error.message);
      }
      
      return Promise.reject(error);
    }
  );
};

// Add interceptors to all API instances
addInterceptors(api);
addInterceptors(authApi);
addInterceptors(customerApi);
addInterceptors(reminderApi);
addInterceptors(noteApi);
addInterceptors(ledgerApi);
addInterceptors(chatApi);
addInterceptors(intentApi);
addInterceptors(sttApi);
addInterceptors(ttsApi);
addInterceptors(aiPipelineApi);

export default api;