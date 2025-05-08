/**
 * Redux Store Configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import { dashboardReducer, widgetReducer, uiReducer } from '../slices';
import themeReducer from '../features/theme/themeSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    widget: widgetReducer,
    ui: uiReducer,
    theme: themeReducer,
  },
  // Enable for development only
  devTools: true,
});

// Define types for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;