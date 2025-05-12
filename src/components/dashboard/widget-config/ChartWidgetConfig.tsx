import React from 'react';
import { ChartWidget } from '../../../types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/layout/Card';
import { Input } from '../../ui/inputs/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/inputs/Select';
import { Heading } from '../../ui/text/Heading';
import { mockTags } from '../../../services/api/tag';

interface ChartWidgetConfigProps {
  widget: Partial<ChartWidget>;
  onChange: (field: string, value: any) => void;
}

const ChartWidgetConfig: React.FC<ChartWidgetConfigProps> = ({ widget, onChange }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Chart Widget Configuration</CardTitle>
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
                <label htmlFor="chartType" className="block text-sm font-medium mb-1">Chart Type</label>
                <Select
                  value={widget.chartType || 'line'}
                  onValueChange={(value) => onChange('chartType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
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

          {/* Chart Settings */}
          <div>
            <Heading level={3} className="text-lg font-medium mb-4">Chart Settings</Heading>
            <div className="space-y-3">
              <div>
                <label htmlFor="timeRange" className="block text-sm font-medium mb-1">Time Range (milliseconds)</label>
                <Input
                  id="timeRange"
                  type="number"
                  value={widget.timeRange || 3600000}
                  onChange={(e) => onChange('timeRange', parseInt(e.target.value))}
                  placeholder="3600000"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Common values: 1 hour = 3600000, 24 hours = 86400000
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showLegend"
                  checked={widget.showLegend !== false}
                  onChange={(e) => onChange('showLegend', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="showLegend" className="text-sm font-medium">Show Legend</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoScale"
                  checked={widget.autoScale !== false}
                  onChange={(e) => onChange('autoScale', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="autoScale" className="text-sm font-medium">Auto-scale Y-axis</label>
              </div>

              {/* Y-Axis Min/Max (only if autoScale is false) */}
              {widget.autoScale === false && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="yAxisMin" className="block text-sm font-medium mb-1">Y-Axis Minimum</label>
                    <Input
                      id="yAxisMin"
                      type="number"
                      value={widget.yAxisMin || 0}
                      onChange={(e) => onChange('yAxisMin', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="yAxisMax" className="block text-sm font-medium mb-1">Y-Axis Maximum</label>
                    <Input
                      id="yAxisMax"
                      type="number"
                      value={widget.yAxisMax || 100}
                      onChange={(e) => onChange('yAxisMax', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Data Series - for multi-line/multi-bar charts */}
          <div>
            <Heading level={3} className="text-lg font-medium mb-4">Additional Data Series</Heading>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Additional Tags (Multi-series)</label>
                <Select
                  value={widget.additionalTags?.[0] || ''}
                  onValueChange={(value) => {
                    const currentTags = widget.additionalTags || [];
                    if (value && !currentTags.includes(value)) {
                      onChange('additionalTags', [...currentTags, value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add data source" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTags
                      .filter(tag => tag.id !== widget.tagId)
                      .map(tag => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name} {tag.unit ? `(${tag.unit})` : ''}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* List of added tags */}
              {widget.additionalTags && widget.additionalTags.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-2">Added Data Sources:</p>
                  <ul className="text-sm space-y-1">
                    {widget.additionalTags.map(tagId => {
                      const tag = mockTags.find(t => t.id === tagId);
                      return (
                        <li key={tagId} className="flex items-center justify-between">
                          <span>{tag?.name || tagId}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const currentTags = widget.additionalTags || [];
                              onChange('additionalTags', currentTags.filter(id => id !== tagId));
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </li>
                      );
                    })}
                  </ul>
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

export default ChartWidgetConfig;