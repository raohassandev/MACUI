import { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/layout/Card';
import { Row } from '../components/ui/layout/Row';
import { Column } from '../components/ui/layout/Column';
import { Grid } from '../components/ui/layout/Grid';
import { useTheme } from '../redux/hooks/useTheme';
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
  const { currentTheme } = useTheme();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background text-text">
      {/* Sidebar */}
      <EngineerSidebar />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};