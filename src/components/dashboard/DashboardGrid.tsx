import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectCurrentDashboard, selectDashboardEditMode, updateLayout } from '../../redux/slices/dashboardSlice';
import { Widget as WidgetType } from '../../types/dashboard';
import WidgetWrapper from './WidgetWrapper';

// Apply width provider HOC to make grid responsive
const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardGrid: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentDashboard = useAppSelector(selectCurrentDashboard);
  const isEditMode = useAppSelector(selectDashboardEditMode);

  // Handle layout changes from react-grid-layout
  const handleLayoutChange = (layout: any) => {
    dispatch(updateLayout(layout));
  };

  if (!currentDashboard) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-lg text-gray-500">No dashboard selected. Please select or create a dashboard.</p>
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
      minW: widget.minW || 3, // Ensure widgets have reasonable minimum width
      minH: widget.minH || 2, // Ensure widgets have reasonable minimum height
      maxW: widget.maxW,
      maxH: widget.maxH,
      static: !isEditMode || widget.static,
    })),
    md: currentDashboard.widgets.map((widget: WidgetType) => ({
      i: widget.id,
      x: widget.x,
      y: widget.y,
      w: Math.min(widget.w, 8), // Limit width on medium screens
      h: widget.h,
      minW: widget.minW || 3,
      minH: widget.minH || 2,
      static: !isEditMode || widget.static,
    })),
    sm: currentDashboard.widgets.map((widget: WidgetType) => ({
      i: widget.id,
      x: 0, // Force single column layout on small screens
      y: widget.y * 2, // Spread vertically
      w: 6, // Full width on small screens
      h: widget.h,
      minW: 3,
      minH: widget.minH || 2,
      static: !isEditMode || widget.static,
    })),
  };

  return (
    <div className="dashboard-grid-container overflow-auto p-4 bg-gray-100 dark:bg-gray-800 flex-grow">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        margin={[16, 16]}
        containerPadding={[16, 16]}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        onLayoutChange={handleLayoutChange}
        useCSSTransforms={true}
        resizeHandles={['se']} // Ensure resize handles are visible
        compactType="vertical" // Improve vertical compacting
        preventCollision={false} // Allow widgets to push others when resizing
      >
        {currentDashboard.widgets.map((widget: WidgetType) => (
          <div key={widget.id} className="widget-container">
            <WidgetWrapper widget={widget} />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default DashboardGrid;