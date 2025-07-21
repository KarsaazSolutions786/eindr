import api, { authApi, customerApi } from './api';

// --- Define Types ---
// Aligned with the actual backend API response/request structures

interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  gender?: string;
  is_new?: boolean;
}

interface Customer {
  id: number;
  email: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  login_attempts: number;
  locked_until: string | null;
  subscription_plan_id: number;
  profile: {
    full_name: string;
    gender: string;
    is_new: boolean;
  };
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  customer: Customer;
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
    // Get current user info from auth service
    const response = await authApi.get('/auth/me');
    return { isNew: response.data.profile?.is_new || false };
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
    // Update user profile to mark onboarding as complete
    await customerApi.put('/customers/me', { is_new: false });
  } catch (error) {
    console.error('Error completing onboarding:', error);
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
  const response = await authApi.post<AuthResponse>('/auth/refresh', {
    refresh_token: refreshToken
  });
  return response.data;
};

/**
 * Get current user information
 */
export const getCurrentUser = async (): Promise<Customer> => {
  const response = await authApi.get<Customer>('/auth/me');
  return response.data;
};

export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
  // Send login request to auth service
  const response = await authApi.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData: RegisterRequest): Promise<AuthResponse> => {
  // Send registration request to auth service
  const response = await authApi.post<AuthResponse>('/auth/register', userData);
  return response.data;
};

export const requestPasswordReset = async (data: ForgotPasswordRequest): Promise<void> => {
  // Send password reset request to auth service
  await authApi.post('/auth/forgot-password', data);
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

/**
 * Logout user and revoke tokens
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await authApi.post('/auth/logout');
  } catch (error) {
    console.error('Error during logout:', error);
    // Continue with logout even if API call fails
  }
};

/**
 * Revoke a specific token
 */
export const revokeToken = async (token: string): Promise<void> => {
  await authApi.post('/auth/revoke-token', { token });
};

/**
 * Validate if a token is still valid
 */
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    await authApi.post('/auth/validate-token', { token });
    return true;
  } catch (error) {
    return false;
  }
};

// --- TODO: Add other auth-related API calls as needed ---
// e.g., resetPassword, verifyEmail, etc.
