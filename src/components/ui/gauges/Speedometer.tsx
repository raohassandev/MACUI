import React, { useEffect, useState } from 'react';

export interface SpeedometerProps {
  value: number;
  min: number;
  max: number;
  size?: number;
  needleHeightRatio?: number;
  needleColor?: string;
  startColor?: string;
  endColor?: string;
  segments?: number;
  segmentColors?: string[];
  maxSegmentLabels?: number;
  valueFormat?: (value: number) => string;
  currentValueText?: string;
  customSegmentLabels?: Array<{
    text: string;
    position: 'INSIDE' | 'OUTSIDE';
    fontSize?: string;
    color?: string;
  }>;
  ringWidth?: number;
  needleTransition?: boolean;
  needleTransitionDuration?: number;
  className?: string;
}

export const Speedometer: React.FC<SpeedometerProps> = ({
  value,
  min,
  max,
  size = 250,
  needleHeightRatio = 0.7,
  needleColor = '#6b7280',
  startColor = '#22c55e',   // Green
  endColor = '#ef4444',     // Red
  segments = 5,
  segmentColors,
  maxSegmentLabels = segments,
  valueFormat,
  currentValueText,
  customSegmentLabels = [],
  ringWidth = 15,
  needleTransition = true,
  needleTransitionDuration = 500,
  className,
}) => {
  // Normalize value
  const normalizedValue = Math.min(Math.max(value, min), max);
  const percentage = ((normalizedValue - min) / (max - min)) * 100;
  
  // For animation
  const [displayValue, setDisplayValue] = useState(needleTransition ? min : normalizedValue);
  const [rotation, setRotation] = useState(needleTransition ? 0 : percentage * 180 / 100);
  
  // Generate default segment colors if not provided
  const getSegmentColors = (): string[] => {
    if (segmentColors && segmentColors.length > 0) {
      return segmentColors;
    }
    
    // Generate gradient colors from start to end
    return Array.from({ length: segments }, (_, i) => {
      const ratio = i / (segments - 1);
      
      // Interpolate between startColor and endColor
      const start = {
        r: parseInt(startColor.slice(1, 3), 16),
        g: parseInt(startColor.slice(3, 5), 16),
        b: parseInt(startColor.slice(5, 7), 16),
      };
      
      const end = {
        r: parseInt(endColor.slice(1, 3), 16),
        g: parseInt(endColor.slice(3, 5), 16),
        b: parseInt(endColor.slice(5, 7), 16),
      };
      
      const r = Math.round(start.r + (end.r - start.r) * ratio);
      const g = Math.round(start.g + (end.g - start.g) * ratio);
      const b = Math.round(start.b + (end.b - start.b) * ratio);
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    });
  };
  
  const colors = getSegmentColors();
  
  // Calculate parameters
  const radius = size / 2;
  const centerX = radius;
  const centerY = radius;
  const innerRadius = radius - ringWidth;
  
  // Animate needle
  useEffect(() => {
    if (needleTransition) {
      const startValue = displayValue;
      const endValue = normalizedValue;
      const startRotation = rotation;
      const endRotation = (normalizedValue - min) / (max - min) * 180;
      
      const startTime = performance.now();
      
      const animate = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / needleTransitionDuration, 1);
        
        // Ease-out cubic animation
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const currentValue = startValue + (endValue - startValue) * easeProgress;
        const currentRotation = startRotation + (endRotation - startRotation) * easeProgress;
        
        setDisplayValue(currentValue);
        setRotation(currentRotation);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    } else {
      setDisplayValue(normalizedValue);
      setRotation((normalizedValue - min) / (max - min) * 180);
    }
  }, [normalizedValue, needleTransition, needleTransitionDuration]);
  
  // Format displayed value
  const formattedValue = valueFormat ? valueFormat(displayValue) : displayValue.toFixed(1);
  
  // Calculate segment angles
  const segmentAngle = 180 / segments;
  
  // Needle properties
  const needleLength = innerRadius * needleHeightRatio;
  const needleBaseWidth = 4;
  
  return (
    <div className={`speedometer-gauge relative ${className}`} style={{ width: size, height: size / 2 + 30 }}>
      <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
        {/* Segments */}
        <g transform={`translate(${centerX}, ${centerY})`}>
          {Array.from({ length: segments }).map((_, i) => {
            const startAngle = -180 + i * segmentAngle;
            const endAngle = startAngle + segmentAngle;
            
            // Convert to radians
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            
            // Calculate path
            const x1 = innerRadius * Math.cos(startRad);
            const y1 = innerRadius * Math.sin(startRad);
            const x2 = radius * Math.cos(startRad);
            const y2 = radius * Math.sin(startRad);
            
            const x3 = radius * Math.cos(endRad);
            const y3 = radius * Math.sin(endRad);
            const x4 = innerRadius * Math.cos(endRad);
            const y4 = innerRadius * Math.sin(endRad);
            
            // Arc flags
            const arcSweep = endAngle - startAngle <= 180 ? 0 : 1;
            
            // Path for outer arc
            const path = [
              `M ${x1},${y1}`,
              `L ${x2},${y2}`,
              `A ${radius},${radius} 0 ${arcSweep},1 ${x3},${y3}`,
              `L ${x4},${y4}`,
              `A ${innerRadius},${innerRadius} 0 ${arcSweep},0 ${x1},${y1}`,
              'Z',
            ].join(' ');
            
            return (
              <path
                key={i}
                d={path}
                fill={colors[i]}
                stroke="none"
              />
            );
          })}
        </g>
        
        {/* Tick marks and values */}
        <g transform={`translate(${centerX}, ${centerY})`}>
          {Array.from({ length: maxSegmentLabels + 1 }).map((_, i) => {
            const angle = -180 + (i * 180) / maxSegmentLabels;
            const rad = (angle * Math.PI) / 180;
            
            const tickStart = radius - 5;
            const tickEnd = radius + 5;
            
            const tickX1 = tickStart * Math.cos(rad);
            const tickY1 = tickStart * Math.sin(rad);
            const tickX2 = tickEnd * Math.cos(rad);
            const tickY2 = tickEnd * Math.sin(rad);
            
            const labelRadius = radius + 15;
            const labelX = labelRadius * Math.cos(rad);
            const labelY = labelRadius * Math.sin(rad);
            
            // Calculate value at this tick
            const tickValue = min + (i * (max - min)) / maxSegmentLabels;
            
            return (
              <g key={i}>
                {/* Tick mark */}
                <line
                  x1={tickX1}
                  y1={tickY1}
                  x2={tickX2}
                  y2={tickY2}
                  stroke="#374151"
                  strokeWidth={1.5}
                />
                
                {/* Tick label */}
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  className="text-gray-600 dark:text-gray-300"
                  transform={`rotate(${angle + 180}, ${labelX}, ${labelY})`}
                >
                  {tickValue.toFixed(0)}
                </text>
              </g>
            );
          })}
        </g>
        
        {/* Custom segment labels (if provided) */}
        <g transform={`translate(${centerX}, ${centerY})`}>
          {customSegmentLabels.map((label, i) => {
            const segmentIndex = Math.min(i, segments - 1);
            const angle = -180 + (segmentIndex + 0.5) * segmentAngle;
            const rad = (angle * Math.PI) / 180;
            
            const labelRadius = label.position === 'INSIDE' 
              ? innerRadius + (radius - innerRadius) / 2 
              : radius + 25;
              
            const labelX = labelRadius * Math.cos(rad);
            const labelY = labelRadius * Math.sin(rad);
            
            return (
              <text
                key={i}
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={label.fontSize || "10"}
                fill={label.color || "#374151"}
                transform={`rotate(${angle + 180}, ${labelX}, ${labelY})`}
              >
                {label.text}
              </text>
            );
          })}
        </g>
        
        {/* Needle */}
        <g transform={`translate(${centerX}, ${centerY}) rotate(${rotation - 180})`}>
          <path
            d={`M -${needleBaseWidth / 2},0 L 0,-${needleLength} L ${needleBaseWidth / 2},0 Z`}
            fill={needleColor}
          />
          <circle cx="0" cy="0" r={needleBaseWidth * 1.5} fill={needleColor} />
        </g>
        
        {/* Value display */}
        <text
          x={centerX}
          y={centerY + 20}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="16"
          fontWeight="bold"
          className="text-gray-800 dark:text-gray-200"
        >
          {currentValueText ? `${currentValueText}: ${formattedValue}` : formattedValue}
        </text>
      </svg>
    </div>
  );
};

export default Speedometer;