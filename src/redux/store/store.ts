/**
 * Redux Store Configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import { dashboardReducer, widgetReducer, uiReducer } from '../slices';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    widget: widgetReducer,
    ui: uiReducer,
  },
  // Enable for development only
  devTools: true,
});

// Define types for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;