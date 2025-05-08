# MongoDB Integration Guide for Dashboard System

## Setup Requirements

### MongoDB Configuration

1. **Connection Setup**
   - Install MongoDB client library: `npm install mongodb`
   - Install Mongoose for schema-based modeling: `npm install mongoose`
   - Create a connection service:

```typescript
// src/services/database/mongoService.ts
import mongoose from 'mongoose';

export const connectToMongoDB = async (uri: string) => {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export const disconnectFromMongoDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
  }
};
```

2. **Environment Configuration**
   - Add MongoDB connection string to your environment variables
   - Create a .env file with the following:

```
MONGODB_URI=mongodb://username:password@localhost:27017/dashboard-db
```

## Schema Definitions

### Dashboard Schema

```typescript
// src/models/Dashboard.ts
import mongoose, { Schema, Document } from 'mongoose';

// Layout item interface (for React Grid Layout)
export interface LayoutItem {
  i: string;  // Component ID
  x: number;  // X position
  y: number;  // Y position
  w: number;  // Width
  h: number;  // Height
  minW?: number; // Min width
  minH?: number; // Min height
  static?: boolean;
}

// Component configuration interface
export interface ComponentConfig {
  type: string;
  config: any;
}

// Dashboard interface extending Document
export interface IDashboard extends Document {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  isPublic: boolean;
  layout: LayoutItem[];
  components: Record<string, ComponentConfig>;
  created: Date;
  updated: Date;
}

const DashboardSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: false },
  layout: [{
    i: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
    minW: { type: Number },
    minH: { type: Number },
    static: { type: Boolean }
  }],
  components: {
    type: Map,
    of: {
      type: { type: String, required: true },
      config: { type: Schema.Types.Mixed, default: {} }
    }
  },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

// Middleware to update the "updated" field on save
DashboardSchema.pre('save', function(next) {
  this.updated = new Date();
  next();
});

export const Dashboard = mongoose.model<IDashboard>('Dashboard', DashboardSchema);
```

### User Dashboard Access Schema (Optional)

```typescript
// src/models/DashboardAccess.ts
import mongoose, { Schema, Document } from 'mongoose';

export type PermissionType = 'view' | 'edit' | 'admin';

export interface IDashboardAccess extends Document {
  dashboardId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  permission: PermissionType;
  created: Date;
}

const DashboardAccessSchema: Schema = new Schema({
  dashboardId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Dashboard', 
    required: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  permission: { 
    type: String, 
    enum: ['view', 'edit', 'admin'], 
    default: 'view' 
  },
  created: { 
    type: Date, 
    default: Date.now 
  }
});

// Create a compound index to ensure unique user-dashboard pairs
DashboardAccessSchema.index({ dashboardId: 1, userId: 1 }, { unique: true });

export const DashboardAccess = mongoose.model<IDashboardAccess>('DashboardAccess', DashboardAccessSchema);
```

## Dashboard Repository Service

Create a service layer to interact with the database:

```typescript
// src/services/database/dashboardRepository.ts
import mongoose from 'mongoose';
import { Dashboard, IDashboard, LayoutItem, ComponentConfig } from '../../models/Dashboard';

export interface DashboardCreateParams {
  name: string;
  description?: string;
  owner: string;
  isPublic?: boolean;
  layout: LayoutItem[];
  components: Record<string, ComponentConfig>;
}

export interface DashboardUpdateParams {
  name?: string;
  description?: string;
  isPublic?: boolean;
  layout?: LayoutItem[];
  components?: Record<string, ComponentConfig>;
}

export interface DashboardQueryParams {
  owner?: string;
  isPublic?: boolean;
  search?: string;
}

export class DashboardRepository {
  // Create a new dashboard
  async createDashboard(params: DashboardCreateParams): Promise<IDashboard> {
    try {
      const dashboard = new Dashboard({
        ...params,
        owner: new mongoose.Types.ObjectId(params.owner)
      });
      return await dashboard.save();
    } catch (error) {
      console.error('Error creating dashboard:', error);
      throw error;
    }
  }

  // Get dashboard by ID
  async getDashboardById(id: string): Promise<IDashboard | null> {
    try {
      return await Dashboard.findById(id);
    } catch (error) {
      console.error(`Error fetching dashboard with ID ${id}:`, error);
      throw error;
    }
  }

  // Update a dashboard
  async updateDashboard(id: string, params: DashboardUpdateParams): Promise<IDashboard | null> {
    try {
      return await Dashboard.findByIdAndUpdate(
        id,
        { ...params, updated: new Date() },
        { new: true }
      );
    } catch (error) {
      console.error(`Error updating dashboard with ID ${id}:`, error);
      throw error;
    }
  }

  // Delete a dashboard
  async deleteDashboard(id: string): Promise<boolean> {
    try {
      const result = await Dashboard.deleteOne({ _id: id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error(`Error deleting dashboard with ID ${id}:`, error);
      throw error;
    }
  }

  // Query dashboards with filters
  async queryDashboards(params: DashboardQueryParams): Promise<IDashboard[]> {
    try {
      let query = Dashboard.find();
      
      if (params.owner) {
        query = query.where('owner').equals(params.owner);
      }
      
      if (params.isPublic !== undefined) {
        query = query.where('isPublic').equals(params.isPublic);
      }
      
      if (params.search) {
        query = query.or([
          { name: { $regex: params.search, $options: 'i' } },
          { description: { $regex: params.search, $options: 'i' } }
        ]);
      }
      
      return await query.sort({ updated: -1 }).exec();
    } catch (error) {
      console.error('Error querying dashboards:', error);
      throw error;
    }
  }

  // Clone a dashboard
  async cloneDashboard(id: string, newOwnerId: string, newName?: string): Promise<IDashboard | null> {
    try {
      const dashboard = await Dashboard.findById(id);
      
      if (!dashboard) {
        return null;
      }
      
      const clonedDashboard = new Dashboard({
        name: newName || `Copy of ${dashboard.name}`,
        description: dashboard.description,
        owner: new mongoose.Types.ObjectId(newOwnerId),
        isPublic: false,
        layout: dashboard.layout,
        components: dashboard.components
      });
      
      return await clonedDashboard.save();
    } catch (error) {
      console.error(`Error cloning dashboard with ID ${id}:`, error);
      throw error;
    }
  }
}
```

## Integrating with Redux

Create a Redux slice to manage dashboard state:

```typescript
// src/redux/slices/dashboardSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DashboardRepository, DashboardCreateParams, DashboardUpdateParams } from '../../services/database/dashboardRepository';
import { LayoutItem, ComponentConfig } from '../../models/Dashboard';

// Create repository instance
const dashboardRepository = new DashboardRepository();

// Define state interface
interface DashboardState {
  dashboards: any[];
  currentDashboard: {
    id: string | null;
    name: string;
    description: string;
    layout: LayoutItem[];
    components: Record<string, ComponentConfig>;
    isEditing: boolean;
  };
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: DashboardState = {
  dashboards: [],
  currentDashboard: {
    id: null,
    name: 'New Dashboard',
    description: '',
    layout: [],
    components: {},
    isEditing: false
  },
  loading: false,
  error: null
};

// Async thunks
export const fetchDashboards = createAsyncThunk(
  'dashboard/fetchDashboards',
  async (userId: string) => {
    const response = await dashboardRepository.queryDashboards({ owner: userId });
    return response;
  }
);

export const fetchDashboardById = createAsyncThunk(
  'dashboard/fetchDashboardById',
  async (id: string) => {
    const dashboard = await dashboardRepository.getDashboardById(id);
    return dashboard;
  }
);

export const createDashboard = createAsyncThunk(
  'dashboard/createDashboard',
  async (params: DashboardCreateParams) => {
    const response = await dashboardRepository.createDashboard(params);
    return response;
  }
);

export const updateDashboard = createAsyncThunk(
  'dashboard/updateDashboard',
  async ({ id, params }: { id: string, params: DashboardUpdateParams }) => {
    const response = await dashboardRepository.updateDashboard(id, params);
    return response;
  }
);

export const deleteDashboard = createAsyncThunk(
  'dashboard/deleteDashboard',
  async (id: string) => {
    await dashboardRepository.deleteDashboard(id);
    return id;
  }
);

// Create slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setCurrentDashboard: (state, action: PayloadAction<any>) => {
      state.currentDashboard = {
        id: action.payload._id,
        name: action.payload.name,
        description: action.payload.description || '',
        layout: action.payload.layout || [],
        components: action.payload.components || {},
        isEditing: false
      };
    },
    updateLayout: (state, action: PayloadAction<LayoutItem[]>) => {
      state.currentDashboard.layout = action.payload;
    },
    addComponent: (state, action: PayloadAction<{ id: string; componentType: string; initialConfig: any; layout: LayoutItem }>) => {
      const { id, componentType, initialConfig, layout } = action.payload;
      state.currentDashboard.components[id] = {
        type: componentType,
        config: initialConfig
      };
      state.currentDashboard.layout.push(layout);
    },
    updateComponentConfig: (state, action: PayloadAction<{ id: string; config: any }>) => {
      const { id, config } = action.payload;
      if (state.currentDashboard.components[id]) {
        state.currentDashboard.components[id].config = {
          ...state.currentDashboard.components[id].config,
          ...config
        };
      }
    },
    removeComponent: (state, action: PayloadAction<string>) => {
      const componentId = action.payload;
      delete state.currentDashboard.components[componentId];
      state.currentDashboard.layout = state.currentDashboard.layout.filter(
        item => item.i !== componentId
      );
    },
    toggleEditMode: (state) => {
      state.currentDashboard.isEditing = !state.currentDashboard.isEditing;
    },
    resetCurrentDashboard: (state) => {
      state.currentDashboard = initialState.currentDashboard;
    }
  },
  extraReducers: (builder) => {
    // Handle async actions
    builder
      .addCase(fetchDashboards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboards.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboards = action.payload;
      })
      .addCase(fetchDashboards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboards';
      })
      .addCase(fetchDashboardById.fulfilled, (state, action) => {
        if (action.payload) {
          state.currentDashboard = {
            id: action.payload._id,
            name: action.payload.name,
            description: action.payload.description || '',
            layout: action.payload.layout || [],
            components: action.payload.components || {},
            isEditing: false
          };
        }
      })
      .addCase(createDashboard.fulfilled, (state, action) => {
        state.dashboards.unshift(action.payload);
        state.currentDashboard = {
          id: action.payload._id,
          name: action.payload.name,
          description: action.payload.description || '',
          layout: action.payload.layout || [],
          components: action.payload.components || {},
          isEditing: false
        };
      })
      .addCase(updateDashboard.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.dashboards.findIndex(d => d._id === action.payload?._id);
          if (index !== -1) {
            state.dashboards[index] = action.payload;
          }
        }
      })
      .addCase(deleteDashboard.fulfilled, (state, action) => {
        state.dashboards = state.dashboards.filter(d => d._id !== action.payload);
        if (state.currentDashboard.id === action.payload) {
          state.currentDashboard = initialState.currentDashboard;
        }
      });
  }
});

// Export actions and reducer
export const {
  setCurrentDashboard,
  updateLayout,
  addComponent,
  updateComponentConfig,
  removeComponent,
  toggleEditMode,
  resetCurrentDashboard
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
```

## Dashboard Persistence Hook

Create a custom hook to handle dashboard persistence:

```typescript
// src/hooks/useDashboardPersistence.ts
import { useAppSelector, useAppDispatch } from '../redux/hooks/hooks';
import { 
  createDashboard, 
  updateDashboard, 
  fetchDashboardById,
  fetchDashboards,
  deleteDashboard
} from '../redux/slices/dashboardSlice';
import { useCallback } from 'react';

export const useDashboardPersistence = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const { currentDashboard, dashboards, loading } = useAppSelector(state => state.dashboard);

  const loadUserDashboards = useCallback(() => {
    if (currentUser?._id) {
      dispatch(fetchDashboards(currentUser._id));
    }
  }, [dispatch, currentUser]);

  const loadDashboard = useCallback((dashboardId: string) => {
    dispatch(fetchDashboardById(dashboardId));
  }, [dispatch]);

  const saveDashboard = useCallback(async () => {
    if (!currentUser?._id) {
      return Promise.reject('User not authenticated');
    }

    // Format data for saving
    const dashboardData = {
      name: currentDashboard.name,
      description: currentDashboard.description,
      layout: currentDashboard.layout,
      components: currentDashboard.components,
      isPublic: false // Default to private
    };

    if (currentDashboard.id) {
      // Update existing dashboard
      return dispatch(updateDashboard({
        id: currentDashboard.id,
        params: dashboardData
      })).unwrap();
    } else {
      // Create new dashboard
      return dispatch(createDashboard({
        ...dashboardData,
        owner: currentUser._id
      })).unwrap();
    }
  }, [dispatch, currentDashboard, currentUser]);

  const removeDashboard = useCallback((dashboardId: string) => {
    return dispatch(deleteDashboard(dashboardId)).unwrap();
  }, [dispatch]);

  return {
    saveDashboard,
    loadDashboard,
    loadUserDashboards,
    removeDashboard,
    isLoading: loading,
    dashboards
  };
};
```

## User Authentication Integration

To properly integrate with MongoDB and your authentication system:

```typescript
// src/services/authService.ts
import { loginUser, logoutUser, getUser } from '../redux/slices/authSlice';
import { useAppDispatch } from '../redux/hooks/hooks';
import { useCallback } from 'react';

export const useAuth = () => {
  const dispatch = useAppDispatch();

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/client/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      const userData = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('authToken', userData.token);
      
      // Update Redux state
      dispatch(loginUser(userData));
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [dispatch]);

  const logout = useCallback(() => {
    // Remove token from localStorage
    localStorage.removeItem('authToken');
    
    // Update Redux state
    dispatch(logoutUser());
  }, [dispatch]);

  const getCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        return null;
      }
      
      const response = await fetch('/client/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get current user');
      }
      
      const userData = await response.json();
      
      // Update Redux state
      dispatch(getUser(userData));
      
      return userData;
    } catch (error) {
      console.error('Get current user error:', error);
      localStorage.removeItem('authToken');
      return null;
    }
  }, [dispatch]);

  return {
    login,
    logout,
    getCurrentUser
  };
};
```

## API Service for HTTP Requests

Create a service to handle API requests with authentication:

```typescript
// src/services/apiService.ts
const BASE_URL = {
  CLIENT: '/client/api',
  AMX: '/amx/api',
  HEALTH: '/health'
};

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('authToken');

// Helper to create headers with auth token
const createHeaders = (contentType = 'application/json') => {
  const headers: HeadersInit = {
    'Content-Type': contentType
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Generic fetch function with error handling
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, options);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
    
    // Parse JSON response
    const data = await response.json();
    
    // Handle API errors
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Device API methods
export const deviceApi = {
  // Get all devices with optional filters
  getAllDevices: async (filters = {}) => {
    const queryString = new URLSearchParams(filters as Record<string, string>).toString();
    const url = `${BASE_URL.CLIENT}/devices${queryString ? `?${queryString}` : ''}`;
    
    return fetchWithAuth(url, {
      method: 'GET',
      headers: createHeaders()
    });
  },
  
  // Get device by ID
  getDeviceById: async (id: string, includeDriver = false) => {
    const url = `${BASE_URL.CLIENT}/devices/${id}${includeDriver ? '?includeDriver=true' : ''}`;
    
    return fetchWithAuth(url, {
      method: 'GET',
      headers: createHeaders()
    });
  },
  
  // Get current device data
  getCurrentDeviceData: async (id: string) => {
    const url = `${BASE_URL.CLIENT}/device-data/${id}/data/current`;
    
    return fetchWithAuth(url, {
      method: 'GET',
      headers: createHeaders()
    });
  },
  
  // Get device historical data
  getDeviceHistoricalData: async (id: string, params = {}) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const url = `${BASE_URL.CLIENT}/device-data/${id}/data/history${queryString ? `?${queryString}` : ''}`;
    
    return fetchWithAuth(url, {
      method: 'GET',
      headers: createHeaders()
    });
  },
  
  // Start device polling
  startDevicePolling: async (id: string, interval: number) => {
    const url = `${BASE_URL.CLIENT}/device-data/${id}/polling/start`;
    
    return fetchWithAuth(url, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ interval })
    });
  },
  
  // Stop device polling
  stopDevicePolling: async (id: string) => {
    const url = `${BASE_URL.CLIENT}/device-data/${id}/polling/stop`;
    
    return fetchWithAuth(url, {
      method: 'POST',
      headers: createHeaders()
    });
  }
};

// Profile API methods
export const profileApi = {
  // Get all profiles
  getAllProfiles: async () => {
    const url = `${BASE_URL.CLIENT}/profiles`;
    
    return fetchWithAuth(url, {
      method: 'GET',
      headers: createHeaders()
    });
  },
  
  // Get profile by ID
  getProfileById: async (id: string) => {
    const url = `${BASE_URL.CLIENT}/profiles/${id}`;
    
    return fetchWithAuth(url, {
      method: 'GET',
      headers: createHeaders()
    });
  },
  
  // Apply profile
  applyProfile: async (id: string) => {
    const url = `${BASE_URL.CLIENT}/profiles/${id}/apply`;
    
    return fetchWithAuth(url, {
      method: 'POST',
      headers: createHeaders()
    });
  }
};

// System health
export const systemApi = {
  getHealth: async () => {
    const url = `${BASE_URL.HEALTH}`;
    
    return fetchWithAuth(url, {
      method: 'GET',
      headers: createHeaders()
    });
  }
};
```

## MongoDB Connection Setup

To initialize MongoDB connection when your app starts:

```typescript
// src/index.ts or App.tsx initialization
import { connectToMongoDB } from './services/database/mongoService';

// Initialize MongoDB connection
const initializeMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dashboard-db';
    await connectToMongoDB(mongoURI);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
};

// Call on app initialization
initializeMongoDB();
```

This guide provides a comprehensive approach to integrating MongoDB with your frontend dashboard system, including schemas, services, and Redux integration.