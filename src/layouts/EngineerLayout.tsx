import { ReactNode, useState, useEffect } from 'react';
import EngineerSidebar from '../components/navigation/EngineerSidebar';
import WidgetEditSidebar from '../components/dashboard/WidgetEditSidebar';
import { useAppSelector } from '../hooks';
import { selectSelectedWidgetId } from '../redux/slices/widgetSlice';
import { selectDashboardEditMode } from '../redux/slices/dashboardSlice';

interface EngineerLayoutProps {
  children?: ReactNode;
}

/**
 * EngineerLayout provides a technical interface with advanced theme customization
 * options and debug tools intended for developers and engineers.
 */
export const EngineerLayout = ({ children }: EngineerLayoutProps) => {
  // Storage for sidebar states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  // Get redux state for widget selection and edit mode
  const selectedWidgetId = useAppSelector(selectSelectedWidgetId);
  const isEditMode = useAppSelector(selectDashboardEditMode);

  // Listen for sidebar collapse state changes
  useEffect(() => {
    const handleStorageChange = () => {
      const collapsedState = localStorage.getItem('sidebarCollapsed');
      setIsSidebarCollapsed(collapsedState === 'true');
    };

    // Check initial state
    handleStorageChange();

    // Listen for changes
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auto-show right sidebar when a widget is selected in edit mode
  useEffect(() => {
    // Only update state if it needs to change to avoid unnecessary rerenders
    const shouldBeOpen = !!(selectedWidgetId && isEditMode);

    if (shouldBeOpen !== isRightSidebarOpen) {
      setIsRightSidebarOpen(shouldBeOpen);
    }
  }, [selectedWidgetId, isEditMode, isRightSidebarOpen]);

  return (
    <div className={`flex min-h-screen bg-background text-text relative ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      {/* Left Sidebar */}
      <EngineerSidebar onCollapseChange={(collapsed) => setIsSidebarCollapsed(collapsed)} />

      {/* Main Content with adjusted margins for sidebars */}
      <div
        className={`flex-1 ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} p-0 overflow-hidden transition-all duration-300 w-full`}
        style={{
          width: `calc(100vw - ${isSidebarCollapsed ? 64 : 256}px${isRightSidebarOpen ? ' - 320px' : ''})`,
          marginRight: isRightSidebarOpen ? '320px' : '0',
        }}
      >
        <div className="w-full h-full">
          {children}
        </div>
      </div>

      {/* Right Sidebar for Widget Editing */}
      <WidgetEditSidebar
        isOpen={isRightSidebarOpen}
        onClose={() => setIsRightSidebarOpen(false)}
      />
    </div>
  );
};