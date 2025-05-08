# Frontend-Configurable Dashboard System Implementation Prompt

## Project Overview
I need to enhance my current React application to become a fully configurable dashboard system similar to Grafana, where users can:

1. Drag and drop pre-built components onto a dashboard grid
2. Configure each component with data from our device management system
3. Save and load dashboard configurations from MongoDB
4. View detailed data in modal popups when clicking on dashboard components

The system should utilize the existing React Grid Layout functionality that's already integrated, while adding component configuration, persistence, and API integration capabilities.

## Technical Requirements

### Frontend Stack
- **React** with TypeScript for component development
- **Redux** for state management (already set up in the `/redux` directory)
- **React Grid Layout** for the dashboard grid system (already integrated)
- **MongoDB** for storing dashboard configurations
- **Tailwind CSS** for styling (already integrated)

### Key Features to Implement

#### 1. Component Library
Create a library of pre-built components that can be placed on the dashboard:
- Device Status Card: Shows online/offline status of devices
- Readings Gauge/Meter: Displays current readings from device data points
- Historical Data Chart: Shows trends from historical device data
- Device List: Filterable list of devices
- Alert Panel: Shows recent alerts and issues
- Quick Actions Panel: Provides buttons for common device actions

Each component should:
- Have a consistent appearance that follows our theme system
- Be configurable through a settings modal
- Support different sizes within the grid
- Refresh data at configurable intervals

#### 2. Dashboard Configuration
- Dashboard state should be managed in Redux
- Create `/redux/slices/dashboardSlice.ts` to handle dashboard state
- Implement CRUD operations for dashboards
- Allow saving/loading multiple dashboard configurations
- Support dashboard templates

#### 3. Component Configuration System
- Each component needs a configuration interface to select:
  - Data source (specific device/data point from API)
  - Display options (chart type, colors, etc.)
  - Refresh rate
  - Size/layout constraints
- Configuration changes should persist to MongoDB

#### 4. MongoDB Integration
- Implement services to:
  - Save dashboard configurations to MongoDB
  - Load saved configurations
  - Share configurations between users (optional)
- Consider using a dedicated collection for dashboard configurations

#### 5. API Integration
- Connect to the Device Management System API provided in the documentation 
- Implement proper authentication and token management
- Create services for different API endpoints:
  - Device data retrieval
  - Device management
  - Profile management
- Handle API errors gracefully

#### 6. Detail Modals
- Implement a modal system for displaying detailed information
- Each dashboard component should expand to show more data when clicked
- Modals should allow for additional configuration options

## API Integration Details

The backend provides a comprehensive API for device management as detailed in the attached API documentation. Key endpoints to integrate include:

### Authentication
- Implement token-based authentication using `/client/api/auth/login`
- Store the JWT token securely
- Include token in the Authorization header for protected requests

### Device Data
- Fetch devices using `/client/api/devices` with appropriate filtering
- Get real-time device data via `/client/api/device-data/:id/data/current`
- Retrieve historical data using `/client/api/device-data/:id/data/history`
- Implement device polling management with start/stop endpoints

### Profiles
- Incorporate device profiles via `/client/api/profiles` endpoints
- Allow profile application from the dashboard

## Component Development Guidelines

1. Each component should follow a consistent pattern:
   - Component folder structure:
     ```
     /components/DashboardComponents/[ComponentName]/
       - [ComponentName].tsx           (Main component)
       - [ComponentName]Config.tsx     (Configuration interface)
       - [ComponentName]Detail.tsx     (Detail modal)
       - types.ts                      (Component-specific types)
     ```

2. Component base interface:
   ```typescript
   interface DashboardComponentProps {
     id: string;              // Unique ID for this component instance
     w: number;               // Width in grid units
     h: number;               // Height in grid units
     config: any;             // Component-specific configuration
     onConfigure: () => void; // Opens configuration modal
     onViewDetails: () => void; // Opens detail modal
     isEditing: boolean;      // Whether dashboard is in edit mode
   }
   ```

3. Configuration storage interface:
   ```typescript
   interface DashboardConfig {
     id: string;
     name: string;
     description?: string;
     owner: string;
     isPublic: boolean;
     layout: Layout[];        // React-Grid-Layout configuration
     components: {
       [id: string]: {
         type: string;        // Component type
         config: any;         // Component-specific configuration
       }
     };
     created: Date;
     updated: Date;
   }
   ```

## Implementation Plan

1. First, create the core dashboard infrastructure:
   - Dashboard container with React Grid Layout
   - Component registry system
   - Basic add/remove component functionality

2. Create foundational services:
   - API service for connecting to backend
   - Authentication service
   - Dashboard persistence service

3. Implement the component library, starting with simpler components:
   - Device Status Card
   - Readings Gauge/Meter
   - Then move to more complex components

4. Build the configuration system:
   - Component configuration modals
   - Dashboard settings

5. Implement persistence and sharing features:
   - Save/load dashboards
   - Dashboard templates
   - User sharing (optional)

6. Add polish and advanced features:
   - Responsive designs for different screen sizes
   - Dashboard filters that affect multiple components
   - Dashboard themes
   - Printing/exporting dashboard views

## MongoDB Schema Suggestions

### Dashboard Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  owner: { type: ObjectId, ref: 'User' },
  isPublic: Boolean,
  layout: [
    {
      i: String,  // Component ID
      x: Number,  // X position
      y: Number,  // Y position
      w: Number,  // Width
      h: Number,  // Height
      minW: Number, // Min width
      minH: Number  // Min height
    }
  ],
  components: {
    "component-uuid-1": {
      type: String,  // Component type
      config: {
        // Component-specific configuration
        deviceId: String,
        dataPoints: [String],
        refreshRate: Number,
        displayOptions: Object
      }
    }
  },
  created: Date,
  updated: Date
}
```

### User Dashboard Access Collection (Optional)
```javascript
{
  _id: ObjectId,
  dashboardId: { type: ObjectId, ref: 'Dashboard' },
  userId: { type: ObjectId, ref: 'User' },
  permission: String,  // 'view', 'edit', 'admin'
  created: Date
}
```

## Best Practices to Follow

1. **Performance**:
   - Implement proper memoization for components
   - Use virtualization for lists with many items
   - Optimize API calls with caching where appropriate
   - Consider using WebSockets for real-time data

2. **Code Organization**:
   - Follow the existing Redux folder structure
   - Create service modules for API interactions
   - Use custom hooks for shared functionality
   - Document interfaces and complex functions

3. **User Experience**:
   - Provide feedback during loading/saving operations
   - Implement undo/redo for dashboard edits
   - Use transitions for smooth UI updates
   - Support keyboard shortcuts for power users

4. **Error Handling**:
   - Gracefully handle API errors
   - Provide meaningful error messages
   - Implement retry mechanisms where appropriate
   - Log errors for debugging

5. **Testing**:
   - Write unit tests for critical components
   - Test API integration with mock services
   - Ensure responsive design works on different devices

## Additional Considerations

1. **Authentication**:
   - Implement proper JWT token management
   - Handle token expiration and refresh
   - Secure routes based on user permissions

2. **Internationalization**:
   - Consider i18n support for multi-language deployment
   - Use a library like react-i18next

3. **Accessibility**:
   - Ensure ARIA attributes are properly set
   - Support keyboard navigation
   - Test with screen readers

4. **Deployment**:
   - Consider environment configuration
   - Implement proper build optimizations

I look forward to your implementation of this configurable dashboard system. Feel free to suggest improvements or alternatives to this approach based on best practices and your expertise.