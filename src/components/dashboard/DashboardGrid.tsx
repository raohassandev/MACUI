import React from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
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
  
  // Only update layout when in edit mode
  const handleLayoutChange = (layout: Layout[]) => {
    if (isEditMode && currentDashboard && layout.length > 0) {
      dispatch(updateLayout(layout));
    }
  };

  if (!currentDashboard) {
    return (
      <div className='flex items-center justify-center h-96'>
        <p className='text-lg text-gray-500'>
          No dashboard selected. Please select or create a dashboard.
        </p>
      </div>
    );
  }

  // Prepare layouts directly from dashboard data
  const layouts = {
    lg: currentDashboard.widgets.map((widget: WidgetType) => ({
      i: widget.id,
      x: widget.x || 0,
      y: widget.y || 0,
      w: widget.w || 6,
      h: widget.h || 4,
      minW: widget.minW || 2,
      minH: widget.minH || 2,
      static: !isEditMode || widget.static,
      isDraggable: isEditMode && widget.isDraggable !== false,
      isResizable: isEditMode && widget.isResizable !== false,
    }))
  };

  return (
    <div className='dashboard-grid-container overflow-hidden p-0 bg-white dark:bg-gray-900 flex-grow w-full h-full'>
      <div className='dashboard-inner-container w-full h-full'>
        <ResponsiveGridLayout
          className='layout'
          layouts={layouts}
          breakpoints={{ lg: 1200 }}
          cols={{ lg: 12 }}
          rowHeight={100}
          margin={[10, 10]}
          containerPadding={[10, 10]}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          onLayoutChange={handleLayoutChange}
          resizeHandles={['se']}
          compactType={null}
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