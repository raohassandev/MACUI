import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/layout/Card';
import { MultiStatWidget as MultiStatWidgetType } from '../../../types/dashboard';
import { fetchTagById } from '../../../services/api/tag';

interface MultiStatWidgetProps {
  widget: MultiStatWidgetType;
}

// Interface for each stat item
interface StatItem {
  id: string;
  name: string;
  value: number;
  unit?: string;
  sparkline?: number[];
  change?: number; // Percentage change
  threshold?: {
    value: number;
    color: string;
  };
  color?: string;
}

export const MultiStatWidget: React.FC<MultiStatWidgetProps> = ({ widget }) => {
  const [stats, setStats] = useState<StatItem[]>([]);
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
        // Process each tag to create the multi-stat panel
        const statsData: StatItem[] = [];
        
        for (const tagId of widget.tagIds) {
          try {
            // Fetch tag data (in a real app)
            const tag = await fetchTagById(tagId);
            
            // Get value from the tag
            const value = typeof tag.lastValue !== 'undefined' ? Number(tag.lastValue) : Math.random() * 100;
            
            // Generate some random historical data for sparkline
            const historyPoints = widget.sparklinePoints || 10;
            const sparkline = Array.from({ length: historyPoints }).map(() => {
              // Random values that hover around the current value
              return value + ((Math.random() - 0.5) * value * 0.3);
            });
            
            // Calculate change (for trend indicator)
            const previousValue = sparkline[0];
            const change = previousValue !== 0 ? ((value - previousValue) / previousValue) * 100 : 0;
            
            // Find applicable threshold
            let thresholdColor;
            if (widget.thresholds && widget.thresholds.length > 0) {
              // Sort thresholds descending, find the first one that's less than or equal to value
              const threshold = [...widget.thresholds]
                .sort((a, b) => b.value - a.value)
                .find(t => value >= t.value);
                
              thresholdColor = threshold ? threshold.color : undefined;
            }
            
            // Create stat item
            statsData.push({
              id: tagId,
              name: widget.statLabels?.[tagId] || tag.name || tagId,
              value,
              unit: tag.unit,
              sparkline,
              change,
              color: thresholdColor,
            });
          } catch (err) {
            console.error(`Error fetching data for tag ${tagId}:`, err);
          }
        }
        
        setStats(statsData);
      } catch (err) {
        console.error('Error generating multi-stat data:', err);
        setError('Failed to load statistics data');
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
  }, [widget.tagIds, widget.refreshRate, widget.statLabels, widget.thresholds, widget.sparklinePoints]);
  
  // Render sparkline as an SVG
  const renderSparkline = (data: number[], color: string = '#3b82f6') => {
    if (!data || data.length === 0) return null;
    
    // Find min and max for scaling
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    
    // Calculate points for the path
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = range === 0 ? 50 : 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          stroke={color}
          strokeWidth="2"
          fill="none"
        />
      </svg>
    );
  };
  
  // Format value based on widget settings
  const formatValue = (value: number, unit?: string): string => {
    if (widget.displayFormat) {
      // For demo, handle a few common formats
      if (widget.displayFormat === '0,0') {
        return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
      } else if (widget.displayFormat === '0.0') {
        return value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      } else if (widget.displayFormat === '0.00') {
        return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } else if (widget.displayFormat === '0.00%') {
        return (value / 100).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 });
      } else if (widget.displayFormat === '0%') {
        return (value / 100).toLocaleString(undefined, { style: 'percent', maximumFractionDigits: 0 });
      }
    }
    
    // Default formatting
    if (value >= 1000) {
      return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
    } else if (value >= 100) {
      return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
    } else {
      return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
  };
  
  // Determine layout based on number of stats and widget settings
  const getLayoutClass = () => {
    const count = stats.length;
    
    if (widget.layout === 'grid') {
      if (count <= 2) return 'grid-cols-1 sm:grid-cols-2';
      if (count <= 4) return 'grid-cols-2';
      if (count <= 6) return 'grid-cols-2 sm:grid-cols-3';
      return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
    } else { // 'list' layout
      return 'grid-cols-1';
    }
  };
  
  return (
    <Card className="widget-content multi-stat-widget">
      <div className="flex flex-col w-full h-full">
        <div className="font-medium text-lg mb-2">{widget.title || 'Multi-Stat Panel'}</div>
        
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center flex-1 text-red-500">
            {error}
          </div>
        ) : (
          <div className={`grid ${getLayoutClass()} gap-3 overflow-auto flex-1 p-1`}>
            {stats.map((stat) => (
              <div 
                key={stat.id}
                className={`stat-item p-3 rounded-lg border ${widget.layout === 'list' ? 'flex items-center' : 'flex flex-col'}`}
                style={{ borderColor: stat.color ? `${stat.color}66` : 'transparent' }}
              >
                <div className={`stat-name text-gray-500 dark:text-gray-400 ${widget.layout === 'list' ? 'mr-auto' : 'mb-1'}`}>
                  {stat.name}
                </div>
                
                <div className={`stat-value-container ${widget.layout === 'list' ? 'flex items-center' : ''}`}>
                  <div 
                    className="stat-value text-2xl font-bold"
                    style={{ color: stat.color }}
                  >
                    {formatValue(stat.value, stat.unit)}
                    {widget.showUnits && stat.unit && (
                      <span className="text-sm ml-1 font-normal text-gray-500 dark:text-gray-400">
                        {stat.unit}
                      </span>
                    )}
                  </div>
                  
                  {/* Trend indicator */}
                  {widget.showTrend && typeof stat.change !== 'undefined' && (
                    <div className={`trend-indicator ml-2 ${stat.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change).toFixed(1)}%
                    </div>
                  )}
                </div>
                
                {/* Sparkline */}
                {widget.showSparkline && stat.sparkline && (
                  <div className="sparkline h-8 mt-1 w-full">
                    {renderSparkline(stat.sparkline, stat.color || '#3b82f6')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default MultiStatWidget;