import React, { useState, useEffect, useRef } from 'react';
import { StatusWidget as StatusWidgetType } from '../../../types/dashboard';
import { fetchTagById } from '../../../services/api/tag';

interface StatusWidgetProps {
  widget: StatusWidgetType;
}

export const StatusWidget: React.FC<StatusWidgetProps> = ({ widget }) => {
  const [value, setValue] = useState<string | number | null>(null);
  const [previousValue, setPreviousValue] = useState<string | number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  
  // Ref to store the interval ID
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        
        // Update previous value before setting the new one
        setPreviousValue(value);
        
        // Use the last value from the tag
        if (tagData.lastValue !== undefined) {
          setValue(tagData.lastValue);
          
          // Handle blinking on status change
          if (widget.blink && value !== null && value !== tagData.lastValue) {
            setIsBlinking(true);
            
            // Stop blinking after 2 seconds
            if (blinkTimeoutRef.current) {
              clearTimeout(blinkTimeoutRef.current);
            }
            blinkTimeoutRef.current = setTimeout(() => {
              setIsBlinking(false);
            }, 2000);
          }
        }
      } catch (err) {
        console.error('Error fetching status data:', err);
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
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current);
      }
    };
  }, [widget.tagId, widget.refreshRate, widget.blink]);

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
  
  if (value === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data</p>
      </div>
    );
  }
  
  // Get status color and label
  const valueKey = String(value);
  const status = widget.statusMap[valueKey] || { 
    label: `Unknown (${valueKey})`, 
    color: '#6b7280' // gray-500
  };

  // Render the status indicator based on shape
  const renderStatusIndicator = () => {
    const blinkClass = isBlinking ? 'animate-pulse' : '';
    
    switch (widget.shape) {
      case 'square':
        return (
          <div 
            className={`w-10 h-10 rounded-md ${blinkClass}`}
            style={{ backgroundColor: status.color }}
          ></div>
        );
      
      case 'pill':
        return (
          <div 
            className={`w-16 h-8 rounded-full flex items-center justify-center ${blinkClass}`}
            style={{ backgroundColor: status.color }}
          >
            {widget.showLabel && (
              <span className="text-white text-xs font-medium">
                {status.label}
              </span>
            )}
          </div>
        );
      
      case 'circle':
      default:
        return (
          <div 
            className={`w-10 h-10 rounded-full ${blinkClass}`}
            style={{ backgroundColor: status.color }}
          ></div>
        );
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      {renderStatusIndicator()}
      
      {widget.showLabel && widget.shape !== 'pill' && (
        <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {status.label}
        </div>
      )}
    </div>
  );
};