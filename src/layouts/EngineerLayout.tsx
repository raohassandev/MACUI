import { ReactNode } from 'react';
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

  return (
    <div className="flex min-h-screen bg-background text-text">
      {/* Sidebar */}
      <EngineerSidebar />

      {/* Main Content - Adding left padding for mobile */}
      <div className="flex-1 p-4 md:p-6 md:ml-0 overflow-auto transition-all duration-300">
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};