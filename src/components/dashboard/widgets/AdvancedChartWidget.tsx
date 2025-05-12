import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/layout/Card';
import AdvancedChart, { ChartDataPoint, ChartSeries, Annotation, Threshold } from '../../ui/charts/AdvancedChart';
import { AdvancedChartWidget as AdvancedChartWidgetType } from '../../../types/dashboard';
import { fetchTagById } from '../../../services/api/tag';
import { format } from 'date-fns';

interface AdvancedChartWidgetProps {
  widget: AdvancedChartWidgetType;
}

export const AdvancedChartWidget: React.FC<AdvancedChartWidgetProps> = ({ widget }) => {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [series, setSeries] = useState<ChartSeries[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Construct series configuration from widget props
        const seriesConfig: ChartSeries[] = [];
        const fetchedData: ChartDataPoint[] = [];
        
        // Process main tag
        if (widget.tagId) {
          const tagData = await fetchTagById(widget.tagId);
          
          // Create synthetic historical data for demo
          const now = Date.now();
          const timeRange = widget.timeRange || 3600000; // Default 1 hour
          const dataPoints = widget.dataPoints || 50;
          const step = timeRange / dataPoints;
          
          // Generate some basic pattern
          const mainTagData = Array.from({ length: dataPoints }).map((_, i) => {
            const timestamp = now - timeRange + (i * step);
            
            // Create patterns based on widget config
            let value = 0;
            
            if (widget.pattern === 'sine') {
              // Sine wave pattern
              value = 50 + 40 * Math.sin((i / dataPoints) * Math.PI * 4);
            } else if (widget.pattern === 'trend') {
              // Upward/downward trend with noise
              const trend = widget.trendDirection === 'down' ? -1 : 1;
              value = 50 + (trend * i * 50 / dataPoints) + (Math.random() - 0.5) * 10;
            } else if (widget.pattern === 'steps') {
              // Step changes
              const step = Math.floor(i / (dataPoints / 5));
              value = 20 + step * 15 + (Math.random() - 0.5) * 5;
            } else if (widget.pattern === 'random') {
              // Random walk
              const prevValue = i > 0 ? fetchedData[i-1]?.value || 50 : 50;
              value = Math.max(0, Math.min(100, prevValue + (Math.random() - 0.5) * 10));
            } else {
              // Default pattern with some randomness
              value = 50 + 30 * Math.sin((i / dataPoints) * Math.PI * 2) + (Math.random() - 0.5) * 10;
            }
            
            return {
              timestamp,
              name: format(timestamp, 'HH:mm:ss'),
              value: value,
            };
          });
          
          fetchedData.push(...mainTagData);
          
          // Add main series
          seriesConfig.push({
            id: 'main',
            name: tagData.name || 'Main Series',
            dataKey: 'value',
            type: widget.chartType || 'line',
            color: widget.lineColor || '#3b82f6',
            fillColor: widget.areaColor,
            strokeWidth: widget.strokeWidth || 2,
            dot: widget.showDots,
          });
        }
        
        // Add data for additional tags if specified
        if (widget.additionalTags && widget.additionalTags.length > 0) {
          for (let i = 0; i < widget.additionalTags.length; i++) {
            const tagId = widget.additionalTags[i];
            const tagColor = (widget.colors && widget.colors[i]) || 
                            getDefaultColor(i);
            
            try {
              const tagData = await fetchTagById(tagId);
              
              // Generate synthetic data for this tag, with some relation to the main series
              const additionalData = fetchedData.map(point => {
                const baseValue = point.value;
                let relatedValue;
                
                // Make this series somewhat related to the main series but with variation
                if (i === 0) { // First additional series - higher
                  relatedValue = baseValue * (1.2 + Math.random() * 0.2);
                } else if (i === 1) { // Second additional series - lower
                  relatedValue = baseValue * (0.7 + Math.random() * 0.2);
                } else { // Others - random relation
                  relatedValue = baseValue * (0.5 + Math.random());
                }
                
                return {
                  ...point,
                  [`value${i+1}`]: relatedValue,
                };
              });
              
              // Update all data points
              for (let j = 0; j < fetchedData.length; j++) {
                fetchedData[j] = {
                  ...fetchedData[j],
                  [`value${i+1}`]: additionalData[j][`value${i+1}`],
                };
              }
              
              // Add additional series config
              seriesConfig.push({
                id: `series-${i}`,
                name: tagData.name || `Series ${i+1}`,
                dataKey: `value${i+1}`,
                type: widget.additionalChartTypes?.[i] || 'line',
                color: tagColor,
                fillColor: widget.areaColor 
                  ? `${tagColor}33` // Transparent version of the color
                  : undefined,
                strokeWidth: widget.strokeWidth || 2,
                dot: widget.showDots,
                yAxisId: widget.useSecondYAxis?.[i] ? 'right' : 'left',
                stackId: widget.stacked ? 'stack1' : undefined,
              });
            } catch (err) {
              console.error(`Error fetching additional tag ${tagId}:`, err);
            }
          }
        }
        
        // Process annotations if any
        const processedAnnotations: Annotation[] = [];
        
        if (widget.annotations && widget.annotations.length > 0) {
          widget.annotations.forEach((anno, i) => {
            processedAnnotations.push({
              id: anno.id || `annotation-${i}`,
              type: anno.type || 'line',
              position: anno.position || 'y',
              value: anno.value,
              startValue: anno.startValue,
              endValue: anno.endValue,
              color: anno.color || '#ff7300',
              label: anno.label,
              labelPosition: anno.labelPosition,
            });
          });
        }
        
        // Process thresholds if any
        const processedThresholds: Threshold[] = [];
        
        if (widget.thresholds && widget.thresholds.length > 0) {
          widget.thresholds.forEach((thresh, i) => {
            processedThresholds.push({
              id: `threshold-${i}`,
              value: thresh.value,
              color: thresh.color,
              label: thresh.label,
              position: widget.useSecondYAxis && widget.useSecondYAxis[0] ? 'y2' : 'y',
              isRange: thresh.maxValue !== undefined,
              maxValue: thresh.maxValue,
            });
          });
        }
        
        // Set all state at once
        setData(fetchedData);
        setSeries(seriesConfig);
        setAnnotations(processedAnnotations);
        setThresholds(processedThresholds);
      } catch (err) {
        console.error('Error generating chart data:', err);
        setError('Failed to load chart data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up polling interval if specified
    if (widget.refreshRate && widget.refreshRate > 0) {
      const interval = setInterval(fetchData, widget.refreshRate);
      return () => clearInterval(interval);
    }
  }, [
    widget.tagId, 
    widget.additionalTags, 
    widget.refreshRate, 
    widget.timeRange,
    widget.chartType,
    widget.pattern,
    widget.trendDirection,
    widget.dataPoints,
    widget.annotations,
    widget.thresholds
  ]);

  // Get a default color for additional series
  const getDefaultColor = (index: number) => {
    const colors = [
      '#3b82f6', // Blue
      '#ef4444', // Red
      '#22c55e', // Green
      '#f59e0b', // Amber
      '#8b5cf6', // Purple
      '#ec4899', // Pink
      '#14b8a6', // Teal
      '#f97316', // Orange
    ];
    
    return colors[index % colors.length];
  };

  // Format timestamp for x-axis
  const formatXAxis = (timestamp: number): string => {
    if (!timestamp) return '';
    return format(new Date(timestamp), 'HH:mm');
  };

  // Format tooltip
  const formatTooltip = (value: any, name: string): [string, string] => {
    return [
      typeof value === 'number' ? value.toFixed(1) : value,
      name
    ];
  };

  return (
    <Card className="widget-content advanced-chart-widget">
      <div className="flex flex-col w-full h-full">
        <div className="font-medium text-lg mb-1">{widget.title || 'Chart'}</div>
        
        {widget.description && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {widget.description}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center flex-1 text-red-500">
            {error}
          </div>
        ) : (
          <div className="chart-container flex-1">
            <AdvancedChart
              data={data}
              series={series}
              xAxisKey="timestamp"
              xAxisType="number"
              xAxisTickFormatter={formatXAxis}
              yAxisLabel={widget.yAxisLabel}
              yAxisDomain={widget.autoScale ? ['auto', 'auto'] : [widget.yAxisMin || 0, widget.yAxisMax || 100]}
              y2AxisLabel={widget.y2AxisLabel}
              showGrid={widget.showGrid !== false}
              showLegend={widget.showLegend !== false}
              legendPosition={widget.legendPosition || 'bottom'}
              tooltipFormatter={formatTooltip}
              showBrush={widget.showBrush}
              animations={widget.animations !== false}
              stacked={widget.stacked || false}
              annotations={annotations}
              thresholds={thresholds}
              zoom={widget.zoom}
              className="w-full h-full"
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default AdvancedChartWidget;