import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks';
import {
  fetchDashboard,
  createNewDashboard,
  saveDashboard,
  toggleDashboardEditMode,
  addWidget,
  selectCurrentDashboard,
  selectDashboardEditMode
} from '../redux/slices/dashboardSlice';
import { selectWidgetTemplates, selectWidget } from '../redux/slices/widgetSlice';
import DashboardGrid from '../components/dashboard/DashboardGrid';
import { v4 as uuidv4 } from 'uuid';

const DashboardPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const currentDashboard = useAppSelector(selectCurrentDashboard);
  const isEditMode = useAppSelector(selectDashboardEditMode);
  const widgetTemplates = useAppSelector(selectWidgetTemplates);
  const isLoading = useAppSelector(state => state.dashboard.isLoading);
  const error = useAppSelector(state => state.dashboard.error);
  
  const [isWidgetPickerOpen, setIsWidgetPickerOpen] = useState(false);

  // Fetch dashboard on mount and when ID changes
  useEffect(() => {
    if (id && id !== 'new') {
      console.log("Fetching dashboard with ID:", id);
      dispatch(fetchDashboard(id));
    } else if (id === 'new') {
      console.log("Creating new dashboard");
      dispatch(createNewDashboard());
    }
  }, [dispatch, id]);

  // When a dashboard is loaded or changes, make sure it's in edit mode to show widgets properly
  useEffect(() => {
    if (currentDashboard) {
      console.log("Dashboard loaded:", currentDashboard);
      console.log("Dashboard widgets:", currentDashboard.widgets);

      // Add a short delay to ensure the dashboard is fully loaded
      setTimeout(() => {
        // Force edit mode to ensure widgets are displayed
        if (!isEditMode) {
          console.log("Enabling edit mode to ensure widgets display correctly");
          dispatch(toggleDashboardEditMode(true));
        }
      }, 300);
    }
  }, [currentDashboard, dispatch]);

  // Toggle edit mode
  const handleToggleEditMode = () => {
    dispatch(toggleDashboardEditMode());
  };

  // Save dashboard
  const handleSaveDashboard = () => {
    if (currentDashboard) {
      dispatch(saveDashboard(currentDashboard));
    }
  };

  // Add widget to dashboard
  const handleAddWidget = (templateId: string) => {
    const template = widgetTemplates.find(t => t.id === templateId);
    if (template && currentDashboard) {
      // We'll use the predefined positions from the template

      // Create a new widget with the template's predefined position
      const newWidget = {
        ...template,
        id: uuidv4() // Generate a new ID
      };

      dispatch(addWidget(newWidget));
      setIsWidgetPickerOpen(false);

      // Select the new widget to open the sidebar editor
      setTimeout(() => {
        dispatch(selectWidget(newWidget.id));
      }, 100);
    }
  };

  // If loading
  if (isLoading && !currentDashboard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If error
  if (error && !currentDashboard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <h2 className="font-bold mb-2">Error Loading Dashboard</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // If no dashboard
  if (!currentDashboard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold mb-4">No Dashboard Selected</h2>
          <p className="mb-4">Please select a dashboard from the sidebar or create a new one.</p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => dispatch(createNewDashboard())}
          >
            Create New Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-screen w-full max-w-full bg-white dark:bg-gray-900">
      {/* Dashboard Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm px-4 py-2 flex items-center justify-between sticky top-0 w-full dashboard-header z-50">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {currentDashboard.name}
          </h1>
          {currentDashboard.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentDashboard.description}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0 pr-32 mr-4 relative z-50">
          {/* Edit Mode Toggle */}
          <button
            className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap font-medium edit-mode-toggle ${
              isEditMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            onClick={handleToggleEditMode}
          >
            {isEditMode ? 'Editing' : 'View Mode'}
          </button>

          {/* Add Widget Button (Only visible in edit mode) */}
          {isEditMode && (
            <div className="relative" style={{ zIndex: 9999 }}>
              <button
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 whitespace-nowrap font-medium shadow-sm"
                onClick={() => navigate(`/dashboard/${id}/widget/new`)}
              >
                Add Widget
              </button>
            </div>
          )}

          {/* Save Dashboard Button (Only visible in edit mode) */}
          {isEditMode && (
            <button
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap edit-mode-toggle"
              onClick={handleSaveDashboard}
            >
              Save Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Content - Takes full available width */}
      <div className="flex-grow w-full max-w-full overflow-hidden dashboard-content-container dashboard-content">
        <DashboardGrid />
      </div>

      {/* Widget editing is now handled by the sidebar in EngineerLayout */}
    </div>
  );
};

export default DashboardPage;