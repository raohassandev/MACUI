import React from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useAppSelector, useAppDispatch } from '../../hooks';
import {
  selectCurrentDashboard,
  selectDashboardEditMode,
  updateLayout,
  toggleDashboardEditMode,
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

  // Add debug logging
  console.log("DashboardGrid: Current dashboard widgets:", currentDashboard.widgets);

  // Make sure widgets array exists and is valid
  const validWidgets = Array.isArray(currentDashboard.widgets) ? currentDashboard.widgets : [];

  if (validWidgets.length === 0) {
    console.warn("No widgets found in dashboard. Widgets array is empty.");
  }

  // Check for invalid or malformed widgets
  for (const widget of validWidgets) {
    if (!widget.id || !widget.type) {
      console.warn("Found invalid widget:", widget);
    }
  }

  // Prepare layouts directly from dashboard data with more defensive coding
  const layouts = {
    lg: validWidgets.map((widget: WidgetType) => {
      // Add debug logging for each widget layout
      console.log(`Creating layout for widget ${widget.id} (${widget.title}):`, {
        x: widget.x || 0,
        y: widget.y || 0,
        w: widget.w || 6,
        h: widget.h || 4,
      });

      return {
        i: widget.id,
        x: widget.x || 0,
        y: widget.y || 0,
        w: widget.w || 6,
        h: widget.h || 4,
        minW: widget.minW || 2,
        minH: widget.minH || 2,
        static: !isEditMode || widget.static === true,
        isDraggable: isEditMode && widget.isDraggable !== false,
        isResizable: isEditMode && widget.isResizable !== false,
      };
    })
  };

  return (
    <div className='dashboard-grid-container overflow-hidden p-0 bg-white dark:bg-gray-900 flex-grow w-full h-full'>
      <div className='dashboard-inner-container w-full h-full'>
        {validWidgets.length > 0 ? (
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
            {validWidgets.map((widget: WidgetType) => (
              <div key={widget.id} className='widget-container' data-grid={{x: widget.x || 0, y: widget.y || 0, w: widget.w || 6, h: widget.h || 4}}>
                <WidgetWrapper widget={widget} />
              </div>
            ))}
          </ResponsiveGridLayout>
        ) : (
          <div className='flex items-center justify-center h-full'>
            <div className='text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg max-w-md'>
              <h3 className='text-lg font-medium mb-2'>No widgets found</h3>
              <p className='text-gray-600 dark:text-gray-400 mb-4'>
                This dashboard is empty. Click the "Add Widget" button in edit mode to create widgets.
              </p>
              {!isEditMode && (
                <button
                  onClick={() => dispatch(toggleDashboardEditMode(true))}
                  className='px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600'
                >
                  Enable Edit Mode
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardGrid;