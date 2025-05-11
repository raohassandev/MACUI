import React, { useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useAppSelector, useAppDispatch } from '../../hooks';
import {
  selectCurrentDashboard,
  selectDashboardEditMode,
  updateLayout,
} from '../../redux/slices/dashboardSlice';
import { Widget as WidgetType } from '../../types/dashboard';
import WidgetWrapper from './WidgetWrapper';

// Apply width provider HOC to make grid responsive
const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardGrid: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentDashboard = useAppSelector(selectCurrentDashboard);
  const isEditMode = useAppSelector(selectDashboardEditMode);
  
  // Handle layout changes
  const handleLayoutChange = React.useCallback(
    (layout: any) => {
      if (
        isEditMode &&
        JSON.stringify(currentDashboard?.layout) !== JSON.stringify(layout)
      ) {
        dispatch(updateLayout(layout));
      }
    },
    [dispatch, isEditMode, currentDashboard?.layout]
  );

  if (!currentDashboard) {
    return (
      <div className='flex items-center justify-center h-96'>
        <p className='text-lg text-gray-500'>
          No dashboard selected. Please select or create a dashboard.
        </p>
      </div>
    );
  }

  // Prepare layout for react-grid-layout
  const layouts = {
    lg: currentDashboard.widgets.map((widget: WidgetType) => ({
      i: widget.id,
      x: widget.x,
      y: widget.y,
      w: widget.w,
      h: widget.h,
      minW: widget.minW || 1,
      minH: widget.minH || 2,
      maxW: widget.maxW || 12,
      maxH: widget.maxH || 12,
      static: !isEditMode || widget.static,
      isDraggable: isEditMode && widget.isDraggable !== false,
      isResizable: isEditMode && widget.isResizable !== false,
    })),
    md: currentDashboard.widgets.map((widget: WidgetType) => ({
      i: widget.id,
      x: widget.x,
      y: widget.y,
      w: Math.min(widget.w, 10),
      h: widget.h,
      minW: widget.minW || 1,
      minH: widget.minH || 2,
      maxW: widget.maxW || 10,
      maxH: widget.maxH || 12,
      static: !isEditMode || widget.static,
      isDraggable: isEditMode && widget.isDraggable !== false,
      isResizable: isEditMode && widget.isResizable !== false,
    })),
    sm: currentDashboard.widgets.map((widget: WidgetType) => ({
      i: widget.id,
      x: 0,
      y: widget.y * 2,
      w: 6,
      h: widget.h,
      minW: 1,
      minH: widget.minH || 2,
      maxW: 6,
      maxH: widget.maxH || 12,
      static: !isEditMode || widget.static,
      isDraggable: isEditMode && widget.isDraggable !== false,
      isResizable: isEditMode && widget.isResizable !== false,
    })),
  };

  return (
    <div className='dashboard-grid-container overflow-hidden p-0 bg-white dark:bg-gray-900 flex-grow w-full h-full'>
      <div className='dashboard-inner-container w-full h-full'>
        <ResponsiveGridLayout
          className='layout'
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          margin={[6, 6]}
          containerPadding={[4, 4]}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          isBounded={false}
          allowOverlap={false}
          onLayoutChange={handleLayoutChange}
          resizeHandles={['se', 'e', 's', 'w', 'ne', 'sw'] as any}
          compactType={null} // This is the key setting that fixes resizing
          preventCollision={false}
          autoSize={true}
          transform={(a,b) => {return { x: a, y: b }}} // Prevent transforms during resize
          useCSSTransforms={false} // Disable CSS transforms
        >
          {currentDashboard.widgets.map((widget: WidgetType) => (
            <div key={widget.id} className='widget-container'>
              <WidgetWrapper widget={widget} />
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
};

export default DashboardGrid;