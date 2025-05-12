import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
  ReferenceLine,
  Brush,
  Label
} from 'recharts';

export type ChartDataPoint = {
  timestamp?: number | string;
  name?: string;
  [key: string]: any;
};

type ChartSeriesType = 'line' | 'bar' | 'area';

export interface ChartSeries {
  id: string;
  name: string;
  dataKey: string;
  type: ChartSeriesType;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  dot?: boolean | object;
  yAxisId?: string;
  stackId?: string;
  isAnimationActive?: boolean;
}

export interface Annotation {
  id: string;
  type: 'line' | 'area';
  position: 'x' | 'y';
  value?: number | string;
  startValue?: number | string;
  endValue?: number | string;
  color?: string;
  label?: string;
  labelPosition?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export interface Threshold {
  id: string;
  value: number;
  color: string;
  label?: string;
  position?: 'y' | 'y2';
  strokeDasharray?: string;
  isRange?: boolean;
  maxValue?: number;
}

export interface AdvancedChartProps {
  data: ChartDataPoint[];
  series: ChartSeries[];
  height?: number | string;
  xAxisKey?: string;
  xAxisLabel?: string;
  xAxisType?: 'number' | 'category' | 'time';
  xAxisTickFormatter?: (value: any) => string;
  xAxisTickCount?: number;
  yAxisLabel?: string;
  yAxisDomain?: [number | 'auto', number | 'auto'];
  y2AxisLabel?: string;
  y2AxisDomain?: [number | 'auto', number | 'auto'];
  syncId?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  legendPosition?: 'top' | 'right' | 'bottom' | 'left';
  showTooltip?: boolean;
  tooltipFormatter?: (value: any, name: string) => [string, string];
  showBrush?: boolean;
  animations?: boolean;
  stacked?: boolean;
  annotations?: Annotation[];
  thresholds?: Threshold[];
  zoom?: boolean;
  onDataPointClick?: (data: ChartDataPoint) => void;
  className?: string;
}

export const AdvancedChart: React.FC<AdvancedChartProps> = ({
  data,
  series,
  height = 300,
  xAxisKey = 'timestamp',
  xAxisLabel,
  xAxisType = 'category',
  xAxisTickFormatter,
  xAxisTickCount,
  yAxisLabel,
  yAxisDomain = ['auto', 'auto'],
  y2AxisLabel,
  y2AxisDomain = ['auto', 'auto'],
  syncId,
  showGrid = true,
  showLegend = true,
  legendPosition = 'bottom',
  showTooltip = true,
  tooltipFormatter,
  showBrush = false,
  animations = true,
  stacked = false,
  annotations = [],
  thresholds = [],
  zoom = false,
  onDataPointClick,
  className,
}) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>(data);
  const [zoomArea, setZoomArea] = useState<{x1: number | null, x2: number | null}>({ x1: null, x2: null });
  const [zoomActive, setZoomActive] = useState<boolean>(false);
  
  // Update chart data when prop changes
  useEffect(() => {
    setChartData(data);
  }, [data]);
  
  // Handle zoom functionality
  const handleZoom = () => {
    if (!zoomArea.x1 || !zoomArea.x2) return;
    
    const { x1, x2 } = zoomArea;
    
    // Find indices for the zoomed area
    const startIndex = chartData.findIndex((d: any) => d[xAxisKey] >= x1);
    const endIndex = chartData.findIndex((d: any) => d[xAxisKey] >= x2);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    // Set zoomed data
    const zoomedData = chartData.slice(
      startIndex > 0 ? startIndex - 1 : 0,
      endIndex > 0 ? endIndex + 1 : chartData.length
    );
    
    setChartData(zoomedData);
    setZoomArea({ x1: null, x2: null });
    setZoomActive(false);
  };
  
  // Handle mouse events for zooming
  const handleMouseDown = useCallback((e: any) => {
    if (!zoom || !e) return;
    setZoomActive(true);
    setZoomArea({ ...zoomArea, x1: e.activeLabel });
  }, [zoom, zoomArea]);
  
  const handleMouseMove = useCallback((e: any) => {
    if (!zoom || !zoomActive || !e) return;
    setZoomArea({ ...zoomArea, x2: e.activeLabel });
  }, [zoom, zoomActive, zoomArea]);
  
  const handleMouseUp = useCallback(() => {
    if (!zoom) return;
    if (zoomActive && zoomArea.x1 !== null && zoomArea.x2 !== null) {
      handleZoom();
    }
    setZoomActive(false);
  }, [zoom, zoomActive, zoomArea, handleZoom]);
  
  // Reset zoom to show all data
  const resetZoom = () => {
    setChartData(data);
  };
  
  // Determine the margin based on axis labels
  const getMargin = () => {
    const base = { top: 10, right: 30, bottom: 30, left: 30 };
    
    if (yAxisLabel) base.left = 50;
    if (y2AxisLabel) base.right = 50;
    if (xAxisLabel) base.bottom = 40;
    
    if (legendPosition === 'top') base.top = 40;
    if (legendPosition === 'bottom') base.bottom = 40;
    if (legendPosition === 'left') base.left = Math.max(base.left, 100);
    if (legendPosition === 'right') base.right = Math.max(base.right, 100);
    
    return base;
  };
  
  // Calculate if we need a secondary Y axis
  const hasSecondaryYAxis = series.some(s => s.yAxisId === 'right');
  
  // Helper to render the correct series component based on type
  const renderSeriesComponent = (s: ChartSeries) => {
    const commonProps = {
      key: s.id,
      name: s.name,
      dataKey: s.dataKey,
      stroke: s.color,
      yAxisId: s.yAxisId || 'left',
      isAnimationActive: animations && (s.isAnimationActive !== false),
      onClick: onDataPointClick ? (data: any) => onDataPointClick(data) : undefined,
    };
    
    // Add stack ID if stacking is enabled and series type supports it
    const stackProps = stacked && (s.type === 'bar' || s.type === 'area') ? { stackId: s.stackId || 'stack1' } : {};
    
    switch (s.type) {
      case 'line':
        return (
          <Line 
            {...commonProps}
            strokeWidth={s.strokeWidth || 2}
            dot={s.dot !== undefined ? s.dot : true}
          />
        );
      case 'bar':
        return (
          <Bar 
            {...commonProps}
            {...stackProps}
            fill={s.fillColor || s.color}
          />
        );
      case 'area':
        return (
          <Area 
            {...commonProps}
            {...stackProps}
            fill={s.fillColor || `${s.color}33`} // Default to transparent version of stroke color
            strokeWidth={s.strokeWidth || 1.5}
            dot={s.dot !== undefined ? s.dot : false}
          />
        );
      default:
        return null;
    }
  };
  
  // Handle legend position
  const getLegendProps = () => {
    switch (legendPosition) {
      case 'top':
        return { layout: 'horizontal', verticalAlign: 'top', align: 'center' };
      case 'right':
        return { layout: 'vertical', verticalAlign: 'middle', align: 'right' };
      case 'left':
        return { layout: 'vertical', verticalAlign: 'middle', align: 'left' };
      case 'bottom':
      default:
        return { layout: 'horizontal', verticalAlign: 'bottom', align: 'center' };
    }
  };
  
  // Render annotations (reference lines and areas)
  const renderAnnotations = () => {
    return annotations.map(annotation => {
      if (annotation.type === 'line') {
        return (
          <ReferenceLine
            key={annotation.id}
            x={annotation.position === 'x' ? annotation.value : undefined}
            y={annotation.position === 'y' ? annotation.value : undefined}
            stroke={annotation.color || '#ff7300'}
            strokeDasharray="3 3"
          >
            {annotation.label && (
              <Label
                value={annotation.label}
                position={annotation.labelPosition || 'top'}
                fill={annotation.color || '#ff7300'}
              />
            )}
          </ReferenceLine>
        );
      } else if (annotation.type === 'area') {
        return (
          <ReferenceArea
            key={annotation.id}
            x1={annotation.position === 'x' ? annotation.startValue : undefined}
            x2={annotation.position === 'x' ? annotation.endValue : undefined}
            y1={annotation.position === 'y' ? annotation.startValue : undefined}
            y2={annotation.position === 'y' ? annotation.endValue : undefined}
            stroke={annotation.color || '#ff7300'}
            fill={annotation.color || '#ff7300'}
            fillOpacity={0.2}
          >
            {annotation.label && (
              <Label
                value={annotation.label}
                position={annotation.labelPosition || 'center'}
                fill={annotation.color || '#ff7300'}
              />
            )}
          </ReferenceArea>
        );
      }
      return null;
    });
  };
  
  // Render thresholds as reference lines
  const renderThresholds = () => {
    return thresholds.map(threshold => {
      if (threshold.isRange && threshold.maxValue !== undefined) {
        return (
          <ReferenceArea
            key={threshold.id}
            y1={threshold.value}
            y2={threshold.maxValue}
            yAxisId={threshold.position === 'y2' ? 'right' : 'left'}
            fill={threshold.color}
            fillOpacity={0.1}
            strokeOpacity={0.3}
          >
            {threshold.label && (
              <Label
                value={threshold.label}
                position="insideRight"
                fill={threshold.color}
              />
            )}
          </ReferenceArea>
        );
      }
      
      return (
        <ReferenceLine
          key={threshold.id}
          y={threshold.value}
          yAxisId={threshold.position === 'y2' ? 'right' : 'left'}
          stroke={threshold.color}
          strokeDasharray={threshold.strokeDasharray || '3 3'}
        >
          {threshold.label && (
            <Label
              value={threshold.label}
              position="insideRight"
              fill={threshold.color}
            />
          )}
        </ReferenceLine>
      );
    });
  };
  
  return (
    <div className={`advanced-chart relative ${className}`} style={{ height }}>
      {/* Zoom reset button (only shown when data is zoomed) */}
      {zoom && chartData.length !== data.length && (
        <button 
          className="absolute top-0 right-0 z-10 bg-blue-500 text-white px-2 py-1 text-xs rounded"
          onClick={resetZoom}
        >
          Reset Zoom
        </button>
      )}
      
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={getMargin()}
          syncId={syncId}
          onMouseDown={zoom ? handleMouseDown : undefined}
          onMouseMove={zoom ? handleMouseMove : undefined}
          onMouseUp={zoom ? handleMouseUp : undefined}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
          )}
          
          <XAxis 
            dataKey={xAxisKey} 
            type={xAxisType}
            tickFormatter={xAxisTickFormatter}
            tickCount={xAxisTickCount}
            allowDataOverflow={zoom}
          >
            {xAxisLabel && <Label value={xAxisLabel} offset={-10} position="insideBottom" />}
          </XAxis>
          
          <YAxis 
            yAxisId="left"
            domain={yAxisDomain}
            allowDataOverflow={zoom}
          >
            {yAxisLabel && <Label value={yAxisLabel} angle={-90} position="insideLeft" />}
          </YAxis>
          
          {hasSecondaryYAxis && (
            <YAxis 
              yAxisId="right" 
              orientation="right"
              domain={y2AxisDomain}
              allowDataOverflow={zoom}
            >
              {y2AxisLabel && <Label value={y2AxisLabel} angle={90} position="insideRight" />}
            </YAxis>
          )}
          
          {showTooltip && <Tooltip formatter={tooltipFormatter} />}
          
          {showLegend && <Legend {...getLegendProps()} />}
          
          {/* Render all series */}
          {series.map(renderSeriesComponent)}
          
          {/* Render annotations and thresholds */}
          {renderAnnotations()}
          {renderThresholds()}
          
          {/* Render brush for time navigation */}
          {showBrush && (
            <Brush 
              dataKey={xAxisKey} 
              height={30} 
              stroke="#8884d8"
              startIndex={0}
              endIndex={Math.min(Math.max(Math.floor(data.length / 4), 5), data.length - 1)}
            />
          )}
          
          {/* Render zoom area if active */}
          {zoom && zoomActive && zoomArea.x1 !== null && zoomArea.x2 !== null && (
            <ReferenceArea
              x1={zoomArea.x1}
              x2={zoomArea.x2}
              strokeOpacity={0.3}
              fill="#8884d8"
              fillOpacity={0.3}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdvancedChart;