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
    // Advanced Gauge - Speedometer Style
    {
      id: 'template-advanced-gauge-speedometer',
      type: 'advanced-gauge',
      title: 'Power Consumption',
      x: 0,
      y: 0,
      w: 4,
      h: 4,
      minW: 3,
      minH: 3,
      tagId: 'power-meter-1',
      gaugeStyle: 'speedometer',
      minValue: 0,
      maxValue: 500,
      segments: 5,
      needleColor: '#374151',
      startColor: '#22c55e',
      endColor: '#ef4444',
      showLabels: true,
      showValue: true,
      valueText: 'Current',
      decimalPlaces: 0,
      animated: true,
      animationDuration: 800,
      segmentLabels: [
        { text: 'Low', position: 'INSIDE', color: '#22c55e' },
        { text: 'High', position: 'INSIDE', color: '#ef4444' }
      ]
    },
    // Advanced Gauge - Radial Style
    {
      id: 'template-advanced-gauge-radial',
      type: 'advanced-gauge',
      title: 'Efficiency Rating',
      x: 4,
      y: 0,
      w: 4,
      h: 4,
      minW: 3,
      minH: 3,
      tagId: 'efficiency-calc-1',
      gaugeStyle: 'radial',
      minValue: 0,
      maxValue: 100,
      size: 200,
      arcWidth: 12,
      pointerWidth: 6,
      pointerColor: '#374151',
      showLabels: true,
      showValue: true,
      decimalPlaces: 1,
      animated: true,
      animationDuration: 1000,
      subTitle: 'Efficiency',
      thresholds: [
        { value: 30, color: '#ef4444', label: 'Poor' }, // Red
        { value: 70, color: '#f59e0b', label: 'Average' }, // Amber
        { value: 90, color: '#22c55e', label: 'Good' }, // Green
      ]
    },
    // Advanced Chart with annotations and thresholds
    {
      id: 'template-advanced-chart',
      type: 'advanced-chart',
      title: 'Energy Analysis Dashboard',
      description: 'Detailed energy consumption with thresholds and annotations',
      x: 0,
      y: 4,
      w: 8,
      h: 5,
      minW: 4,
      minH: 4,
      chartType: 'line',
      timeRange: 86400000, // 24 hours
      dataPoints: 100,
      tagId: 'power-meter-1',
      additionalTags: ['power-meter-2', 'efficiency-calc-1'],
      additionalChartTypes: ['area', 'line'],
      pattern: 'sine',
      lineColor: '#3b82f6',
      areaColor: '#3b82f633',
      strokeWidth: 2,
      showDots: false,
      showGrid: true,
      showLegend: true,
      legendPosition: 'bottom',
      yAxisLabel: 'Energy (kWh)',
      y2AxisLabel: 'Efficiency (%)',
      useSecondYAxis: [false, false, true],
      showBrush: true,
      autoScale: true,
      stacked: false,
      animations: true,
      zoom: true,
      annotations: [
        {
          type: 'line',
          position: 'y',
          value: 75,
          color: '#f59e0b',
          label: 'Warning Level',
          labelPosition: 'right'
        },
        {
          type: 'area',
          position: 'y',
          startValue: 90,
          endValue: 100,
          color: '#ef4444',
          label: 'Critical Range',
          labelPosition: 'right'
        }
      ],
      thresholds: [
        { value: 75, color: '#f59e0b', label: 'Warning' },
        { value: 90, color: '#ef4444', label: 'Critical' }
      ]
    },
    // Energy Consumption Chart
    {
      id: 'template-energy-consumption',
      type: 'chart',
      title: 'Energy Consumption Trend',
      x: 0,
      y: 9,
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
    // Temperature Heatmap
    {
      id: 'template-temperature-heatmap',
      type: 'heatmap',
      title: 'Temperature Distribution',
      x: 0,
      y: 12,
      w: 6,
      h: 5,
      minW: 4,
      minH: 4,
      tagId: 'temp-sensor-1',
      gridSize: 12,
      patternType: 'radial',
      showLegend: true,
      colorScheme: {
        minColor: '#3b82f6', // blue
        midColor: '#a855f7', // purple
        maxColor: '#ef4444', // red
      }
    },
    // Machine States Timeline
    {
      id: 'template-machine-states',
      type: 'state-timeline',
      title: 'Machine States Timeline',
      x: 6,
      y: 12,
      w: 6,
      h: 5,
      minW: 4,
      minH: 4,
      tagIds: ['machine-status-1', 'machine-status-2', 'machine-status-3'],
      tagLabels: ['Machine 1', 'Machine 2', 'Machine 3'],
      timeRange: 86400000, // 24 hours
      showLegend: true,
      stateColors: {
        'running': '#22c55e',     // Green
        'idle': '#3b82f6',        // Blue
        'warning': '#f59e0b',     // Amber
        'error': '#ef4444',       // Red
        'maintenance': '#8b5cf6', // Purple
        'offline': '#6b7280',     // Gray
      }
    },
    // Key Performance Indicators
    {
      id: 'template-performance-kpis',
      type: 'multi-stat',
      title: 'Key Performance Indicators',
      x: 0,
      y: 17,
      w: 12,
      h: 3,
      minW: 6,
      minH: 3,
      tagIds: ['efficiency-calc-1', 'power-meter-1', 'temp-sensor-1'],
      statLabels: {
        'efficiency-calc-1': 'Efficiency',
        'power-meter-1': 'Power Draw',
        'temp-sensor-1': 'Temperature'
      },
      layout: 'grid',
      displayFormat: '0.0',
      showSparkline: true,
      showTrend: true,
      showUnits: true,
      sparklinePoints: 12,
      thresholds: [
        { value: 25, color: '#ef4444' }, // Red
        { value: 50, color: '#f59e0b' }, // Amber
        { value: 75, color: '#22c55e' }, // Green
      ]
    }
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