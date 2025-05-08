import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { LayoutBuilderProvider } from '@/contexts/LayoutBuilderContext';
import { Row } from '@/components/ui/layout/Row';
import { Column } from '@/components/ui/layout/Column';
import ComponentSidebar from './ComponentSidebar';
import LayoutDropZone from './LayoutDropZone';
import LayoutControls from './LayoutControls';

export const LayoutBuilder: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <LayoutBuilderProvider>
        <div className="relative overflow-visible w-full h-full">
          <Column gap="md" className="h-full w-full overflow-visible">
            {/* Layout Controls */}
            <LayoutControls />
            
            {/* Main Content */}
            <Row gap="md" className="flex-1 w-full overflow-visible">
              {/* Component Sidebar */}
              <div className="w-64 flex-shrink-0">
                <ComponentSidebar />
              </div>
              
              {/* Layout Drop Zone */}
              <div className="flex-1 overflow-visible">
                <LayoutDropZone />
              </div>
            </Row>
          </Column>
        </div>
      </LayoutBuilderProvider>
    </DndProvider>
  );
};

export default LayoutBuilder;