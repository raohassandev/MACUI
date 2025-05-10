import React from 'react';
import { useLayoutBuilder } from '@/contexts/LayoutBuilderContext';
import { DraggableComponent } from './DraggableComponent';
import { Card, CardContent } from '@/components/ui/layout/Card';

export const LayoutDropZone: React.FC = () => {
  const { state } = useLayoutBuilder();
  const { currentLayout } = state;

  return (
    <Card className="w-full h-full relative overflow-hidden">
      <CardContent className="h-full p-0">
        <div 
          className="w-full h-full relative min-h-[500px]"
          style={{ background: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23f0f0f0\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 0h20v20H0V0zm20 20h20v20H20V20z\'/%3E%3C/g%3E%3C/svg%3E")' }}
        >
          {!currentLayout && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="mb-2">Create or select a layout to start building</p>
                <p className="text-sm">Click on components in the sidebar to add them</p>
              </div>
            </div>
          )}
          
          {currentLayout && currentLayout.components.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="mb-2">Click on components in the sidebar to add them</p>
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