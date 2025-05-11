/**
 * Dashboard Redux Slice
 * 
 * Manages the state for dashboards and their widgets
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Dashboard, Widget } from '../../types/dashboard';
import { 
  fetchDashboards, 
  fetchDashboardById,
  createDashboard,
  updateDashboard,
  deleteDashboard
} from '../../services/api/dashboard';
import { RootState } from '../store/store';

// Define the initial state
interface DashboardState {
  dashboards: Dashboard[];
  currentDashboard: Dashboard | null;
  isLoading: boolean;
  error: string | null;
  isDashboardEditMode: boolean;
}

const initialState: DashboardState = {
  dashboards: [],
  currentDashboard: null,
  isLoading: false,
  error: null,
  isDashboardEditMode: false,
};

// Async thunks
export const fetchAllDashboards = createAsyncThunk(
  'dashboard/fetchAll',
  async () => {
    return await fetchDashboards();
  }
);

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetchOne',
  async (id: string) => {
    return await fetchDashboardById(id);
  }
);

export const saveDashboard = createAsyncThunk(
  'dashboard/save',
  async (dashboard: Dashboard) => {
    if (dashboard.id === 'new') {
      // Create new dashboard without the temporary ID
      const { id, ...newDashboard } = dashboard;
      return await createDashboard(newDashboard as Omit<Dashboard, 'id'>);
    } else {
      // Update existing dashboard
      return await updateDashboard(dashboard.id, dashboard);
    }
  }
);

export const removeDashboard = createAsyncThunk(
  'dashboard/remove',
  async (id: string) => {
    await deleteDashboard(id);
    return id;
  }
);

// Create the slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setCurrentDashboard: (state, action: PayloadAction<Dashboard | null>) => {
      state.currentDashboard = action.payload;
    },
    createNewDashboard: (state) => {
      // Create a new empty dashboard with temporary ID
      state.currentDashboard = {
        id: 'new',
        name: 'New Dashboard',
        description: '',
        widgets: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.isDashboardEditMode = true;
    },
    toggleDashboardEditMode: (state, action: PayloadAction<boolean | undefined>) => {
      state.isDashboardEditMode = action.payload !== undefined ? action.payload : !state.isDashboardEditMode;
    },
    // Widget Management
    addWidget: (state, action: PayloadAction<Widget>) => {
      if (state.currentDashboard) {
        state.currentDashboard.widgets.push(action.payload);
      }
    },
    updateWidget: (state, action: PayloadAction<{ id: string; widget: Partial<Widget> }>) => {
      if (state.currentDashboard) {
        const index = state.currentDashboard.widgets.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
          state.currentDashboard.widgets[index] = {
            ...state.currentDashboard.widgets[index],
            ...action.payload.widget,
          } as Widget;
        }
      }
    },
    removeWidget: (state, action: PayloadAction<string>) => {
      if (state.currentDashboard) {
        state.currentDashboard.widgets = state.currentDashboard.widgets.filter(
          widget => widget.id !== action.payload
        );
      }
    },
    updateLayout: (state, action: PayloadAction<any>) => {
      if (state.currentDashboard) {
        // Update widget positions based on react-grid-layout data
        const layout = action.payload;

        // Simple direct update of widget positions
        if (Array.isArray(layout) && layout.length > 0) {
          state.currentDashboard.widgets = state.currentDashboard.widgets.map(widget => {
            const layoutItem = layout.find((item: any) => item.i === widget.id);
            if (layoutItem) {
              return {
                ...widget,
                x: layoutItem.x,
                y: layoutItem.y,
                w: layoutItem.w,
                h: layoutItem.h,
              };
            }
            return widget;
          });
        }
      }
    },
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAllDashboards
      .addCase(fetchAllDashboards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllDashboards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboards = action.payload;
      })
      .addCase(fetchAllDashboards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch dashboards';
      })
      
      // fetchDashboard
      .addCase(fetchDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDashboard = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch dashboard';
      })
      
      // saveDashboard
      .addCase(saveDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDashboard = action.payload;
        
        // Update the dashboards array
        const index = state.dashboards.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.dashboards[index] = action.payload;
        } else {
          state.dashboards.push(action.payload);
        }
        
        // Exit edit mode after save
        state.isDashboardEditMode = false;
      })
      .addCase(saveDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to save dashboard';
      })
      
      // removeDashboard
      .addCase(removeDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboards = state.dashboards.filter(d => d.id !== action.payload);
        if (state.currentDashboard && state.currentDashboard.id === action.payload) {
          state.currentDashboard = null;
        }
      })
      .addCase(removeDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete dashboard';
      });
  },
});

// Export actions
export const {
  setCurrentDashboard,
  createNewDashboard,
  toggleDashboardEditMode,
  addWidget,
  updateWidget,
  removeWidget,
  updateLayout,
  clearDashboardError,
} = dashboardSlice.actions;

// Export selectors
export const selectAllDashboards = (state: RootState) => state.dashboard.dashboards;
export const selectCurrentDashboard = (state: RootState) => state.dashboard.currentDashboard;
export const selectDashboardLoading = (state: RootState) => state.dashboard.isLoading;
export const selectDashboardError = (state: RootState) => state.dashboard.error;
export const selectDashboardEditMode = (state: RootState) => state.dashboard.isDashboardEditMode;

// Export reducer
export default dashboardSlice.reducer;