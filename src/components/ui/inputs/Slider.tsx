import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface SliderMark {
  value: number;
  label?: string;
}

export interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  onChangeComplete?: (value: number) => void;
  disabled?: boolean;
  marks?: SliderMark[];
  showMarks?: boolean;
  showValue?: boolean;
  valuePosition?: 'top' | 'right' | 'bottom' | 'tooltip';
  tooltip?: boolean;
  tooltipFormat?: (value: number) => string;
  range?: boolean;
  rangeValues?: [number, number];
  onRangeChange?: (values: [number, number]) => void;
  onRangeChangeComplete?: (values: [number, number]) => void;
  trackColor?: string;
  railColor?: string;
  thumbColor?: string;
  activeTrackColor?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  min,
  max,
  step = 1,
  value,
  defaultValue,
  onChange,
  onChangeComplete,
  disabled = false,
  marks = [],
  showMarks = false,
  showValue = false,
  valuePosition = 'top',
  tooltip = false,
  tooltipFormat,
  range = false,
  rangeValues,
  onRangeChange,
  onRangeChangeComplete,
  trackColor,
  railColor,
  thumbColor,
  activeTrackColor,
  orientation = 'horizontal',
  size = 'md',
  className = '',
}) => {
  // Initialize states
  const [internalValue, setInternalValue] = useState<number>(() => {
    if (value !== undefined) return value;
    if (defaultValue !== undefined) return defaultValue;
    return min;
  });
  
  const [internalRangeValues, setInternalRangeValues] = useState<[number, number]>(() => {
    if (rangeValues) return rangeValues;
    return [min, max];
  });
  
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragThumbIndex, setDragThumbIndex] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const thumbStartRef = useRef<HTMLDivElement>(null);
  const thumbEndRef = useRef<HTMLDivElement>(null);
  
  // Size mapping
  const sizeMap = {
    sm: {
      track: 'h-1',
      thumb: 'w-3 h-3',
      verticalTrack: 'w-1',
    },
    md: {
      track: 'h-2',
      thumb: 'w-4 h-4',
      verticalTrack: 'w-2',
    },
    lg: {
      track: 'h-3',
      thumb: 'w-5 h-5',
      verticalTrack: 'w-3',
    },
  };
  
  // Update internal value from props
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);
  
  useEffect(() => {
    if (rangeValues) {
      setInternalRangeValues(rangeValues);
    }
  }, [rangeValues]);
  
  // Convert value to percentage
  const valueToPercent = (val: number): number => {
    return ((val - min) / (max - min)) * 100;
  };
  
  // Convert percentage to value
  const percentToValue = (percent: number): number => {
    const rawValue = min + ((max - min) * percent) / 100;
    // Round to nearest step
    const steps = Math.round((rawValue - min) / step);
    return min + steps * step;
  };
  
  // Format the value for display
  const formatValue = (val: number): string => {
    if (tooltipFormat) {
      return tooltipFormat(val);
    }
    return val.toString();
  };
  
  // Handle mouse/touch events for single slider
  const handleTrackMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || range) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    // Handle the click position
    handleDragMove(e);
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);
  };
  
  // Handle thumb mouse/touch events
  const handleThumbMouseDown = (e: React.MouseEvent | React.TouchEvent, thumbIndex?: number) => {
    if (disabled) return;
    
    e.stopPropagation();
    setIsDragging(true);
    
    if (range && thumbIndex !== undefined) {
      setDragThumbIndex(thumbIndex);
    }
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);
  };
  
  // Handle drag/move events
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if (!trackRef.current) return;
    
    const track = trackRef.current;
    const trackRect = track.getBoundingClientRect();
    
    // Get the cursor position
    let position: number;
    
    if ('touches' in e) {
      position = orientation === 'horizontal' 
        ? (e.touches[0].clientX - trackRect.left) 
        : (trackRect.bottom - e.touches[0].clientY);
    } else {
      position = orientation === 'horizontal' 
        ? (e.clientX - trackRect.left) 
        : (trackRect.bottom - e.clientY);
    }
    
    // Convert to percentage
    const trackSize = orientation === 'horizontal' ? trackRect.width : trackRect.height;
    let percentage = Math.max(0, Math.min(100, (position / trackSize) * 100));
    
    // Calculate value based on percentage
    const newValue = percentToValue(percentage);
    
    if (range) {
      // Handle range slider
      if (dragThumbIndex === 0) {
        // Moving the start thumb
        const newRangeValues: [number, number] = [
          Math.min(newValue, internalRangeValues[1] - step),
          internalRangeValues[1]
        ];
        setInternalRangeValues(newRangeValues);
        onRangeChange?.(newRangeValues);
      } else if (dragThumbIndex === 1) {
        // Moving the end thumb
        const newRangeValues: [number, number] = [
          internalRangeValues[0],
          Math.max(newValue, internalRangeValues[0] + step)
        ];
        setInternalRangeValues(newRangeValues);
        onRangeChange?.(newRangeValues);
      }
    } else {
      // Handle single slider
      setInternalValue(newValue);
      onChange?.(newValue);
    }
  }, [min, max, step, onChange, onRangeChange, internalRangeValues, range, dragThumbIndex, orientation]);
  
  // Handle drag end events
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragThumbIndex(null);
    
    if (range) {
      onRangeChangeComplete?.(internalRangeValues);
    } else {
      onChangeComplete?.(internalValue);
    }
    
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchend', handleDragEnd);
  }, [internalValue, internalRangeValues, onChangeComplete, onRangeChangeComplete, range]);
  
  // Handle hover events for tooltip
  const handleMouseEnter = () => {
    if (tooltip) {
      setShowTooltip(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (!isDragging && tooltip) {
      setShowTooltip(false);
    }
  };
  
  // Cleanup event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [handleDragMove, handleDragEnd]);
  
  // Calculate track and thumb styles
  const getTrackStyles = () => {
    if (range) {
      const startPercent = valueToPercent(internalRangeValues[0]);
      const endPercent = valueToPercent(internalRangeValues[1]);
      
      if (orientation === 'horizontal') {
        return {
          background: `linear-gradient(
            to right,
            ${railColor || '#e5e7eb'} 0%,
            ${railColor || '#e5e7eb'} ${startPercent}%,
            ${activeTrackColor || '#3b82f6'} ${startPercent}%,
            ${activeTrackColor || '#3b82f6'} ${endPercent}%,
            ${railColor || '#e5e7eb'} ${endPercent}%,
            ${railColor || '#e5e7eb'} 100%
          )`,
        };
      } else {
        return {
          background: `linear-gradient(
            to top,
            ${railColor || '#e5e7eb'} 0%,
            ${railColor || '#e5e7eb'} ${startPercent}%,
            ${activeTrackColor || '#3b82f6'} ${startPercent}%,
            ${activeTrackColor || '#3b82f6'} ${endPercent}%,
            ${railColor || '#e5e7eb'} ${endPercent}%,
            ${railColor || '#e5e7eb'} 100%
          )`,
        };
      }
    } else {
      const fillPercent = valueToPercent(internalValue);
      
      if (orientation === 'horizontal') {
        return {
          background: `linear-gradient(
            to right,
            ${activeTrackColor || '#3b82f6'} 0%,
            ${activeTrackColor || '#3b82f6'} ${fillPercent}%,
            ${railColor || '#e5e7eb'} ${fillPercent}%,
            ${railColor || '#e5e7eb'} 100%
          )`,
        };
      } else {
        return {
          background: `linear-gradient(
            to top,
            ${activeTrackColor || '#3b82f6'} 0%,
            ${activeTrackColor || '#3b82f6'} ${fillPercent}%,
            ${railColor || '#e5e7eb'} ${fillPercent}%,
            ${railColor || '#e5e7eb'} 100%
          )`,
        };
      }
    }
  };
  
  const getSingleThumbStyles = () => {
    const thumbPercent = valueToPercent(internalValue);
    
    if (orientation === 'horizontal') {
      return {
        left: `${thumbPercent}%`,
      };
    } else {
      return {
        bottom: `${thumbPercent}%`,
      };
    }
  };
  
  const getRangeThumbStyles = (index: number) => {
    const thumbPercent = valueToPercent(internalRangeValues[index]);
    
    if (orientation === 'horizontal') {
      return {
        left: `${thumbPercent}%`,
      };
    } else {
      return {
        bottom: `${thumbPercent}%`,
      };
    }
  };
  
  // Render marks
  const renderMarks = () => {
    if (!showMarks && (!marks || marks.length === 0)) return null;
    
    const defaultMarks = showMarks && marks.length === 0 
      ? Array.from({ length: 5 }, (_, i) => ({
          value: min + ((max - min) / 4) * i,
        }))
      : marks;
    
    return (
      <>
        {defaultMarks.map((mark, index) => {
          const markPercent = valueToPercent(mark.value);
          const markPosition = orientation === 'horizontal'
            ? { left: `${markPercent}%` }
            : { bottom: `${markPercent}%` };
          
          return (
            <div key={index} className="absolute" style={markPosition}>
              <div 
                className={`bg-gray-400 ${orientation === 'horizontal' ? 'h-2' : 'w-2'} -translate-x-1/2`}
                style={{width: 1, height: 8}}
              ></div>
              {mark.label && (
                <div 
                  className={`absolute text-xs text-gray-600 mt-1 ${
                    orientation === 'horizontal' ? '-translate-x-1/2' : 'ml-3'
                  }`}
                >
                  {mark.label}
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  };
  
  // Main component structure
  const renderSlider = () => {
    return (
      <div
        className={`relative ${
          orientation === 'horizontal' ? 'w-full h-12' : 'h-64 w-12'
        } ${className}`}
      >
        {/* Value display */}
        {showValue && valuePosition !== 'tooltip' && !range && (
          <div
            className={`absolute ${
              valuePosition === 'top' ? 'top-0 left-1/2 -translate-x-1/2 -mt-6' :
              valuePosition === 'bottom' ? 'bottom-0 left-1/2 -translate-x-1/2 -mb-6' :
              'right-0 top-1/2 -translate-y-1/2 mr-6'
            } text-sm font-medium text-gray-700 dark:text-gray-300`}
          >
            {formatValue(internalValue)}
          </div>
        )}
        
        {/* Track */}
        <div
          ref={trackRef}
          className={`absolute ${
            orientation === 'horizontal' 
              ? `left-0 right-0 top-1/2 -translate-y-1/2 ${sizeMap[size].track} rounded-full cursor-pointer` 
              : `bottom-0 top-0 left-1/2 -translate-x-1/2 ${sizeMap[size].verticalTrack} rounded-full cursor-pointer`
          } ${disabled ? 'bg-gray-300 cursor-not-allowed' : ''}`}
          style={getTrackStyles()}
          onMouseDown={handleTrackMouseDown}
          onTouchStart={handleTrackMouseDown}
        >
          {/* Marks */}
          {renderMarks()}
        </div>
        
        {/* Thumb(s) */}
        {range ? (
          <>
            {/* Start thumb */}
            <div
              ref={thumbStartRef}
              className={`absolute ${sizeMap[size].thumb} ${
                orientation === 'horizontal' ? 'top-1/2 -translate-y-1/2 -translate-x-1/2' : 'left-1/2 -translate-x-1/2 translate-y-1/2'
              } rounded-full shadow ${
                disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-white border-2 border-blue-500 cursor-grab'
              } ${isDragging && dragThumbIndex === 0 ? '!cursor-grabbing' : ''}`}
              style={{
                ...getRangeThumbStyles(0),
                backgroundColor: disabled ? undefined : (thumbColor || 'white'),
                borderColor: disabled ? '#d1d5db' : (activeTrackColor || '#3b82f6'),
              }}
              onMouseDown={(e) => handleThumbMouseDown(e, 0)}
              onTouchStart={(e) => handleThumbMouseDown(e, 0)}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {tooltip && showTooltip && (
                <div className={`absolute ${
                  orientation === 'horizontal' ? 'bottom-full mb-2 left-1/2 -translate-x-1/2' : 'left-full ml-2 top-1/2 -translate-y-1/2'
                } bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap`}>
                  {formatValue(internalRangeValues[0])}
                </div>
              )}
            </div>
            
            {/* End thumb */}
            <div
              ref={thumbEndRef}
              className={`absolute ${sizeMap[size].thumb} ${
                orientation === 'horizontal' ? 'top-1/2 -translate-y-1/2 -translate-x-1/2' : 'left-1/2 -translate-x-1/2 translate-y-1/2'
              } rounded-full shadow ${
                disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-white border-2 border-blue-500 cursor-grab'
              } ${isDragging && dragThumbIndex === 1 ? '!cursor-grabbing' : ''}`}
              style={{
                ...getRangeThumbStyles(1),
                backgroundColor: disabled ? undefined : (thumbColor || 'white'),
                borderColor: disabled ? '#d1d5db' : (activeTrackColor || '#3b82f6'),
              }}
              onMouseDown={(e) => handleThumbMouseDown(e, 1)}
              onTouchStart={(e) => handleThumbMouseDown(e, 1)}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {tooltip && showTooltip && (
                <div className={`absolute ${
                  orientation === 'horizontal' ? 'bottom-full mb-2 left-1/2 -translate-x-1/2' : 'left-full ml-2 top-1/2 -translate-y-1/2'
                } bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap`}>
                  {formatValue(internalRangeValues[1])}
                </div>
              )}
            </div>
            
            {/* Range values display */}
            {showValue && valuePosition !== 'tooltip' && (
              <div className={`absolute ${
                valuePosition === 'top' ? 'top-0 left-0 right-0 -mt-6' :
                valuePosition === 'bottom' ? 'bottom-0 left-0 right-0 -mb-6' :
                'right-0 top-0 bottom-0 mr-6'
              } flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300`}>
                <span>{formatValue(internalRangeValues[0])}</span>
                <span>{formatValue(internalRangeValues[1])}</span>
              </div>
            )}
          </>
        ) : (
          <div
            ref={thumbRef}
            className={`absolute ${sizeMap[size].thumb} ${
              orientation === 'horizontal' ? 'top-1/2 -translate-y-1/2 -translate-x-1/2' : 'left-1/2 -translate-x-1/2 translate-y-1/2'
            } rounded-full shadow ${
              disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-white border-2 border-blue-500 cursor-grab'
            } ${isDragging ? '!cursor-grabbing' : ''}`}
            style={{
              ...getSingleThumbStyles(),
              backgroundColor: disabled ? undefined : (thumbColor || 'white'),
              borderColor: disabled ? '#d1d5db' : (activeTrackColor || '#3b82f6'),
            }}
            onMouseDown={handleThumbMouseDown}
            onTouchStart={handleThumbMouseDown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {tooltip && showTooltip && (
              <div className={`absolute ${
                orientation === 'horizontal' ? 'bottom-full mb-2 left-1/2 -translate-x-1/2' : 'left-full ml-2 top-1/2 -translate-y-1/2'
              } bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap`}>
                {formatValue(internalValue)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  return renderSlider();
};

export default Slider;