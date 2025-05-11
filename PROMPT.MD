# Project: Energy Monitoring Dashboard System

You are a senior frontend developer working with a team building an industrial-grade, responsive, configurable dashboard UI for monitoring energy systems via a REST API. The backend handles MQTT, Modbus, WebSocket, and data polling. Your job is to build the **UI and UX layer** using the tools listed below.

---

## 🛠️ Tech Stack (Frontend Only)
- **Framework**: React + TypeScript (with Vite)
- **UI**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Dashboard Layout**: `react-grid-layout`
- **Data Visualization**: Recharts for charts, custom SVG for gauges
- **API**: REST API (specs provided externally)
- **Persistence**: MongoDB is managed by the backend (you only fetch/update via API)

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

## 📋 Project Requirements

### 1. Energy Monitoring Dashboard

Create a complete, fully functional energy monitoring dashboard with the following widgets:

1. **Energy Consumption Trend (Line Chart)**
   - Position: Top left, 8 units wide, 4 units tall
   - Shows power consumption over 24 hours
   - Data source: power-meter-1
   - Y-axis auto-scaling with legend

2. **Current Power Usage (Gauge)**
   - Position: Top right, 4 units wide, 4 units tall
   - Range: 0-500 kW
   - Threshold colors: Green (0-200), Yellow (201-350), Red (351-500)
   - Shows current power consumption with units

3. **Energy Efficiency (Numeric)**
   - Position: Middle right, 4 units wide, 2 units tall
   - Format: Percentage with one decimal place
   - Shows trend indicator (up/down arrow)
   - Data source: efficiency-calc-1

4. **System Status (Status Indicator)**
   - Position: Lower right, 4 units wide, 2 units tall
   - Status values: Offline, Standby, Running, Warning, Critical
   - Distinct colors for each status
   - Data source: machine-status-1

5. **Power Distribution (Bar Chart)**
   - Position: Middle left, 8 units wide, 4 units tall
   - Shows power distribution across different systems
   - Includes legend and tooltips

6. **Energy Sources (Table)**
   - Position: Bottom left, 8 units wide, 4 units tall
   - Columns: Source, Output (kW), Efficiency (%), Status
   - Sortable by column
   - Paginated (5 items per page)

7. **System Alerts (Alert List)**
   - Position: Bottom right, 4 units wide, 4 units tall
   - Shows recent system alerts with timestamp
   - Filterable by severity (warning, error)
   - Maximum 5 items displayed

### 2. Dashboard Features

1. **Widget Layout**:
   - All widgets must maintain their exact positions and sizes
   - Must use react-grid-layout for positioning
   - Grid should use 12-column layout with 100px row height
   - Widgets should not overlap

2. **Widget Editing**:
   - Each widget must have Edit/Delete buttons that appear on hover
   - Clicking Edit should open the widget editor sidebar
   - Sidebar must show widget-specific configuration options
   - Changes must take effect immediately

3. **Real-Time Updates**:
   - Widgets must update with mock data
   - Update intervals should be configurable per widget
   - UI must remain responsive during updates

4. **Dashboard Management**:
   - Users must be able to save and load dashboards
   - Dashboard state must persist, including all widget positions
   - Dashboard name and description must be editable

---

## 🧠 Implementation Guidelines

1. **Project Structure**
   - Use Redux slices: `dashboardSlice.ts`, `widgetSlice.ts`, `uiSlice.ts`
   - Organize components by type: `components/dashboard/widgets/`
   - Create separate types in `types/dashboard.ts`

2. **Widget Implementation**
   - Each widget should be a separate component
   - Use consistent prop interfaces
   - Handle loading/error states properly
   - Include mock data for development

3. **Layout Management**
   - Use `compactType: null` in react-grid-layout to preserve exact positions
   - Set `resizeHandles: ['se']` for simple resizing
   - Make widget positions immutable when not in edit mode

4. **Redux State**
   - Dashboard state should include widgets array
   - Widget state should include full configuration for each widget
   - UI state should track selected widget and edit mode

5. **Error Prevention**
   - Fix all build errors before submitting
   - Prevent infinite update loops in DashboardGrid
   - Debounce all event handlers appropriately
   - Use proper cleanup in useEffect hooks

---

## 🚀 Deliverables

1. A fully functional Energy Monitoring Dashboard exactly matching the specifications
2. Properly positioned and sized widgets that maintain their layout
3. Working widget editing via sidebar with type-specific configuration
4. Dashboard save/load functionality
5. Responsive and performant UI that handles real-time updates
6. Build-ready codebase with no TypeScript or runtime errors

---

## 🔄 Development Workflow

1. Start with implementing the DashboardGrid component
2. Create widget components with mock data
3. Implement widget editing functionality
4. Add dashboard management features
5. Test all interactions and fix any bugs
6. Ensure build process completes without errors

---

## 📆 Project Timeline

- Phase 1: Dashboard grid and widget layout (1 day)
- Phase 2: Widget implementation with mock data (2 days)
- Phase 3: Widget editing and configuration (2 days)
- Phase 4: Testing and bug fixes (1 day)

---

## 📝 Evaluation Criteria

Your solution will be evaluated based on:
1. Exact match to requirements and specifications
2. Code quality and organization
3. Performance and responsiveness
4. Error handling and robustness
5. Industrial-grade implementation standards
6. Build process success (no errors)