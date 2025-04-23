import { combineReducers } from '@reduxjs/toolkit';
import settingsReducer from './slices/settingsSlice';
import authReducer from './slices/authSlice';

const rootReducer = combineReducers({
  settings: settingsReducer,
  auth: authReducer,
  // Add other reducers here as you create them
  // e.g., user: userReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer; 