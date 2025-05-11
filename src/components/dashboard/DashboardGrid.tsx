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
  // Handle responsive grid when sidebar changes
  useEffect(() => {
    const handleResize = () => {
      // Force grid layout to recalculate dimensions
      window.dispatchEvent(new Event('resize'));
    };

    // Listen for sidebar state changes
    const storageListener = () => {
      // Wait for transition to complete
      setTimeout(handleResize, 310);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('storage', storageListener);

    // Apply direct DOM modifications to override react-grid-layout's behavior for resizing
    const fixResizeHandles = () => {
      // Find all resize handles and ensure they're visible and working
      const resizeHandles = document.querySelectorAll(
        '.react-resizable-handle'
      );
      resizeHandles.forEach((handle: any) => {
        handle.style.display = 'block';
        handle.style.opacity = '0.8';
        handle.style.zIndex = '10';
      });
    };

    // Run after a slight delay to ensure components are mounted
    setTimeout(fixResizeHandles, 500);
    // Also run after resize to catch any new elements
    window.addEventListener('resize', fixResizeHandles);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('storage', storageListener);
      window.removeEventListener('resize', fixResizeHandles);
    };
  }, []);

  // Handle layout changes from react-grid-layout
  // Use memoization to prevent unnecessary dispatches that can cause infinite loops
  const handleLayoutChange = React.useCallback(
    (layout: any) => {
      // Only dispatch if we're in edit mode and layout is actually different
      if (
        isEditMode &&
        JSON.stringify(currentDashboard?.layout) !== JSON.stringify(layout)
      ) {
        dispatch(updateLayout(layout));
      }
    },
    [dispatch, isEditMode, currentDashboard?.layout]
  );

  // Add handlers for resize events
  const handleResizeStart = React.useCallback(
    (
      _layout: any,
      oldItem: any,
      newItem: any,
      _placeholder: any,
      _e: any,
      _element: any
    ) => {
      // Set a data attribute on the element being resized
      const gridItems = document.querySelectorAll('.react-grid-item');
      gridItems.forEach((item) => {
        const itemId = item.getAttribute('data-grid-key');
        if (itemId === newItem.i) {
          item.setAttribute('data-resizing', 'true');
        }
      });
    },
    []
  );

  const handleResize = React.useCallback(
    (
      _layout: any,
      oldItem: any,
      newItem: any,
      _placeholder: any,
      _e: any,
      _element: HTMLElement
    ) => {
      // Directly set the width for the resize operation
      if (_element) {
        const item = _element.closest('.react-grid-item') as HTMLElement;
        if (item) {
          // We'll use a custom CSS property to store the intended width
          item.style.setProperty(
            '--actual-width',
            `${(newItem.w * 100) / 12}%`
          );
          item.style.setProperty('--cols', String(newItem.w));

          // Force width during resize to avoid transform issues
          if (Math.abs(newItem.w - oldItem.w) > 0) {
            // Direct DOM manipulation for width
            const parentWidth = item.parentElement?.clientWidth || 1200;
            const colWidth = parentWidth / 12;
            // Try to set the width directly
            item.style.width = `${newItem.w * colWidth}px`;
          }
        }
      }
    },
    []
  );

  const handleResizeStop = React.useCallback(
    (
      _layout: any,
      oldItem: any,
      newItem: any,
      _placeholder: any,
      _e: any,
      _element: any
    ) => {
      // Remove the resizing attribute
      const gridItems = document.querySelectorAll('.react-grid-item');
      gridItems.forEach((item) => {
        item.removeAttribute('data-resizing');
      });

      // Force an update to all widgets
      setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
    },
    []
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
      minW: widget.minW || 1, // Minimal width constraint to allow maximum flexibility
      minH: widget.minH || 2, // Ensure widgets have reasonable minimum height
      maxW: widget.maxW || 12, // Default max width is full container width
      maxH: widget.maxH || 12, // Default max height for reasonable limits
      static: !isEditMode || widget.static,
      isDraggable: isEditMode && widget.isDraggable !== false,
      isResizable: isEditMode && widget.isResizable !== false,
    })),
    md: currentDashboard.widgets.map((widget: WidgetType) => ({
      i: widget.id,
      x: widget.x,
      y: widget.y,
      w: Math.min(widget.w, 10), // Allow slightly more width on medium screens
      h: widget.h,
      minW: widget.minW || 1,
      minH: widget.minH || 2,
      maxW: widget.maxW || 10, // Default max width for medium screens
      maxH: widget.maxH || 12, // Default max height for reasonable limits
      static: !isEditMode || widget.static,
      isDraggable: isEditMode && widget.isDraggable !== false,
      isResizable: isEditMode && widget.isResizable !== false,
    })),
    sm: currentDashboard.widgets.map((widget: WidgetType) => ({
      i: widget.id,
      x: 0, // Force single column layout on small screens
      y: widget.y * 2, // Spread vertically
      w: 6, // Full width on small screens
      h: widget.h,
      minW: 1,
      minH: widget.minH || 2,
      maxW: 6, // Limit to full width on small screens
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
          isBounded={false} // Allow widgets to be moved outside bounds for more flexibility
          allowOverlap={false} // Don't allow widgets to overlap
          onLayoutChange={handleLayoutChange}
          onResizeStart={handleResizeStart}
          onResize={handleResize}
          onResizeStop={handleResizeStop}
          useCSSTransforms={true}
          resizeHandles={['se', 'e', 's', 'w', 'ne', 'sw'] as any} // Enable all resize handles including left edge
          // Setting to null disables compacting which can cause issues with resizing
          // Using 'vertical' ensures reliable widget resizing behavior
          compactType='vertical'
          preventCollision={false} // Allow widgets to push others when resizing
          autoSize={true} // Allow content to determine size
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
