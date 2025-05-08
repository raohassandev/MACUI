import React, { useState, useEffect } from 'react';
import { ChartWidget as ChartWidgetType } from '../../../types/dashboard';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchTagHistory } from '../../../services/api/tag';
import { mockTags } from '../../../services/api/tag';

interface ChartWidgetProps {
  widget: ChartWidgetType;
}

interface DataPoint {
  timestamp: string;
  value: any;
  [key: string]: any;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ widget }) => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!widget.tagId) {
        setError('No tag selected');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch historical data for the primary tag
        const history = await fetchTagHistory(
          widget.tagId,
          widget.timeRange,
          widget.historyPoints || 100
        );
        
        // Format the data for Recharts
        const formattedData: DataPoint[] = history.map(point => ({
          timestamp: new Date(point.timestamp).toLocaleTimeString(),
          value: point.value,
        }));

        // Add additional tags if specified
        if (widget.additionalTags && widget.additionalTags.length > 0) {
          // For each additional tag, fetch its history and add it to the data
          for (const additionalTagId of widget.additionalTags) {
            const additionalHistory = await fetchTagHistory(
              additionalTagId,
              widget.timeRange,
              widget.historyPoints || 100
            );
            
            // Add the values to the formatted data
            additionalHistory.forEach((point, index) => {
              if (index < formattedData.length) {
                formattedData[index][additionalTagId] = point.value;
              }
            });
          }
        }
        
        setData(formattedData);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Failed to load data');
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
  }, [widget.tagId, widget.timeRange, widget.historyPoints, widget.refreshRate, widget.additionalTags]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Find the tag details for label/formatting
  const tag = widget.tagId ? mockTags.find(t => t.id === widget.tagId) : null;
  const unit = tag?.unit || '';

  // Helper to generate the right chart type
  const renderChart = () => {
    const colors = widget.colors || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    // Set up axis min/max
    const yAxisProps = {
      domain: widget.autoScale ? ['auto', 'auto'] : [widget.yAxisMin || 0, widget.yAxisMax || 100],
      unit: unit ? ` ${unit}` : '',
    };

    // Type-safe tooltip formatter
    const tooltipFormatter = (value: any, name: string) => {
      return [`${value}${unit ? ` ${unit}` : ''}`, name === 'value' ? tag?.name || 'Value' : name];
    };

    switch (widget.chartType) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis {...yAxisProps} />
            <Tooltip 
              formatter={tooltipFormatter} 
            />
            {widget.showLegend && <Legend />}
            <Line 
              type="monotone" 
              dataKey="value" 
              name={tag?.name || 'Value'} 
              stroke={colors[0]} 
              dot={false} 
              isAnimationActive={false} 
            />
            {/* Render additional lines for multi-tag charts */}
            {widget.additionalTags?.map((tagId, index) => {
              const additionalTag = mockTags.find(t => t.id === tagId);
              return (
                <Line
                  key={tagId}
                  type="monotone"
                  dataKey={tagId}
                  name={additionalTag?.name || `Series ${index + 2}`}
                  stroke={colors[(index + 1) % colors.length]}
                  dot={false}
                  isAnimationActive={false}
                />
              );
            })}
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis {...yAxisProps} />
            <Tooltip 
              formatter={tooltipFormatter} 
            />
            {widget.showLegend && <Legend />}
            <Bar 
              dataKey="value" 
              name={tag?.name || 'Value'} 
              fill={colors[0]} 
              isAnimationActive={false} 
            />
            {/* Render additional bars for multi-tag charts */}
            {widget.additionalTags?.map((tagId, index) => {
              const additionalTag = mockTags.find(t => t.id === tagId);
              return (
                <Bar
                  key={tagId}
                  dataKey={tagId}
                  name={additionalTag?.name || `Series ${index + 2}`}
                  fill={colors[(index + 1) % colors.length]}
                  isAnimationActive={false}
                />
              );
            })}
          </BarChart>
        );
      
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis {...yAxisProps} />
            <Tooltip 
              formatter={tooltipFormatter} 
            />
            {widget.showLegend && <Legend />}
            <Area 
              type="monotone" 
              dataKey="value" 
              name={tag?.name || 'Value'} 
              stroke={colors[0]} 
              fill={colors[0]} 
              fillOpacity={0.3}
              isAnimationActive={false} 
            />
            {/* Render additional areas for multi-tag charts */}
            {widget.additionalTags?.map((tagId, index) => {
              const additionalTag = mockTags.find(t => t.id === tagId);
              return (
                <Area
                  key={tagId}
                  type="monotone"
                  dataKey={tagId}
                  name={additionalTag?.name || `Series ${index + 2}`}
                  stroke={colors[(index + 1) % colors.length]}
                  fill={colors[(index + 1) % colors.length]}
                  fillOpacity={0.3}
                  isAnimationActive={false}
                />
              );
            })}
          </AreaChart>
        );
      
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};