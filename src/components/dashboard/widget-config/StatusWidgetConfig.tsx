import React from 'react';
import { StatusWidget } from '../../../types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/layout/Card';
import { Input } from '../../ui/inputs/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/inputs/Select';
import { Heading } from '../../ui/text/Heading';
import { mockTags } from '../../../services/api/tag';

interface StatusWidgetConfigProps {
  widget: Partial<StatusWidget>;
  onChange: (field: string, value: any) => void;
}

const StatusWidgetConfig: React.FC<StatusWidgetConfigProps> = ({ widget, onChange }) => {
  const updateStatusMap = (key: string, field: 'label' | 'color', value: string) => {
    const statusMap = { ...(widget.statusMap || {}) };
    if (!statusMap[key]) {
      statusMap[key] = { label: '', color: '#cccccc' };
    }
    statusMap[key][field] = value;
    onChange('statusMap', statusMap);
  };

  const addStatusMapping = () => {
    const statusMap = { ...(widget.statusMap || {}) };
    const keys = Object.keys(statusMap);
    const newKey = keys.length > 0 ? String(Number(keys[keys.length - 1]) + 1) : '0';
    statusMap[newKey] = { label: `Status ${newKey}`, color: '#cccccc' };
    onChange('statusMap', statusMap);
  };

  const removeStatusMapping = (key: string) => {
    const statusMap = { ...(widget.statusMap || {}) };
    delete statusMap[key];
    onChange('statusMap', statusMap);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Status Widget Configuration</CardTitle>
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
                <label htmlFor="shape" className="block text-sm font-medium mb-1">Indicator Shape</label>
                <Select
                  value={widget.shape || 'circle'}
                  onValueChange={(value) => onChange('shape', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shape" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="circle">Circle</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="pill">Pill</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="tagId" className="block text-sm font-medium mb-1">Data Source Tag</label>
                <Select
                  value={widget.tagId || ''}
                  onValueChange={(value) => onChange('tagId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select data source" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTags.map(tag => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.name} {tag.unit ? `(${tag.unit})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div>
            <Heading level={3} className="text-lg font-medium mb-4">Display Settings</Heading>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showLabel"
                  checked={widget.showLabel !== false}
                  onChange={(e) => onChange('showLabel', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="showLabel" className="text-sm font-medium">Show Status Label</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="blink"
                  checked={widget.blink === true}
                  onChange={(e) => onChange('blink', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="blink" className="text-sm font-medium">Blink on Status Change</label>
              </div>
            </div>
          </div>

          {/* Status Mappings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Heading level={3} className="text-lg font-medium">Status Mappings</Heading>
              <button
                type="button"
                onClick={addStatusMapping}
                className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Status
              </button>
            </div>

            <div className="space-y-4">
              {widget.statusMap && Object.keys(widget.statusMap).length > 0 ? (
                Object.entries(widget.statusMap).map(([key, status]) => (
                  <div key={key} className="grid grid-cols-3 gap-2 items-end">
                    <div>
                      <label className="block text-sm font-medium mb-1">Value</label>
                      <Input
                        type="text"
                        value={key}
                        readOnly
                        className="w-full bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Label</label>
                      <Input
                        type="text"
                        value={status.label}
                        onChange={(e) => updateStatusMap(key, 'label', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Color</label>
                        <div className="flex space-x-2">
                          <Input
                            type="color"
                            value={status.color}
                            onChange={(e) => updateStatusMap(key, 'color', e.target.value)}
                            className="w-10 h-9 p-0 border"
                          />
                          <Input
                            type="text"
                            value={status.color}
                            onChange={(e) => updateStatusMap(key, 'color', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStatusMapping(key)}
                        className="px-2 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 self-end"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No status mappings defined. Add status mappings to define colors and labels for different status values.</p>
                </div>
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

export default StatusWidgetConfig;