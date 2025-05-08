/**
 * UI Redux Slice
 * 
 * Manages the global UI state, like sidebar visibility, modals, etc.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store/store';

// Define the initial state
interface UiState {
  isSidebarOpen: boolean;
  activeModal: string | null;
  isLoading: boolean;
  toasts: {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
  }[];
  dashboardEditMode: boolean;
}

const initialState: UiState = {
  isSidebarOpen: true,
  activeModal: null,
  isLoading: false,
  toasts: [],
  dashboardEditMode: false,
};

// Create the slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state, action: PayloadAction<boolean | undefined>) => {
      state.isSidebarOpen = action.payload !== undefined ? action.payload : !state.isSidebarOpen;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    addToast: (state, action: PayloadAction<{ type: 'info' | 'success' | 'warning' | 'error'; message: string }>) => {
      const id = Date.now().toString();
      state.toasts.push({
        id,
        ...action.payload,
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    setDashboardEditMode: (state, action: PayloadAction<boolean>) => {
      state.dashboardEditMode = action.payload;
    },
    toggleDashboardEditMode: (state) => {
      state.dashboardEditMode = !state.dashboardEditMode;
    }
  },
});

// Export actions
export const {
  toggleSidebar,
  openModal,
  closeModal,
  setLoading,
  addToast,
  removeToast,
  setDashboardEditMode,
  toggleDashboardEditMode,
} = uiSlice.actions;

// Export selectors
export const selectIsSidebarOpen = (state: RootState) => state.ui.isSidebarOpen;
export const selectActiveModal = (state: RootState) => state.ui.activeModal;
export const selectIsLoading = (state: RootState) => state.ui.isLoading;
export const selectToasts = (state: RootState) => state.ui.toasts;
export const selectDashboardEditMode = (state: RootState) => state.ui.dashboardEditMode;

// Export reducer
export default uiSlice.reducer;