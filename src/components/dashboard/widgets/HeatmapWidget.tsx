import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/layout/Card';
import { HeatmapWidget as HeatmapWidgetType } from '../../../types/dashboard';
import { fetchTagById } from '../../../services/api/tag';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';

interface HeatmapWidgetProps {
  widget: HeatmapWidgetType;
}

// Interface for heatmap data point
interface HeatmapDataPoint {
  x: number;
  y: number;
  z: number; // Value intensity
  name?: string;
}

export const HeatmapWidget: React.FC<HeatmapWidgetProps> = ({ widget }) => {
  const [data, setData] = useState<HeatmapDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Generate colors for heatmap
  const getColor = (value: number): string => {
    // Default color scheme: blue to red
    const minColor = widget.colorScheme?.minColor || '#3b82f6'; // blue
    const midColor = widget.colorScheme?.midColor || '#a855f7'; // purple
    const maxColor = widget.colorScheme?.maxColor || '#ef4444'; // red
    
    // Simple gradient calculation (you could use a library like d3-interpolate for better results)
    if (value <= 0.5) {
      // Blend from minColor to midColor
      const ratio = value * 2;
      return blendColors(minColor, midColor, ratio);
    } else {
      // Blend from midColor to maxColor
      const ratio = (value - 0.5) * 2;
      return blendColors(midColor, maxColor, ratio);
    }
  };
  
  // Simple color blending function (for demo purposes)
  const blendColors = (color1: string, color2: string, ratio: number): string => {
    const hex = (color: string) => {
      // Convert shorthand hex to full form
      if (color.length === 4) {
        color = color[0] + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
      }
      return color.substring(1);
    };
    
    const r1 = parseInt(hex(color1).substring(0, 2), 16);
    const g1 = parseInt(hex(color1).substring(2, 4), 16);
    const b1 = parseInt(hex(color1).substring(4, 6), 16);
    
    const r2 = parseInt(hex(color2).substring(0, 2), 16);
    const g2 = parseInt(hex(color2).substring(2, 4), 16);
    const b2 = parseInt(hex(color2).substring(4, 6), 16);
    
    const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
    
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };
  
  useEffect(() => {
    const fetchData = async () => {
      if (!widget.tagId) {
        setError('No tag selected');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // In a real app, this would fetch heatmap data from the API
        // Here we'll generate some example data based on the tag and time range
        
        // Get tag data for reference
        const tagData = await fetchTagById(widget.tagId);
        
        // Generate a grid of data points (for demonstration)
        const gridSize = widget.gridSize || 10;
        const generatedData: HeatmapDataPoint[] = [];
        
        // Create a heatmap grid
        for (let x = 0; x < gridSize; x++) {
          for (let y = 0; y < gridSize; y++) {
            // Generate some sample patterns
            const centerX = gridSize / 2;
            const centerY = gridSize / 2;
            
            // Distance from center (normalized to 0-1)
            const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)) / 
                            Math.sqrt(Math.pow(gridSize, 2));
            
            // Add some randomness and patterns
            let z = 0;
            
            if (widget.patternType === 'radial') {
              // Radial pattern from center
              z = 1 - distance + (Math.random() * 0.2);
            } else if (widget.patternType === 'gradient') {
              // Gradient pattern
              z = y / gridSize + (Math.random() * 0.1);
            } else if (widget.patternType === 'hotspots') {
              // Random hotspots
              const hotspots = [
                { x: gridSize * 0.2, y: gridSize * 0.2, intensity: 0.8 },
                { x: gridSize * 0.8, y: gridSize * 0.8, intensity: 0.9 },
                { x: gridSize * 0.2, y: gridSize * 0.8, intensity: 0.7 }
              ];
              
              // Influence from hotspots
              z = hotspots.reduce((acc, spot) => {
                const spotDistance = Math.sqrt(Math.pow(x - spot.x, 2) + Math.pow(y - spot.y, 2)) / gridSize;
                return acc + (spot.intensity * (1 - Math.min(1, spotDistance * 2)));
              }, 0) / hotspots.length;
              
              // Add noise
              z += (Math.random() * 0.15);
            } else {
              // Default random pattern
              z = Math.random();
            }
            
            // Ensure z is between 0 and 1
            z = Math.max(0, Math.min(1, z));
            
            generatedData.push({ 
              x, 
              y, 
              z,
              // Optional labels or metadata
              name: `Cell (${x},${y})`
            });
          }
        }
        
        setData(generatedData);
      } catch (err) {
        console.error('Error generating heatmap data:', err);
        setError('Failed to load heatmap data');
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
  }, [widget.tagId, widget.refreshRate, widget.gridSize, widget.patternType]);
  
  // Custom tooltip for better display of heatmap data
  const renderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-2 shadow-md rounded border border-gray-200 dark:border-gray-700">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">Value: {(data.z * 100).toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="widget-content heatmap-widget">
      <div className="flex flex-col w-full h-full">
        <div className="font-medium text-lg mb-2">{widget.title || 'Heatmap'}</div>
        
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
              <ScatterChart
                margin={{ top: 10, right: 10, bottom: 20, left: 10 }}
              >
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="X" 
                  domain={[0, widget.gridSize || 10]} 
                  tickCount={5} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Y" 
                  domain={[0, widget.gridSize || 10]} 
                  tickCount={5} 
                  tick={{ fontSize: 12 }}
                />
                <ZAxis 
                  type="number" 
                  dataKey="z" 
                  range={[40, 400]} 
                  domain={[0, 1]} 
                />
                <Tooltip content={renderTooltip} />
                <Scatter name="Heatmap" data={data}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.z)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* Optional legend */}
        {widget.showLegend && !loading && !error && (
          <div className="flex justify-center items-center h-6 mt-1">
            <div className="flex w-full max-w-xs h-3 rounded-full overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 h-full" 
                  style={{ backgroundColor: getColor(i / 19) }}
                />
              ))}
            </div>
            <div className="flex justify-between w-full max-w-xs text-xs text-gray-500 dark:text-gray-400 px-1">
              <span>Min</span>
              <span>Max</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default HeatmapWidget;