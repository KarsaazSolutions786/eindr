import api from './api';

// --- Define Types ---
// TODO: Align these types with the actual backend API response/request structures

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    isNew: boolean;
    // Add other fields returned by backend
  };
  token: string;
}

interface ForgotPasswordRequest {
  email: string;
}

// --- API Service Functions ---

/**
 * Check if the current user is new and should see onboarding
 * @returns Promise that resolves to { isNew: boolean }
 */
export const checkUserStatus = async (): Promise<{ isNew: boolean }> => {
  try {
    // In a real implementation, this would check with the backend
    // For now, we'll simulate it with a local storage check
    // If this is running in a React Native environment
    if (typeof localStorage !== 'undefined') {
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      return { isNew: hasSeenOnboarding !== 'true' };
    }
    return { isNew: true }; // Default to true if localStorage is not available
  } catch (error) {
    console.error('Error checking user status:', error);
    return { isNew: false }; // Default to false if there's an error
  }
};

/**
 * Mark that the user has completed onboarding
 */
export const completeOnboarding = async (): Promise<void> => {
  try {
    // In a real implementation, this would update the backend
    // For now, we'll simulate it with a local storage update
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
  } catch (error) {
    console.error('Error completing onboarding:', error);
  }
};

export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
  // Assuming backend returns user and token on successful login at /auth/login
  const response = await api.post<AuthResponse>('/auth/login', credentials);

  // In a real implementation, we might need to check if the user is new
  // For demo purposes, we'll assume new users have isNew: true
  if (!response.data.user.hasOwnProperty('isNew')) {
    response.data.user.isNew = true; // Default to true if not provided by backend
  }

  return response.data;
};

export const registerUser = async (userData: RegisterRequest): Promise<AuthResponse> => {
  // Assuming backend returns user and token on successful registration at /auth/register
  const response = await api.post<AuthResponse>('/auth/register', userData);

  // New users are always marked as new
  if (!response.data.user.hasOwnProperty('isNew')) {
    response.data.user.isNew = true;
  }

  return response.data;
};

export const requestPasswordReset = async (data: ForgotPasswordRequest): Promise<void> => {
  // Assuming backend sends email and returns success/failure at /auth/forgot-password
  await api.post('/auth/forgot-password', data);
  // No specific data needed in response for this example
};

// --- Social Login Functions ---

// Google Login
export const loginWithGoogle = async (idToken: string): Promise<AuthResponse> => {
  console.log('Sending Google ID Token to backend...');
  // TODO: Replace '/auth/google' with your actual backend endpoint
  const response = await api.post<AuthResponse>('/auth/google', { idToken });
  console.log('Backend response for Google login:', response.data);
  return response.data;
};

// Facebook Login
export const loginWithFacebook = async (accessToken: string): Promise<AuthResponse> => {
  console.log('Sending Facebook Access Token to backend...');
  // TODO: Replace '/auth/facebook' with your actual backend endpoint
  const response = await api.post<AuthResponse>('/auth/facebook', { accessToken });
  console.log('Backend response for Facebook login:', response.data);
  return response.data;
};

// Apple Login
export const loginWithApple = async (identityToken: string): Promise<AuthResponse> => {
  console.log('Sending Apple Identity Token to backend...');
  // TODO: Replace '/auth/apple' with your actual backend endpoint
  const response = await api.post<AuthResponse>('/auth/apple', { identityToken });
  console.log('Backend response for Apple login:', response.data);
  return response.data;
};

// --- TODO: Add other auth-related API calls as needed ---
// e.g., resetPassword, verifyEmail, etc.
