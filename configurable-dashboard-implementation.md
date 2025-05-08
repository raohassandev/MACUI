# Configurable Dashboard Application Implementation Strategy

## Table of Contents
1. [Frontend Architecture](#frontend-architecture)
2. [MongoDB Schema Design](#mongodb-schema-design)
3. [Component Registry & Selection Panel](#component-registry--selection-panel)
4. [Dashboard Layout Management](#dashboard-layout-management)
5. [Component Configuration Interface](#component-configuration-interface)
6. [Modal Implementation for Detailed Views](#modal-implementation-for-detailed-views)
7. [Adding New Component Types](#adding-new-component-types)
8. [API Endpoints & Integration](#api-endpoints--integration)
9. [Authentication & Authorization](#authentication--authorization)

## Frontend Architecture

We'll structure the application using a modular approach with React, TypeScript, and Material-UI for the interface. Redux Toolkit will be used for state management.

### Project Structure

```
src/
├── assets/            # Static assets
├── components/        # Shared/common components
│   ├── common/        # App-wide common components
│   ├── dashboard/     # Dashboard-specific components
│   └── modals/        # Modal components
├── features/          # Redux Toolkit feature slices
│   ├── auth/          # Authentication slice
│   ├── dashboard/     # Dashboard management slice
│   └── components/    # Dashboard components slice
├── layouts/           # Layout components
├── pages/             # Page components
├── services/          # API services
├── store/             # Redux store configuration
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

### Core Component Design Pattern

For each dashboard component, we'll follow a standardized design pattern:

```typescript
// src/types/dashboardComponent.ts
export interface DashboardComponentProps {
  id: string;                      // Unique component ID
  type: string;                    // Component type (for registry lookup)
  title: string;                   // Component title
  config: Record<string, any>;     // Component-specific configuration
  width: number;                   // Grid width
  height: number;                  // Grid height
  isEditing: boolean;              // Whether dashboard is in edit mode
  onConfigChange: (config: Record<string, any>) => void;  // Config change handler
  onOpenDetails: () => void;       // Handler to open detail modal
}

export interface DashboardComponentConfig {
  title: string;
  dataSource?: string;             // Data source identifier
  refreshInterval?: number;        // Data refresh interval in ms
  [key: string]: any;              // Additional component-specific config
}

export interface DashboardComponentDefinition {
  type: string;                    // Unique component type identifier
  name: string;                    // Display name for component
  description: string;             // Component description
  icon: string;                    // Material-UI icon name or custom SVG
  defaultConfig: DashboardComponentConfig;  // Default configuration
  component: React.ComponentType<DashboardComponentProps>;  // Component implementation
  configComponent: React.ComponentType<{    // Configuration form component
    config: DashboardComponentConfig;
    onChange: (config: DashboardComponentConfig) => void;
  }>;
  detailComponent?: React.ComponentType<{   // Detail modal component (optional)
    config: DashboardComponentConfig;
    data: any;
    onClose: () => void;
  }>;
  defaultWidth: number;            // Default grid width
  defaultHeight: number;           // Default grid height
  minWidth: number;                // Minimum allowed width
  minHeight: number;               // Minimum allowed height
}
```

### Core Component Implementation Example

```typescript
// src/components/dashboard/MetricsCard/MetricsCard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Typography } from '@mui/material';
import { DashboardComponentProps } from '../../../types/dashboardComponent';
import { fetchMetricData } from '../../../services/dataService';

export interface MetricsCardConfig {
  title: string;
  metricKey: string;
  dataSource: string;
  refreshInterval: number;
  showTrend: boolean;
  prefix?: string;
  suffix?: string;
}

export const MetricsCard: React.FC<DashboardComponentProps> = ({
  id,
  title,
  config,
  isEditing,
  onOpenDetails,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const typedConfig = config as MetricsCardConfig;
  
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchMetricData(typedConfig.dataSource, typedConfig.metricKey);
        
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load data');
          console.error('Error fetching metric data:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    // Set up polling if interval is specified
    if (typedConfig.refreshInterval > 0) {
      const intervalId = setInterval(fetchData, typedConfig.refreshInterval);
      return () => {
        clearInterval(intervalId);
        mounted = false;
      };
    }
    
    return () => {
      mounted = false;
    };
  }, [typedConfig.dataSource, typedConfig.metricKey, typedConfig.refreshInterval]);
  
  const formatValue = (value: number) => {
    return `${typedConfig.prefix || ''}${value}${typedConfig.suffix || ''}`;
  };
  
  return (
    <Card 
      sx={{ height: '100%', cursor: isEditing ? 'move' : 'pointer' }}
      onClick={isEditing ? undefined : onOpenDetails}
    >
      <CardHeader title={title || typedConfig.title} />
      <CardContent>
        {loading ? (
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        ) : error ? (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        ) : (
          <Typography variant="h3" component="div">
            {formatValue(data.value)}
            {typedConfig.showTrend && data.trend && (
              <Typography 
                variant="caption" 
                component="span"
                color={data.trend > 0 ? 'success.main' : 'error.main'}
              >
                {data.trend > 0 ? '↑' : '↓'} {Math.abs(data.trend)}%
              </Typography>
            )}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
```

## MongoDB Schema Design

The MongoDB schema design will need to support dashboards, components, user preferences, and access control.

### Dashboard Schema

```typescript
// Dashboard collection schema
interface Dashboard {
  _id: ObjectId;
  name: string;
  description?: string;
  owner: ObjectId;  // Reference to User
  isPublic: boolean;
  sharedWith: Array<{
    userId: ObjectId;  // Reference to User
    permission: 'view' | 'edit';
  }>;
  layout: Array<{
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    componentId: string;  // Reference to Component
  }>;
  created: Date;
  updated: Date;
}
```

### Component Schema

```typescript
// Component collection schema
interface Component {
  _id: ObjectId;
  dashboardId: ObjectId;  // Reference to Dashboard
  type: string;
  title: string;
  config: Record<string, any>;
  created: Date;
  updated: Date;
}
```

### User Schema

```typescript
// User collection schema
interface User {
  _id: ObjectId;
  email: string;
  password: string;  // Hashed
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  preferences: {
    defaultDashboard?: ObjectId;
    theme: 'light' | 'dark';
    [key: string]: any;
  };
  created: Date;
  updated: Date;
}
```

### Data Source Schema

```typescript
// DataSource collection schema
interface DataSource {
  _id: ObjectId;
  name: string;
  type: string;
  config: Record<string, any>;
  owner: ObjectId;  // Reference to User
  isPublic: boolean;
  created: Date;
  updated: Date;
}
```

## Component Registry & Selection Panel

To manage all available components, we'll create a component registry system that allows for easy registration and lookup of components.

### Component Registry Implementation

```typescript
// src/features/components/registry.ts
import { DashboardComponentDefinition } from '../../types/dashboardComponent';

// Component registry
const componentRegistry = new Map<string, DashboardComponentDefinition>();

// Register a component definition
export const registerComponent = (definition: DashboardComponentDefinition): void => {
  if (componentRegistry.has(definition.type)) {
    console.warn(`Component with type "${definition.type}" is already registered. It will be overridden.`);
  }
  componentRegistry.set(definition.type, definition);
};

// Get a component definition by type
export const getComponentDefinition = (type: string): DashboardComponentDefinition | undefined => {
  return componentRegistry.get(type);
};

// Get all registered component definitions
export const getAllComponentDefinitions = (): DashboardComponentDefinition[] => {
  return Array.from(componentRegistry.values());
};

// Get component registry map
export const getComponentRegistry = (): Map<string, DashboardComponentDefinition> => {
  return componentRegistry;
};
```

### Component Registration Example

```typescript
// src/components/dashboard/MetricsCard/index.ts
import { MetricsCard } from './MetricsCard';
import { MetricsCardConfig } from './MetricsCard';
import { MetricsCardConfigForm } from './MetricsCardConfigForm';
import { MetricsCardDetail } from './MetricsCardDetail';
import { registerComponent } from '../../../features/components/registry';

// Register the metrics card component
registerComponent({
  type: 'metrics-card',
  name: 'Metrics Card',
  description: 'Displays a single metric value with optional trend indicator.',
  icon: 'Speed',
  defaultConfig: {
    title: 'Metric',
    metricKey: '',
    dataSource: '',
    refreshInterval: 60000,
    showTrend: true,
  },
  component: MetricsCard,
  configComponent: MetricsCardConfigForm,
  detailComponent: MetricsCardDetail,
  defaultWidth: 3,
  defaultHeight: 2,
  minWidth: 2,
  minHeight: 1,
});

// Export for direct import if needed
export { MetricsCard, MetricsCardConfig, MetricsCardConfigForm, MetricsCardDetail };
```

### Component Selection Panel

```tsx
// src/components/dashboard/ComponentSelectorPanel.tsx
import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Divider,
  IconButton
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import * as Icons from '@mui/icons-material';
import { getAllComponentDefinitions } from '../../features/components/registry';
import { useAppDispatch } from '../../store/hooks';
import { addComponentToDashboard } from '../../features/dashboard/dashboardSlice';

// Helper to dynamically get Material-UI icons
const getIcon = (iconName: string) => {
  const IconComponent = (Icons as any)[iconName] || Icons.Extension;
  return <IconComponent />;
};

interface ComponentSelectorPanelProps {
  open: boolean;
  onClose: () => void;
}

export const ComponentSelectorPanel: React.FC<ComponentSelectorPanelProps> = ({ 
  open, 
  onClose 
}) => {
  const dispatch = useAppDispatch();
  const componentDefinitions = getAllComponentDefinitions();
  
  const handleAddComponent = (componentType: string) => {
    dispatch(addComponentToDashboard(componentType));
    onClose();
  };
  
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ width: 320 }}
      PaperProps={{ sx: { width: 320 } }}
    >
      <div style={{ padding: 16 }}>
        <Typography variant="h6">Add Components</Typography>
        <Typography variant="body2" color="text.secondary">
          Select a component to add to your dashboard
        </Typography>
      </div>
      
      <Divider />
      
      <List>
        {componentDefinitions.map((definition) => (
          <ListItem
            key={definition.type}
            button
            onClick={() => handleAddComponent(definition.type)}
          >
            <ListItemIcon>
              {typeof definition.icon === 'string' 
                ? getIcon(definition.icon) 
                : definition.icon}
            </ListItemIcon>
            <ListItemText 
              primary={definition.name} 
              secondary={definition.description} 
            />
            <IconButton edge="end" aria-label="add">
              <AddIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};
```

## Dashboard Layout Management

We'll use react-grid-layout for the grid-based dashboard layout system. This powerful library allows for responsive, draggable, and resizable grid layouts.

### Dashboard Layout Implementation

```tsx
// src/components/dashboard/DashboardGrid.tsx
import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { 
  Paper, 
  IconButton, 
  Menu, 
  MenuItem, 
  Typography 
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { 
  updateLayout, 
  removeComponent,
  openComponentConfig,
  openComponentDetail
} from '../../features/dashboard/dashboardSlice';
import { getComponentDefinition } from '../../features/components/registry';
import { DashboardComponentWrapper } from './DashboardComponentWrapper';

// Apply width provider HOC to make grid responsive
const ResponsiveGridLayout = WidthProvider(Responsive);

export const DashboardGrid: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    currentDashboard,
    components,
    isEditing 
  } = useAppSelector(state => state.dashboard);
  
  // Menu state for component actions
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeComponentId, setActiveComponentId] = useState<string | null>(null);
  
  // Handle layout changes from react-grid-layout
  const handleLayoutChange = (layout: any) => {
    dispatch(updateLayout(layout));
  };
  
  // Handle component menu opening
  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>, componentId: string) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
    setActiveComponentId(componentId);
  };
  
  // Handle component menu closing
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setActiveComponentId(null);
  };
  
  // Handle component removal
  const handleRemoveComponent = () => {
    if (activeComponentId) {
      dispatch(removeComponent(activeComponentId));
    }
    handleCloseMenu();
  };
  
  // Handle component configuration
  const handleConfigureComponent = () => {
    if (activeComponentId) {
      dispatch(openComponentConfig(activeComponentId));
    }
    handleCloseMenu();
  };
  
  // Handle opening component detail view
  const handleOpenDetail = (componentId: string) => {
    dispatch(openComponentDetail(componentId));
  };
  
  // Render a dashboard component based on its type and props
  const renderComponent = (componentId: string) => {
    const componentData = components.find(c => c.id === componentId);
    
    if (!componentData) return null;
    
    const definition = getComponentDefinition(componentData.type);
    
    if (!definition) {
      return (
        <Paper sx={{ p: 2, height: '100%' }}>
          <Typography color="error">
            Unknown component type: {componentData.type}
          </Typography>
        </Paper>
      );
    }
    
    const ComponentToRender = definition.component;
    
    return (
      <DashboardComponentWrapper
        title={componentData.title}
        isEditing={isEditing}
        onMenuOpen={(e) => handleOpenMenu(e, componentId)}
        onOpenDetails={() => handleOpenDetail(componentId)}
      >
        <ComponentToRender
          id={componentId}
          type={componentData.type}
          title={componentData.title}
          config={componentData.config}
          width={componentData.width}
          height={componentData.height}
          isEditing={isEditing}
          onConfigChange={(config) => {
            // Handle config changes
          }}
          onOpenDetails={() => handleOpenDetail(componentId)}
        />
      </DashboardComponentWrapper>
    );
  };
  
  return (
    <>
      <ResponsiveGridLayout
        className="dashboard-grid"
        layouts={{
          lg: currentDashboard.layout,
          md: currentDashboard.layout,
          sm: currentDashboard.layout,
          xs: currentDashboard.layout,
          xxs: currentDashboard.layout,
        }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditing}
        isResizable={isEditing}
        margin={[16, 16]}
      >
        {currentDashboard.layout.map((item) => (
          <div key={item.i}>
            {renderComponent(item.i)}
          </div>
        ))}
      </ResponsiveGridLayout>
      
      {/* Component Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleConfigureComponent}>Configure</MenuItem>
        <MenuItem onClick={handleRemoveComponent}>Remove</MenuItem>
      </Menu>
    </>
  );
};
```

### Dashboard Component Wrapper

```tsx
// src/components/dashboard/DashboardComponentWrapper.tsx
import React from 'react';
import { Paper, Box, Typography, IconButton } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

interface DashboardComponentWrapperProps {
  title: string;
  isEditing: boolean;
  children: React.ReactNode;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
  onOpenDetails: () => void;
}

export const DashboardComponentWrapper: React.FC<DashboardComponentWrapperProps> = ({
  title,
  isEditing,
  children,
  onMenuOpen,
  onOpenDetails
}) => {
  return (
    <Paper 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}
      onClick={isEditing ? undefined : onOpenDetails}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="subtitle1">{title}</Typography>
        {isEditing && (
          <IconButton size="small" onClick={onMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        )}
      </Box>
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
        {children}
      </Box>
    </Paper>
  );
};
```

### Dashboard Management Redux Slice

```typescript
// src/features/dashboard/dashboardSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { getComponentDefinition } from '../components/registry';
import { 
  fetchDashboards, 
  fetchDashboardById, 
  createDashboard,
  updateDashboard,
  deleteDashboard
} from '../../services/dashboardService';

// Types for dashboard state
interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ComponentData {
  id: string;
  type: string;
  title: string;
  config: Record<string, any>;
  width: number;
  height: number;
}

interface DashboardData {
  id: string;
  name: string;
  description: string;
  layout: LayoutItem[];
  isPublic: boolean;
}

interface DashboardState {
  dashboards: DashboardData[];
  currentDashboard: DashboardData;
  components: ComponentData[];
  isEditing: boolean;
  activeConfigComponentId: string | null;
  activeDetailComponentId: string | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: DashboardState = {
  dashboards: [],
  currentDashboard: {
    id: 'default',
    name: 'New Dashboard',
    description: '',
    layout: [],
    isPublic: false
  },
  components: [],
  isEditing: false,
  activeConfigComponentId: null,
  activeDetailComponentId: null,
  isLoading: false,
  error: null
};

// Async thunks for API calls
export const fetchUserDashboards = createAsyncThunk(
  'dashboard/fetchUserDashboards',
  async () => {
    const response = await fetchDashboards();
    return response;
  }
);

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetchDashboard',
  async (dashboardId: string) => {
    const response = await fetchDashboardById(dashboardId);
    return response;
  }
);

export const saveDashboard = createAsyncThunk(
  'dashboard/saveDashboard',
  async (_, { getState }) => {
    const state = getState() as { dashboard: DashboardState };
    const { currentDashboard, components } = state.dashboard;
    
    const dashboardData = {
      ...currentDashboard,
      components
    };
    
    if (currentDashboard.id === 'default') {
      // Create new dashboard
      return await createDashboard(dashboardData);
    } else {
      // Update existing dashboard
      return await updateDashboard(currentDashboard.id, dashboardData);
    }
  }
);

// Dashboard slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Toggle editing mode
    toggleEditing: (state) => {
      state.isEditing = !state.isEditing;
    },
    
    // Update dashboard layout
    updateLayout: (state, action: PayloadAction<LayoutItem[]>) => {
      state.currentDashboard.layout = action.payload;
    },
    
    // Add a new component to the dashboard
    addComponentToDashboard: (state, action: PayloadAction<string>) => {
      const componentType = action.payload;
      const definition = getComponentDefinition(componentType);
      
      if (!definition) return;
      
      // Generate a unique ID for the component
      const componentId = `${componentType}-${uuidv4()}`;
      
      // Find the next available position
      let maxY = 0;
      state.currentDashboard.layout.forEach(item => {
        const bottomY = item.y + item.h;
        if (bottomY > maxY) {
          maxY = bottomY;
        }
      });
      
      // Create new component data
      const newComponent: ComponentData = {
        id: componentId,
        type: componentType,
        title: definition.name,
        config: { ...definition.defaultConfig },
        width: definition.defaultWidth,
        height: definition.defaultHeight
      };
      
      // Add to components array
      state.components.push(newComponent);
      
      // Add to layout
      state.currentDashboard.layout.push({
        i: componentId,
        x: 0,
        y: maxY,
        w: definition.defaultWidth,
        h: definition.defaultHeight
      });
      
      // Open config modal for the new component
      state.activeConfigComponentId = componentId;
    },
    
    // Remove a component from the dashboard
    removeComponent: (state, action: PayloadAction<string>) => {
      const componentId = action.payload;
      
      // Remove from components array
      state.components = state.components.filter(c => c.id !== componentId);
      
      // Remove from layout
      state.currentDashboard.layout = state.currentDashboard.layout.filter(
        item => item.i !== componentId
      );
    },
    
    // Open component configuration modal
    openComponentConfig: (state, action: PayloadAction<string>) => {
      state.activeConfigComponentId = action.payload;
    },
    
    // Close component configuration modal
    closeComponentConfig: (state) => {
      state.activeConfigComponentId = null;
    },
    
    // Update component configuration
    updateComponentConfig: (
      state,
      action: PayloadAction<{ id: string; config: Record<string, any>; title?: string }>
    ) => {
      const { id, config, title } = action.payload;
      const component = state.components.find(c => c.id === id);
      
      if (component) {
        component.config = { ...config };
        if (title) {
          component.title = title;
        }
      }
      
      state.activeConfigComponentId = null;
    },
    
    // Open component detail modal
    openComponentDetail: (state, action: PayloadAction<string>) => {
      state.activeDetailComponentId = action.payload;
    },
    
    // Close component detail modal
    closeComponentDetail: (state) => {
      state.activeDetailComponentId = null;
    },
    
    // Create a new dashboard
    createNewDashboard: (state) => {
      state.currentDashboard = {
        id: 'default',
        name: 'New Dashboard',
        description: '',
        layout: [],
        isPublic: false
      };
      state.components = [];
    },
    
    // Update dashboard metadata
    updateDashboardMetadata: (
      state,
      action: PayloadAction<{ name: string; description: string; isPublic: boolean }>
    ) => {
      const { name, description, isPublic } = action.payload;
      state.currentDashboard.name = name;
      state.currentDashboard.description = description;
      state.currentDashboard.isPublic = isPublic;
    },
  },
  extraReducers: (builder) => {
    // Handle async thunk states
    builder
      // fetchUserDashboards
      .addCase(fetchUserDashboards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserDashboards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboards = action.payload;
      })
      .addCase(fetchUserDashboards.rejected, (state, action) => {
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
        const { dashboard, components } = action.payload;
        state.currentDashboard = dashboard;
        state.components = components;
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
        const { dashboard, components } = action.payload;
        
        // Update current dashboard with saved data
        state.currentDashboard = dashboard;
        
        // Update dashboards list
        const existingIndex = state.dashboards.findIndex(d => d.id === dashboard.id);
        if (existingIndex >= 0) {
          state.dashboards[existingIndex] = dashboard;
        } else {
          state.dashboards.push(dashboard);
        }
      })
      .addCase(saveDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to save dashboard';
      });
  }
});

// Export actions and reducer
export const {
  toggleEditing,
  updateLayout,
  addComponentToDashboard,
  removeComponent,
  openComponentConfig,
  closeComponentConfig,
  updateComponentConfig,
  openComponentDetail,
  closeComponentDetail,
  createNewDashboard,
  updateDashboardMetadata
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
```

## Component Configuration Interface

We need to create a reusable configuration modal system that can adapt to different component types.

### Configuration Modal Component

```tsx
// src/components/modals/ConfigurationModal.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  closeComponentConfig,
  updateComponentConfig
} from '../../features/dashboard/dashboardSlice';
import { getComponentDefinition } from '../../features/components/registry';

export const ConfigurationModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    activeConfigComponentId, 
    components 
  } = useAppSelector(state => state.dashboard);
  
  // Find the active component
  const activeComponent = activeConfigComponentId 
    ? components.find(c => c.id === activeConfigComponentId) 
    : null;
  
  // Get component definition if we have an active component
  const componentDefinition = activeComponent 
    ? getComponentDefinition(activeComponent.type) 
    : null;
  
  // Local state for configuration form
  const [formState, setFormState] = React.useState<{
    title: string;
    config: Record<string, any>;
  }>({
    title: activeComponent?.title || '',
    config: { ...(activeComponent?.config || {}) }
  });
  
  // Update form state when active component changes
  React.useEffect(() => {
    if (activeComponent) {
      setFormState({
        title: activeComponent.title,
        config: { ...activeComponent.config }
      });
    }
  }, [activeComponent]);
  
  // Handler for configuration changes
  const handleConfigChange = (newConfig: Record<string, any>) => {
    setFormState(prev => ({
      ...prev,
      config: newConfig
    }));
  };
  
  // Handler for title change
  const handleTitleChange = (newTitle: string) => {
    setFormState(prev => ({
      ...prev,
      title: newTitle
    }));
  };
  
  // Handler for save button
  const handleSave = () => {
    if (activeConfigComponentId) {
      dispatch(updateComponentConfig({
        id: activeConfigComponentId,
        config: formState.config,
        title: formState.title
      }));
    }
  };
  
  // Handler for close button
  const handleClose = () => {
    dispatch(closeComponentConfig());
  };
  
  // If no active component or definition, don't render
  if (!activeComponent || !componentDefinition) {
    return null;
  }
  
  // Get config component from definition
  const ConfigComponent = componentDefinition.configComponent;
  
  return (
    <Dialog
      open={Boolean(activeConfigComponentId)}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            Configure {componentDefinition.name}
          </Typography>
          <IconButton edge="end" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            Component Title
          </Typography>
          <input
            type="text"
            value={formState.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </Box>
        
        <ConfigComponent
          config={formState.config}
          onChange={handleConfigChange}
        />
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

### Component Configuration Form Example

```tsx
// src/components/dashboard/MetricsCard/MetricsCardConfigForm.tsx
import React, { useEffect, useState } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Grid
} from '@mui/material';
import { MetricsCardConfig } from './MetricsCard';
import { fetchDataSources } from '../../../services/dataSourceService';

interface MetricsCardConfigFormProps {
  config: MetricsCardConfig;
  onChange: (config: MetricsCardConfig) => void;
}

export const MetricsCardConfigForm: React.FC<MetricsCardConfigFormProps> = ({
  config,
  onChange
}) => {
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Load data sources when the component mounts
  useEffect(() => {
    const loadDataSources = async () => {
      try {
        setLoading(true);
        const sources = await fetchDataSources();
        setDataSources(sources);
      } catch (err) {
        console.error('Failed to load data sources:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadDataSources();
  }, []);
  
  // Load available metrics when the data source changes
  useEffect(() => {
    const loadMetrics = async () => {
      if (!config.dataSource) return;
      
      try {
        setLoading(true);
        const metricsData = await fetchMetrics(config.dataSource);
        setMetrics(metricsData);
      } catch (err) {
        console.error('Failed to load metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadMetrics();
  }, [config.dataSource]);
  
  // Update a single config property
  const updateConfig = (property: keyof MetricsCardConfig, value: any) => {
    onChange({
      ...config,
      [property]: value
    });
  };
  
  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Data Source Configuration
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="data-source-label">Data Source</InputLabel>
            <Select
              labelId="data-source-label"
              value={config.dataSource}
              onChange={(e) => updateConfig('dataSource', e.target.value)}
              disabled={loading}
            >
              <MenuItem value="">Select a data source</MenuItem>
              {dataSources.map((source) => (
                <MenuItem key={source.id} value={source.id}>
                  {source.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="metric-key-label">Metric</InputLabel>
            <Select
              labelId="metric-key-label"
              value={config.metricKey}
              onChange={(e) => updateConfig('metricKey', e.target.value)}
              disabled={!config.dataSource || loading}
            >
              <MenuItem value="">Select a metric</MenuItem>
              {metrics.map((metric) => (
                <MenuItem key={metric.key} value={metric.key}>
                  {metric.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Refresh Interval (ms)"
            type="number"
            value={config.refreshInterval}
            onChange={(e) => updateConfig('refreshInterval', Number(e.target.value))}
            margin="normal"
            inputProps={{ min: 1000, step: 1000 }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={config.showTrend}
                  onChange={(e) => updateConfig('showTrend', e.target.checked)}
                  color="primary"
                />
              }
              label="Show Trend Indicator"
            />
          </FormGroup>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Prefix"
            value={config.prefix || ''}
            onChange={(e) => updateConfig('prefix', e.target.value)}
            margin="normal"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Suffix"
            value={config.suffix || ''}
            onChange={(e) => updateConfig('suffix', e.target.value)}
            margin="normal"
          />
        </Grid>
      </Grid>
    </Box>
  );
};
```

## Modal Implementation for Detailed Views

We need a modal system to display detailed information when a user clicks on a component.

### Detail Modal Component

```tsx
// src/components/modals/DetailModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { closeComponentDetail } from '../../features/dashboard/dashboardSlice';
import { getComponentDefinition } from '../../features/components/registry';
import { fetchComponentDetailData } from '../../services/dataService';

export const DetailModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    activeDetailComponentId, 
    components 
  } = useAppSelector(state => state.dashboard);
  
  const [detailData, setDetailData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Find the active component
  const activeComponent = activeDetailComponentId 
    ? components.find(c => c.id === activeDetailComponentId) 
    : null;
  
  // Get component definition
  const componentDefinition = activeComponent 
    ? getComponentDefinition(activeComponent.type) 
    : null;
  
  // Fetch detail data when the modal opens
  useEffect(() => {
    const fetchData = async () => {
      if (!activeComponent) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const data = await fetchComponentDetailData(
          activeComponent.type,
          activeComponent.config
        );
        
        setDetailData(data);
      } catch (err) {
        console.error('Failed to fetch detail data:', err);
        setError('Failed to load detailed information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeComponent]);
  
  // Handler for close button
  const handleClose = () => {
    dispatch(closeComponentDetail());
  };
  
  // If no active component or definition, don't render
  if (!activeComponent || !componentDefinition) {
    return null;
  }
  
  // Get detail component from definition or use default
  const DetailComponent = componentDefinition.detailComponent;
  
  // If no detail component is defined, show a default view
  const renderDetailContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Box p={2}>
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }
    
    if (DetailComponent && detailData) {
      return (
        <DetailComponent
          config={activeComponent.config}
          data={detailData}
          onClose={handleClose}
        />
      );
    }
    
    // Default detail view
    return (
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          {activeComponent.title}
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom>
          Component Type: {componentDefinition.name}
        </Typography>
        
        <Typography variant="subtitle2" gutterBottom>
          Configuration:
        </Typography>
        
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '8px', 
          borderRadius: '4px',
          overflow: 'auto'
        }}>
          {JSON.stringify(activeComponent.config, null, 2)}
        </pre>
        
        {detailData && (
          <>
            <Typography variant="subtitle2" gutterBottom>
              Data:
            </Typography>
            
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '8px', 
              borderRadius: '4px',
              overflow: 'auto' 
            }}>
              {JSON.stringify(detailData, null, 2)}
            </pre>
          </>
        )}
      </Box>
    );
  };
  
  return (
    <Dialog
      open={Boolean(activeDetailComponentId)}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {activeComponent.title}
          </Typography>
          <IconButton edge="end" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {renderDetailContent()}
      </DialogContent>
    </Dialog>
  );
};
```

### Component Detail Example

```tsx
// src/components/dashboard/MetricsCard/MetricsCardDetail.tsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { MetricsCardConfig } from './MetricsCard';

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MetricsCardDetailProps {
  config: MetricsCardConfig;
  data: {
    current: {
      value: number;
      trend: number;
      timestamp: string;
    };
    historical: Array<{
      timestamp: string;
      value: number;
    }>;
    metadata: {
      name: string;
      description: string;
      unit: string;
      min?: number;
      max?: number;
      average?: number;
    };
    alerts?: Array<{
      id: string;
      type: string;
      message: string;
      threshold: number;
      timestamp: string;
    }>;
  };
  onClose: () => void;
}

export const MetricsCardDetail: React.FC<MetricsCardDetailProps> = ({
  config,
  data
}) => {
  // Format the current value display
  const formatValue = (value: number) => {
    return `${config.prefix || ''}${value}${config.suffix || ''}`;
  };
  
  // Prepare chart data
  const chartData = {
    labels: data.historical.map(point => 
      new Date(point.timestamp).toLocaleTimeString()
    ),
    datasets: [
      {
        label: data.metadata.name,
        data: data.historical.map(point => point.value),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${data.metadata.name} Over Time`
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: data.metadata.unit
        }
      }
    }
  };
  
  return (
    <Box p={2}>
      {/* Header with current value */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="div">
              {formatValue(data.current.value)}
              {config.showTrend && data.current.trend && (
                <Typography 
                  variant="h6" 
                  component="span"
                  color={data.current.trend > 0 ? 'success.main' : 'error.main'}
                  sx={{ ml: 1 }}
                >
                  {data.current.trend > 0 ? '↑' : '↓'} {Math.abs(data.current.trend)}%
                </Typography>
              )}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {data.metadata.name}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" justifyContent="flex-end" flexWrap="wrap" gap={1}>
              <Chip label={`Unit: ${data.metadata.unit}`} size="small" />
              {data.metadata.min !== undefined && (
                <Chip label={`Min: ${data.metadata.min}`} size="small" />
              )}
              {data.metadata.max !== undefined && (
                <Chip label={`Max: ${data.metadata.max}`} size="small" />
              )}
              {data.metadata.average !== undefined && (
                <Chip label={`Avg: ${data.metadata.average}`} size="small" />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Description */}
      {data.metadata.description && (
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Typography variant="body1">
            {data.metadata.description}
          </Typography>
        </Paper>
      )}
      
      {/* Historical data chart */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Historical Data
        </Typography>
        <Box height={300}>
          <Line data={chartData} options={chartOptions} />
        </Box>
      </Paper>
      
      {/* Alerts if available */}
      {data.alerts && data.alerts.length > 0 && (
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Alerts
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Threshold</TableCell>
                <TableCell>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    <Chip 
                      label={alert.type} 
                      color={
                        alert.type === 'critical' ? 'error' :
                        alert.type === 'warning' ? 'warning' : 'info'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{alert.message}</TableCell>
                  <TableCell>{alert.threshold}</TableCell>
                  <TableCell>
                    {new Date(alert.timestamp).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
      
      {/* Raw data table */}
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Data Points
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.historical.map((point, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(point.timestamp).toLocaleString()}</TableCell>
                <TableCell>{point.value} {data.metadata.unit}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};
```

## Adding New Component Types

To make the system extensible, we need a clear process for adding new component types. Let's create documentation for this process.

### Component Extension Documentation

```markdown
# Adding New Dashboard Components

This document explains how to create and register new component types for the dashboard system.

## Component Structure

Each dashboard component consists of at least three parts:
1. The main component (visualization)
2. The configuration form
3. The detailed view (optional)

## Step 1: Create Component Files

Create a new folder for your component in `src/components/dashboard/[ComponentName]/` with these files:

- `[ComponentName].tsx` - Main component implementation
- `[ComponentName]ConfigForm.tsx` - Configuration form
- `[ComponentName]Detail.tsx` - Detail view (optional)
- `index.ts` - Export file that registers the component

## Step 2: Implement the Main Component

Your main component should implement the `DashboardComponentProps` interface:

```tsx
import React from 'react';
import { DashboardComponentProps } from '../../../types/dashboardComponent';

// Define your component-specific configuration interface
export interface MyComponentConfig {
  // Add your configuration properties
  title: string;
  dataSource: string;
  // ...other properties
}

export const MyComponent: React.FC<DashboardComponentProps> = ({
  id,
  title,
  config,
  isEditing,
  onOpenDetails,
}) => {
  // Type assertion for your config
  const typedConfig = config as MyComponentConfig;

  // Your component implementation
  return (
    <div onClick={isEditing ? undefined : onOpenDetails}>
      {/* Your component content */}
    </div>
  );
};
```

## Step 3: Implement the Configuration Form

```tsx
import React from 'react';
import { TextField, FormControl, Grid } from '@mui/material';
import { MyComponentConfig } from './MyComponent';

interface MyComponentConfigFormProps {
  config: MyComponentConfig;
  onChange: (config: MyComponentConfig) => void;
}

export const MyComponentConfigForm: React.FC<MyComponentConfigFormProps> = ({
  config,
  onChange,
}) => {
  // Update a single config property
  const updateConfig = (property: keyof MyComponentConfig, value: any) => {
    onChange({
      ...config,
      [property]: value,
    });
  };

  return (
    <Grid container spacing={2}>
      {/* Your configuration form fields */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Data Source"
          value={config.dataSource}
          onChange={(e) => updateConfig('dataSource', e.target.value)}
        />
      </Grid>
      {/* Add more configuration fields */}
    </Grid>
  );
};
```

## Step 4: Implement the Detail View (Optional)

```tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { MyComponentConfig } from './MyComponent';

interface MyComponentDetailProps {
  config: MyComponentConfig;
  data: any;
  onClose: () => void;
}

export const MyComponentDetail: React.FC<MyComponentDetailProps> = ({
  config,
  data,
  onClose,
}) => {
  return (
    <Box p={2}>
      <Typography variant="h6">{config.title}</Typography>
      {/* Your detailed view implementation */}
    </Box>
  );
};
```

## Step 5: Register Your Component

In your `index.ts` file, register the component with the registry:

```tsx
import { MyComponent } from './MyComponent';
import { MyComponentConfigForm } from './MyComponentConfigForm';
import { MyComponentDetail } from './MyComponentDetail';
import { registerComponent } from '../../../features/components/registry';

// Register your component
registerComponent({
  type: 'my-component', // Unique identifier
  name: 'My Component', // Display name
  description: 'Description of what this component does',
  icon: 'Dashboard', // Material-UI icon name
  defaultConfig: {
    title: 'My Component',
    dataSource: '',
    // ...other default values
  },
  component: MyComponent,
  configComponent: MyComponentConfigForm,
  detailComponent: MyComponentDetail, // Optional
  defaultWidth: 3,
  defaultHeight: 2,
  minWidth: 2,
  minHeight: 1,
});

// Export for direct import if needed
export { MyComponent, MyComponentConfigForm, MyComponentDetail };
```

## Step 6: Import in Main Registry

To ensure your component is registered, import it in the main component registry file:

```tsx
// src/components/dashboard/componentRegistration.ts
import './MetricsCard';
import './LineChart';
import './DataTable';
// ... import other components
import './MyComponent'; // Add your new component
```

## Step 7: Add Custom Styling (Optional)

If your component needs specific styles:

```tsx
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    // Your styles
  },
}));

export const MyComponent: React.FC<DashboardComponentProps> = (props) => {
  const classes = useStyles();
  // ...
};
```

## Testing Your Component

Before integrating your component, test it independently:

1. Create a test dashboard
2. Add your component to it
3. Test the configuration modal
4. Test the detail view
5. Verify data updates correctly

## Best Practices

- **Error Handling**: Always handle loading states and errors gracefully
- **Responsiveness**: Ensure your component works well at different sizes
- **Types**: Use TypeScript interfaces for all props and state
- **Performance**: Use memoization for expensive calculations
- **Accessibility**: Ensure your component is accessible with proper ARIA attributes
```

## API Endpoints & Integration

Let's set up the API service to connect our frontend with MongoDB.

### API Service Implementation

```typescript
// src/services/api.ts
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API request function
export const apiRequest = async <T>(
  method: string,
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient({
      method,
      url,
      data,
      ...config
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'API Error');
    }
    throw new Error('Network error');
  }
};

// API endpoints
export const api = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) => 
      apiRequest<{ token: string; user: any }>('post', '/auth/login', { email, password }),
    register: (userData: any) => 
      apiRequest<{ token: string; user: any }>('post', '/auth/register', userData),
    me: () => 
      apiRequest<{ user: any }>('get', '/auth/me'),
    logout: () => 
      apiRequest<void>('post', '/auth/logout')
  },
  
  // Dashboard endpoints
  dashboards: {
    getAll: () => 
      apiRequest<any[]>('get', '/dashboards'),
    getById: (id: string) => 
      apiRequest<any>('get', `/dashboards/${id}`),
    create: (dashboard: any) => 
      apiRequest<any>('post', '/dashboards', dashboard),
    update: (id: string, dashboard: any) => 
      apiRequest<any>('put', `/dashboards/${id}`, dashboard),
    delete: (id: string) => 
      apiRequest<void>('delete', `/dashboards/${id}`),
    share: (id: string, users: { userId: string; permission: string }[]) => 
      apiRequest<void>('post', `/dashboards/${id}/share`, { users })
  },
  
  // Component endpoints
  components: {
    getByDashboardId: (dashboardId: string) => 
      apiRequest<any[]>('get', `/components?dashboardId=${dashboardId}`),
    create: (component: any) => 
      apiRequest<any>('post', '/components', component),
    update: (id: string, component: any) => 
      apiRequest<any>('put', `/components/${id}`, component),
    delete: (id: string) => 
      apiRequest<void>('delete', `/components/${id}`)
  },
  
  // Data source endpoints
  dataSources: {
    getAll: () => 
      apiRequest<any[]>('get', '/data-sources'),
    getById: (id: string) => 
      apiRequest<any>('get', `/data-sources/${id}`),
    create: (dataSource: any) => 
      apiRequest<any>('post', '/data-sources', dataSource),
    update: (id: string, dataSource: any) => 
      apiRequest<any>('put', `/data-sources/${id}`, dataSource),
    delete: (id: string) => 
      apiRequest<void>('delete', `/data-sources/${id}`),
    testConnection: (dataSource: any) => 
      apiRequest<{ success: boolean; message: string }>('post', '/data-sources/test', dataSource)
  },
  
  // Data endpoints
  data: {
    query: (dataSourceId: string, query: any) => 
      apiRequest<any>('post', `/data/query/${dataSourceId}`, query),
    getMetrics: (dataSourceId: string) => 
      apiRequest<any[]>('get', `/data/metrics/${dataSourceId}`),
    getMetricData: (dataSourceId: string, metricKey: string, options?: any) => 
      apiRequest<any>('get', `/data/metrics/${dataSourceId}/${metricKey}`, { params: options }),
    getComponentData: (componentType: string, componentConfig: any) => 
      apiRequest<any>('post', '/data/component', { type: componentType, config: componentConfig })
  }
};
```

### Dashboard Service

```typescript
// src/services/dashboardService.ts
import { api } from './api';

// Fetch all dashboards for the current user
export const fetchDashboards = async () => {
  try {
    const dashboards = await api.dashboards.getAll();
    return dashboards;
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    throw error;
  }
};

// Fetch a specific dashboard by ID
export const fetchDashboardById = async (id: string) => {
  try {
    const dashboard = await api.dashboards.getById(id);
    const components = await api.components.getByDashboardId(id);
    
    return { dashboard, components };
  } catch (error) {
    console.error(`Error fetching dashboard with ID ${id}:`, error);
    throw error;
  }
};

// Create a new dashboard
export const createDashboard = async (dashboardData: any) => {
  try {
    // Create the dashboard first
    const dashboard = await api.dashboards.create({
      name: dashboardData.name,
      description: dashboardData.description,
      isPublic: dashboardData.isPublic,
      layout: dashboardData.layout
    });
    
    // Create each component associated with the dashboard
    const components = await Promise.all(
      dashboardData.components.map((component: any) =>
        api.components.create({
          ...component,
          dashboardId: dashboard.id
        })
      )
    );
    
    return { dashboard, components };
  } catch (error) {
    console.error('Error creating dashboard:', error);
    throw error;
  }
};

// Update an existing dashboard
export const updateDashboard = async (id: string, dashboardData: any) => {
  try {
    // Update the dashboard
    const dashboard = await api.dashboards.update(id, {
      name: dashboardData.name,
      description: dashboardData.description,
      isPublic: dashboardData.isPublic,
      layout: dashboardData.layout
    });
    
    // Get existing components
    const existingComponents = await api.components.getByDashboardId(id);
    
    // Separate components to create, update, or delete
    const existingIds = existingComponents.map((c: any) => c.id);
    const newComponentIds = dashboardData.components.map((c: any) => c.id);
    
    // Components to create (not in existing)
    const componentsToCreate = dashboardData.components.filter(
      (c: any) => !existingIds.includes(c.id)
    );
    
    // Components to update (in both)
    const componentsToUpdate = dashboardData.components.filter(
      (c: any) => existingIds.includes(c.id)
    );
    
    // Components to delete (in existing but not in new)
    const componentsToDelete = existingComponents.filter(
      (c: any) => !newComponentIds.includes(c.id)
    );
    
    // Create new components
    await Promise.all(
      componentsToCreate.map((component: any) =>
        api.components.create({
          ...component,
          dashboardId: id
        })
      )
    );
    
    // Update existing components
    await Promise.all(
      componentsToUpdate.map((component: any) =>
        api.components.update(component.id, component)
      )
    );
    
    // Delete removed components
    await Promise.all(
      componentsToDelete.map((component: any) =>
        api.components.delete(component.id)
      )
    );
    
    // Get updated components
    const updatedComponents = await api.components.getByDashboardId(id);
    
    return { dashboard, components: updatedComponents };
  } catch (error) {
    console.error(`Error updating dashboard with ID ${id}:`, error);
    throw error;
  }
};

// Delete a dashboard
export const deleteDashboard = async (id: string) => {
  try {
    await api.dashboards.delete(id);
  } catch (error) {
    console.error(`Error deleting dashboard with ID ${id}:`, error);
    throw error;
  }
};

// Share a dashboard with other users
export const shareDashboard = async (
  id: string,
  users: Array<{ userId: string; permission: string }>
) => {
  try {
    await api.dashboards.share(id, users);
  } catch (error) {
    console.error(`Error sharing dashboard with ID ${id}:`, error);
    throw error;
  }
};
```

## Authentication & Authorization

To handle user authentication, we'll implement a secure authentication system with JWT tokens.

### Auth Slice

```typescript
// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

// Types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: Boolean(localStorage.getItem('auth_token')),
  isLoading: false,
  error: null
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.auth.login(email, password);
      localStorage.setItem('auth_token', response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await api.auth.register(userData);
      localStorage.setItem('auth_token', response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.auth.me();
      return response.user;
    } catch (error: any) {
      localStorage.removeItem('auth_token');
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.auth.logout();
      localStorage.removeItem('auth_token');
      return null;
    } catch (error: any) {
      localStorage.removeItem('auth_token');
      return rejectWithValue(error.message);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear any error messages
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      })
      
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  }
});

// Export actions and reducer
export const { clearError } = authSlice.actions;
export default authSlice.reducer;
```

### Protected Route Component

```tsx
// src/components/common/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { loadUser } from '../../features/auth/authSlice';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole
}) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAppSelector(state => state.auth);
  
  useEffect(() => {
    if (!user && isAuthenticated) {
      dispatch(loadUser());
    }
  }, [dispatch, user, isAuthenticated]);
  
  // If still loading, show loading indicator
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If role is required and user doesn't have it, redirect to access denied
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/access-denied" replace />;
  }
  
  // User is authenticated and has required role
  return <>{children}</>;
};
```

This implementation strategy covers all the core aspects of your configurable dashboard application. The code provides a flexible and extensible system for creating, configuring, and displaying components on a dashboard, with persistence to MongoDB and a comprehensive API integration.

For production use, you would need to:
1. Implement the backend API endpoints described in the API service
2. Set up the MongoDB schemas and controllers
3. Create the actual visualization components for your dashboard
4. Implement any specific data fetching or processing logic

The architecture is designed to be modular and extensible, allowing you to add new component types as your requirements evolve.