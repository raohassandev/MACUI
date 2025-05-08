/**
 * Widget Redux Slice
 * 
 * Manages the state for active widget and widget configuration
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Widget } from '../../types/dashboard';
import { RootState } from '../store/store';

// Define the initial state
interface WidgetState {
  selectedWidgetId: string | null;
  isConfiguring: boolean;
  widgetTemplates: Widget[]; // Predefined widget templates
}

const initialState: WidgetState = {
  selectedWidgetId: null,
  isConfiguring: false,
  widgetTemplates: [
    // Line Chart Widget Template
    {
      id: 'template-chart-line',
      type: 'chart',
      title: 'Line Chart',
      x: 0,
      y: 0,
      w: 6,
      h: 4,
      minW: 3,
      minH: 3,
      chartType: 'line',
      timeRange: 3600000, // 1 hour
      showLegend: true,
      autoScale: true,
    },
    // Bar Chart Widget Template
    {
      id: 'template-chart-bar',
      type: 'chart',
      title: 'Bar Chart',
      x: 0,
      y: 0,
      w: 6,
      h: 4,
      minW: 3,
      minH: 3,
      chartType: 'bar',
      timeRange: 3600000, // 1 hour
      showLegend: true,
      autoScale: true,
    },
    // Gauge Widget Template
    {
      id: 'template-gauge',
      type: 'gauge',
      title: 'Gauge',
      x: 0,
      y: 0,
      w: 3,
      h: 4,
      minW: 2,
      minH: 3,
      gaugeType: 'radial',
      minValue: 0,
      maxValue: 100,
      thresholds: [
        { value: 30, color: '#22c55e' }, // Green
        { value: 70, color: '#f59e0b' }, // Yellow
        { value: 90, color: '#ef4444' }, // Red
      ],
      showValue: true,
      showUnit: true,
    },
    // Numeric Widget Template
    {
      id: 'template-numeric',
      type: 'numeric',
      title: 'Value Display',
      x: 0,
      y: 0,
      w: 3,
      h: 2,
      minW: 2,
      minH: 2,
      displayFormat: '0.0',
      showUnit: true,
      trendIndicator: true,
    },
    // Status Widget Template
    {
      id: 'template-status',
      type: 'status',
      title: 'Status',
      x: 0,
      y: 0,
      w: 3,
      h: 2,
      minW: 2,
      minH: 2,
      shape: 'circle',
      statusMap: {
        '0': { label: 'Offline', color: '#6b7280' },
        '1': { label: 'Idle', color: '#3b82f6' },
        '2': { label: 'Running', color: '#22c55e' },
        '3': { label: 'Warning', color: '#f59e0b' },
        '4': { label: 'Error', color: '#ef4444' },
      },
      showLabel: true,
    },
    // Table Widget Template
    {
      id: 'template-table',
      type: 'table',
      title: 'Data Table',
      x: 0,
      y: 0,
      w: 6,
      h: 6,
      minW: 4,
      minH: 4,
      tagIds: [],
      columns: [
        { key: 'name', label: 'Name', width: 150 },
        { key: 'value', label: 'Value', width: 100 },
        { key: 'unit', label: 'Unit', width: 80 },
        { key: 'status', label: 'Status', width: 100 },
      ],
      pageSize: 10,
      sortable: true,
      defaultSortField: 'name',
    },
    // Alert Widget Template
    {
      id: 'template-alert',
      type: 'alert',
      title: 'Alerts',
      x: 0,
      y: 0,
      w: 6,
      h: 4,
      minW: 3,
      minH: 3,
      maxAlerts: 10,
      alertLevel: 'warning',
      showTimestamp: true,
      showDescription: true,
    },
  ],
};

// Create the slice
const widgetSlice = createSlice({
  name: 'widget',
  initialState,
  reducers: {
    selectWidget: (state, action: PayloadAction<string | null>) => {
      state.selectedWidgetId = action.payload;
    },
    startConfiguringWidget: (state, action: PayloadAction<string>) => {
      state.selectedWidgetId = action.payload;
      state.isConfiguring = true;
    },
    stopConfiguringWidget: (state) => {
      state.isConfiguring = false;
    },
    addWidgetTemplate: (state, action: PayloadAction<Widget>) => {
      state.widgetTemplates.push(action.payload);
    },
  },
});

// Export actions
export const {
  selectWidget,
  startConfiguringWidget,
  stopConfiguringWidget,
  addWidgetTemplate,
} = widgetSlice.actions;

// Export selectors
export const selectSelectedWidgetId = (state: RootState) => state.widget.selectedWidgetId;
export const selectIsConfiguringWidget = (state: RootState) => state.widget.isConfiguring;
export const selectWidgetTemplates = (state: RootState) => state.widget.widgetTemplates;

// Export reducer
export default widgetSlice.reducer;