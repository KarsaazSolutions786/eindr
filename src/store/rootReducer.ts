import { combineReducers } from '@reduxjs/toolkit';
import settingsReducer from './slices/settingsSlice';

const rootReducer = combineReducers({
  settings: settingsReducer,
  // Add other reducers here as you create them
  // e.g., user: userReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer; 