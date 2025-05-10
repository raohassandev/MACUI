import React from 'react';
import { ComponentType, useLayoutBuilder } from '../../contexts/LayoutBuilderContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/layout/Card';
import { Column } from '../ui/layout/Column';
import { Button } from '../ui/navigation/Button';

// Component item that can be selected from the sidebar
interface ComponentItemProps {
  type: ComponentType;
  label: string;
  icon: string;
  onSelect: (type: ComponentType) => void;
}

const ComponentItem: React.FC<ComponentItemProps> = ({ type, label, icon, onSelect }) => {
  return (
    <div
      className="p-2 mb-2 bg-background border border-border rounded flex items-center gap-2 cursor-pointer hover:bg-muted/20"
      onClick={() => onSelect(type)}
    >
      <span className="text-lg" role="img" aria-label={label}>
        {icon}
      </span>
      <span>{label}</span>
    </div>
  );
};

// Component sidebar containing component items
export const ComponentSidebar: React.FC = () => {
  const { state, addComponent } = useLayoutBuilder();
  const { components } = state;

  // Handle component selection
  const handleSelectComponent = (type: ComponentType) => {
    // Add to center of layout area by default
    addComponent(type, 100, 100);
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Components</CardTitle>
      </CardHeader>
      <CardContent>
        <Column gap="sm">
          <p className="text-sm text-muted-foreground mb-2">
            Select components to add to the layout
          </p>

          <div className="component-list overflow-y-auto max-h-[400px]">
            {components.map((component) => (
              <ComponentItem
                key={component.type}
                type={component.type}
                label={component.label}
                icon={component.icon}
                onSelect={handleSelectComponent}
              />
            ))}
          </div>
        </Column>
      </CardContent>
    </Card>
  );
};

export default ComponentSidebar;