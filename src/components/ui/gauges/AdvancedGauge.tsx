import React, { useEffect, useState } from 'react';

interface Arc {
  value: number;
  color: string;
  label?: string;
}

export interface AdvancedGaugeProps {
  value: number;
  min: number;
  max: number;
  size?: number;
  arcWidth?: number;
  arcs?: Arc[];
  pointerWidth?: number;
  pointerColor?: string;
  showLabels?: boolean;
  showValue?: boolean;
  valueFormat?: (value: number) => string;
  animated?: boolean;
  animationDuration?: number;
  label?: string;
  unit?: string;
  className?: string;
}

export const AdvancedGauge: React.FC<AdvancedGaugeProps> = ({
  value,
  min,
  max,
  size = 200,
  arcWidth = 10,
  arcs = [{ value: 100, color: '#3b82f6' }], // Default to blue
  pointerWidth = 6,
  pointerColor = '#374151',
  showLabels = true,
  showValue = true,
  valueFormat,
  animated = true,
  animationDuration = 1000,
  label,
  unit,
  className,
}) => {
  // Validate and normalize value
  const normalizedValue = Math.min(Math.max(value, min), max);
  const percentage = ((normalizedValue - min) / (max - min)) * 100;
  
  // For animation
  const [displayValue, setDisplayValue] = useState(animated ? min : normalizedValue);
  
  useEffect(() => {
    if (animated) {
      const startValue = displayValue;
      const endValue = normalizedValue;
      const diff = endValue - startValue;
      
      if (diff === 0) return;
      
      const startTime = performance.now();
      
      const animate = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        
        // Ease-out cubic animation
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + diff * easeProgress;
        
        setDisplayValue(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    } else {
      setDisplayValue(normalizedValue);
    }
  }, [normalizedValue, animated, animationDuration]);
  
  // Sort arcs by value
  const sortedArcs = [...arcs].sort((a, b) => a.value - b.value);
  
  // Calculate stroke dash array and offset for each arc
  const radius = (size / 2) - arcWidth / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Arc spans 270 degrees (3/4 of the circumference)
  const arcLength = (circumference * 3) / 4;
  
  // Pointer rotation calculation
  const pointerRotation = -45 + (percentage * 270 / 100);
  
  // Format displayed value
  const formattedValue = valueFormat ? valueFormat(displayValue) : displayValue.toFixed(1);
  
  // Get color based on current value
  const getCurrentColor = (value: number): string => {
    // Find the highest arc value that's less than or equal to the current percentage
    const normalizedPercentage = ((value - min) / (max - min)) * 100;
    const arc = [...sortedArcs]
      .reverse()
      .find(arc => (arc.value <= normalizedPercentage));
      
    return arc ? arc.color : sortedArcs[0].color;
  };
  
  return (
    <div className={`advanced-gauge relative ${className}`} style={{ width: size, height: size }}>
      {/* SVG for arcs and pointer */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {/* Background arc (track) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={arcWidth}
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeLinecap="round"
        />
        
        {/* Dynamic arcs for value ranges */}
        {sortedArcs.map((arc, index) => {
          const previousValue = index > 0 ? sortedArcs[index - 1].value : 0;
          const arcPercentage = arc.value - previousValue;
          const dashLength = (arcPercentage / 100) * arcLength;
          
          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={arcWidth}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={circumference - (previousValue / 100) * arcLength}
              strokeLinecap="round"
            />
          );
        })}
        
        {/* Value arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getCurrentColor(displayValue)}
          strokeWidth={arcWidth}
          strokeDasharray={`${(percentage / 100) * arcLength} ${circumference - (percentage / 100) * arcLength}`}
          strokeLinecap="round"
          className="transition-all duration-300"
          style={{
            strokeDashoffset: circumference - arcLength,
          }}
        />
        
        {/* Pointer */}
        <g transform={`rotate(${pointerRotation}, ${size / 2}, ${size / 2})`}>
          <line
            x1={size / 2}
            y1={size / 2}
            x2={size / 2}
            y2={size / 2 - radius + arcWidth / 2}
            stroke={pointerColor}
            strokeWidth={pointerWidth}
            strokeLinecap="round"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={pointerWidth * 1.5}
            fill={pointerColor}
          />
        </g>
      </svg>
      
      {/* Min/Max labels */}
      {showLabels && (
        <>
          <div className="absolute bottom-0 left-5 text-xs text-gray-500 dark:text-gray-400">{min}</div>
          <div className="absolute bottom-0 right-5 text-xs text-gray-500 dark:text-gray-400">{max}</div>
        </>
      )}
      
      {/* Value display */}
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold" style={{ color: getCurrentColor(displayValue) }}>
            {formattedValue}
            {unit && <span className="text-sm ml-1">{unit}</span>}
          </div>
          {label && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</div>
          )}
        </div>
      )}
      
      {/* Arcs legend (if labels provided) */}
      {sortedArcs.some(arc => arc.label) && (
        <div className="flex justify-center gap-2 mt-2 absolute bottom-0 left-0 right-0 flex-wrap">
          {sortedArcs.map((arc, index) => arc.label && (
            <div key={index} className="flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: arc.color }}
              ></div>
              <span className="text-xs text-gray-600 dark:text-gray-300">
                {arc.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedGauge;