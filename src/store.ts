import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './redux/features/theme/themeSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
});

// Apply initial theme from store
const initialState = store.getState();
Object.entries(initialState.theme.currentTheme.colors).forEach(([key, value]) => {
  document.documentElement.style.setProperty(`--color-${key}`, value);
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;