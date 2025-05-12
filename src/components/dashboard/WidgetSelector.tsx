import React, { useState } from 'react';
import { Heading } from '../ui/text/Heading';
import { Text } from '../ui/text/Text';
import { Card } from '../ui/layout/Card';
import { Button } from '../ui/navigation/Button';
import { Widget } from '../../types/dashboard';

interface WidgetSelectorProps {
  widgets: Widget[];
  onSelectWidget: (templateId: string) => void;
  selectedWidgetId: string | null;
}

const WidgetSelector: React.FC<WidgetSelectorProps> = ({
  widgets,
  onSelectWidget,
  selectedWidgetId,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Get widget categories from all available widgets
  const getCategories = () => {
    const categories = new Set(['all']);
    
    widgets.forEach(widget => {
      const category = getWidgetCategory(widget.type);
      if (category) {
        categories.add(category);
      }
    });
    
    return Array.from(categories);
  };

  // Get widget category based on widget type
  const getWidgetCategory = (type: string): string => {
    switch (type) {
      case 'chart':
      case 'advanced-chart':
        return 'charts';
      case 'gauge':
      case 'advanced-gauge':
        return 'gauges';
      case 'numeric':
      case 'multi-stat':
        return 'stats';
      case 'status':
      case 'state-timeline':
        return 'status';
      case 'table':
        return 'tables';
      case 'alert':
        return 'alerts';
      case 'heatmap':
        return 'visualizations';
      default:
        return 'others';
    }
  };

  // Filter widgets based on search query and category
  const getFilteredWidgets = () => {
    return widgets.filter(widget => {
      // Apply search filter
      const searchMatch = searchQuery === '' || 
        widget.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        widget.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply category filter
      const categoryMatch = categoryFilter === 'all' || 
        getWidgetCategory(widget.type) === categoryFilter;
      
      return searchMatch && categoryMatch;
    });
  };

  // Get widget type description
  const getWidgetTypeDescription = (type: string): string => {
    switch (type) {
      case 'chart':
        return 'Display time-series data as line, bar, or area charts';
      case 'advanced-chart':
        return 'Advanced chart with annotations, thresholds and multiple series';
      case 'gauge':
        return 'Show values as gauges with thresholds and ranges';
      case 'advanced-gauge':
        return 'Enhanced gauge with animations and multiple display options';
      case 'numeric':
        return 'Display single numeric values with optional formatting';
      case 'status':
        return 'Show status indicators with custom colors and labels';
      case 'table':
        return 'Display data in a tabular format with sortable columns';
      case 'alert':
        return 'Show alerts and notifications with severity levels';
      case 'heatmap':
        return 'Visualize data density with color gradients';
      case 'state-timeline':
        return 'Show state changes over time for multiple entities';
      case 'multi-stat':
        return 'Display multiple statistics with optional sparklines';
      default:
        return 'Widget type';
    }
  };

  // Get widget type icon (placeholder)
  const getWidgetTypeIcon = (type: string): React.ReactNode => {
    const iconColor = 'currentColor';
    
    switch (type) {
      case 'chart':
      case 'advanced-chart':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke={iconColor}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'gauge':
      case 'advanced-gauge':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke={iconColor}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        );
      case 'numeric':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke={iconColor}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        );
      case 'status':
      case 'state-timeline':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke={iconColor}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'table':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke={iconColor}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'alert':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke={iconColor}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'heatmap':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke={iconColor}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
        );
      case 'multi-stat':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke={iconColor}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke={iconColor}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        );
    }
  };

  // Render widgets in grid view
  const renderGridView = () => {
    const filteredWidgets = getFilteredWidgets();
    
    if (filteredWidgets.length === 0) {
      return (
        <div className="w-full p-8 text-center text-gray-500">
          <Text>No widgets match your search criteria.</Text>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWidgets.map(widget => (
          <Card 
            key={widget.id}
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              selectedWidgetId === widget.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => onSelectWidget(widget.id)}
          >
            <div className="p-4 flex flex-col h-full">
              <Heading level={3}>{widget.title}</Heading>
              <Text className="text-gray-500 mt-2 text-sm flex-grow">
                {getWidgetTypeDescription(widget.type)}
              </Text>
              
              {/* Widget Type Icon/Preview */}
              <div className="h-24 flex items-center justify-center mt-4 bg-gray-50 dark:bg-gray-800 rounded">
                {getWidgetTypeIcon(widget.type)}
              </div>
              
              {/* Widget Properties */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between text-xs text-gray-500">
                <span>Type: {widget.type}</span>
                <span>Size: {widget.w || 4}×{widget.h || 3}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // Render widgets in list view
  const renderListView = () => {
    const filteredWidgets = getFilteredWidgets();
    
    if (filteredWidgets.length === 0) {
      return (
        <div className="w-full p-8 text-center text-gray-500">
          <Text>No widgets match your search criteria.</Text>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {filteredWidgets.map(widget => (
          <Card 
            key={widget.id}
            className={`cursor-pointer hover:shadow-lg transition-shadow ${
              selectedWidgetId === widget.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => onSelectWidget(widget.id)}
          >
            <div className="p-3 flex items-center">
              <div className="h-12 w-12 flex items-center justify-center mr-4 bg-gray-50 dark:bg-gray-800 rounded">
                {getWidgetTypeIcon(widget.type)}
              </div>
              
              <div className="flex-grow">
                <Heading level={4}>{widget.title}</Heading>
                <Text className="text-gray-500 text-sm">
                  {getWidgetTypeDescription(widget.type)}
                </Text>
              </div>
              
              <div className="ml-4 text-right text-sm text-gray-500">
                <div>Type: {widget.type}</div>
                <div>Size: {widget.w || 4}×{widget.h || 3}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <Heading level={2}>Select Widget Type</Heading>
        <Text className="text-gray-500">
          Choose the type of widget you want to add to your dashboard
        </Text>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex flex-1 max-w-md">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 placeholder-gray-400 text-sm"
              placeholder="Search widgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex">
          <div className="relative z-10 mr-2">
            <select
              className="block w-40 py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md shadow-sm focus:outline-none text-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {getCategories().map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-300 rounded-l-md 
                ${viewMode === 'grid'
                  ? 'bg-gray-100 dark:bg-gray-700'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                } border`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-300 rounded-r-md 
                ${viewMode === 'list'
                  ? 'bg-gray-100 dark:bg-gray-700'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                } border`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Render widgets based on view mode */}
      {viewMode === 'grid' ? renderGridView() : renderListView()}
    </div>
  );
};

export default WidgetSelector;