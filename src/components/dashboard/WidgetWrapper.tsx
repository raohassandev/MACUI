import React from 'react';
import { Widget } from '../../types/dashboard';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppSelector';
import { selectWidget } from '../../redux/slices/widgetSlice';
import { selectDashboardEditMode } from '../../redux/slices/dashboardSlice';
import { ChartWidget } from './widgets/ChartWidget';
import { GaugeWidget } from './widgets/GaugeWidget';
import { NumericWidget } from './widgets/NumericWidget';
import { StatusWidget } from './widgets/StatusWidget';
import { TableWidget } from './widgets/TableWidget';
import { AlertWidget } from './widgets/AlertWidget';

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
        return <ChartWidget widget={widget} />;
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

  return (
    <div 
      className={`widget-wrapper h-full w-full flex flex-col shadow-md rounded-lg overflow-hidden transition-all 
        ${isEditMode ? 'cursor-move' : ''} 
        ${isSelected && isEditMode ? 'ring-2 ring-blue-500' : ''}
        bg-white dark:bg-gray-700`}
      onClick={handleWidgetClick}
    >
      <div className="widget-header px-4 py-2 border-b border-gray-200 dark:border-gray-600 font-medium bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
        <h3 className="text-gray-800 dark:text-gray-200 truncate">{widget.title}</h3>
      </div>
      <div className="widget-body flex-grow p-3 overflow-auto">
        {renderWidget()}
      </div>
    </div>
  );
};

export default WidgetWrapper;