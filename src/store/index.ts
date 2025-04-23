import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import rootReducer from './rootReducer';

const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  // Whitelist (persist only specific reducers) or Blacklist (don't persist specific reducers)
  // Example: Persist only settings
  whitelist: ['settings'],
  // Example: Don't persist user temporarily
  // blacklist: ['user']
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      // Add other middleware here if needed
    }),
  // Add enhancers here if needed
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
// We already defined RootState in rootReducer.ts, but this is another way
// export type RootState = ReturnType<typeof store.getState>; 
export type AppDispatch = typeof store.dispatch; 