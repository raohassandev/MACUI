# Industrial IoT Monitoring Dashboard

A flexible, modern React dashboard for real-time monitoring of industrial devices and processes.

## Features

- **Drag & Drop Dashboard Builder**: Create and customize dashboards with ease using react-grid-layout
- **Multiple Widget Types**: Charts, gauges, numeric displays, status indicators, data tables and alerts
- **Real-time Data**: View real-time device data with configurable refresh rates
- **Responsive Design**: Works across desktop and tablet devices
- **Customizable**: Configure widgets for your specific needs
- **Dark Mode Support**: Full support for light and dark themes

## Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Grid Layout**: react-grid-layout
- **Data Visualization**: Recharts
- **API Integration**: RESTful API

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A modern web browser

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/raohassandev/MACUI.git
   cd MACUI
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to [http://localhost:5173](http://localhost:5173)

## Dashboard Configuration

### Creating a Dashboard

1. Navigate to the dashboard page
2. Click "Create New Dashboard" if this is your first dashboard
3. Toggle to "Edit Mode" to start customizing
4. Click "Add Widget" to add widgets to your dashboard
5. Drag and resize widgets as needed
6. Click "Save Dashboard" when complete

### Widget Types

- **Chart Widget**: Displays time-series data as line, bar, or area charts
- **Gauge Widget**: Shows values as radial, linear, or tank-style gauges
- **Numeric Widget**: Simple value display with trend indicators
- **Status Widget**: Visual status indicators with color coding
- **Table Widget**: Tabular display of multiple data points
- **Alert Widget**: Displays system alerts and warnings

### Configuring Widgets

1. In edit mode, click on a widget to select it
2. Use the widget configuration panel to:
   - Bind to data sources (tags)
   - Set refresh rates
   - Configure display options
   - Set thresholds and alerts
   - Adjust visual settings

## API Integration

The dashboard connects to a RESTful API for data retrieval. Key endpoints:

- `/api/dashboards` - Dashboard CRUD operations
- `/api/tags` - Data source information
- `/api/tags/:id/history` - Historical data for a specific tag

**Note**: During development, mock data is used when API is unavailable.

## Development Notes

### Project Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── widgets/         # Individual widget components
│   │   ├── DashboardGrid.tsx      # Main grid component
│   │   ├── WidgetConfigModal.tsx  # Widget configuration UI
│   │   └── WidgetWrapper.tsx      # Container for widgets
├── contexts/               # React contexts
├── hooks/                  # Custom hooks
├── layouts/                # Page layouts
├── pages/
│   └── DashboardPage.tsx   # Main dashboard page
├── redux/
│   ├── slices/             # Redux slices 
│   └── store/              # Redux store configuration
├── services/
│   └── api/                # API service layer
├── types/                  # TypeScript type definitions
└── App.tsx                 # Main app component
```

### Adding a New Widget Type

1. Define the widget interface in `src/types/dashboard.ts`
2. Create a widget component in `src/components/dashboard/widgets/`
3. Add a widget template in `widgetSlice.ts`
4. Update the widget configuration UI in `WidgetConfigModal.tsx`

### Mock Data

During development, mock data is provided for dashboards and tag values. This can be found in:
- `src/services/api/dashboard.ts`
- `src/services/api/tag.ts`

## Troubleshooting

### Common Issues

- **Widget not updating**: Check that the tag ID is correctly set and the refresh rate is appropriate
- **Layout changes not persisting**: Ensure you click "Save Dashboard" after making changes
- **No data displayed**: Verify API connection or check that mock data is being used in development

### Redux Development

- Use Redux DevTools extension to inspect state changes
- Check action payloads in case of unexpected behavior
- Verify that component is connected to the correct state slices

### Vite Issues

- Clear the `.vite` cache directory if you experience strange bundling issues
- Restart the dev server when adding new dependencies
- Check console for build errors

## License

This project is licensed under the MIT License - see the LICENSE file for details.