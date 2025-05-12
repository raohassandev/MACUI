import React, { useState } from 'react';
import { TableWidget } from '../../../types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/layout/Card';
import { Input } from '../../ui/inputs/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/inputs/Select';
import { Heading } from '../../ui/text/Heading';
import { mockTags } from '../../../services/api/tag';

interface TableWidgetConfigProps {
  widget: Partial<TableWidget>;
  onChange: (field: string, value: any) => void;
}

const TableWidgetConfig: React.FC<TableWidgetConfigProps> = ({ widget, onChange }) => {
  const [newColumnKey, setNewColumnKey] = useState('');
  const [newColumnLabel, setNewColumnLabel] = useState('');
  const [newColumnWidth, setNewColumnWidth] = useState(100);

  const handleAddColumn = () => {
    if (!newColumnKey.trim()) return;
    
    const newColumns = [...(widget.columns || [])];
    newColumns.push({
      key: newColumnKey,
      label: newColumnLabel || newColumnKey,
      width: newColumnWidth
    });
    
    onChange('columns', newColumns);
    setNewColumnKey('');
    setNewColumnLabel('');
    setNewColumnWidth(100);
  };

  const handleRemoveColumn = (index: number) => {
    const newColumns = [...(widget.columns || [])];
    newColumns.splice(index, 1);
    onChange('columns', newColumns);
  };

  const handleColumnChange = (index: number, field: 'key' | 'label' | 'width' | 'format', value: any) => {
    const newColumns = [...(widget.columns || [])];
    newColumns[index] = {
      ...newColumns[index],
      [field]: value
    };
    onChange('columns', newColumns);
  };

  const handleAddTagId = (tagId: string) => {
    if (!tagId) return;
    
    const currentTagIds = [...(widget.tagIds || [])];
    if (!currentTagIds.includes(tagId)) {
      onChange('tagIds', [...currentTagIds, tagId]);
    }
  };

  const handleRemoveTagId = (tagId: string) => {
    const currentTagIds = [...(widget.tagIds || [])];
    onChange('tagIds', currentTagIds.filter(id => id !== tagId));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Table Widget Configuration</CardTitle>
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
                <label htmlFor="pageSize" className="block text-sm font-medium mb-1">Items Per Page</label>
                <Input
                  id="pageSize"
                  type="number"
                  value={widget.pageSize || 10}
                  onChange={(e) => onChange('pageSize', parseInt(e.target.value))}
                  className="w-full"
                  min={1}
                  max={100}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sortable"
                  checked={widget.sortable !== false}
                  onChange={(e) => onChange('sortable', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="sortable" className="text-sm font-medium">Enable Column Sorting</label>
              </div>

              {widget.sortable !== false && (
                <div>
                  <label htmlFor="defaultSortField" className="block text-sm font-medium mb-1">Default Sort Field</label>
                  <Select
                    value={widget.defaultSortField || ''}
                    onValueChange={(value) => onChange('defaultSortField', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select default sort field" />
                    </SelectTrigger>
                    <SelectContent>
                      {(widget.columns || []).map((column, index) => (
                        <SelectItem key={index} value={column.key}>
                          {column.label || column.key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Data Sources */}
          <div>
            <Heading level={3} className="text-lg font-medium mb-4">Data Sources</Heading>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Add Data Source</label>
                <Select
                  value=""
                  onValueChange={handleAddTagId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tag to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTags
                      .filter(tag => !(widget.tagIds || []).includes(tag.id))
                      .map(tag => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name} {tag.unit ? `(${tag.unit})` : ''}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* List of added tags */}
              {(widget.tagIds || []).length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-2">Added Data Sources:</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(widget.tagIds || []).map(tagId => {
                      const tag = mockTags.find(t => t.id === tagId);
                      return (
                        <div key={tagId} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          <span className="text-sm">{tag?.name || tagId}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTagId(tagId)}
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

          {/* Table Columns */}
          <div>
            <Heading level={3} className="text-lg font-medium mb-4">Table Columns</Heading>
            
            {/* Current columns */}
            {(widget.columns || []).length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Current Columns:</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(widget.columns || []).map((column, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 items-center bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      <div>
                        <label className="text-xs font-medium">Key</label>
                        <Input
                          value={column.key}
                          onChange={(e) => handleColumnChange(index, 'key', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Label</label>
                        <Input
                          value={column.label || ''}
                          onChange={(e) => handleColumnChange(index, 'label', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Width</label>
                        <Input
                          type="number"
                          value={column.width || 100}
                          onChange={(e) => handleColumnChange(index, 'width', parseInt(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-end justify-end h-full">
                        <button
                          type="button"
                          onClick={() => handleRemoveColumn(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Add new column */}
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Add New Column:</p>
              <div className="grid grid-cols-4 gap-2 items-end">
                <div>
                  <label className="text-xs font-medium">Key</label>
                  <Input
                    value={newColumnKey}
                    onChange={(e) => setNewColumnKey(e.target.value)}
                    placeholder="Column key"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Label</label>
                  <Input
                    value={newColumnLabel}
                    onChange={(e) => setNewColumnLabel(e.target.value)}
                    placeholder="Display label"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Width</label>
                  <Input
                    type="number"
                    value={newColumnWidth}
                    onChange={(e) => setNewColumnWidth(parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleAddColumn}
                    className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add Column
                  </button>
                </div>
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

export default TableWidgetConfig;