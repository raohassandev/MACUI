import React, { useState, useEffect, useRef } from 'react';
import { NumericWidget as NumericWidgetType } from '../../../types/dashboard';
import { fetchTagById } from '../../../services/api/tag';

interface NumericWidgetProps {
  widget: NumericWidgetType;
}

export const NumericWidget: React.FC<NumericWidgetProps> = ({ widget }) => {
  const [value, setValue] = useState<number | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [tag, setTag] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to store the interval ID
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
        
        // Update previous value before setting the new one
        if (value !== null) {
          setPreviousValue(value);
        } else {
          setPreviousValue(Number(tagData.lastValue));
        }
        
        // Use the last value from the tag
        if (tagData.lastValue !== undefined) {
          setValue(Number(tagData.lastValue));
        }
      } catch (err) {
        console.error('Error fetching numeric data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch data immediately
    fetchData();

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up polling interval if specified
    if (widget.refreshRate && widget.refreshRate > 0) {
      intervalRef.current = setInterval(fetchData, widget.refreshRate);
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [widget.tagId, widget.refreshRate]);

  // Get color based on thresholds
  const getColor = (value: number) => {
    if (!widget.thresholds || widget.thresholds.length === 0) {
      return 'text-gray-900 dark:text-gray-100'; // Default text color
    }
    
    // Find the appropriate threshold
    const threshold = [...widget.thresholds]
      .sort((a, b) => b.value - a.value)
      .find(t => value >= t.value);
    
    return threshold ? threshold.color : '';
  };

  // Format the value based on display format
  const formatValue = (val: number | null) => {
    if (val === null) return '--';
    
    if (widget.displayFormat) {
      // Simple format parsing for common cases
      if (widget.displayFormat === '0,0') {
        return val.toLocaleString('en-US', { maximumFractionDigits: 0 });
      }
      if (widget.displayFormat === '0.0') {
        return val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      }
      if (widget.displayFormat === '0.00') {
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      if (widget.displayFormat.includes('kW')) {
        return `${val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kW`;
      }
      
      // For other formats, do simple replacement
      return widget.displayFormat.replace('0', val.toString());
    }
    
    // Default formatting based on value
    if (Number.isInteger(val)) {
      return val.toLocaleString();
    }
    return val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  };

  // Determine trend direction
  const getTrendIndicator = () => {
    if (!widget.trendIndicator || previousValue === null || value === null) {
      return null;
    }
    
    const diff = value - previousValue;
    
    if (Math.abs(diff) < 0.01) {
      return (
        <span className="text-gray-500">
          <svg className="inline w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        </span>
      );
    }
    
    if (diff > 0) {
      return (
        <span className="text-green-500 dark:text-green-400">
          <svg className="inline w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </span>
      );
    }
    
    return (
      <span className="text-red-500 dark:text-red-400">
        <svg className="inline w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    );
  };

  if (isLoading && value === null) {
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
  
  const valueColor = value !== null ? getColor(value) : '';
  const unit = tag?.unit || '';

  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-center p-2">
      <div className={`text-4xl font-bold transition-colors ${valueColor}`}>
        {formatValue(value)}
        {getTrendIndicator()}
      </div>
      
      {widget.showUnit && unit && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {unit}
        </div>
      )}
    </div>
  );
};