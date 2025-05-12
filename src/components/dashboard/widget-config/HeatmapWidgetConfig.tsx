import React from 'react';
import { HeatmapWidget } from '../../../types/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/layout/Card';
import { Input } from '../../ui/inputs/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/inputs/Select';
import { Heading } from '../../ui/text/Heading';
import { mockTags } from '../../../services/api/tag';

interface HeatmapWidgetConfigProps {
  widget: Partial<HeatmapWidget>;
  onChange: (field: string, value: any) => void;
}

const HeatmapWidgetConfig: React.FC<HeatmapWidgetConfigProps> = ({ widget, onChange }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Heatmap Widget Configuration</CardTitle>
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

          {/* Heatmap Settings */}
          <div>
            <Heading level={3} className="text-lg font-medium mb-4">Heatmap Settings</Heading>
            <div className="space-y-3">
              <div>
                <label htmlFor="gridSize" className="block text-sm font-medium mb-1">Grid Size</label>
                <Input
                  id="gridSize"
                  type="number"
                  value={widget.gridSize || 10}
                  onChange={(e) => onChange('gridSize', parseInt(e.target.value))}
                  className="w-full"
                  min={5}
                  max={30}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of cells in each dimension (higher values create more detailed heatmaps)
                </p>
              </div>

              <div>
                <label htmlFor="patternType" className="block text-sm font-medium mb-1">Pattern Type</label>
                <Select
                  value={widget.patternType || 'radial'}
                  onValueChange={(value) => onChange('patternType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pattern type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="radial">Radial Pattern</SelectItem>
                    <SelectItem value="gradient">Gradient Pattern</SelectItem>
                    <SelectItem value="hotspots">Hotspots Pattern</SelectItem>
                    <SelectItem value="random">Random Pattern</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  The type of pattern to generate for the heatmap visualization
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
                <label htmlFor="showLegend" className="text-sm font-medium">Show Color Legend</label>
              </div>
            </div>
          </div>

          {/* Color Settings */}
          <div>
            <Heading level={3} className="text-lg font-medium mb-4">Color Settings</Heading>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="minColor" className="block text-sm font-medium mb-1">Minimum Color</label>
                  <div className="flex space-x-2">
                    <Input
                      id="minColor"
                      type="color"
                      value={widget.colorScheme?.minColor || '#3b82f6'}
                      onChange={(e) => onChange('colorScheme', { 
                        ...widget.colorScheme,
                        minColor: e.target.value 
                      })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={widget.colorScheme?.minColor || '#3b82f6'}
                      onChange={(e) => onChange('colorScheme', { 
                        ...widget.colorScheme,
                        minColor: e.target.value 
                      })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="midColor" className="block text-sm font-medium mb-1">Middle Color</label>
                  <div className="flex space-x-2">
                    <Input
                      id="midColor"
                      type="color"
                      value={widget.colorScheme?.midColor || '#a855f7'}
                      onChange={(e) => onChange('colorScheme', { 
                        ...widget.colorScheme,
                        midColor: e.target.value 
                      })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={widget.colorScheme?.midColor || '#a855f7'}
                      onChange={(e) => onChange('colorScheme', { 
                        ...widget.colorScheme,
                        midColor: e.target.value 
                      })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="maxColor" className="block text-sm font-medium mb-1">Maximum Color</label>
                  <div className="flex space-x-2">
                    <Input
                      id="maxColor"
                      type="color"
                      value={widget.colorScheme?.maxColor || '#ef4444'}
                      onChange={(e) => onChange('colorScheme', { 
                        ...widget.colorScheme,
                        maxColor: e.target.value 
                      })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={widget.colorScheme?.maxColor || '#ef4444'}
                      onChange={(e) => onChange('colorScheme', { 
                        ...widget.colorScheme,
                        maxColor: e.target.value 
                      })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Color gradient preview */}
              <div className="mt-2">
                <label className="block text-sm font-medium mb-1">Color Gradient Preview</label>
                <div className="h-6 w-full rounded overflow-hidden flex">
                  {Array.from({ length: 20 }).map((_, index) => (
                    <div 
                      key={index} 
                      className="flex-1 h-full" 
                      style={{ 
                        backgroundColor: index < 10 
                          ? blendColors(
                              widget.colorScheme?.minColor || '#3b82f6', 
                              widget.colorScheme?.midColor || '#a855f7', 
                              index / 9
                            )
                          : blendColors(
                              widget.colorScheme?.midColor || '#a855f7', 
                              widget.colorScheme?.maxColor || '#ef4444', 
                              (index - 10) / 9
                            )
                      }}
                    />
                  ))}
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

// Helper function to blend colors
const blendColors = (colorA: string, colorB: string, ratio: number): string => {
  const hexToRgb = (hex: string): number[] => {
    hex = hex.replace('#', '');
    return [
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16),
    ];
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b]
      .map(x => Math.round(x).toString(16).padStart(2, '0'))
      .join('');
  };

  const rgbA = hexToRgb(colorA);
  const rgbB = hexToRgb(colorB);

  const r = rgbA[0] + (rgbB[0] - rgbA[0]) * ratio;
  const g = rgbA[1] + (rgbB[1] - rgbA[1]) * ratio;
  const b = rgbA[2] + (rgbB[2] - rgbA[2]) * ratio;

  return rgbToHex(r, g, b);
};

export default HeatmapWidgetConfig;