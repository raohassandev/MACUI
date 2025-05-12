import React from 'react';
import { ReferenceLine, ReferenceArea } from 'recharts';

export interface Threshold {
  id: string;
  value: number;
  color: string;
  label?: string;
  alertLevel?: 'info' | 'warning' | 'critical';
  showValue?: boolean;
  showLabel?: boolean;
  orientation?: 'horizontal' | 'vertical';
  type?: 'line' | 'band';
  bandStart?: number; // Only for band type
}

interface ThresholdIndicatorsProps {
  thresholds: Threshold[];
  yAxisId?: string | number;
  xAxisId?: string | number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  labelOffset?: number;
}

const ThresholdIndicators: React.FC<ThresholdIndicatorsProps> = ({
  thresholds,
  yAxisId,
  xAxisId,
  position = 'right',
  labelOffset = 5,
}) => {
  // Sort thresholds by value for consistent rendering
  const sortedThresholds = [...thresholds].sort((a, b) => a.value - b.value);
  
  return (
    <>
      {sortedThresholds.map(threshold => {
        // For horizontal thresholds
        if (threshold.orientation !== 'vertical') {
          if (threshold.type === 'band' && threshold.bandStart !== undefined) {
            // Render a band threshold (area between two values)
            return (
              <ReferenceArea
                key={threshold.id}
                y1={threshold.bandStart}
                y2={threshold.value}
                fill={threshold.color}
                fillOpacity={0.1}
                stroke={threshold.color}
                strokeDasharray="3 3"
                strokeOpacity={0.5}
                yAxisId={yAxisId}
              >
                {threshold.showLabel && threshold.label && (
                  <div
                    className="text-xs absolute"
                    style={{
                      color: threshold.color,
                      right: position === 'right' ? labelOffset : undefined,
                      left: position === 'left' ? labelOffset : undefined,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  >
                    {threshold.label}
                  </div>
                )}
              </ReferenceArea>
            );
          } else {
            // Render a line threshold
            return (
              <ReferenceLine
                key={threshold.id}
                y={threshold.value}
                stroke={threshold.color}
                strokeDasharray="3 3"
                yAxisId={yAxisId}
                label={
                  (threshold.showLabel || threshold.showValue) ? {
                    value: threshold.showLabel ? 
                      (threshold.label || (threshold.showValue ? threshold.value.toString() : '')) : 
                      (threshold.showValue ? threshold.value.toString() : ''),
                    position,
                    fill: threshold.color,
                    fontSize: 12,
                    offset: labelOffset,
                  } : undefined
                }
              />
            );
          }
        } else {
          // For vertical thresholds
          if (threshold.type === 'band' && threshold.bandStart !== undefined) {
            // Render a vertical band threshold
            return (
              <ReferenceArea
                key={threshold.id}
                x1={threshold.bandStart}
                x2={threshold.value}
                fill={threshold.color}
                fillOpacity={0.1}
                stroke={threshold.color}
                strokeDasharray="3 3"
                strokeOpacity={0.5}
                xAxisId={xAxisId}
              >
                {threshold.showLabel && threshold.label && (
                  <div
                    className="text-xs absolute"
                    style={{
                      color: threshold.color,
                      bottom: position === 'bottom' ? labelOffset : undefined,
                      top: position === 'top' ? labelOffset : undefined,
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    {threshold.label}
                  </div>
                )}
              </ReferenceArea>
            );
          } else {
            // Render a vertical line threshold
            return (
              <ReferenceLine
                key={threshold.id}
                x={threshold.value}
                stroke={threshold.color}
                strokeDasharray="3 3"
                xAxisId={xAxisId}
                label={
                  (threshold.showLabel || threshold.showValue) ? {
                    value: threshold.showLabel ? 
                      (threshold.label || (threshold.showValue ? threshold.value.toString() : '')) : 
                      (threshold.showValue ? threshold.value.toString() : ''),
                    position: position === 'right' ? 'right' : 
                            position === 'left' ? 'left' : 
                            position === 'top' ? 'top' : 'bottom',
                    fill: threshold.color,
                    fontSize: 12,
                    offset: labelOffset,
                  } : undefined
                }
              />
            );
          }
        }
      })}
    </>
  );
};

// ThresholdLegend component for displaying threshold descriptions
export const ThresholdLegend: React.FC<{ thresholds: Threshold[] }> = ({ thresholds }) => {
  // Sort thresholds by value for consistent display
  const sortedThresholds = [...thresholds].sort((a, b) => a.value - b.value);
  
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {sortedThresholds.map(threshold => (
        <div key={threshold.id} className="flex items-center">
          {threshold.type === 'band' ? (
            <div 
              className="w-4 h-4 mr-1 rounded-sm"
              style={{ 
                backgroundColor: threshold.color, 
                opacity: 0.2,
                border: `1px solid ${threshold.color}`
              }}
            />
          ) : (
            <div className="flex items-center mr-1">
              <div 
                className="w-4 border-t-2" 
                style={{ 
                  borderColor: threshold.color,
                  borderStyle: 'dashed' 
                }}
              />
            </div>
          )}
          <span style={{ color: threshold.color }}>
            {threshold.label || `${threshold.value}${threshold.bandStart !== undefined ? `-${threshold.bandStart}` : ''}`}
          </span>
        </div>
      ))}
    </div>
  );
};

// Utility Component: ThresholdStatus
// Shows status indicator based on a value and thresholds
export const ThresholdStatus: React.FC<{
  value: number;
  thresholds: Threshold[];
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'square' | 'pill';
}> = ({ 
  value, 
  thresholds, 
  showLabel = true,
  size = 'md',
  shape = 'circle'
}) => {
  // Find applicable threshold (highest threshold that is less than or equal to value)
  const applicableThreshold = [...thresholds]
    .sort((a, b) => b.value - a.value)
    .find(t => value >= t.value);
  
  if (!applicableThreshold) {
    return null;
  }
  
  // Determine size classes
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }[size];
  
  // Determine shape classes
  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-sm',
    pill: 'rounded-full w-6'
  }[shape];
  
  return (
    <div className="flex items-center">
      <div 
        className={`${sizeClasses} ${shapeClasses} mr-1`}
        style={{ backgroundColor: applicableThreshold.color }}
      />
      {showLabel && (
        <span className="text-sm">
          {applicableThreshold.label || `${value}`}
        </span>
      )}
    </div>
  );
};

export default ThresholdIndicators;