import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id?: string;
  name?: string;
  email?: string;
  isNew?: boolean;
  // Add other user fields as needed
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;
  token: string | null;
}

const initialState: AuthState = {
  isAuthenticated: true,
  isLoading: false,
  error: null,
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: state => {
      state.isLoading = true;
      state.error = null;
    },
    authSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
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
    logout: state => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
  },
});

export const { authStart, authSuccess, authFailure, updateUser, clearError, logout } =
  authSlice.actions;
export default authSlice.reducer;
