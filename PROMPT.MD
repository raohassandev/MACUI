# Project: Industrial IoT Monitoring Dashboard (Frontend Only)

You are a senior frontend developer working with a team building an industrial-grade, responsive, drag-and-drop dashboard UI for monitoring devices via a REST API. The backend handles MQTT, Modbus, WebSocket, and data polling. Your job is to build the **UI and UX layer** using the tools listed below.

---

## 🛠️ Tech Stack (Frontend Only)
- **Framework**: React + TypeScript (with Vite)
- **UI**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Drag & Drop Dashboard**: `react-grid-layout`
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
- Allow drag-and-drop and resize of components using `react-grid-layout`

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

## 🧠 Claude Code Rules
1. Stay consistent with this architecture—**do not generate backend code**.
2. Always provide a high-level summary before showing code.
3. Do not switch between approaches (e.g., don’t use both local and Redux state for the same feature).
4. Keep layout modular (pages, components, hooks, store, services).
5. Every time a new file is created, show file path and filename.
6. Do not leave placeholder or incomplete code without noting TODOs.
7. Never re-implement polling, MQTT, or Modbus logic—these are REST-fed.

---

## 🧾 Deliverables
- `src/` structure with:
  - `components/` → Reusable UI pieces
  - `pages/` → Dashboard view
  - `store/` → Redux slices
  - `services/` → API call logic
  - `types/` → Shared types/interfaces
- `App.tsx` with routes (support single dashboard route like `/dashboard/:id`)
- Basic working example of:
  - One dashboard with one chart widget bound to a tag
  - Editable widget settings
  - Saving & loading dashboard from API
- `README.md` with setup instructions

---

## 🧪 Testing and Mocking
- Include mock API responses using MSW or static JSONs if backend is not ready
- Add clear TODOs for backend integration points

---

## 📚 Documentation
Claude must generate and maintain:
- A clean `README.md`
- Widget usage examples in markdown
- A brief troubleshooting section (React/Vite issues, Redux debugging)

---

## 🧩 Starting Point
Claude, please begin by:
1. Creating the base folder structure
2. Creating `types.ts` for `Dashboard`, `Widget`, and `Tag`
3. Creating Redux slices: `dashboardSlice`, `widgetSlice`
4. Creating a basic `DashboardPage.tsx` with drag-and-drop layout and mock widget

---

Claude, do not proceed unless each step is complete and consistent. After each step, summarize progress, update the project structure tree, and ask what to do next.

