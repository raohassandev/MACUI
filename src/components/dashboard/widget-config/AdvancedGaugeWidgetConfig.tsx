import React from 'react';
import { AdvancedGaugeWidget } from '../../../types/dashboard';
import { fetchTags } from '../../../services/api/tag';
import { useEffect, useState } from 'react';

interface AdvancedGaugeWidgetConfigProps {
  widget: Partial<AdvancedGaugeWidget>;
  onChange: (field: string, value: any) => void;
}

const AdvancedGaugeWidgetConfig: React.FC<AdvancedGaugeWidgetConfigProps> = ({ widget, onChange }) => {
  const [tags, setTags] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch available tags
  useEffect(() => {
    const loadTags = async () => {
      try {
        setIsLoading(true);
        const tagsData = await fetchTags();
        setTags(tagsData);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTags();
  }, []);

  // Update widget title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('title', e.target.value);
  };

  // Update widget tag
  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange('tagId', e.target.value);
  };

  // Handle threshold changes
  const handleThresholdChange = (index: number, field: string, value: any) => {
    const updatedThresholds = [...(widget.thresholds || [])];
    updatedThresholds[index] = {
      ...updatedThresholds[index],
      [field]: value
    };
    onChange('thresholds', updatedThresholds);
  };

  // Add new threshold
  const addThreshold = () => {
    const newThreshold = {
      value: 50,
      color: '#3b82f6',
      label: 'New threshold'
    };
    
    const updatedThresholds = [...(widget.thresholds || []), newThreshold];
    onChange('thresholds', updatedThresholds);
  };

  // Remove threshold
  const removeThreshold = (index: number) => {
    const updatedThresholds = [...(widget.thresholds || [])];
    updatedThresholds.splice(index, 1);
    onChange('thresholds', updatedThresholds);
  };

  return (
    <div className="space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Widget Title
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
          value={widget.title || ''}
          onChange={handleTitleChange}
          placeholder="Enter widget title"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Data Source Tag
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
          value={widget.tagId || ''}
          onChange={handleTagChange}
        >
          <option value="">Select a tag</option>
          {tags.map(tag => (
            <option key={tag.id} value={tag.id}>
              {tag.name} {tag.unit ? `(${tag.unit})` : ''}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Refresh Rate (ms)
        </label>
        <input
          type="number"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
          value={widget.refreshRate || ''}
          onChange={(e) => onChange('refreshRate', e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="Auto (use tag refresh rate)"
          min={1000}
          step={1000}
        />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Common values: 5 seconds = 5000, 10 seconds = 10000, 1 minute = 60000
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Minimum Value
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
            value={widget.minValue || 0}
            onChange={(e) => onChange('minValue', parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Maximum Value
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
            value={widget.maxValue || 100}
            onChange={(e) => onChange('maxValue', parseFloat(e.target.value))}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Gauge Style
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
          value={widget.gaugeStyle || 'radial'}
          onChange={(e) => onChange('gaugeStyle', e.target.value)}
        >
          <option value="radial">Radial</option>
          <option value="speedometer">Speedometer</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Size
        </label>
        <input
          type="number"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
          value={widget.size || 200}
          onChange={(e) => onChange('size', parseInt(e.target.value))}
          min={100}
          max={500}
          step={10}
        />
      </div>
      
      {widget.gaugeStyle === 'radial' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Arc Width
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
            value={widget.arcWidth || 10}
            onChange={(e) => onChange('arcWidth', parseInt(e.target.value))}
            min={5}
            max={30}
          />
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Decimal Places
        </label>
        <input
          type="number"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
          value={widget.decimalPlaces !== undefined ? widget.decimalPlaces : 1}
          onChange={(e) => onChange('decimalPlaces', parseInt(e.target.value))}
          min={0}
          max={5}
        />
      </div>
      
      {widget.gaugeStyle === 'speedometer' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Segments
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
            value={widget.segments || 5}
            onChange={(e) => onChange('segments', parseInt(e.target.value))}
            min={3}
            max={10}
          />
        </div>
      )}
      
      {widget.gaugeStyle === 'speedometer' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Color
            </label>
            <div className="flex">
              <input
                type="color"
                className="h-10 w-10 border border-gray-300 dark:border-gray-700 rounded-md"
                value={widget.startColor || '#22c55e'}
                onChange={(e) => onChange('startColor', e.target.value)}
              />
              <input
                type="text"
                className="w-full ml-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
                value={widget.startColor || '#22c55e'}
                onChange={(e) => onChange('startColor', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Color
            </label>
            <div className="flex">
              <input
                type="color"
                className="h-10 w-10 border border-gray-300 dark:border-gray-700 rounded-md"
                value={widget.endColor || '#ef4444'}
                onChange={(e) => onChange('endColor', e.target.value)}
              />
              <input
                type="text"
                className="w-full ml-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
                value={widget.endColor || '#ef4444'}
                onChange={(e) => onChange('endColor', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Pointer Width
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
            value={widget.pointerWidth || 6}
            onChange={(e) => onChange('pointerWidth', parseInt(e.target.value))}
            min={2}
            max={20}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Pointer Color
          </label>
          <div className="flex">
            <input
              type="color"
              className="h-10 w-10 border border-gray-300 dark:border-gray-700 rounded-md"
              value={widget.pointerColor || '#374151'}
              onChange={(e) => onChange('pointerColor', e.target.value)}
            />
            <input
              type="text"
              className="w-full ml-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
              value={widget.pointerColor || '#374151'}
              onChange={(e) => onChange('pointerColor', e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={widget.showLabels !== false}
            onChange={(e) => onChange('showLabels', e.target.checked)}
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Show Labels
          </span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={widget.showValue !== false}
            onChange={(e) => onChange('showValue', e.target.checked)}
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Show Value
          </span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={widget.animated !== false}
            onChange={(e) => onChange('animated', e.target.checked)}
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Enable Animation
          </span>
        </label>
      </div>
      
      {widget.animated !== false && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Animation Duration (ms)
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
            value={widget.animationDuration || 1000}
            onChange={(e) => onChange('animationDuration', parseInt(e.target.value))}
            min={100}
            max={5000}
            step={100}
          />
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Subtitle (optional)
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
          value={widget.subTitle || ''}
          onChange={(e) => onChange('subTitle', e.target.value)}
          placeholder="Enter a subtitle"
        />
      </div>
      
      {/* Thresholds section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Thresholds
          </label>
          <button
            type="button"
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
            onClick={addThreshold}
          >
            Add Threshold
          </button>
        </div>
        
        {(widget.thresholds || []).length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
            No thresholds defined. Add a threshold to change colors based on value.
          </div>
        ) : (
          <div className="space-y-3">
            {(widget.thresholds || []).map((threshold, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 border border-gray-200 dark:border-gray-700 rounded">
                <div className="flex-grow">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400">Value</label>
                      <input
                        type="number"
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded"
                        value={threshold.value}
                        onChange={(e) => handleThresholdChange(index, 'value', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400">Color</label>
                      <div className="flex">
                        <input
                          type="color"
                          className="h-7 w-7 border border-gray-300 dark:border-gray-700 rounded"
                          value={threshold.color}
                          onChange={(e) => handleThresholdChange(index, 'color', e.target.value)}
                        />
                        <input
                          type="text"
                          className="w-full ml-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded"
                          value={threshold.color}
                          onChange={(e) => handleThresholdChange(index, 'color', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400">Label</label>
                      <input
                        type="text"
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded"
                        value={threshold.label || ''}
                        onChange={(e) => handleThresholdChange(index, 'label', e.target.value)}
                        placeholder="Label"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-1 text-red-500 hover:text-red-700"
                  onClick={() => removeThreshold(index)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedGaugeWidgetConfig;