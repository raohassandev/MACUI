import React, { useState, useEffect } from 'react';
import { GaugeWidget as GaugeWidgetType } from '../../../types/dashboard';
import { fetchTagById } from '../../../services/api/tag';
import { mockTags } from '../../../services/api/tag';

interface GaugeWidgetProps {
  widget: GaugeWidgetType;
}

export const GaugeWidget: React.FC<GaugeWidgetProps> = ({ widget }) => {
  const [value, setValue] = useState<number>(0);
  const [tag, setTag] = useState<any>(null);
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
        
        // Fetch the tag data
        const tagData = await fetchTagById(widget.tagId);
        setTag(tagData);
        
        // Use the last value from the tag
        if (tagData.lastValue !== undefined) {
          setValue(Number(tagData.lastValue));
        }
      } catch (err) {
        console.error('Error fetching gauge data:', err);
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
  }, [widget.tagId, widget.refreshRate]);

  // Get color based on thresholds
  const getColor = (value: number) => {
    if (!widget.thresholds || widget.thresholds.length === 0) {
      return '#3b82f6'; // Default blue
    }
    
    // Find the appropriate threshold
    const threshold = [...widget.thresholds]
      .sort((a, b) => b.value - a.value)
      .find(t => value >= t.value);
    
    return threshold ? threshold.color : widget.thresholds[0].color;
  };

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

  // Calculate the percentage for the gauge
  const min = widget.minValue;
  const max = widget.maxValue;
  const percent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const color = getColor(value);
  const unit = tag?.unit || '';

  // Render a radial gauge
  if (widget.gaugeType === 'radial') {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-2">
        <div className="relative w-full max-w-[200px] aspect-square">
          {/* Background circle */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="10"
              strokeDasharray={`${Math.PI * 2 * 45 * 0.75} ${Math.PI * 2 * 45 * 0.25}`}
              strokeLinecap="round"
              transform="rotate(-135 50 50)"
            />
            {/* Value circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeDasharray={`${Math.PI * 2 * 45 * 0.75 * percent / 100} ${Math.PI * 2 * 45 - Math.PI * 2 * 45 * 0.75 * percent / 100}`}
              strokeLinecap="round"
              transform="rotate(-135 50 50)"
            />
            
            {/* Min label */}
            <text
              x="25"
              y="75"
              fontSize="8"
              textAnchor="middle"
              fill="currentColor"
              className="text-gray-500 dark:text-gray-400"
            >
              {min}
            </text>
            
            {/* Max label */}
            <text
              x="75"
              y="75"
              fontSize="8"
              textAnchor="middle"
              fill="currentColor"
              className="text-gray-500 dark:text-gray-400"
            >
              {max}
            </text>
          </svg>
          
          {/* Value display */}
          {widget.showValue && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold" style={{ color }}>
                {value.toFixed(tag?.unit === '%' ? 1 : 0)}
              </div>
              {widget.showUnit && unit && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {unit}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Show thresholds legend if available */}
        {widget.thresholds && widget.thresholds.length > 0 && (
          <div className="flex justify-center gap-2 mt-2">
            {widget.thresholds.map((threshold, index) => (
              <div key={index} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: threshold.color }}
                ></div>
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {index === 0 ? `< ${widget.thresholds![1]?.value || threshold.value}` : 
                   index === widget.thresholds!.length - 1 ? `> ${threshold.value}` : 
                   `${threshold.value} - ${widget.thresholds![index+1].value}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  // Render a linear gauge
  if (widget.gaugeType === 'linear') {
    return (
      <div className="h-full w-full flex flex-col justify-center p-2">
        {/* Value display */}
        {widget.showValue && (
          <div className="flex items-baseline gap-1 mb-2">
            <div className="text-2xl font-bold" style={{ color }}>
              {value.toFixed(tag?.unit === '%' ? 1 : 0)}
            </div>
            {widget.showUnit && unit && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {unit}
              </div>
            )}
          </div>
        )}
        
        {/* Linear gauge */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-1">
          <div 
            className="h-4 rounded-full transition-all duration-500"
            style={{ width: `${percent}%`, backgroundColor: color }}
          ></div>
        </div>
        
        {/* Min/max labels */}
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    );
  }
  
  // Render a tank gauge
  if (widget.gaugeType === 'tank') {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-2">
        {/* Tank gauge */}
        <div className="relative w-24 h-48 border-2 border-gray-300 dark:border-gray-600 rounded-b-lg overflow-hidden">
          <div 
            className="absolute bottom-0 w-full transition-all duration-500"
            style={{ 
              height: `${percent}%`, 
              backgroundColor: color,
            }}
          ></div>
          
          {/* Value markers */}
          <div className="absolute inset-0">
            {[0, 25, 50, 75, 100].map(level => (
              <div 
                key={level} 
                className="absolute w-2 h-0.5 bg-gray-400 dark:bg-gray-500 left-0"
                style={{ bottom: `${level}%` }}
              ></div>
            ))}
          </div>
          
          {/* Value display */}
          {widget.showValue && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-white dark:bg-gray-800 bg-opacity-70 dark:bg-opacity-70 px-2 py-1 rounded text-center">
                <div className="text-lg font-bold" style={{ color }}>
                  {value.toFixed(tag?.unit === '%' ? 1 : 0)}
                </div>
                {widget.showUnit && unit && (
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    {unit}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Min/max labels */}
        <div className="flex w-full justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    );
  }
  
  return <div>Unsupported gauge type</div>;
};