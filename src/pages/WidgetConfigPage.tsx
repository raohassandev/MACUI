import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks';
import {
  selectCurrentDashboard,
  addWidget,
  toggleDashboardEditMode,
  saveDashboard
} from '../redux/slices/dashboardSlice';
import { selectWidgetTemplates } from '../redux/slices/widgetSlice';
import { Widget as WidgetType } from '../types/dashboard';
import { v4 as uuidv4 } from 'uuid';

// Import widget configuration components
import {
  ChartWidgetConfig,
  GaugeWidgetConfig,
  NumericWidgetConfig,
  StatusWidgetConfig,
  TableWidgetConfig,
  AlertWidgetConfig,
  HeatmapWidgetConfig,
  StateTimelineWidgetConfig,
  MultiStatWidgetConfig,
  AdvancedGaugeWidgetConfig,
  AdvancedChartWidgetConfig
} from '../components/dashboard/widget-config';

// Import widget components for preview
import SimpleChartWidget from '../components/dashboard/widgets/SimpleChartWidget';
import { GaugeWidget } from '../components/dashboard/widgets/GaugeWidget';
import { NumericWidget } from '../components/dashboard/widgets/NumericWidget';
import { StatusWidget } from '../components/dashboard/widgets/StatusWidget';
import { TableWidget } from '../components/dashboard/widgets/TableWidget';
import { AlertWidget } from '../components/dashboard/widgets/AlertWidget';
import HeatmapWidget from '../components/dashboard/widgets/HeatmapWidget';
import StateTimelineWidget from '../components/dashboard/widgets/StateTimelineWidget';
import MultiStatWidget from '../components/dashboard/widgets/MultiStatWidget';
import AdvancedGaugeWidget from '../components/dashboard/widgets/AdvancedGaugeWidget';
import AdvancedChartWidget from '../components/dashboard/widgets/AdvancedChartWidget';

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/layout/Card';
import { Row } from '../components/ui/layout/Row';
import { Column } from '../components/ui/layout/Column';
import { Button } from '../components/ui/navigation/Button';
import { Heading } from '../components/ui/text/Heading';
import { Text } from '../components/ui/text/Text';
import WidgetSelector from '../components/dashboard/WidgetSelector';

const WidgetConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { dashboardId } = useParams<{ dashboardId: string }>();
  
  const currentDashboard = useAppSelector(selectCurrentDashboard);
  const widgetTemplates = useAppSelector(selectWidgetTemplates);
  
  // State for currently selected widget type
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  
  // State for widget configuration
  const [widgetConfig, setWidgetConfig] = useState<Partial<WidgetType> | null>(null);
  
  // When template is selected, initialize widget config
  useEffect(() => {
    if (selectedTemplateId) {
      const template = widgetTemplates.find(t => t.id === selectedTemplateId);
      if (template) {
        // Set default grid dimensions based on widget type
        let defaultWidth = 4;
        let defaultHeight = 3;

        // Adjust default dimensions based on widget type
        switch (template.type) {
          case 'chart':
            defaultWidth = 6;
            defaultHeight = 4;
            break;
          case 'gauge':
            defaultWidth = 3;
            defaultHeight = 3;
            break;
          case 'numeric':
            defaultWidth = 2;
            defaultHeight = 2;
            break;
          case 'status':
            defaultWidth = 2;
            defaultHeight = 2;
            break;
          case 'table':
            defaultWidth = 6;
            defaultHeight = 5;
            break;
          case 'alert':
            defaultWidth = 4;
            defaultHeight = 3;
            break;
        }

        setWidgetConfig({
          ...template,
          id: uuidv4(),
          title: template.title, // Start with template title, user can modify
          x: 0, // These will be adjusted when actually placing on dashboard
          y: 0,
          w: defaultWidth,
          h: defaultHeight,
          minW: 2,
          minH: 2,
          isDraggable: true,
          isResizable: true,
          resizeHandles: ['se']
        });
      }
    } else {
      setWidgetConfig(null);
    }
  }, [selectedTemplateId, widgetTemplates]);
  
  // Handle widget type selection
  const handleSelectWidgetType = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };
  
  // Handle config changes from widget configuration forms
  const handleConfigChange = (field: string, value: any) => {
    if (widgetConfig) {
      setWidgetConfig(prevConfig => ({
        ...prevConfig,
        [field]: value
      }));

      // Mark form as modified when changes are made
      setIsFormModified(true);

      // Clear validation errors when user makes changes
      if (validationError) {
        setValidationError(null);
      }
    }
  };
  
  // State for validation errors
  const [validationError, setValidationError] = useState<string | null>(null);

  // Handle save widget
  const handleSaveWidget = () => {
    // Clear previous validation errors
    setValidationError(null);

    // Ensure we have all required data
    if (!currentDashboard || !widgetConfig) {
      setValidationError("Widget configuration is missing");
      return;
    }

    // Validate required fields based on widget type
    if (!widgetConfig.title || widgetConfig.title.trim() === '') {
      setValidationError("Widget title is required");
      return;
    }

    // Specific validations based on widget type
    switch (widgetConfig.type) {
      case 'chart':
        if (!widgetConfig.tagId) {
          setValidationError("A data source tag is required for chart widgets");
          return;
        }
        // Make sure chart type is specified
        if (!(widgetConfig as any).chartType) {
          (widgetConfig as any).chartType = 'line';
        }
        // Ensure time range is set
        if (!(widgetConfig as any).timeRange) {
          (widgetConfig as any).timeRange = 3600000; // 1 hour default
        }
        break;
      case 'gauge':
        if (!widgetConfig.tagId) {
          setValidationError("A data source tag is required for gauge widgets");
          return;
        }
        if ((widgetConfig as any).minValue === undefined || (widgetConfig as any).maxValue === undefined) {
          setValidationError("Min and max values are required for gauge widgets");
          return;
        }
        // Ensure gauge type is set
        if (!(widgetConfig as any).gaugeType) {
          (widgetConfig as any).gaugeType = 'radial';
        }
        break;
      case 'numeric':
        if (!widgetConfig.tagId) {
          setValidationError("A data source tag is required for numeric widgets");
          return;
        }
        break;
      case 'status':
        if (!widgetConfig.tagId) {
          setValidationError("A data source tag is required for status widgets");
          return;
        }
        if (!(widgetConfig as any).statusMap || Object.keys((widgetConfig as any).statusMap || {}).length === 0) {
          setValidationError("Status mapping is required for status widgets");
          return;
        }
        break;
      case 'table':
        if (!(widgetConfig as any).tagIds || (widgetConfig as any).tagIds.length === 0) {
          setValidationError("At least one data source tag is required for table widgets");
          return;
        }
        if (!(widgetConfig as any).columns || (widgetConfig as any).columns.length === 0) {
          setValidationError("Table columns configuration is required");
          return;
        }
        break;
      case 'alert':
        // Ensure alert level is set
        if (!(widgetConfig as any).alertLevel) {
          (widgetConfig as any).alertLevel = 'warning';
        }
        break;
      default:
        setValidationError("Unknown widget type");
        return;
    }

    // Find the maximum y coordinate of existing widgets to place this one after them
    let maxY = 0;
    if (currentDashboard.widgets && currentDashboard.widgets.length > 0) {
      currentDashboard.widgets.forEach(widget => {
        const bottomY = (widget.y || 0) + (widget.h || 3);
        if (bottomY > maxY) {
          maxY = bottomY;
        }
      });
    }

    console.log("Creating widget with following configuration:", widgetConfig);

    // Add widget position info with improved positioning
    const finalWidgetConfig = {
      ...widgetConfig,
      // Use existing x/y if defined, otherwise place it at a good position
      x: widgetConfig.x !== undefined ? widgetConfig.x : 0,
      y: widgetConfig.y !== undefined ? widgetConfig.y : maxY + 1, // Place below existing widgets
      w: widgetConfig.w || 4,
      h: widgetConfig.h || 3,
      isDraggable: true,
      isResizable: true,
      static: false,
    };

    console.log("Final widget configuration:", finalWidgetConfig);

    // Make sure edit mode is enabled
    dispatch(toggleDashboardEditMode(true));

    try {
      // Add the widget to the dashboard
      console.log("Adding widget to dashboard state...");
      dispatch(addWidget(finalWidgetConfig as WidgetType));

      // In a real app with a backend, we would save the dashboard
      // But since we're using mock data, we can just add the widget to the state
      // and navigate back to the dashboard

      // Optional: Save the dashboard to update mock data
      // This dispatches a saveDashboard action which will use our mock API
      const updatedDashboard = {
        ...currentDashboard,
        widgets: [...currentDashboard.widgets, finalWidgetConfig as WidgetType]
      };
      dispatch(saveDashboard(updatedDashboard));

      // Navigate back to the dashboard after a slight delay
      setTimeout(() => {
        console.log("Navigating to dashboard:", currentDashboard.id);
        navigate(`/dashboard/${currentDashboard.id}`);
      }, 200);
    } catch (error) {
      console.error("Error saving widget:", error);
      setValidationError("Failed to save widget. Please try again.");
    }
  };
  
  // Track if form has been modified
  const [isFormModified, setIsFormModified] = useState(false);

  // Update form modified state when widget config changes
  useEffect(() => {
    if (widgetConfig) {
      setIsFormModified(true);
    }
  }, [widgetConfig]);

  // Handle cancel
  const handleCancel = () => {
    // If form has been modified, show confirmation dialog
    if (isFormModified) {
      const confirmCancel = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );

      if (!confirmCancel) {
        return; // User chose to continue editing
      }
    }

    // Navigate back to dashboard without saving
    if (currentDashboard) {
      navigate(`/dashboard/${currentDashboard.id}`);
    } else {
      navigate('/dashboards');
    }
  };
  
  // Render widget type selection
  const renderWidgetTypeSelection = () => {
    return (
      <Column gap="lg" className="w-full">
        <WidgetSelector
          widgets={widgetTemplates}
          onSelectWidget={handleSelectWidgetType}
          selectedWidgetId={selectedTemplateId}
        />
      </Column>
    );
  };
  
  // Get widget type description
  const getWidgetTypeDescription = (type: string): string => {
    switch (type) {
      case 'chart':
        return 'Display time-series data as line, bar, or area charts';
      case 'gauge':
        return 'Show values as gauges with thresholds and ranges';
      case 'numeric':
        return 'Display single numeric values with optional formatting';
      case 'status':
        return 'Show status indicators with custom colors and labels';
      case 'table':
        return 'Display data in a tabular format with sortable columns';
      case 'alert':
        return 'Show alerts and notifications with severity levels';
      default:
        return 'Widget type';
    }
  };
  
  // Get widget type icon (placeholder)
  const getWidgetTypeIcon = (type: string): React.ReactNode => {
    const iconColor = 'currentColor';
    
    switch (type) {
      case 'chart':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke={iconColor}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'gauge':
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
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke={iconColor}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        );
    }
  };
  
  // Render widget configuration based on widget type
  const renderWidgetConfiguration = () => {
    if (!widgetConfig) return null;

    switch (widgetConfig.type) {
      case 'chart':
        return <ChartWidgetConfig widget={widgetConfig} onChange={handleConfigChange} />;
      case 'gauge':
        return <GaugeWidgetConfig widget={widgetConfig} onChange={handleConfigChange} />;
      case 'numeric':
        return <NumericWidgetConfig widget={widgetConfig} onChange={handleConfigChange} />;
      case 'status':
        return <StatusWidgetConfig widget={widgetConfig} onChange={handleConfigChange} />;
      case 'table':
        return <TableWidgetConfig widget={widgetConfig} onChange={handleConfigChange} />;
      case 'alert':
        return <AlertWidgetConfig widget={widgetConfig} onChange={handleConfigChange} />;
      case 'heatmap':
        return <HeatmapWidgetConfig widget={widgetConfig} onChange={handleConfigChange} />;
      case 'state-timeline':
        return <StateTimelineWidgetConfig widget={widgetConfig} onChange={handleConfigChange} />;
      case 'multi-stat':
        return <MultiStatWidgetConfig widget={widgetConfig} onChange={handleConfigChange} />;
      case 'advanced-gauge':
        return <AdvancedGaugeWidgetConfig widget={widgetConfig} onChange={handleConfigChange} />;
      case 'advanced-chart':
        return <AdvancedChartWidgetConfig widget={widgetConfig} onChange={handleConfigChange} />;
      default:
        return (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Text className="text-gray-500">No configuration available for this widget type</Text>
          </div>
        );
    }
  };

  // Render widget preview based on widget type
  const renderWidgetPreview = () => {
    if (!widgetConfig) return null;

    // Use a fixed size container to simulate the widget in the dashboard
    // Apply a grid background to help visualize the widget dimensions
    const previewContainerStyle = {
      width: '100%',
      height: '300px',
      padding: '16px',
      overflow: 'hidden',
      background: 'linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.05)',
      position: 'relative'
    };

    const widgetContainerStyle = {
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '8px'
    };

    // Add size indicator
    const sizeIndicator = (
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
        {`${widgetConfig.w || 4} × ${widgetConfig.h || 3} grid units`}
      </div>
    );

    switch (widgetConfig.type) {
      case 'chart':
        return (
          <div style={previewContainerStyle}>
            <div style={widgetContainerStyle}>
              <SimpleChartWidget widget={widgetConfig as any} />
            </div>
            {sizeIndicator}
          </div>
        );
      case 'gauge':
        return (
          <div style={previewContainerStyle}>
            <div style={widgetContainerStyle}>
              <GaugeWidget widget={widgetConfig as any} />
            </div>
            {sizeIndicator}
          </div>
        );
      case 'numeric':
        return (
          <div style={previewContainerStyle}>
            <div style={widgetContainerStyle}>
              <NumericWidget widget={widgetConfig as any} />
            </div>
            {sizeIndicator}
          </div>
        );
      case 'status':
        return (
          <div style={previewContainerStyle}>
            <div style={widgetContainerStyle}>
              <StatusWidget widget={widgetConfig as any} />
            </div>
            {sizeIndicator}
          </div>
        );
      case 'table':
        return (
          <div style={previewContainerStyle}>
            <div style={widgetContainerStyle}>
              <TableWidget widget={widgetConfig as any} />
            </div>
            {sizeIndicator}
          </div>
        );
      case 'alert':
        return (
          <div style={previewContainerStyle}>
            <div style={widgetContainerStyle}>
              <AlertWidget widget={widgetConfig as any} />
            </div>
            {sizeIndicator}
          </div>
        );
      case 'heatmap':
        return (
          <div style={previewContainerStyle}>
            <div style={widgetContainerStyle}>
              <HeatmapWidget widget={widgetConfig as any} />
            </div>
            {sizeIndicator}
          </div>
        );
      case 'state-timeline':
        return (
          <div style={previewContainerStyle}>
            <div style={widgetContainerStyle}>
              <StateTimelineWidget widget={widgetConfig as any} />
            </div>
            {sizeIndicator}
          </div>
        );
      case 'multi-stat':
        return (
          <div style={previewContainerStyle}>
            <div style={widgetContainerStyle}>
              <MultiStatWidget widget={widgetConfig as any} />
            </div>
            {sizeIndicator}
          </div>
        );
      case 'advanced-gauge':
        return (
          <div style={previewContainerStyle}>
            <div style={widgetContainerStyle}>
              <AdvancedGaugeWidget widget={widgetConfig as any} />
            </div>
            {sizeIndicator}
          </div>
        );
      case 'advanced-chart':
        return (
          <div style={previewContainerStyle}>
            <div style={widgetContainerStyle}>
              <AdvancedChartWidget widget={widgetConfig as any} />
            </div>
            {sizeIndicator}
          </div>
        );
      default:
        return (
          <div className="border border-gray-200 rounded-lg p-4 h-64 flex items-center justify-center">
            <p className="text-gray-500">Preview not available for this widget type</p>
          </div>
        );
    }
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Heading level={1} className="mb-6">Widget Configuration</Heading>
      
      {!selectedTemplateId ? (
        // Step 1: Widget Type Selection
        renderWidgetTypeSelection()
      ) : (
        // Step 2: Widget Configuration & Preview
        <Row gap="lg" className="w-full">
          <Column gap="md" className="w-full lg:w-1/2">
            {renderWidgetConfiguration()}
          </Column>
          
          <Column gap="md" className="w-full lg:w-1/2">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">

                {/* Widget Dimensions Controls */}
                <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm font-medium mb-2">Widget Dimensions</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="widgetWidth" className="block text-xs font-medium mb-1">Width (columns)</label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          className="p-1 bg-gray-200 dark:bg-gray-700 rounded-l-md"
                          onClick={() => {
                            if (widgetConfig && widgetConfig.w && widgetConfig.w > 1) {
                              handleConfigChange('w', widgetConfig.w - 1);
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <input
                          id="widgetWidth"
                          type="number"
                          min="1"
                          max="12"
                          className="w-full text-center border-y border-gray-300 dark:border-gray-600 py-1"
                          value={widgetConfig?.w || 4}
                          onChange={(e) => handleConfigChange('w', Math.max(1, Math.min(12, parseInt(e.target.value) || 4)))}
                        />
                        <button
                          type="button"
                          className="p-1 bg-gray-200 dark:bg-gray-700 rounded-r-md"
                          onClick={() => {
                            if (widgetConfig && widgetConfig.w < 12) {
                              handleConfigChange('w', (widgetConfig.w || 4) + 1);
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="widgetHeight" className="block text-xs font-medium mb-1">Height (rows)</label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          className="p-1 bg-gray-200 dark:bg-gray-700 rounded-l-md"
                          onClick={() => {
                            if (widgetConfig && widgetConfig.h && widgetConfig.h > 1) {
                              handleConfigChange('h', widgetConfig.h - 1);
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <input
                          id="widgetHeight"
                          type="number"
                          min="1"
                          max="8"
                          className="w-full text-center border-y border-gray-300 dark:border-gray-600 py-1"
                          value={widgetConfig?.h || 3}
                          onChange={(e) => handleConfigChange('h', Math.max(1, Math.min(8, parseInt(e.target.value) || 3)))}
                        />
                        <button
                          type="button"
                          className="p-1 bg-gray-200 dark:bg-gray-700 rounded-r-md"
                          onClick={() => {
                            if (widgetConfig && widgetConfig.h < 8) {
                              handleConfigChange('h', (widgetConfig.h || 3) + 1);
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {renderWidgetPreview()}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="w-full p-4">
              {validationError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{validationError}</span>
                  </div>
                </div>
              )}

              <Row gap="md" className="w-full justify-end">
                <Button variant="outline" onClick={handleCancel}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </Button>
                <Button onClick={handleSaveWidget}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Widget
                </Button>
              </Row>
            </Card>
          </Column>
        </Row>
      )}
    </div>
  );
};

export default WidgetConfigPage;