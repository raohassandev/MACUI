import React from 'react';
import { Widget } from '../../types/dashboard';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectWidget } from '../../redux/slices/widgetSlice';
import { selectDashboardEditMode } from '../../redux/slices/dashboardSlice';
import { GaugeWidget } from './widgets/GaugeWidget';
import { NumericWidget } from './widgets/NumericWidget';
import { StatusWidget } from './widgets/StatusWidget';
import { TableWidget } from './widgets/TableWidget';
import { AlertWidget } from './widgets/AlertWidget';
import SimpleChartWidget from './widgets/SimpleChartWidget';

interface WidgetWrapperProps {
  widget: Widget;
}

const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ widget }) => {
  const dispatch = useAppDispatch();
  const isEditMode = useAppSelector(selectDashboardEditMode);
  const selectedWidgetId = useAppSelector(state => state.widget.selectedWidgetId);

  const handleWidgetClick = () => {
    if (isEditMode) {
      dispatch(selectWidget(widget.id));
    }
  };

  // Determine widget component based on type
  const renderWidget = () => {
    switch (widget.type) {
      case 'chart':
        return <SimpleChartWidget widget={widget} />;
      case 'gauge':
        return <GaugeWidget widget={widget} />;
      case 'numeric':
        return <NumericWidget widget={widget} />;
      case 'status':
        return <StatusWidget widget={widget} />;
      case 'table':
        return <TableWidget widget={widget} />;
      case 'alert':
        return <AlertWidget widget={widget} />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  const isSelected = selectedWidgetId === widget.id;

  // Add data with JSON.stringify for debug info
  const debugInfo = {
    id: widget.id,
    type: widget.type,
    w: widget.w,
    h: widget.h,
    isEditMode,
    isSelected
  };

  // Log this to console
  React.useEffect(() => {
    console.log("Widget wrapper props:", debugInfo);

    // Force update CSS custom properties to match current dimensions
    const widgetElements = document.querySelectorAll(`.react-grid-item`);
    widgetElements.forEach(el => {
      const itemId = el.getAttribute('data-grid-key');
      if (itemId === widget.id) {
        // Set actual width and height as CSS variables
        (el as HTMLElement).style.setProperty('--actual-width', `${el.clientWidth}px`);
        (el as HTMLElement).style.setProperty('--actual-height', `${el.clientHeight}px`);
        (el as HTMLElement).style.setProperty('--cols', String(widget.w));
        console.log(`Set actual dimensions for ${widget.id}:`, {
          width: `${el.clientWidth}px`,
          height: `${el.clientHeight}px`,
          cols: widget.w
        });
      }
    });
  }, [JSON.stringify(debugInfo)]);

  return (
    <div
      className={`widget-wrapper h-full w-full flex flex-col shadow-md rounded-lg overflow-hidden transition-all
        ${isEditMode ? 'cursor-move resizable-widget' : ''}
        ${isSelected && isEditMode ? 'ring-2 ring-blue-500' : ''}
        bg-white dark:bg-gray-700 relative`}
      onClick={handleWidgetClick}
      style={{
        "--cols": widget.w,
        "--margin": "6px",
        "--resizable": isEditMode ? "all" : "none"
      } as React.CSSProperties}
      data-debug={JSON.stringify(debugInfo)}
    >
      <div className="widget-header px-4 py-2 border-b border-gray-200 dark:border-gray-600 font-medium bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
        <h3 className="text-gray-800 dark:text-gray-200 truncate">{widget.title}</h3>
        {isEditMode && (
          <span className="text-xs text-gray-500 bg-gray-100 px-1 rounded">
            {widget.w}x{widget.h}
          </span>
        )}
      </div>
      <div className="widget-body flex-grow p-3 overflow-auto min-h-[100px]">
        {renderWidget()}
      </div>
      {/* Remove custom resize handle to use the ones from react-grid-layout */}
    </div>
  );
};

export default WidgetWrapper;