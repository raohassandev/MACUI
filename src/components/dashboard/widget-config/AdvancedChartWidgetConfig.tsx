import React from 'react';
import { AdvancedChartWidget } from '../../../types/dashboard';
import { fetchTags } from '../../../services/api/tag';
import { useEffect, useState } from 'react';

interface AdvancedChartWidgetConfigProps {
  widget: Partial<AdvancedChartWidget>;
  onChange: (field: string, value: any) => void;
}

const AdvancedChartWidgetConfig: React.FC<AdvancedChartWidgetConfigProps> = ({ widget, onChange }) => {
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

  // Handle additional tags
  const handleAdditionalTagsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions);
    const selectedValues = options.map(option => option.value);
    onChange('additionalTags', selectedValues);
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
      color: '#f59e0b',
      label: 'Warning'
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

  // Handle annotation changes
  const handleAnnotationChange = (index: number, field: string, value: any) => {
    const updatedAnnotations = [...(widget.annotations || [])];
    updatedAnnotations[index] = {
      ...updatedAnnotations[index],
      [field]: value
    };
    onChange('annotations', updatedAnnotations);
  };

  // Add new annotation
  const addAnnotation = () => {
    const newAnnotation = {
      type: 'line',
      position: 'y',
      value: 75,
      color: '#f59e0b',
      label: 'Threshold'
    };
    
    const updatedAnnotations = [...(widget.annotations || []), newAnnotation];
    onChange('annotations', updatedAnnotations);
  };

  // Remove annotation
  const removeAnnotation = (index: number) => {
    const updatedAnnotations = [...(widget.annotations || [])];
    updatedAnnotations.splice(index, 1);
    onChange('annotations', updatedAnnotations);
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
          Description (optional)
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
          value={widget.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Enter chart description"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Main Data Source Tag
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
          Additional Data Source Tags
        </label>
        <select
          multiple
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
          value={widget.additionalTags || []}
          onChange={handleAdditionalTagsChange}
          size={3}
        >
          {tags.map(tag => (
            <option key={tag.id} value={tag.id}>
              {tag.name} {tag.unit ? `(${tag.unit})` : ''}
            </option>
          ))}
        </select>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Hold Ctrl/Cmd to select multiple tags
        </span>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Chart Type
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
          value={widget.chartType || 'line'}
          onChange={(e) => onChange('chartType', e.target.value)}
        >
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="area">Area Chart</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Pattern
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
          value={widget.pattern || 'sine'}
          onChange={(e) => onChange('pattern', e.target.value)}
        >
          <option value="sine">Sine Wave</option>
          <option value="trend">Trend Line</option>
          <option value="steps">Step Changes</option>
          <option value="random">Random Walk</option>
        </select>
      </div>
      
      {widget.pattern === 'trend' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Trend Direction
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
            value={widget.trendDirection || 'up'}
            onChange={(e) => onChange('trendDirection', e.target.value)}
          >
            <option value="up">Upward</option>
            <option value="down">Downward</option>
          </select>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Time Range (milliseconds)
        </label>
        <input
          type="number"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
          value={widget.timeRange || 3600000}
          onChange={(e) => onChange('timeRange', parseInt(e.target.value))}
        />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Common values: 1 minute = 60000, 1 hour = 3600000, 1 day = 86400000
        </span>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Data Points
        </label>
        <input
          type="number"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
          value={widget.dataPoints || 50}
          onChange={(e) => onChange('dataPoints', parseInt(e.target.value))}
          min={10}
          max={500}
        />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Number of data points to display. More points = higher resolution.
        </span>
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
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Line Color
        </label>
        <div className="flex">
          <input
            type="color"
            className="h-10 w-10 border border-gray-300 dark:border-gray-700 rounded-md"
            value={widget.lineColor || '#3b82f6'}
            onChange={(e) => onChange('lineColor', e.target.value)}
          />
          <input
            type="text"
            className="w-full ml-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
            value={widget.lineColor || '#3b82f6'}
            onChange={(e) => onChange('lineColor', e.target.value)}
          />
        </div>
      </div>
      
      {widget.chartType === 'area' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Area Color
          </label>
          <div className="flex">
            <input
              type="color"
              className="h-10 w-10 border border-gray-300 dark:border-gray-700 rounded-md"
              value={widget.areaColor || '#3b82f633'}
              onChange={(e) => onChange('areaColor', e.target.value)}
            />
            <input
              type="text"
              className="w-full ml-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
              value={widget.areaColor || '#3b82f633'}
              onChange={(e) => onChange('areaColor', e.target.value)}
            />
          </div>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Y-Axis Label
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
          value={widget.yAxisLabel || ''}
          onChange={(e) => onChange('yAxisLabel', e.target.value)}
          placeholder="Enter y-axis label"
        />
      </div>
      
      {widget.additionalTags && widget.additionalTags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Second Y-Axis Label (optional)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
            value={widget.y2AxisLabel || ''}
            onChange={(e) => onChange('y2AxisLabel', e.target.value)}
            placeholder="Enter secondary y-axis label"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Used for tags that need a different scale
          </span>
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={widget.showGrid !== false}
            onChange={(e) => onChange('showGrid', e.target.checked)}
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Show Grid
          </span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={widget.showLegend !== false}
            onChange={(e) => onChange('showLegend', e.target.checked)}
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Show Legend
          </span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={widget.showDots || false}
            onChange={(e) => onChange('showDots', e.target.checked)}
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Show Data Points
          </span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={widget.autoScale !== false}
            onChange={(e) => onChange('autoScale', e.target.checked)}
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Auto Scale Y-Axis
          </span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={widget.showBrush || false}
            onChange={(e) => onChange('showBrush', e.target.checked)}
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Show Time Range Brush
          </span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={widget.animations !== false}
            onChange={(e) => onChange('animations', e.target.checked)}
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Enable Animations
          </span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={widget.zoom || false}
            onChange={(e) => onChange('zoom', e.target.checked)}
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Enable Zoom
          </span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={widget.stacked || false}
            onChange={(e) => onChange('stacked', e.target.checked)}
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Stacked (for Bar and Area charts)
          </span>
        </label>
      </div>
      
      {!widget.autoScale && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Y-Axis Min
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
              value={widget.yAxisMin ?? ''}
              onChange={(e) => onChange('yAxisMin', e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Y-Axis Max
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
              value={widget.yAxisMax ?? ''}
              onChange={(e) => onChange('yAxisMax', e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          </div>
        </div>
      )}
      
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
            No thresholds defined. Add a threshold to highlight specific values.
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
      
      {/* Annotations section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Annotations
          </label>
          <button
            type="button"
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
            onClick={addAnnotation}
          >
            Add Annotation
          </button>
        </div>
        
        {(widget.annotations || []).length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
            No annotations defined. Add annotations to mark important points or ranges.
          </div>
        ) : (
          <div className="space-y-3">
            {(widget.annotations || []).map((annotation, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 border border-gray-200 dark:border-gray-700 rounded">
                <div className="flex-grow">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400">Type</label>
                      <select
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded"
                        value={annotation.type || 'line'}
                        onChange={(e) => handleAnnotationChange(index, 'type', e.target.value)}
                      >
                        <option value="line">Line</option>
                        <option value="area">Area</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400">Position</label>
                      <select
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded"
                        value={annotation.position || 'y'}
                        onChange={(e) => handleAnnotationChange(index, 'position', e.target.value)}
                      >
                        <option value="y">Y-Axis</option>
                        <option value="x">X-Axis</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {annotation.type === 'line' ? (
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400">Value</label>
                        <input
                          type="number"
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded"
                          value={annotation.value || 0}
                          onChange={(e) => handleAnnotationChange(index, 'value', parseFloat(e.target.value))}
                        />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400">Start Value</label>
                          <input
                            type="number"
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded"
                            value={annotation.startValue || 0}
                            onChange={(e) => handleAnnotationChange(index, 'startValue', parseFloat(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400">End Value</label>
                          <input
                            type="number"
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded"
                            value={annotation.endValue || 0}
                            onChange={(e) => handleAnnotationChange(index, 'endValue', parseFloat(e.target.value))}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400">Color</label>
                      <div className="flex">
                        <input
                          type="color"
                          className="h-7 w-7 border border-gray-300 dark:border-gray-700 rounded"
                          value={annotation.color || '#ff7300'}
                          onChange={(e) => handleAnnotationChange(index, 'color', e.target.value)}
                        />
                        <input
                          type="text"
                          className="w-full ml-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded"
                          value={annotation.color || '#ff7300'}
                          onChange={(e) => handleAnnotationChange(index, 'color', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400">Label</label>
                      <input
                        type="text"
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded"
                        value={annotation.label || ''}
                        onChange={(e) => handleAnnotationChange(index, 'label', e.target.value)}
                        placeholder="Label"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-1 text-red-500 hover:text-red-700"
                  onClick={() => removeAnnotation(index)}
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

export default AdvancedChartWidgetConfig;