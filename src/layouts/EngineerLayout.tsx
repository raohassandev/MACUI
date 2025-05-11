import { ReactNode, useState, useEffect } from 'react';
import EngineerSidebar from '../components/navigation/EngineerSidebar';

interface EngineerLayoutProps {
  children?: ReactNode;
}

/**
 * EngineerLayout provides a technical interface with advanced theme customization
 * options and debug tools intended for developers and engineers.
 */
export const EngineerLayout = ({ children }: EngineerLayoutProps) => {
  // Storage for sidebar state
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
    <div className={`flex min-h-screen bg-background text-text relative ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      {/* Sidebar */}
      <EngineerSidebar onCollapseChange={(collapsed) => setIsSidebarCollapsed(collapsed)} />

      {/* Main Content with adjusted left margin for sidebar */}
      <div
        className={`flex-1 ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} p-0 overflow-hidden transition-all duration-300 w-full`}
        style={{ width: `calc(100vw - ${isSidebarCollapsed ? 64 : 256}px)` }}
      >
        <div className="w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
};