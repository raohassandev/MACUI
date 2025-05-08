import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectSelectedWidgetId, stopConfiguringWidget } from '../../redux/slices/widgetSlice';
import { selectCurrentDashboard, updateWidget } from '../../redux/slices/dashboardSlice';
import { Widget, Tag } from '../../types/dashboard';
import { fetchTags } from '../../services/api/tag';

const WidgetConfigModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedWidgetId = useAppSelector(selectSelectedWidgetId);
  const currentDashboard = useAppSelector(selectCurrentDashboard);
  const isConfiguring = useAppSelector(state => state.widget.isConfiguring);
  
  const [widget, setWidget] = useState<Widget | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Find the selected widget
  useEffect(() => {
    if (currentDashboard && selectedWidgetId) {
      const selectedWidget = currentDashboard.widgets.find(w => w.id === selectedWidgetId);
      if (selectedWidget) {
        setWidget(selectedWidget);
      }
    } else {
      setWidget(null);
    }
  }, [selectedWidgetId, currentDashboard]);

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

    if (isConfiguring) {
      loadTags();
    }
  }, [isConfiguring]);

  // Close the modal
  const handleClose = () => {
    dispatch(stopConfiguringWidget());
  };

  // Save widget configuration
  const handleSave = () => {
    if (widget && selectedWidgetId) {
      dispatch(updateWidget({ id: selectedWidgetId, widget }));
      dispatch(stopConfiguringWidget());
    }
  };

  // Update widget title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (widget) {
      setWidget({
        ...widget,
        title: e.target.value
      });
    }
  };

  // Update widget tag
  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (widget) {
      setWidget({
        ...widget,
        tagId: e.target.value
      });
    }
  };

  // Update widget refresh rate
  const handleRefreshRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (widget) {
      setWidget({
        ...widget,
        refreshRate: e.target.value ? parseInt(e.target.value, 10) : undefined
      });
    }
  };

  // Render type-specific settings
  const renderTypeSpecificSettings = () => {
    if (!widget) return null;

    switch (widget.type) {
      case 'chart':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Chart Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
                value={widget.chartType}
                onChange={(e) => setWidget({ ...widget, chartType: e.target.value as any })}
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="area">Area Chart</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time Range (milliseconds)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
                value={widget.timeRange}
                onChange={(e) => setWidget({ ...widget, timeRange: parseInt(e.target.value, 10) })}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Common values: 1 minute = 60000, 1 hour = 3600000, 1 day = 86400000
              </span>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={widget.showLegend ?? true}
                  onChange={(e) => setWidget({ ...widget, showLegend: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Show Legend
                </span>
              </label>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={widget.autoScale ?? true}
                  onChange={(e) => setWidget({ ...widget, autoScale: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Auto Scale Y-Axis
                </span>
              </label>
            </div>
            
            {!widget.autoScale && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Y-Axis Min
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
                    value={widget.yAxisMin ?? ''}
                    onChange={(e) => setWidget({ ...widget, yAxisMin: e.target.value ? parseFloat(e.target.value) : undefined })}
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
                    onChange={(e) => setWidget({ ...widget, yAxisMax: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
              </div>
            )}
          </>
        );
        
      case 'gauge':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gauge Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
                value={widget.gaugeType}
                onChange={(e) => setWidget({ ...widget, gaugeType: e.target.value as any })}
              >
                <option value="radial">Radial</option>
                <option value="linear">Linear</option>
                <option value="tank">Tank</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minimum Value
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
                  value={widget.minValue}
                  onChange={(e) => setWidget({ ...widget, minValue: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maximum Value
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
                  value={widget.maxValue}
                  onChange={(e) => setWidget({ ...widget, maxValue: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={widget.showValue ?? true}
                  onChange={(e) => setWidget({ ...widget, showValue: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Show Value
                </span>
              </label>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={widget.showUnit ?? true}
                  onChange={(e) => setWidget({ ...widget, showUnit: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Show Unit
                </span>
              </label>
            </div>
            
            {/* TODO: Add UI for thresholds when needed */}
          </>
        );
        
      case 'numeric':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Format
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
                value={widget.displayFormat || ''}
                onChange={(e) => setWidget({ ...widget, displayFormat: e.target.value || undefined })}
              >
                <option value="">Default</option>
                <option value="0,0">Whole Numbers (1,234)</option>
                <option value="0.0">One Decimal (1.2)</option>
                <option value="0.00">Two Decimals (1.23)</option>
                <option value="0.0 kW">With Unit (1.2 kW)</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={widget.showUnit ?? true}
                  onChange={(e) => setWidget({ ...widget, showUnit: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Show Unit
                </span>
              </label>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={widget.trendIndicator ?? false}
                  onChange={(e) => setWidget({ ...widget, trendIndicator: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Show Trend Indicator
                </span>
              </label>
            </div>
            
            {/* TODO: Add UI for thresholds when needed */}
          </>
        );
        
      case 'status':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Shape
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
                value={widget.shape || 'circle'}
                onChange={(e) => setWidget({ ...widget, shape: e.target.value as any })}
              >
                <option value="circle">Circle</option>
                <option value="square">Square</option>
                <option value="pill">Pill</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={widget.showLabel ?? true}
                  onChange={(e) => setWidget({ ...widget, showLabel: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Show Status Label
                </span>
              </label>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={widget.blink ?? false}
                  onChange={(e) => setWidget({ ...widget, blink: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Blink on Status Change
                </span>
              </label>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status Mapping
              </label>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Status mappings are pre-configured. To customize them, contact your administrator.
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>Value</div>
                  <div>Label</div>
                  <div>Color</div>
                </div>
                {Object.entries(widget.statusMap).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-2 mt-1 text-sm">
                    <div>{key}</div>
                    <div>{value.label}</div>
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-1"
                        style={{ backgroundColor: value.color }}
                      ></div>
                      {value.color}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
        
      case 'table':
        // Only showing key settings for brevity
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags to Display
              </label>
              <select
                multiple
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
                value={widget.tagIds}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions);
                  const selectedValues = options.map(option => option.value);
                  setWidget({ ...widget, tagIds: selectedValues });
                }}
                size={5}
              >
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Hold Ctrl/Cmd to select multiple tags
              </span>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Page Size
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
                value={widget.pageSize || 5}
                onChange={(e) => setWidget({ ...widget, pageSize: parseInt(e.target.value, 10) })}
                min={1}
                max={50}
              />
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={widget.sortable ?? true}
                  onChange={(e) => setWidget({ ...widget, sortable: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Enable Sorting
                </span>
              </label>
            </div>
          </>
        );
        
      case 'alert':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Alert Level
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
                value={widget.alertLevel || ''}
                onChange={(e) => setWidget({ ...widget, alertLevel: e.target.value as any || undefined })}
              >
                <option value="">All Levels</option>
                <option value="info">Info and Above</option>
                <option value="warning">Warning and Above</option>
                <option value="error">Error Only</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Maximum Alerts
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
                value={widget.maxAlerts || 10}
                onChange={(e) => setWidget({ ...widget, maxAlerts: parseInt(e.target.value, 10) })}
                min={1}
                max={50}
              />
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={widget.showTimestamp ?? true}
                  onChange={(e) => setWidget({ ...widget, showTimestamp: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Show Timestamps
                </span>
              </label>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={widget.showDescription ?? true}
                  onChange={(e) => setWidget({ ...widget, showDescription: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Show Description
                </span>
              </label>
            </div>
          </>
        );
        
      default:
        return <div>No specific settings for this widget type</div>;
    }
  };

  // If no widget is selected, don't render the modal
  if (!widget || !isConfiguring) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Configure Widget
          </h2>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            onClick={handleClose}
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="px-6 py-4 max-h-[calc(90vh-10rem)] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Basic settings */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Widget Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
                  value={widget.title}
                  onChange={handleTitleChange}
                  placeholder="Enter widget title"
                />
              </div>
              
              <div className="mb-4">
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
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Refresh Rate (ms)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
                  value={widget.refreshRate || ''}
                  onChange={handleRefreshRateChange}
                  placeholder="Auto (use tag refresh rate)"
                  min={1000}
                  step={1000}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Common values: 5 seconds = 5000, 10 seconds = 10000, 1 minute = 60000
                </span>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Widget-Specific Settings
                </h3>
                {renderTypeSpecificSettings()}
              </div>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={handleSave}
            disabled={isLoading}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetConfigModal;