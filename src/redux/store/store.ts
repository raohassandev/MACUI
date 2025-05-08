import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '../features/theme/themeSlice';

// Create the store
export const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
  // Add middleware or other config here if needed
});

// Apply initial theme from store (browser-only)
if (typeof window !== 'undefined') {
  const initialState = store.getState();
  Object.entries(initialState.theme.currentTheme.colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--color-${key}`, value);
  });
}

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;