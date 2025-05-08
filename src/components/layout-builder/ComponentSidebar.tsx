import React from 'react';
import { useDrag } from 'react-dnd';
import { ComponentType, useLayoutBuilder } from '@/contexts/LayoutBuilderContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/layout/Card';
import { Column } from '@/components/ui/layout/Column';

// Component item that can be dragged from the sidebar
interface ComponentItemProps {
  type: ComponentType;
  label: string;
  icon: string;
}

const ComponentItem: React.FC<ComponentItemProps> = ({ type, label, icon }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`p-2 mb-2 bg-background border border-border rounded cursor-move flex items-center gap-2 ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <span className="text-lg" role="img" aria-label={label}>
        {icon}
      </span>
      <span>{label}</span>
    </div>
  );
};

// Component sidebar containing draggable component items
export const ComponentSidebar: React.FC = () => {
  const { state } = useLayoutBuilder();
  const { components } = state;

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Components</CardTitle>
      </CardHeader>
      <CardContent>
        <Column gap="sm">
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop components to the layout area
          </p>

          <div className="component-list overflow-y-auto max-h-[400px]">
            {components.map((component) => (
              <ComponentItem
                key={component.type}
                type={component.type}
                label={component.label}
                icon={component.icon}
              />
            ))}
          </div>
        </Column>
      </CardContent>
    </Card>
  );
};

export default ComponentSidebar;