/**
 * Dashboard and Widget Type Definitions
 *
 * This file contains the core type definitions for the IIoT dashboard system.
 */

// Tag represents a data point from an industrial device
export interface Tag {
  id: string;
  name: string;
  description?: string;
  valueType: 'number' | 'boolean' | 'string';
  unit?: string;
  minValue?: number;
  maxValue?: number;
  refreshRate?: number; // in milliseconds
  status?: 'active' | 'inactive' | 'error';
  lastValue?: unknown;
  lastUpdated?: string;
}

// Widget types available for dashboards
export type WidgetType =
  | 'chart'
  | 'gauge'
  | 'numeric'
  | 'status'
  | 'table'
  | 'alert';

// Base properties for all widgets
export interface WidgetBase {
  id: string;
  type: WidgetType;
  title: string;
  tagId?: string;
  refreshRate?: number; // override tag refresh rate
  x: number; // Grid position - x coordinate
  y: number; // Grid position - y coordinate
  w: number; // Grid width
  h: number; // Grid height
  minW?: number; // Minimum width
  minH?: number; // Minimum height
  maxW?: number; // Maximum width
  maxH?: number; // Maximum height
  static?: boolean; // If static, cannot be moved
  isDraggable?: boolean; // If widget can be dragged
  isResizable?: boolean; // If widget can be resized
  resizeHandles?: string[]; // Resize handles to show
}

// Chart widget properties
export interface ChartWidget extends WidgetBase {
  type: 'chart';
  chartType: 'line' | 'bar' | 'area';
  timeRange: number; // in milliseconds
  historyPoints?: number;
  showLegend?: boolean;
  yAxisMin?: number;
  yAxisMax?: number;
  autoScale?: boolean;
  additionalTags?: string[]; // For multi-line charts
  colors?: string[];
}

// Gauge widget properties
export interface GaugeWidget extends WidgetBase {
  type: 'gauge';
  gaugeType: 'radial' | 'linear' | 'tank';
  minValue: number;
  maxValue: number;
  thresholds?: {
    value: number;
    color: string;
  }[];
  showValue?: boolean;
  showUnit?: boolean;
}

// Numeric display widget properties
export interface NumericWidget extends WidgetBase {
  type: 'numeric';
  displayFormat?: string; // e.g., '0.00'
  showUnit?: boolean;
  trendIndicator?: boolean; // Show up/down arrow based on value change
  thresholds?: {
    value: number;
    color: string;
  }[];
}

// Status indicator widget properties
export interface StatusWidget extends WidgetBase {
  type: 'status';
  shape?: 'circle' | 'square' | 'pill';
  statusMap: {
    [key: string]: {
      label: string;
      color: string;
    };
  };
  showLabel?: boolean;
  blink?: boolean; // Blink on status change
}

// Table widget properties
export interface TableWidget extends WidgetBase {
  type: 'table';
  tagIds: string[];
  columns: {
    key: string;
    label: string;
    width?: number;
    format?: string;
  }[];
  pageSize?: number;
  sortable?: boolean;
  defaultSortField?: string;
}

// Alert widget properties
export interface AlertWidget extends WidgetBase {
  type: 'alert';
  alertLevel?: 'info' | 'warning' | 'error';
  maxAlerts?: number;
  filterTags?: string[];
  showTimestamp?: boolean;
  showDescription?: boolean;
}

// Union type for all widget types
export type Widget =
  | ChartWidget
  | GaugeWidget
  | NumericWidget
  | StatusWidget
  | TableWidget
  | AlertWidget;

// Dashboard definition
export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  isPublic?: boolean;
  widgets: Widget[];
  tags?: Tag[]; // Tags referenced by this dashboard
  layout?: unknown; // Additional layout information
}
