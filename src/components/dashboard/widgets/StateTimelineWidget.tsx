import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/layout/Card';
import { StateTimelineWidget as StateTimelineWidgetType } from '../../../types/dashboard';
import { fetchTagById } from '../../../services/api/tag';
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, Tooltip, ReferenceArea, CartesianGrid } from 'recharts';

interface StateTimelineWidgetProps {
  widget: StateTimelineWidgetType;
}

// Interface for timeline state data
interface StateEntry {
  time: string;        // Timestamp (for display)
  startTime: number;   // Start time in milliseconds
  endTime: number;     // End time in milliseconds
  state: string;       // State identifier
  duration: number;    // Duration in milliseconds
  index: number;       // Y-axis position for rendering
}

export const StateTimelineWidget: React.FC<StateTimelineWidgetProps> = ({ widget }) => {
  const [data, setData] = useState<StateEntry[]>([]);
  const [stateColors, setStateColors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!widget.tagIds || widget.tagIds.length === 0) {
        setError('No tags selected');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // In a real app, this would fetch timeline state data from the API
        // Here we'll generate some example state timeline data
        
        // Get state colors from widget config or set defaults
        const colors = widget.stateColors || {
          'running': '#22c55e',     // Green
          'idle': '#3b82f6',        // Blue
          'warning': '#f59e0b',     // Amber
          'error': '#ef4444',       // Red
          'maintenance': '#8b5cf6', // Purple
          'offline': '#6b7280',     // Gray
        };
        
        setStateColors(colors);
        
        // Generate timeline data for each machine/tag
        const timelineData: StateEntry[] = [];
        const now = Date.now();
        const timeRange = widget.timeRange || 3600000; // Default 1 hour
        const startTime = now - timeRange;
        
        // Process each tag (each tag represents a separate machine or component)
        for (let i = 0; i < widget.tagIds.length; i++) {
          const tagId = widget.tagIds[i];
          
          try {
            // Get tag info (in real app)
            const tag = await fetchTagById(tagId);
            
            // Possible states for the simulation
            const possibleStates = Object.keys(colors);
            let currentTime = startTime;
            
            // Generate state segments spanning the time range
            while (currentTime < now) {
              // Randomly choose a state
              const stateIndex = Math.floor(Math.random() * possibleStates.length);
              const state = possibleStates[stateIndex];
              
              // Generate a random duration for this state
              // Shorter durations for error states, longer for running/idle
              let maxDuration = 30 * 60 * 1000; // 30 minutes max
              if (state === 'error') maxDuration = 10 * 60 * 1000; // 10 minutes max for errors
              if (state === 'warning') maxDuration = 15 * 60 * 1000; // 15 minutes max for warnings
              
              const minDuration = 2 * 60 * 1000; // 2 minutes minimum
              const duration = Math.floor(Math.random() * (maxDuration - minDuration)) + minDuration;
              
              // Calculate end time, capping at 'now'
              const endTime = Math.min(currentTime + duration, now);
              
              // Format time for display
              const timeStr = new Date(currentTime).toLocaleTimeString();
              
              // Add state entry
              timelineData.push({
                time: timeStr,
                startTime: currentTime,
                endTime: endTime,
                state: state,
                duration: endTime - currentTime,
                index: i, // Y-axis position based on tag index
              });
              
              // Move to next time segment
              currentTime = endTime;
            }
          } catch (err) {
            console.error(`Error processing tag ${tagId}:`, err);
          }
        }
        
        // Sort data by time
        timelineData.sort((a, b) => a.startTime - b.startTime);
        
        setData(timelineData);
      } catch (err) {
        console.error('Error generating timeline data:', err);
        setError('Failed to load timeline data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up polling interval if specified
    if (widget.refreshRate && widget.refreshRate > 0) {
      const interval = setInterval(fetchData, widget.refreshRate);
      return () => clearInterval(interval);
    }
  }, [widget.tagIds, widget.timeRange, widget.refreshRate, widget.stateColors]);
  
  // Format duration for display (e.g., "1h 30m")
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };
  
  // Format time for display on x-axis
  const formatXAxis = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Custom tooltip for state timeline
  const renderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-2 shadow-md rounded border border-gray-200 dark:border-gray-700">
          <p className="font-semibold capitalize">{data.state}</p>
          <p className="text-sm">
            {new Date(data.startTime).toLocaleTimeString()} - {new Date(data.endTime).toLocaleTimeString()}
          </p>
          <p className="text-sm">Duration: {formatDuration(data.duration)}</p>
          <p className="text-sm">Machine: {widget.tagIds[data.index]}</p>
        </div>
      );
    }
    return null;
  };
  
  // Custom bar shape for timeline segments
  const renderCustomBar = (props: any) => {
    const { x, y, width, height, state } = props;
    const color = stateColors[state] || '#6b7280'; // Default to gray if no color defined
    
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={color} />
      </g>
    );
  };
  
  // Calculate data for the chart
  const chartData = data.map(entry => ({
    startTime: entry.startTime,
    endTime: entry.endTime,
    value: entry.index,
    state: entry.state,
    duration: entry.duration,
  }));
  
  // Calculate y-axis ticks and labels based on tag IDs
  const yAxisTicks = widget.tagIds?.map((_, index) => index) || [];
  const yAxisLabels: Record<number, string> = {};
  widget.tagIds?.forEach((tagId, index) => {
    yAxisLabels[index] = widget.tagLabels?.[index] || tagId;
  });
  
  // Custom y-axis formatter
  const formatYAxis = (value: number): string => {
    return yAxisLabels[value] || '';
  };
  
  return (
    <Card className="widget-content timeline-widget">
      <div className="flex flex-col w-full h-full">
        <div className="font-medium text-lg mb-2">{widget.title || 'State Timeline'}</div>
        
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center flex-1 text-red-500">
            {error}
          </div>
        ) : (
          <div className="chart-container flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 120, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="startTime" 
                  type="number" 
                  scale="time" 
                  domain={[chartData.length > 0 ? chartData[0].startTime : 0, 'dataMax']}
                  tickFormatter={formatXAxis}
                />
                <YAxis 
                  dataKey="value" 
                  type="number" 
                  domain={[0, widget.tagIds ? widget.tagIds.length - 1 : 0]} 
                  ticks={yAxisTicks}
                  tickFormatter={formatYAxis}
                />
                <Tooltip content={renderTooltip} />
                
                {/* Render timeline segments as bars */}
                {chartData.map((entry, index) => (
                  <ReferenceArea 
                    key={index}
                    x1={entry.startTime} 
                    x2={entry.endTime}
                    y1={entry.value - 0.45} 
                    y2={entry.value + 0.45}
                    fill={stateColors[entry.state] || '#6b7280'}
                    strokeOpacity={0}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* State color legend */}
        {widget.showLegend && !loading && !error && (
          <div className="flex flex-wrap justify-center items-center pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
            {Object.entries(stateColors).map(([state, color]) => (
              <div key={state} className="flex items-center mx-2 mb-1">
                <div 
                  className="w-3 h-3 mr-1 rounded-sm" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-700 dark:text-gray-300 capitalize">
                  {state}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StateTimelineWidget;