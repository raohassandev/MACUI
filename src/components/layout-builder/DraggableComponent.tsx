import React from 'react';
import { ComponentPosition, useLayoutBuilder } from '../../contexts/LayoutBuilderContext';
import { Card } from '../ui/layout/Card';
import { Button } from '../ui/navigation/Button';
import { Heading } from '../ui/text/Heading';
import { Text } from '../ui/text/Text';
import { Input } from '../ui/inputs/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/inputs/Select';

interface DraggableComponentProps {
  component: ComponentPosition;
}

// Helper function to render the appropriate component based on type
const renderComponent = (component: ComponentPosition) => {
  const { type, props = {} } = component;

  switch (type) {
    case 'card':
      return (
        <Card className="w-full h-full p-4" border>
          {props.title && <div className="font-semibold mb-2">{props.title}</div>}
          {props.content && <div>{props.content}</div>}
        </Card>
      );
    case 'button':
      return (
        <Button variant={props.variant || 'default'} size={props.size || 'default'}>
          {props.label || 'Button'}
        </Button>
      );
    case 'text':
      return <Text>{props.content || 'Text content'}</Text>;
    case 'input':
      return (
        <Input 
          placeholder={props.placeholder || 'Enter text'} 
          label={props.label} 
          variant={props.variant || 'default'}
        />
      );
    case 'select':
      return (
        <Select defaultValue={props.defaultValue || ''}>
          <SelectTrigger label={props.label || 'Select'}>
            <SelectValue placeholder={props.placeholder || 'Select an option'} />
          </SelectTrigger>
          <SelectContent>
            {(props.options || [{ value: 'option1', label: 'Option 1' }]).map((option: any) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case 'image':
      return (
        <div className="w-full h-full flex items-center justify-center bg-muted/30">
          {props.src ? (
            <img 
              src={props.src} 
              alt={props.alt || 'Image'} 
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="text-muted">Image Placeholder</div>
          )}
        </div>
      );
    case 'heading':
      return (
        <Heading level={props.level || 2}>
          {props.content || 'Heading'}
        </Heading>
      );
    case 'divider':
      return <div className="w-full h-px bg-border my-4" />;
    default:
      return <div>Unknown component type</div>;
  }
};

export const DraggableComponent: React.FC<DraggableComponentProps> = ({ component }) => {
  const { selectComponent, removeComponent } = useLayoutBuilder();
  const { state } = useLayoutBuilder();
  const { selectedComponent } = state;

  // Handle component selection
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectComponent(component.id);
  };

  // Handle component deletion
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeComponent(component.id);
  };

  return (
    <div
      className={`absolute ${selectedComponent === component.id ? 'ring-2 ring-primary' : ''}`}
      style={{
        left: `${component.x}px`,
        top: `${component.y}px`,
        width: `${component.width}px`,
        height: `${component.height}px`,
      }}
      onClick={handleSelect}
    >
      {/* Component controls (only visible when selected) */}
      {selectedComponent === component.id && (
        <div className="absolute -top-8 right-0 flex space-x-1 bg-background p-1 rounded shadow-sm z-10">
          <Button size="sm" variant="destructive" onClick={handleDelete}>
            Remove
          </Button>
        </div>
      )}

      {/* Render the actual component */}
      <div className="w-full h-full">
        {renderComponent(component)}
      </div>
    </div>
  );
};

export default DraggableComponent;