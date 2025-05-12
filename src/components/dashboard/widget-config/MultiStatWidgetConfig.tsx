import React, { useState } from 'react';
import { MultiStatWidget } from '../../../types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/layout/Card';
import { Input } from '../../ui/inputs/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/inputs/Select';
import { Heading } from '../../ui/text/Heading';
import { mockTags } from '../../../services/api/tag';

interface MultiStatWidgetConfigProps {
  widget: Partial<MultiStatWidget>;
  onChange: (field: string, value: any) => void;
}

const FORMAT_OPTIONS = [
  { value: 'default', label: 'Auto Format' },
  { value: '0,0', label: 'Whole Numbers (1,234)' },
  { value: '0.0', label: 'One Decimal (1.2)' },
  { value: '0.00', label: 'Two Decimals (1.23)' },
  { value: '0.0 kW', label: 'With Unit (1.2 kW)' },
  { value: '0.0%', label: 'Percentage (1.2%)' },
  { value: '0.00e+0', label: 'Scientific (1.23e+3)' },
];

const MultiStatWidgetConfig: React.FC<MultiStatWidgetConfigProps> = ({ widget, onChange }) => {
  // State for adding new thresholds
  const [newThresholdValue, setNewThresholdValue] = useState<string>('');
  const [newThresholdColor, setNewThresholdColor] = useState<string>('#22c55e');

  // Handler for adding a tag
  const handleAddTag = (tagId: string) => {
    if (!tagId || tagId === 'placeholder') return;
    
    const currentTags = [...(widget.tagIds || [])];
    if (!currentTags.includes(tagId)) {
      onChange('tagIds', [...currentTags, tagId]);
      
      // Create a label for the tag
      const tag = mockTags.find(t => t.id === tagId);
      if (tag && widget.statLabels) {
        const newLabels = { ...widget.statLabels };
        newLabels[tagId] = tag.name;
        onChange('statLabels', newLabels);
      } else if (tag) {
        onChange('statLabels', { 
          ...(widget.statLabels || {}), 
          [tagId]: tag.name 
        });
      }
    }
  };

  // Handler for removing a tag
  const handleRemoveTag = (tagId: string) => {
    const currentTags = [...(widget.tagIds || [])];
    const newTags = currentTags.filter(id => id !== tagId);
    onChange('tagIds', newTags);
    
    // Remove the corresponding label
    if (widget.statLabels) {
      const newLabels = { ...widget.statLabels };
      delete newLabels[tagId];
      onChange('statLabels', newLabels);
    }
  };

  // Handler for updating tag label
  const handleUpdateTagLabel = (tagId: string, label: string) => {
    onChange('statLabels', { 
      ...(widget.statLabels || {}), 
      [tagId]: label 
    });
  };

  // Handler for adding a threshold
  const handleAddThreshold = () => {
    if (!newThresholdValue) return;
    
    const value = parseFloat(newThresholdValue);
    if (isNaN(value)) return;
    
    const newThreshold = {
      value,
      color: newThresholdColor
    };
    
    const currentThresholds = [...(widget.thresholds || [])];
    onChange('thresholds', [...currentThresholds, newThreshold]);
    
    // Reset the form
    setNewThresholdValue('');
    setNewThresholdColor('#22c55e');
  };

  // Handler for removing a threshold
  const handleRemoveThreshold = (index: number) => {
    const currentThresholds = [...(widget.thresholds || [])];
    currentThresholds.splice(index, 1);
    onChange('thresholds', currentThresholds);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Multi-Stat Panel Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Basic Settings */}
          <div>
            <Heading level={3} className="text-lg font-medium mb-4">Basic Settings</Heading>
            <div className="space-y-3">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">Widget Title</label>
                <Input
                  id="title"
                  value={widget.title || ''}
                  onChange={(e) => onChange('title', e.target.value)}
                  placeholder="Enter widget title"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="layout" className="block text-sm font-medium mb-1">Layout Style</label>
                <Select
                  value={widget.layout || 'grid'}
                  onValueChange={(value) => onChange('layout', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select layout style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid Layout</SelectItem>
                    <SelectItem value="list">List Layout</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Grid layout arranges stats in a grid, list layout shows them in a vertical list
                </p>
              </div>

              <div>
                <label htmlFor="displayFormat" className="block text-sm font-medium mb-1">Display Format</label>
                <Select
                  value={widget.displayFormat || 'default'}
                  onValueChange={(value) => onChange('displayFormat', value === 'default' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMAT_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Display Options */}
          <div>
            <Heading level={3} className="text-lg font-medium mb-4">Display Options</Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showSparkline"
                  checked={widget.showSparkline === true}
                  onChange={(e) => onChange('showSparkline', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="showSparkline" className="text-sm font-medium">Show Sparkline</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showTrend"
                  checked={widget.showTrend === true}
                  onChange={(e) => onChange('showTrend', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="showTrend" className="text-sm font-medium">Show Trend Indicator</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showUnits"
                  checked={widget.showUnits !== false}
                  onChange={(e) => onChange('showUnits', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="showUnits" className="text-sm font-medium">Show Units</label>
              </div>
            </div>

            {widget.showSparkline && (
              <div className="mt-3">
                <label htmlFor="sparklinePoints" className="block text-sm font-medium mb-1">Sparkline Points</label>
                <Input
                  id="sparklinePoints"
                  type="number"
                  value={widget.sparklinePoints || 10}
                  onChange={(e) => onChange('sparklinePoints', parseInt(e.target.value))}
                  min={5}
                  max={50}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of points to show in the sparkline chart
                </p>
              </div>
            )}
          </div>

          {/* Data Sources */}
          <div>
            <Heading level={3} className="text-lg font-medium mb-4">Data Sources</Heading>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Add Stat</label>
                <Select
                  value="placeholder"
                  onValueChange={handleAddTag}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tag to add" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>Select a tag to add</SelectItem>
                    {mockTags
                      .filter(tag => !(widget.tagIds || []).includes(tag.id))
                      .map(tag => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name} {tag.unit ? `(${tag.unit})` : ''}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Each tag will be displayed as a separate stat in the panel
                </p>
              </div>

              {/* List of added tags with labels */}
              {(widget.tagIds || []).length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-2">Configured Stats:</p>
                  <div className="space-y-2">
                    {(widget.tagIds || []).map((tagId) => {
                      const tag = mockTags.find(t => t.id === tagId);
                      return (
                        <div key={tagId} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          <div className="flex-1">
                            <span className="text-sm font-medium block mb-1">
                              {tag?.name || tagId}
                            </span>
                            <div className="flex space-x-2">
                              <span className="text-xs text-gray-500">Display Name:</span>
                              <Input
                                size={1}
                                className="text-xs py-0.5 h-6 flex-1"
                                value={(widget.statLabels || {})[tagId] || ''}
                                onChange={(e) => handleUpdateTagLabel(tagId, e.target.value)}
                                placeholder="Display name"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tagId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Thresholds */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Heading level={3} className="text-lg font-medium">Thresholds</Heading>
            </div>
            
            {/* Add new threshold form */}
            <div className="flex items-end space-x-2 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Value</label>
                <Input
                  type="number"
                  value={newThresholdValue}
                  onChange={(e) => setNewThresholdValue(e.target.value)}
                  placeholder="Enter threshold value"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <Input
                  type="color"
                  value={newThresholdColor}
                  onChange={(e) => setNewThresholdColor(e.target.value)}
                  className="w-16 h-10"
                />
              </div>
              <button
                type="button"
                onClick={handleAddThreshold}
                className="px-3 py-2 bg-blue-500 text-white rounded-md"
                disabled={!newThresholdValue}
              >
                Add
              </button>
            </div>

            {/* List of existing thresholds */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(widget.thresholds || [])
                .sort((a, b) => a.value - b.value)
                .map((threshold, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: threshold.color }}
                    />
                    <span className="text-sm font-medium flex-grow">
                      Value: {threshold.value}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: threshold.color }}
                    >
                      {threshold.color}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveThreshold(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              
              {(!widget.thresholds || widget.thresholds.length === 0) && (
                <p className="text-sm text-gray-500">
                  No thresholds defined. Add thresholds to colorize values based on value ranges.
                </p>
              )}
            </div>
          </div>

          {/* Advanced Settings */}
          <div>
            <Heading level={3} className="text-lg font-medium mb-4">Advanced Settings</Heading>
            <div className="space-y-3">
              <div>
                <label htmlFor="refreshRate" className="block text-sm font-medium mb-1">Refresh Rate (milliseconds)</label>
                <Input
                  id="refreshRate"
                  type="number"
                  value={widget.refreshRate || ''}
                  onChange={(e) => onChange('refreshRate', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Auto"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use tag's refresh rate
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiStatWidgetConfig;