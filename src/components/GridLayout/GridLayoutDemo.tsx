import { useState } from 'react';
import RGL, { Layout, WidthProvider } from 'react-grid-layout';
import { useTheme } from '@/redux/hooks/useTheme';

// Width provider to handle the responsive behavior
const ReactGridLayout = WidthProvider(RGL);

// Demo component for grid layout
export const GridLayoutDemo = () => {
  const { currentTheme } = useTheme();
  
  // Initial layout configuration
  const [layout, setLayout] = useState<Layout[]>([
    { i: 'a', x: 0, y: 0, w: 2, h: 2 },
    { i: 'b', x: 2, y: 0, w: 2, h: 2 },
    { i: 'c', x: 4, y: 0, w: 2, h: 2 },
    { i: 'd', x: 0, y: 1, w: 6, h: 2 }
  ]);

  // Handle layout changes
  const handleLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout);
  };

  return (
    <div className="p-4 bg-background text-text rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4">Draggable & Resizable Grid Layout</h2>
      <p className="mb-4">Drag items to rearrange, or resize from the corners.</p>
      
      <ReactGridLayout
        className="layout"
        layout={layout}
        cols={6}
        rowHeight={100}
        onLayoutChange={handleLayoutChange}
        isDraggable={true}
        isResizable={true}
        margin={[10, 10]}
      >
        <div key="a" style={{ backgroundColor: currentTheme.colors.primary }} className="rounded-lg flex items-center justify-center text-white">
          A
        </div>
        <div key="b" style={{ backgroundColor: currentTheme.colors.secondary }} className="rounded-lg flex items-center justify-center text-white">
          B
        </div>
        <div key="c" style={{ backgroundColor: currentTheme.colors.accent }} className="rounded-lg flex items-center justify-center text-white">
          C
        </div>
        <div key="d" style={{ backgroundColor: currentTheme.colors.background, border: `1px solid ${currentTheme.colors.primary}` }} className="rounded-lg flex items-center justify-center">
          D
        </div>
      </ReactGridLayout>
      
      <div className="mt-4">
        <p className="text-sm">Current Layout:</p>
        <pre className="mt-2 p-2 bg-background border border-secondary rounded text-sm overflow-auto">
          {JSON.stringify(layout, null, 2)}
        </pre>
      </div>
    </div>
  );
};