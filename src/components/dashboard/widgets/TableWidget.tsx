import React, { useState, useEffect } from 'react';
import { TableWidget as TableWidgetType } from '../../../types/dashboard';
import { fetchTagById } from '../../../services/api/tag';
import { mockTags } from '../../../services/api/tag';

interface TableWidgetProps {
  widget: TableWidgetType;
}

interface TableData {
  id: string;
  name: string;
  value: any;
  unit?: string;
  status: string;
  updated: string;
  [key: string]: any;
}

export const TableWidget: React.FC<TableWidgetProps> = ({ widget }) => {
  const [data, setData] = useState<TableData[]>([]);
  const [sortField, setSortField] = useState<string>(widget.defaultSortField || 'name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const pageSize = widget.pageSize || 5;

  useEffect(() => {
    const fetchData = async () => {
      if (!widget.tagIds || widget.tagIds.length === 0) {
        setError('No tags selected');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch data for all tags in parallel
        const tagDataPromises = widget.tagIds.map(id => fetchTagById(id));
        const tagDataResults = await Promise.all(tagDataPromises);
        
        // Convert to table data format
        const tableData = tagDataResults.map(tag => ({
          id: tag.id,
          name: tag.name,
          value: tag.lastValue,
          unit: tag.unit,
          status: tag.status || 'unknown',
          updated: new Date(tag.lastUpdated || Date.now()).toLocaleString(),
        }));
        
        setData(tableData);
      } catch (err) {
        console.error('Error fetching table data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up polling interval if specified
    if (widget.refreshRate && widget.refreshRate > 0) {
      const interval = setInterval(fetchData, widget.refreshRate);
      return () => clearInterval(interval);
    }
  }, [widget.tagIds, widget.refreshRate]);

  // Sort the data
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set to ascending by default
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sorted and paginated data
  const getSortedData = () => {
    if (!widget.sortable) {
      return data.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
    }

    const sorted = [...data].sort((a, b) => {
      let comparison = 0;
      if (a[sortField] > b[sortField]) {
        comparison = 1;
      } else if (a[sortField] < b[sortField]) {
        comparison = -1;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  };

  if (isLoading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const totalPages = Math.ceil(data.length / pageSize);

  // If no tags were provided, show a list of available tags for easy selection
  if (widget.tagIds.length === 0) {
    return (
      <div className="h-full w-full overflow-auto p-2">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          No tags selected. Available tags:
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-800">
              {mockTags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {tag.id}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {tag.name}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {tag.valueType}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto p-2">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {widget.columns.map((column) => (
                <th 
                  key={column.key}
                  className={`px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${widget.sortable ? 'cursor-pointer' : ''}`}
                  style={{ width: column.width }}
                  onClick={() => widget.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {widget.sortable && sortField === column.key && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-800">
            {getSortedData().map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                {widget.columns.map((column) => (
                  <td 
                    key={`${item.id}-${column.key}`}
                    className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                  >
                    {renderCellValue(item, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-3 pb-1">
          <button
            className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 disabled:opacity-50"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </button>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 disabled:opacity-50"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
  
  // Helper to render cell values with formatting
  function renderCellValue(item: TableData, column: { key: string; format?: string }) {
    const value = item[column.key];
    
    // Handle special column keys
    if (column.key === 'status') {
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value}
        </span>
      );
    }
    
    if (column.key === 'value') {
      return formatValue(value, item.unit, column.format);
    }
    
    // Default rendering
    return value;
  }
  
  // Helper to get status color
  function getStatusColor(status: string) {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  }
  
  // Helper to format values
  function formatValue(value: any, unit?: string, format?: string) {
    if (value === undefined || value === null) {
      return '--';
    }
    
    // Handle boolean values
    if (typeof value === 'boolean') {
      return value ? 'True' : 'False';
    }
    
    // Handle numeric values
    if (typeof value === 'number') {
      let formatted: string;
      
      // Apply format if available
      if (format) {
        if (format === '0,0') {
          formatted = value.toLocaleString('en-US', { maximumFractionDigits: 0 });
        } else if (format === '0.0') {
          formatted = value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
        } else if (format === '0.00') {
          formatted = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else {
          formatted = value.toString();
        }
      } else {
        // Default formatting
        formatted = Number.isInteger(value) 
          ? value.toLocaleString(undefined, { maximumFractionDigits: 0 }) 
          : value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
      }
      
      // Add unit if available
      return unit ? `${formatted} ${unit}` : formatted;
    }
    
    // Default for other types
    return value;
  }
};