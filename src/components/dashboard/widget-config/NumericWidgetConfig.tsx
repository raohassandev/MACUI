import React from 'react';
import { NumericWidget } from '../../../types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/layout/Card';
import { Input } from '../../ui/inputs/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/inputs/Select';
import { Heading } from '../../ui/text/Heading';
import { mockTags } from '../../../services/api/tag';

interface NumericWidgetConfigProps {
  widget: Partial<NumericWidget>;
  onChange: (field: string, value: any) => void;
}

const NumericWidgetConfig: React.FC<NumericWidgetConfigProps> = ({ widget, onChange }) => {
  const handleThresholdChange = (index: number, field: 'value' | 'color', value: any) => {
    const thresholds = [...(widget.thresholds || [])];
    if (!thresholds[index]) {
      thresholds[index] = { value: 0, color: '#cccccc' };
    }
    thresholds[index][field] = value;
    onChange('thresholds', thresholds);
  };

  const addThreshold = () => {
    const thresholds = [...(widget.thresholds || [])];
    const lastValue = thresholds.length > 0 ? thresholds[thresholds.length - 1].value + 10 : 50;
    thresholds.push({ value: lastValue, color: '#ef4444' });
    onChange('thresholds', thresholds);
  };

  const removeThreshold = (index: number) => {
    const thresholds = [...(widget.thresholds || [])];
    thresholds.splice(index, 1);
    onChange('thresholds', thresholds);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Numeric Widget Configuration</CardTitle>
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
              <div>
                <label htmlFor="displayFormat" className="block text-sm font-medium mb-1">Display Format</label>
                <Select
                  value={widget.displayFormat || ''}
                  onValueChange={(value) => onChange('displayFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="0,0">Whole Numbers (1,234)</SelectItem>
                    <SelectItem value="0.0">One Decimal (1.2)</SelectItem>
                    <SelectItem value="0.00">Two Decimals (1.23)</SelectItem>
                    <SelectItem value="0.0 kW">With Unit (1.2 kW)</SelectItem>
                    <SelectItem value="0.0%">Percentage (1.2%)</SelectItem>
                    <SelectItem value="0.00e+0">Scientific (1.23e+3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showUnit"
                  checked={widget.showUnit !== false}
                  onChange={(e) => onChange('showUnit', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="showUnit" className="text-sm font-medium">Show Unit</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="trendIndicator"
                  checked={widget.trendIndicator === true}
                  onChange={(e) => onChange('trendIndicator', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="trendIndicator" className="text-sm font-medium">Show Trend Indicator</label>
              </div>
            </div>
          </div>

          {/* Thresholds */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Heading level={3} className="text-lg font-medium">Value Thresholds</Heading>
              <button
                type="button"
                onClick={addThreshold}
                className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Threshold
              </button>
            </div>

            <div className="space-y-4">
              {(widget.thresholds || []).map((threshold, index) => (
                <div key={index} className="flex items-end space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Value</label>
                    <Input
                      type="number"
                      value={threshold.value}
                      onChange={(e) => handleThresholdChange(index, 'value', parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Color</label>
                    <div className="flex space-x-2">
                      <Input
                        type="color"
                        value={threshold.color}
                        onChange={(e) => handleThresholdChange(index, 'color', e.target.value)}
                        className="w-10 h-9 p-0 border"
                      />
                      <Input
                        type="text"
                        value={threshold.color}
                        onChange={(e) => handleThresholdChange(index, 'color', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeThreshold(index)}
                    className="px-2 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {(!widget.thresholds || widget.thresholds.length === 0) && (
                <p className="text-sm text-gray-500">No thresholds defined. Add thresholds to colorize values based on thresholds.</p>
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

export default NumericWidgetConfig;