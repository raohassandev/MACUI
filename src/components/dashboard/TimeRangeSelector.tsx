import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';

interface TimeRangeOption {
  label: string;
  value: number; // milliseconds
  isRelative: boolean;
}

interface TimeRangeValue {
  from: Date | null;
  to: Date | null;
  label?: string;
  range?: number; // milliseconds for relative ranges
}

interface TimeRangeSelectorProps {
  value: TimeRangeValue;
  onChange: (range: TimeRangeValue) => void;
  showRefresh?: boolean;
  onRefresh?: () => void;
  autoRefreshOptions?: number[]; // Time in seconds
  showCustom?: boolean;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  value,
  onChange,
  showRefresh = true,
  onRefresh,
  autoRefreshOptions = [0, 5, 10, 30, 60], // 0 means disabled
  showCustom = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customFrom, setCustomFrom] = useState<string>(
    value.from ? format(value.from, "yyyy-MM-dd'T'HH:mm") : ''
  );
  const [customTo, setCustomTo] = useState<string>(
    value.to ? format(value.to, "yyyy-MM-dd'T'HH:mm") : ''
  );
  const [autoRefresh, setAutoRefresh] = useState(0); // 0 means disabled
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isAutoRefreshOpen, setIsAutoRefreshOpen] = useState(false);
  const autoRefreshRef = useRef<HTMLDivElement>(null);
  const autoRefreshIntervalRef = useRef<number | null>(null);
  
  // Common time range options
  const timeRangeOptions: TimeRangeOption[] = [
    { label: 'Last 5 minutes', value: 5 * 60 * 1000, isRelative: true },
    { label: 'Last 15 minutes', value: 15 * 60 * 1000, isRelative: true },
    { label: 'Last 30 minutes', value: 30 * 60 * 1000, isRelative: true },
    { label: 'Last 1 hour', value: 60 * 60 * 1000, isRelative: true },
    { label: 'Last 3 hours', value: 3 * 60 * 60 * 1000, isRelative: true },
    { label: 'Last 6 hours', value: 6 * 60 * 60 * 1000, isRelative: true },
    { label: 'Last 12 hours', value: 12 * 60 * 60 * 1000, isRelative: true },
    { label: 'Last 24 hours', value: 24 * 60 * 60 * 1000, isRelative: true },
    { label: 'Last 2 days', value: 2 * 24 * 60 * 60 * 1000, isRelative: true },
    { label: 'Last 7 days', value: 7 * 24 * 60 * 60 * 1000, isRelative: true },
    { label: 'Last 30 days', value: 30 * 24 * 60 * 60 * 1000, isRelative: true },
  ];
  
  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        (!autoRefreshRef.current || !autoRefreshRef.current.contains(event.target as Node))
      ) {
        setIsOpen(false);
      }
      
      if (
        autoRefreshRef.current && 
        !autoRefreshRef.current.contains(event.target as Node) &&
        (!dropdownRef.current || !dropdownRef.current.contains(event.target as Node))
      ) {
        setIsAutoRefreshOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Set up auto-refresh interval
  useEffect(() => {
    if (autoRefreshIntervalRef.current) {
      clearInterval(autoRefreshIntervalRef.current);
      autoRefreshIntervalRef.current = null;
    }
    
    if (autoRefresh > 0 && onRefresh) {
      autoRefreshIntervalRef.current = window.setInterval(() => {
        onRefresh();
      }, autoRefresh * 1000);
    }
    
    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, [autoRefresh, onRefresh]);
  
  // Handle preset time range selection
  const handleSelectTimeRange = (option: TimeRangeOption) => {
    if (option.isRelative) {
      const to = new Date();
      const from = new Date(to.getTime() - option.value);
      
      onChange({
        from,
        to,
        range: option.value,
        label: option.label,
      });
    }
    
    setIsOpen(false);
  };
  
  // Handle custom time range submission
  const handleCustomRangeSubmit = () => {
    if (customFrom && customTo) {
      const from = new Date(customFrom);
      const to = new Date(customTo);
      
      if (from && to && from <= to) {
        onChange({
          from,
          to,
          label: `${format(from, 'MMM d, HH:mm')} to ${format(to, 'MMM d, HH:mm')}`,
        });
        
        setIsCustomMode(false);
        setIsOpen(false);
      }
    }
  };
  
  // Format the current time range for display
  const formatTimeRange = () => {
    if (value.label) {
      return value.label;
    }
    
    if (value.from && value.to) {
      return `${format(value.from, 'MMM d, HH:mm')} to ${format(value.to, 'MMM d, HH:mm')}`;
    }
    
    return 'Select time range';
  };
  
  // Format auto-refresh text
  const formatAutoRefresh = () => {
    if (autoRefresh === 0) {
      return 'Auto-refresh off';
    }
    return `Every ${autoRefresh} ${autoRefresh === 1 ? 'second' : 'seconds'}`;
  };
  
  return (
    <div className="flex items-center space-x-2">
      {/* Time Range Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1.5 text-sm flex items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span>{formatTimeRange()}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Dropdown */}
        {isOpen && (
          <div className="absolute left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
            {isCustomMode ? (
              <div className="p-3">
                <div className="text-sm font-medium mb-2">Custom Time Range</div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1">From</label>
                    <input
                      type="datetime-local"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 dark:bg-gray-700 rounded-md text-sm"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">To</label>
                    <input
                      type="datetime-local"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 dark:bg-gray-700 rounded-md text-sm"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between">
                    <button
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded-md"
                      onClick={() => setIsCustomMode(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded-md"
                      onClick={handleCustomRangeSubmit}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="py-1">
                  {timeRangeOptions.map((option) => (
                    <button
                      key={option.label}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSelectTimeRange(option)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                
                {showCustom && (
                  <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsCustomMode(true)}
                    >
                      Custom time range
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Auto-refresh Selector */}
      {showRefresh && (
        <div className="relative" ref={autoRefreshRef}>
          <button
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1.5 text-sm flex items-center"
            onClick={() => setIsAutoRefreshOpen(!isAutoRefreshOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            <span>{formatAutoRefresh()}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Auto-refresh Dropdown */}
          {isAutoRefreshOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <div className="py-1">
                {autoRefreshOptions.map((seconds) => (
                  <button
                    key={seconds}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      setAutoRefresh(seconds);
                      setIsAutoRefreshOpen(false);
                    }}
                  >
                    {seconds === 0 ? 'Off' : `Every ${seconds} ${seconds === 1 ? 'second' : 'seconds'}`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Manual Refresh Button */}
      {showRefresh && onRefresh && (
        <button
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-1.5 text-gray-500 hover:text-gray-700"
          onClick={onRefresh}
          title="Refresh now"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default TimeRangeSelector;