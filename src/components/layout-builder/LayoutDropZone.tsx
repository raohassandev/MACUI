import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { ComponentType, useLayoutBuilder } from '@/contexts/LayoutBuilderContext';
import { DraggableComponent } from './DraggableComponent';
import { Card, CardContent } from '@/components/ui/layout/Card';

export const LayoutDropZone: React.FC = () => {
  const { state, addComponent } = useLayoutBuilder();
  const { currentLayout } = state;
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Set up drop handling for new components from the sidebar
  const [{ isOver }, drop] = useDrop({
    accept: ['COMPONENT', 'LAYOUT_COMPONENT'],
    drop: (item: any, monitor) => {
      if (!dropZoneRef.current) return;

      // Get drop zone position
      const dropZoneRect = dropZoneRef.current.getBoundingClientRect();
      
      // Get drop position relative to the drop zone
      const clientOffset = monitor.getClientOffset();
      
      if (clientOffset) {
        const x = clientOffset.x - dropZoneRect.left;
        const y = clientOffset.y - dropZoneRect.top;
        
        // Check if this is a new component or moving an existing one
        if (item.type && !item.id) {
          // It's a new component from the sidebar
          addComponent(item.type as ComponentType, x, y);
        }
      }
      
      return undefined;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Connect the drop ref
  drop(dropZoneRef);

  return (
    <Card 
      className={`w-full h-full relative overflow-hidden transition-colors ${isOver ? 'border-primary border-dashed' : ''}`}
    >
      <CardContent className="h-full p-0">
        <div 
          ref={dropZoneRef}
          className="w-full h-full relative min-h-[500px]"
          style={{ background: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23f0f0f0\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 0h20v20H0V0zm20 20h20v20H20V20z\'/%3E%3C/g%3E%3C/svg%3E")' }}
        >
          {!currentLayout && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="mb-2">Create or select a layout to start building</p>
                <p className="text-sm">Drag components from the sidebar onto this area</p>
              </div>
            </div>
          )}
          
          {currentLayout && currentLayout.components.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="mb-2">Drag components from the sidebar to start building</p>
                <p className="text-sm">This layout is currently empty</p>
              </div>
            </div>
          )}
          
          {/* Render all components in the current layout */}
          {currentLayout && currentLayout.components.map((component) => (
            <DraggableComponent key={component.id} component={component} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LayoutDropZone;