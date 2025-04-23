import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  // Add other relevant user fields
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action when login/register starts
    authStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    // Action on successful login/registration
    authSuccess(state, action: PayloadAction<{ user: User; token: string }>) {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    // Action on authentication failure
    authFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
    },
    // Action on logout
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      state.isLoading = false;
    },
    // Action to clear errors
    clearError(state) {
      state.error = null;
    },
  },
  // We can add async thunks here later for API calls
  // extraReducers: (builder) => { ... }
});

export const { 
  authStart, 
  authSuccess, 
  authFailure, 
  logout, 
  clearError 
} = authSlice.actions;

export default authSlice.reducer; 