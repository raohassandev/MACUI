import React, { useState } from 'react';
import { ReferenceLine, ReferenceArea, Label } from 'recharts';

export interface Annotation {
  id: string;
  type: 'line' | 'area' | 'point';
  timestamp?: number;      // For line and point annotations
  startTime?: number;      // For area annotations
  endTime?: number;        // For area annotations
  value?: number;          // Optional y-value for horizontal or point annotations
  label?: string;          // Text label
  color?: string;          // Color of the annotation
  opacity?: number;        // Opacity for areas
  description?: string;    // Longer description for tooltips
  category?: string;       // e.g., 'Maintenance', 'Alert', 'Event'
}

interface ChartAnnotationsProps {
  annotations: Annotation[];
  onAnnotationClick?: (annotation: Annotation) => void;
  showLabels?: boolean;
}

const ChartAnnotations: React.FC<ChartAnnotationsProps> = ({
  annotations,
  onAnnotationClick,
  showLabels = true,
}) => {
  // Handle click on annotation
  const handleClick = (annotation: Annotation) => {
    if (onAnnotationClick) {
      onAnnotationClick(annotation);
    }
  };
  
  // Render different types of annotations
  return (
    <>
      {annotations.map(annotation => {
        const key = annotation.id;
        const color = annotation.color || '#f59e0b';
        
        if (annotation.type === 'line') {
          // Line annotations (vertical lines at specific timestamps)
          return (
            <ReferenceLine
              key={key}
              x={annotation.timestamp}
              stroke={color}
              strokeDasharray="3 3"
              strokeWidth={2}
              onClick={() => handleClick(annotation)}
              style={{ cursor: 'pointer' }}
            >
              {showLabels && annotation.label && (
                <Label 
                  value={annotation.label} 
                  position="insideTopRight"
                  fill={color}
                  fontSize={12}
                />
              )}
            </ReferenceLine>
          );
        } else if (annotation.type === 'area') {
          // Area annotations (highlighted time regions)
          return (
            <ReferenceArea
              key={key}
              x1={annotation.startTime}
              x2={annotation.endTime}
              fill={color}
              fillOpacity={annotation.opacity || 0.2}
              stroke={color}
              strokeOpacity={0.5}
              onClick={() => handleClick(annotation)}
              style={{ cursor: 'pointer' }}
            >
              {showLabels && annotation.label && (
                <Label 
                  value={annotation.label} 
                  position="insideTop"
                  fill={color}
                  fontSize={12}
                />
              )}
            </ReferenceArea>
          );
        }
        
        // Default case or unknown type
        return null;
      })}
    </>
  );
};

// AnnotationTooltip component for displaying details
export const AnnotationTooltip: React.FC<{ annotation: Annotation | null }> = ({ annotation }) => {
  if (!annotation) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-w-xs">
      <div className="flex items-center mb-2">
        <div 
          className="w-3 h-3 rounded-full mr-2"
          style={{ backgroundColor: annotation.color || '#f59e0b' }}
        ></div>
        <div className="font-medium">{annotation.label || 'Annotation'}</div>
        {annotation.category && (
          <div className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded ml-2">
            {annotation.category}
          </div>
        )}
      </div>
      
      {annotation.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{annotation.description}</p>
      )}
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {annotation.type === 'line' && annotation.timestamp && (
          <p>Time: {new Date(annotation.timestamp).toLocaleString()}</p>
        )}
        
        {annotation.type === 'area' && annotation.startTime && annotation.endTime && (
          <>
            <p>Start: {new Date(annotation.startTime).toLocaleString()}</p>
            <p>End: {new Date(annotation.endTime).toLocaleString()}</p>
            <p>Duration: {formatDuration(annotation.endTime - annotation.startTime)}</p>
          </>
        )}
      </div>
    </div>
  );
};

// Helper function to format duration
const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

// AnnotationEditor component for creating/editing annotations
export const AnnotationEditor: React.FC<{
  annotation: Annotation;
  onChange: (annotation: Annotation) => void;
  onSave: () => void;
  onCancel: () => void;
}> = ({
  annotation,
  onChange,
  onSave,
  onCancel,
}) => {
  const [localAnnotation, setLocalAnnotation] = useState<Annotation>(annotation);
  
  const handleChange = (field: string, value: any) => {
    setLocalAnnotation(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleSave = () => {
    onChange(localAnnotation);
    onSave();
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium mb-4">
        {annotation.id ? 'Edit Annotation' : 'Create Annotation'}
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Annotation Type</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-700 rounded-md"
            value={localAnnotation.type}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <option value="line">Vertical Line</option>
            <option value="area">Time Range</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Label</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-700 rounded-md"
            value={localAnnotation.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder="Brief label for the annotation"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              className="w-10 h-10 p-1 border border-gray-300 dark:border-gray-700 rounded"
              value={localAnnotation.color || '#f59e0b'}
              onChange={(e) => handleChange('color', e.target.value)}
            />
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-700 rounded-md"
              value={localAnnotation.color || '#f59e0b'}
              onChange={(e) => handleChange('color', e.target.value)}
              placeholder="HEX color code"
            />
          </div>
        </div>
        
        {localAnnotation.type === 'line' && (
          <div>
            <label className="block text-sm font-medium mb-1">Timestamp</label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-700 rounded-md"
              value={localAnnotation.timestamp ? new Date(localAnnotation.timestamp).toISOString().slice(0, 16) : ''}
              onChange={(e) => handleChange('timestamp', new Date(e.target.value).getTime())}
            />
          </div>
        )}
        
        {localAnnotation.type === 'area' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-700 rounded-md"
                value={localAnnotation.startTime ? new Date(localAnnotation.startTime).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleChange('startTime', new Date(e.target.value).getTime())}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-700 rounded-md"
                value={localAnnotation.endTime ? new Date(localAnnotation.endTime).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleChange('endTime', new Date(e.target.value).getTime())}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Opacity ({localAnnotation.opacity || 0.2})</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                className="w-full"
                value={localAnnotation.opacity || 0.2}
                onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
              />
            </div>
          </>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-700 rounded-md"
            value={localAnnotation.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            <option value="">No Category</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Alert">Alert</option>
            <option value="Event">Event</option>
            <option value="Note">Note</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-700 rounded-md"
            value={localAnnotation.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            placeholder="Additional details about this annotation"
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <button
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartAnnotations;