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
  | 'alert'
  | 'heatmap'
  | 'state-timeline'
  | 'multi-stat'
  | 'advanced-gauge'
  | 'advanced-chart';

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

// Heatmap widget properties
export interface HeatmapWidget extends WidgetBase {
  type: 'heatmap';
  tagId: string;
  gridSize?: number;
  patternType?: 'radial' | 'gradient' | 'hotspots' | 'random';
  showLegend?: boolean;
  colorScheme?: {
    minColor: string;
    midColor?: string;
    maxColor: string;
  };
}

// State Timeline widget properties
export interface StateTimelineWidget extends WidgetBase {
  type: 'state-timeline';
  tagIds: string[];
  tagLabels?: string[];
  timeRange: number; // Time range in milliseconds
  showLegend?: boolean;
  stateColors?: Record<string, string>; // Mapping of state names to colors
}

// Multi-Stat Panel widget properties
export interface MultiStatWidget extends WidgetBase {
  type: 'multi-stat';
  tagIds: string[];
  statLabels?: Record<string, string>; // Mapping of tag IDs to display names
  layout?: 'grid' | 'list';
  displayFormat?: string;
  showSparkline?: boolean;
  showTrend?: boolean;
  showUnits?: boolean;
  sparklinePoints?: number;
  thresholds?: {
    value: number;
    color: string;
  }[];
}

// Advanced Gauge widget properties
export interface AdvancedGaugeWidget extends WidgetBase {
  type: 'advanced-gauge';
  minValue: number;
  maxValue: number;
  gaugeStyle: 'radial' | 'speedometer';
  size?: number;
  arcWidth?: number;
  pointerWidth?: number;
  pointerColor?: string;
  needleColor?: string;
  startColor?: string;
  endColor?: string;
  segments?: number;
  segmentLabels?: Array<{
    text: string;
    position: 'INSIDE' | 'OUTSIDE';
    fontSize?: string;
    color?: string;
  }>;
  showLabels?: boolean;
  showValue?: boolean;
  decimalPlaces?: number;
  animated?: boolean;
  animationDuration?: number;
  subTitle?: string;
  valueText?: string;
  thresholds?: {
    value: number;
    color: string;
    label?: string;
  }[];
}

// Advanced Chart widget properties
export interface AdvancedChartWidget extends WidgetBase {
  type: 'advanced-chart';
  timeRange: number; // in milliseconds
  chartType: 'line' | 'bar' | 'area';
  tagId?: string;
  dataPoints?: number;
  additionalTags?: string[];
  additionalChartTypes?: ('line' | 'bar' | 'area')[];
  pattern?: 'sine' | 'trend' | 'steps' | 'random';
  trendDirection?: 'up' | 'down';
  colors?: string[];
  lineColor?: string;
  areaColor?: string;
  strokeWidth?: number;
  showDots?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  legendPosition?: 'top' | 'right' | 'bottom' | 'left';
  yAxisLabel?: string;
  yAxisMin?: number;
  yAxisMax?: number;
  y2AxisLabel?: string;
  useSecondYAxis?: boolean[];
  showBrush?: boolean;
  autoScale?: boolean;
  stacked?: boolean;
  animations?: boolean;
  showTooltip?: boolean;
  zoom?: boolean;
  description?: string;
  annotations?: {
    id?: string;
    type?: 'line' | 'area';
    position?: 'x' | 'y';
    value?: number | string;
    startValue?: number | string;
    endValue?: number | string;
    color?: string;
    label?: string;
    labelPosition?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  }[];
  thresholds?: {
    value: number;
    color: string;
    label?: string;
    maxValue?: number;
  }[];
}

// Union type for all widget types
export type Widget =
  | ChartWidget
  | GaugeWidget
  | NumericWidget
  | StatusWidget
  | TableWidget
  | AlertWidget
  | HeatmapWidget
  | StateTimelineWidget
  | MultiStatWidget
  | AdvancedGaugeWidget
  | AdvancedChartWidget;

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
