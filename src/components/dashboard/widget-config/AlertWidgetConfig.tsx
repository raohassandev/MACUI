import React from 'react';
import { AlertWidget } from '../../../types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/layout/Card';
import { Input } from '../../ui/inputs/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/inputs/Select';
import { Heading } from '../../ui/text/Heading';
import { mockTags } from '../../../services/api/tag';

interface AlertWidgetConfigProps {
  widget: Partial<AlertWidget>;
  onChange: (field: string, value: any) => void;
}

const AlertWidgetConfig: React.FC<AlertWidgetConfigProps> = ({ widget, onChange }) => {
  const handleAddFilterTag = (tagId: string) => {
    if (!tagId || tagId === 'placeholder') return;

    const currentTags = [...(widget.filterTags || [])];
    if (!currentTags.includes(tagId)) {
      onChange('filterTags', [...currentTags, tagId]);
    }
  };

  const handleRemoveFilterTag = (tagId: string) => {
    const currentTags = [...(widget.filterTags || [])];
    onChange('filterTags', currentTags.filter(id => id !== tagId));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Alert Widget Configuration</CardTitle>
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
                <label htmlFor="alertLevel" className="block text-sm font-medium mb-1">Alert Level</label>
                <Select
                  value={widget.alertLevel || 'warning'}
                  onValueChange={(value) => onChange('alertLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select alert level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="maxAlerts" className="block text-sm font-medium mb-1">Maximum Alerts to Display</label>
                <Input
                  id="maxAlerts"
                  type="number"
                  value={widget.maxAlerts || 10}
                  onChange={(e) => onChange('maxAlerts', parseInt(e.target.value))}
                  className="w-full"
                  min={1}
                  max={100}
                />
              </div>

              <div>
                <label htmlFor="tagId" className="block text-sm font-medium mb-1">Primary Alert Source Tag</label>
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
                  id="showTimestamp"
                  checked={widget.showTimestamp !== false}
                  onChange={(e) => onChange('showTimestamp', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="showTimestamp" className="text-sm font-medium">Show Timestamp</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showDescription"
                  checked={widget.showDescription !== false}
                  onChange={(e) => onChange('showDescription', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="showDescription" className="text-sm font-medium">Show Description</label>
              </div>
            </div>
          </div>

          {/* Filter Tags */}
          <div>
            <Heading level={3} className="text-lg font-medium mb-4">Filter Tags</Heading>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Add Tag Filter</label>
                <Select
                  value="placeholder"
                  onValueChange={handleAddFilterTag}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tag to filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>Select a tag to add</SelectItem>
                    {mockTags
                      .filter(tag => !(widget.filterTags || []).includes(tag.id))
                      .map(tag => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name} {tag.unit ? `(${tag.unit})` : ''}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Only show alerts from these tags
                </p>
              </div>

              {/* List of filter tags */}
              {(widget.filterTags || []).length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-2">Current Filters:</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {(widget.filterTags || []).map(tagId => {
                      const tag = mockTags.find(t => t.id === tagId);
                      return (
                        <div key={tagId} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          <span className="text-sm">{tag?.name || tagId}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFilterTag(tagId)}
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

export default AlertWidgetConfig;