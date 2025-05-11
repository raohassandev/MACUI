import { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import EngineerSidebar from '../components/navigation/EngineerSidebar';

interface EngineerLayoutProps {
  children?: ReactNode;
}

/**
 * EngineerLayout provides a technical interface with advanced theme customization
 * options and debug tools intended for developers and engineers.
 */
export const EngineerLayout = ({ children }: EngineerLayoutProps) => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  return (
    <div className="flex min-h-screen bg-background text-text relative">
      {/* Sidebar */}
      <EngineerSidebar onCollapseChange={(collapsed) => setIsSidebarCollapsed(collapsed)} />

      {/* Main Content with adjusted left margin for sidebar */}
      <div
        className={`flex-1 ml-0 ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} p-0 overflow-auto transition-all duration-300 w-full`}
      >
        <div className="w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
};