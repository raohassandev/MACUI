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
    // Energy Consumption Chart
    {
      id: 'template-energy-consumption',
      type: 'chart',
      title: 'Energy Consumption Trend',
      x: 0,
      y: 0,
      w: 8,
      h: 4,
      minW: 4,
      minH: 3,
      chartType: 'line',
      timeRange: 86400000, // 24 hours
      showLegend: true,
      autoScale: true,
      tagId: 'power-meter-1',
    },
    // Power Distribution Chart
    {
      id: 'template-power-distribution',
      type: 'chart',
      title: 'Power Distribution',
      x: 0,
      y: 4,
      w: 6,
      h: 4,
      minW: 3,
      minH: 3,
      chartType: 'bar',
      timeRange: 3600000, // 1 hour
      showLegend: true,
      autoScale: true,
    },
    // Main Power Gauge
    {
      id: 'template-power-gauge',
      type: 'gauge',
      title: 'Current Power Usage',
      x: 8,
      y: 0,
      w: 4,
      h: 4,
      minW: 2,
      minH: 3,
      gaugeType: 'radial',
      minValue: 0,
      maxValue: 500,
      tagId: 'power-meter-1',
      thresholds: [
        { value: 200, color: '#22c55e' }, // Green
        { value: 350, color: '#f59e0b' }, // Yellow
        { value: 450, color: '#ef4444' }, // Red
      ],
      showValue: true,
      showUnit: true,
    },
    // Energy Efficiency Numeric
    {
      id: 'template-efficiency',
      type: 'numeric',
      title: 'Energy Efficiency',
      x: 8,
      y: 4,
      w: 4,
      h: 2,
      minW: 2,
      minH: 2,
      tagId: 'efficiency-calc-1',
      displayFormat: '0.0 %',
      showUnit: true,
      trendIndicator: true,
    },
    // System Status
    {
      id: 'template-system-status',
      type: 'status',
      title: 'System Status',
      x: 8,
      y: 6,
      w: 4,
      h: 2,
      minW: 2,
      minH: 2,
      tagId: 'machine-status-1',
      shape: 'circle',
      statusMap: {
        '0': { label: 'Offline', color: '#6b7280' },
        '1': { label: 'Standby', color: '#3b82f6' },
        '2': { label: 'Running', color: '#22c55e' },
        '3': { label: 'Warning', color: '#f59e0b' },
        '4': { label: 'Critical', color: '#ef4444' },
      },
      showLabel: true,
    },
    // Energy Sources Table
    {
      id: 'template-energy-sources',
      type: 'table',
      title: 'Energy Sources',
      x: 0,
      y: 8,
      w: 8,
      h: 4,
      minW: 4,
      minH: 4,
      tagIds: [],
      columns: [
        { key: 'name', label: 'Source', width: 150 },
        { key: 'value', label: 'Output (kW)', width: 100 },
        { key: 'efficiency', label: 'Efficiency (%)', width: 100 },
        { key: 'status', label: 'Status', width: 100 },
      ],
      pageSize: 5,
      sortable: true,
      defaultSortField: 'value',
    },
    // System Alerts
    {
      id: 'template-system-alerts',
      type: 'alert',
      title: 'System Alerts',
      x: 8,
      y: 8,
      w: 4,
      h: 4,
      minW: 3,
      minH: 3,
      tagId: 'alarm-status-1',
      maxAlerts: 5,
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