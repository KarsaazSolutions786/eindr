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
    // Add other fields returned by backend
  };
  token: string;
}

interface ForgotPasswordRequest {
  email: string;
}

// --- API Service Functions --- 

export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
  // Assuming backend returns user and token on successful login at /auth/login
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData: RegisterRequest): Promise<AuthResponse> => {
  // Assuming backend returns user and token on successful registration at /auth/register
  const response = await api.post<AuthResponse>('/auth/register', userData);
  return response.data;
};

export const requestPasswordReset = async (data: ForgotPasswordRequest): Promise<void> => {
  // Assuming backend sends email and returns success/failure at /auth/forgot-password
  await api.post('/auth/forgot-password', data);
  // No specific data needed in response for this example
};

// --- TODO: Add other auth-related API calls as needed ---
// e.g., resetPassword, verifyEmail, etc. 