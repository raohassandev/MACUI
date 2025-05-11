# Project: Industrial IoT Monitoring Dashboard (Frontend Only)

You are a senior frontend developer working with a team building an industrial-grade, responsive, configurable dashboard UI for monitoring devices via a REST API. The backend handles MQTT, Modbus, WebSocket, and data polling. Your job is to build the **UI and UX layer** using the tools listed below.

---

## 🛠️ Tech Stack (Frontend Only)
- **Framework**: React + TypeScript (with Vite)
- **UI**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Dashboard Layout**: `react-grid-layout`
- **Data Visualization**: Recharts, and optional SVG/Canvas-based gauges
- **API**: REST API (specs provided externally)
- **Persistence**: MongoDB is managed by the backend (you only fetch/update via API)
- **Optional**: Use shadcn/ui or headless UI components for modals, menus, tabs

---

## 🔗 Integration with Backend

You will NOT implement:
- Modbus logic
- MQTT/WebSocket handlers
- MongoDB queries

You WILL:
- Fetch configuration and real-time data via REST API
- Display data widgets bound to API tag data
- Allow users to configure, layout, save, and load dashboards
- Allow widget resize and positioning using `react-grid-layout`

---

## 🔄 System Features You Must Build (Frontend Only)

### 1. Dashboard Builder (Canvas UI)
- Main layout using `react-grid-layout`
- Allow adding/removing/moving/resizing widgets
- Widgets include:
  - Chart (line, bar)
  - Numeric display
  - Gauge
  - Status indicator (LED style)
- Each widget can be bound to a `tagId` (from REST API)

### 2. Widget Property Editor
- Sidebar/modal to configure:
  - Tag binding
  - Units, title
  - Refresh rate (if needed)
  - Display range (for gauges/charts)
- Persist widget settings to dashboard JSON (sent to backend)

### 3. Dashboard Config
- Load/save dashboards via REST API
- Each dashboard has:
  - `id`
  - `name`
  - `layout` (from react-grid-layout)
  - `widgets[]` (widget type, tagId, props)

### 4. Project Layout
- Use Redux slices:
  - `dashboardSlice`
  - `widgetsSlice`
  - `uiSlice` (edit mode, selected widget, etc.)
- Use service layer (e.g., `api/dashboard.ts`) to call REST endpoints
- Include types: `Dashboard`, `Widget`, `Tag`, etc.

---

## ✅ Development Requirements
- All files must be well-structured and commented
- Use reusable components (WidgetContainer, ChartWidget, etc.)
- Follow responsive design best practices
- Add mock data/fallbacks for development
- Support edit mode vs view-only mode (for deployment)

---

## 🎨 Enhanced Customization Requirements

### 1. Widget Customization
- Every component must be fully customizable in all respects (similar to Grafana)
- Customization options for each widget should include:
  - Show/hide labels
  - Label positioning (top, bottom, left, right, inside)
  - Font styles and sizes
  - Color schemes and themes
  - Background transparency and borders
  - Axis options for charts (min/max, grid lines, tick marks)
  - Legend positioning and display options
  - Thresholds with custom colors and indicators
  - Multiple data series display options

### 2. Layout Management
- Dashboard layout customization options:
  - Grid size and spacing
  - Widget snapping settings
  - Locked/unlocked positions
  - Widget layering (z-index control)
  - Position locking for critical widgets
  - Responsive layout breakpoints
  - Layout templates for quick setup

### 3. Theme Settings
- Create a dedicated theme settings page with:
  - Global color palette configuration
  - Light/dark mode toggle
  - Custom theme creation and saving
  - Font and typography settings
  - Border and shadow preferences
  - Widget style presets
  - Import/export theme configurations

### 4. Dashboard Management
- On landing page:
  - Show list of user's previous dashboards
  - Option to create new dashboard
  - Dashboard templates/presets
  - Dashboard categories and tags
  - Search and filter dashboards
  - Dashboard preview thumbnails
  - Dashboard sharing options

### 5. Container Components
- Create container components to manage:
  - Widget grouping
  - Tab containers
  - Collapsible sections
  - Card containers with headers
  - Split-view containers
  - Dashboard sections with titles
  - Multi-view widgets (different visualization modes)

---

## 📋 Project Development History

### Phase 1: Initial Implementation
- Created base folder structure (components, pages, store, services, types)
- Implemented basic Redux slices (dashboard, widget, ui)
- Created initial dashboard page with react-grid-layout
- Implemented basic widget types (Chart, Gauge, Numeric, Status, Table, Alert)
- Added mock API services for development

### Phase 2: Enhancing Dashboard Functionality
- Improved widget configurations and settings
- Added theme settings page with light/dark mode
- Created dashboard management page for loading/saving dashboards
- Enhanced widget styling and layout options
- Implemented responsive design improvements

### Phase 3: Bug Fixes and Enhancement
- Fixed widget resize handle issues (made handles more visible)
- Resolved React hook ordering problems in EnhancedChartWidget
- Created SimpleChartWidget as a stable replacement for complex chart components
- Added CSS fixes for widget dimensions and responsiveness
- Improved Card component to better handle layout and sizing
- Removed drag-and-drop functionality to simplify component architecture
- Enhanced dashboard grid configuration for better responsiveness

### Phase 4: Layout Improvements and Widget Editing
- Added side navigation drawer for engineer role
- Created engineer/client layout switching functionality
- Implemented collapsible sidebar with state persistence
- Fixed critical dashboard layout and positioning issues
- Resolved widget resize handling in the dashboard grid
- Added CSS optimizations for better layout stability
- Implemented widget edit sidebar for widget configuration
- Fixed JSON parsing issues in API services with mock data

### Phase 5: Feature Stabilization and Bug Fixes
- Fixed infinite update loops in DashboardGrid and SimpleChartWidget
- Enhanced React state management with useRef and memoization
- Fixed path aliasing issues throughout the codebase
- Resolved TypeScript errors and improved type safety
- Enhanced CSS for widget positioning and resize handling
- Implemented proper state cleanup in useEffect hooks
- Streamlined widget selection and configuration process

---

## 🧾 Current Project Status: MILESTONE 1 ACHIEVED

### Completed Features
- Basic dashboard layout with widget resize functionality
- Multiple widget types (Chart, Gauge, Numeric, Status, Table, Alert)
- Theme settings with light/dark mode
- Engineer and client layout modes with easy switching
- Collapsible side navigation drawer
- Widget editing via sidebar interface
- Dashboard management (create, save, load, list)
- Widget configuration options specific to each widget type
- Mock API services for development
- Responsive layout for different screen sizes

### In Progress
- Enhanced widget customization options
- Container components
- Dashboard templates
- Advanced API integration

### Pending
- Advanced theme settings (complete color customization)
- Dashboard categories and tags
- Search and filter capabilities
- Preview thumbnails and sharing options
- Enhanced data binding UI

---

## 🚫 Known Issues

1. There are inconsistencies between widget configuration via modal vs sidebar:
   - The `widgetSlice.ts` still contains both the original configuration modal approach (`isConfiguring` state) and the newer sidebar approach.
   - The `DashboardPage.tsx` references both `WidgetConfigModal` and sidebar-related functionality.

2. Path aliasing issues in layout builder components:
   - Several components in the layout-builder directory use `@/` path aliases instead of relative paths.
   - These need to be standardized to ensure proper building.

3. Optimization issues:
   - Some components have inefficient rendering patterns that need optimization.
   - The dashboard grid has potential for infinite update loops that needs careful management.

---

## 🧩 Next Development Steps

1. Standardize widget editing approach:
   - Fully transition to sidebar-based widget editing
   - Remove deprecated modal-based widget editing code
   - Update all references to use the new pattern consistently

2. Fix import path issues:
   - Standardize import paths across the codebase
   - Replace all `@/` imports with proper relative imports
   - Ensure consistent path usage

3. Complete the widget property editor:
   - Implement all customization options
   - Enhance tag binding UI
   - Add display range configuration

4. Create container components:
   - Implement Tab containers
   - Add Group containers
   - Create Card containers with headers

5. Enhance theme capabilities:
   - Complete color palette configuration
   - Add font and typography settings
   - Create theme presets and import/export

6. Add Edit/Delete Buttons on Every Widget:
   - Display "Edit" and "Delete" buttons on hover over each widget
   - Trigger the right sidebar for editing on "Edit" button click
   - Dispatch an action to remove the widget on "Delete" button click
   - Ensure buttons are styled minimally and do not interfere with drag/resize behavior

7. Add Right Sidebar for Widget Editing:
   - Create a persistent right sidebar that opens when a widget is selected
   - Move all widget-related configuration options (tag binding, titles, colors, font, etc.) into this sidebar
   - Sync changes to the Redux store immediately
   - Ensure it integrates with uiSlice for state tracking (selectedWidgetId, isEditing, etc.)

---

## 🧠 Implementation Notes

1. Always maintain project structure and consistency
2. Follow established patterns for new components
3. Update types as needed for new features
4. Use existing utility functions and avoid duplication
5. Keep Redux state as the source of truth
6. Add proper error handling for all API operations
7. Maintain responsive design principles
8. Use React.memo and useCallback for performance optimization
9. Implement proper cleanup in useEffect hooks to prevent memory leaks
10. Ensure consistent CSS approach across components

## 🔄 Development Workflow

After every modification to the codebase:
1. The project will be automatically rebuilt
2. All unit tests will be executed
3. Any issues found will be fixed before proceeding
4. Upon successful completion, each task must be explicitly marked as complete

For each development task:
1. Clearly define the scope and objectives
2. Make changes in small, logical increments
3. Follow existing patterns and architecture
4. Provide a summary of changes made
5. Declare "Task completed" when finished