import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  email: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  login_attempts: number;
  locked_until: string | null;
  profile: {
    first_name: string | null;
    last_name: string | null;
    display_name: string | null;
    bio: string | null;
    phone_number: string | null;
    timezone: string;
    language: string;
    is_public: boolean;
    id: number;
    customer_id: number;
    avatar_url: string | null;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
    is_new: boolean;
  };
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  tokenType: string;
  expiresIn: number | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  user: null,
  token: null,
  refreshToken: null,
  tokenType: 'bearer',
  expiresIn: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: state => {
      state.isLoading = true;
      state.error = null;
    },
    authSuccess: (state, action: PayloadAction<{ 
      customer: User; 
      access_token: string; 
      refresh_token: string;
      token_type: string;
      expires_in: number;
    }>) => {
      state.isLoading = false;
      state.isInitialized = true;
      state.isAuthenticated = true;
      state.user = action.payload.customer;
      state.token = action.payload.access_token;
      state.refreshToken = action.payload.refresh_token;
      state.tokenType = action.payload.token_type;
      state.expiresIn = action.payload.expires_in;
      state.error = null;
    },
    authFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearError: state => {
      state.error = null;
    },
    setTokens: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
    logout: state => {
      state.isAuthenticated = false;
      state.isInitialized = true;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.tokenType = 'bearer';
      state.expiresIn = null;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
  },
});

export const { authStart, authSuccess, authFailure, updateUser, clearError, setTokens, logout, setInitialized } =
  authSlice.actions;
export default authSlice.reducer;
