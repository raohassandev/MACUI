import React from 'react';
import { StateTimelineWidget } from '../../../types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/layout/Card';
import { Input } from '../../ui/inputs/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/inputs/Select';
import { Heading } from '../../ui/text/Heading';
import { mockTags } from '../../../services/api/tag';

interface StateTimelineWidgetConfigProps {
  widget: Partial<StateTimelineWidget>;
  onChange: (field: string, value: any) => void;
}

const STATE_OPTIONS = [
  { id: 'running', label: 'Running', defaultColor: '#22c55e' },
  { id: 'idle', label: 'Idle', defaultColor: '#3b82f6' },
  { id: 'warning', label: 'Warning', defaultColor: '#f59e0b' },
  { id: 'error', label: 'Error', defaultColor: '#ef4444' },
  { id: 'maintenance', label: 'Maintenance', defaultColor: '#8b5cf6' },
  { id: 'offline', label: 'Offline', defaultColor: '#6b7280' },
];

const TimeOptions = [
  { label: 'Last 1 hour', value: 60 * 60 * 1000 },
  { label: 'Last 3 hours', value: 3 * 60 * 60 * 1000 },
  { label: 'Last 6 hours', value: 6 * 60 * 60 * 1000 },
  { label: 'Last 12 hours', value: 12 * 60 * 60 * 1000 },
  { label: 'Last 24 hours', value: 24 * 60 * 60 * 1000 },
  { label: 'Last 2 days', value: 2 * 24 * 60 * 60 * 1000 },
  { label: 'Last 7 days', value: 7 * 24 * 60 * 60 * 1000 },
];

const StateTimelineWidgetConfig: React.FC<StateTimelineWidgetConfigProps> = ({ widget, onChange }) => {
  // Handler for adding a tag
  const handleAddTag = (tagId: string) => {
    if (!tagId || tagId === 'placeholder') return;
    
    const currentTags = [...(widget.tagIds || [])];
    if (!currentTags.includes(tagId)) {
      onChange('tagIds', [...currentTags, tagId]);
      
      // Create a label for the tag
      const tag = mockTags.find(t => t.id === tagId);
      if (tag && widget.tagLabels) {
        const newLabels = [...widget.tagLabels];
        newLabels[currentTags.length] = tag.name;
        onChange('tagLabels', newLabels);
      } else if (tag) {
        const currentLabels = widget.tagLabels || [];
        onChange('tagLabels', [...currentLabels, tag.name]);
      }
    }
  };

  // Handler for removing a tag
  const handleRemoveTag = (index: number) => {
    const currentTags = [...(widget.tagIds || [])];
    const newTags = [...currentTags];
    newTags.splice(index, 1);
    onChange('tagIds', newTags);
    
    // Remove the corresponding label
    if (widget.tagLabels) {
      const newLabels = [...widget.tagLabels];
      newLabels.splice(index, 1);
      onChange('tagLabels', newLabels);
    }
  };

  // Handler for updating tag label
  const handleUpdateTagLabel = (index: number, label: string) => {
    if (!widget.tagLabels) {
      // Create labels array if it doesn't exist
      const labels = (widget.tagIds || []).map((_, i) => i === index ? label : '');
      onChange('tagLabels', labels);
    } else {
      const newLabels = [...widget.tagLabels];
      newLabels[index] = label;
      onChange('tagLabels', newLabels);
    }
  };

  // Handler for updating state color
  const handleStateColorChange = (stateId: string, color: string) => {
    const currentColors = widget.stateColors || {};
    onChange('stateColors', {
      ...currentColors,
      [stateId]: color
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>State Timeline Widget Configuration</CardTitle>
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
                <label htmlFor="timeRange" className="block text-sm font-medium mb-1">Time Range</label>
                <Select
                  value={widget.timeRange?.toString() || TimeOptions[4].value.toString()}
                  onValueChange={(value) => onChange('timeRange', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    {TimeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div>
            <Heading level={3} className="text-lg font-medium mb-4">Data Sources</Heading>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Add Machine/Tag</label>
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
                  Each tag represents a separate machine or component in the timeline
                </p>
              </div>

              {/* List of added tags with labels */}
              {(widget.tagIds || []).length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-2">Configured Machines/Tags:</p>
                  <div className="space-y-2">
                    {(widget.tagIds || []).map((tagId, index) => {
                      const tag = mockTags.find(t => t.id === tagId);
                      return (
                        <div key={index} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          <div className="flex-1">
                            <span className="text-sm font-medium block mb-1">
                              {tag?.name || tagId}
                            </span>
                            <div className="flex space-x-2">
                              <span className="text-xs text-gray-500">Label:</span>
                              <Input
                                size={1}
                                className="text-xs py-0.5 h-6 flex-1"
                                value={(widget.tagLabels || [])[index] || ''}
                                onChange={(e) => handleUpdateTagLabel(index, e.target.value)}
                                placeholder="Display name"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(index)}
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

          {/* State Colors */}
          <div>
            <Heading level={3} className="text-lg font-medium mb-4">State Colors</Heading>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {STATE_OPTIONS.map(state => (
                  <div key={state.id} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: (widget.stateColors || {})[state.id] || state.defaultColor }}
                    />
                    <span className="text-sm font-medium flex-grow">{state.label}</span>
                    <div className="flex space-x-1">
                      <Input
                        type="color"
                        className="w-8 h-8 p-1"
                        value={(widget.stateColors || {})[state.id] || state.defaultColor}
                        onChange={(e) => handleStateColorChange(state.id, e.target.value)}
                      />
                      <Input
                        type="text"
                        className="w-24 text-xs"
                        value={(widget.stateColors || {})[state.id] || state.defaultColor}
                        onChange={(e) => handleStateColorChange(state.id, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showLegend"
                  checked={widget.showLegend !== false}
                  onChange={(e) => onChange('showLegend', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="showLegend" className="text-sm font-medium">Show State Legend</label>
              </div>
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

export default StateTimelineWidgetConfig;