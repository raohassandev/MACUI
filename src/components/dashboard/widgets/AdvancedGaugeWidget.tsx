import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/layout/Card';
import { AdvancedGauge } from '../../ui/gauges/AdvancedGauge';
import { Speedometer } from '../../ui/gauges/Speedometer';
import { AdvancedGaugeWidget as AdvancedGaugeWidgetType } from '../../../types/dashboard';
import { fetchTagById } from '../../../services/api/tag';

interface AdvancedGaugeWidgetProps {
  widget: AdvancedGaugeWidgetType;
}

export const AdvancedGaugeWidget: React.FC<AdvancedGaugeWidgetProps> = ({ widget }) => {
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

  // Convert threshold array to arcs format for AdvancedGauge
  const getArcsFromThresholds = () => {
    if (!widget.thresholds || widget.thresholds.length === 0) {
      return [{ value: 100, color: '#3b82f6' }]; // Default blue
    }
    
    // Convert thresholds to arcs
    return widget.thresholds.map(threshold => {
      const min = widget.minValue || 0;
      const max = widget.maxValue || 100;
      
      // Calculate percentage value for the threshold
      const percentage = ((threshold.value - min) / (max - min)) * 100;
      
      return {
        value: percentage,
        color: threshold.color,
        label: threshold.label,
      };
    });
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

  const min = widget.minValue || 0;
  const max = widget.maxValue || 100;
  const unit = tag?.unit || '';

  // Render based on gauge style
  const renderGauge = () => {
    switch (widget.gaugeStyle) {
      case 'speedometer':
        return (
          <Speedometer
            value={value}
            min={min}
            max={max}
            size={widget.size || 200}
            needleColor={widget.needleColor || '#6b7280'}
            startColor={widget.startColor || '#22c55e'}
            endColor={widget.endColor || '#ef4444'}
            segments={widget.segments || 5}
            needleTransition={widget.animated}
            needleTransitionDuration={widget.animationDuration || 800}
            valueFormat={(val) => val.toFixed(widget.decimalPlaces || 1)}
            currentValueText={widget.valueText}
            customSegmentLabels={widget.segmentLabels}
            className="mx-auto"
          />
        );
      case 'radial':
      default:
        return (
          <AdvancedGauge
            value={value}
            min={min}
            max={max}
            size={widget.size || 200}
            arcWidth={widget.arcWidth || 10}
            arcs={getArcsFromThresholds()}
            pointerWidth={widget.pointerWidth || 6}
            pointerColor={widget.pointerColor || '#374151'}
            showLabels={widget.showLabels !== false}
            showValue={widget.showValue !== false}
            valueFormat={(val) => val.toFixed(widget.decimalPlaces || 1)}
            animated={widget.animated !== false}
            animationDuration={widget.animationDuration || 1000}
            label={widget.subTitle}
            unit={unit}
            className="mx-auto"
          />
        );
    }
  };

  return (
    <Card className="widget-content advanced-gauge-widget">
      <div className="flex flex-col items-center w-full h-full p-2">
        <div className="text-lg font-medium mb-2">
          {widget.title}
        </div>
        
        <div className="flex-grow flex items-center justify-center w-full">
          {renderGauge()}
        </div>
      </div>
    </Card>
  );
};

export default AdvancedGaugeWidget;