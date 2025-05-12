import React, { useState } from 'react';
import { Widget } from '../../types/dashboard';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { selectWidget } from '../../redux/slices/widgetSlice';
import { selectDashboardEditMode, removeWidget } from '../../redux/slices/dashboardSlice';
import { GaugeWidget } from './widgets/GaugeWidget';
import { NumericWidget } from './widgets/NumericWidget';
import { StatusWidget } from './widgets/StatusWidget';
import { TableWidget } from './widgets/TableWidget';
import { AlertWidget } from './widgets/AlertWidget';
import SimpleChartWidget from './widgets/SimpleChartWidget';
import HeatmapWidget from './widgets/HeatmapWidget';
import StateTimelineWidget from './widgets/StateTimelineWidget';
import MultiStatWidget from './widgets/MultiStatWidget';
import AdvancedGaugeWidget from './widgets/AdvancedGaugeWidget';
import AdvancedChartWidget from './widgets/AdvancedChartWidget';

interface WidgetWrapperProps {
  widget: Widget;
}

const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ widget }) => {
  const dispatch = useAppDispatch();
  const isEditMode = useAppSelector(selectDashboardEditMode);
  const selectedWidgetId = useAppSelector(state => state.widget.selectedWidgetId);
  const [isHovered, setIsHovered] = useState(false);

  const handleWidgetClick = () => {
    if (isEditMode) {
      // If widget is already selected, clicking again will deselect it
      if (selectedWidgetId === widget.id) {
        dispatch(selectWidget(null));
      } else {
        dispatch(selectWidget(widget.id));
      }
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(selectWidget(widget.id));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(removeWidget(widget.id));
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
      case 'heatmap':
        return <HeatmapWidget widget={widget} />;
      case 'state-timeline':
        return <StateTimelineWidget widget={widget} />;
      case 'multi-stat':
        return <MultiStatWidget widget={widget} />;
      case 'advanced-gauge':
        return <AdvancedGaugeWidget widget={widget} />;
      case 'advanced-chart':
        return <AdvancedChartWidget widget={widget} />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  const isSelected = selectedWidgetId === widget.id;

  return (
    <div
      className={`widget-wrapper h-full w-full flex flex-col shadow-md rounded-lg overflow-hidden transition-all
        ${isEditMode ? 'cursor-move resizable-widget' : ''}
        ${isSelected && isEditMode ? 'ring-2 ring-blue-500' : ''}
        bg-white dark:bg-gray-700 relative`}
      onClick={handleWidgetClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-widget-id={widget.id}
    >
      {/* Edit/Delete buttons (only visible on hover in edit mode) */}
      {isEditMode && isHovered && (
        <div className="absolute top-2 right-2 z-10 flex space-x-1">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded shadow-sm"
            onClick={handleEdit}
            title="Edit Widget"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white p-1 rounded shadow-sm"
            onClick={handleDelete}
            title="Delete Widget"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}

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
    </div>
  );
};

export default WidgetWrapper;