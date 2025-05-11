import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/layout/Card';
import { Row } from '../components/ui/layout/Row';
import { Column } from '../components/ui/layout/Column';
import { Button } from '../components/ui/navigation/Button';
import { useTheme } from '../redux/hooks/useTheme';
import LayoutBuilder from '../components/layout-builder/LayoutBuilder';

interface ClientLayoutProps {
  children?: React.ReactNode;
}

/**
 * ClientLayout provides a simplified interface for end-users with 
 * basic theme options and a clean, focused presentation.
 * It also includes a layout builder for customizing the UI.
 */
export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const { setTheme } = useTheme();
  const location = useLocation();
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  // Navigation links with active state tracking
  const navigationLinks = [
    { to: '/', label: 'Dashboards', icon: 'grid' },
    { to: '/dashboard/new', label: 'New Dashboard', icon: 'plus-square' },
    { to: '/theme-settings', label: 'Theme Settings', icon: 'palette' },
    { to: '/components', label: 'Components', icon: 'layers' },
  ];

  // Helper function to check if a link is active
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="relative w-full min-h-screen bg-background text-text">
      {/* Navigation Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm z-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">IIoT Dashboard</span>
              </div>
              <nav className="ml-10 flex space-x-4">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(link.to)
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setTheme('dark')}
                className="mr-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setTheme('light')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Column gap="lg" className="p-6 w-full">
        {/* Mode Switcher Card (only show on dashboard pages) */}
        {location.pathname.includes('/dashboard') && (
          <Card className="w-full z-10">
            <CardHeader>
              <CardTitle>Dashboard Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Row gap="md" justifyContent="end">
                <Button 
                  variant={mode === 'view' ? 'outline' : 'default'}
                  onClick={() => setMode(mode === 'view' ? 'edit' : 'view')}
                >
                  {mode === 'view' ? 'Edit Dashboard' : 'Exit Editor'}
                </Button>
              </Row>
            </CardContent>
          </Card>
        )}
        
        {mode === 'edit' ? (
          <Card className="mt-4 w-full z-10 overflow-visible">
            <CardHeader>
              <CardTitle>Layout Builder</CardTitle>
            </CardHeader>
            <CardContent className="p-0 min-h-[700px] overflow-visible">
              <LayoutBuilder />
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 w-full">
            {children}
          </div>
        )}
      </Column>
    </div>
  );
};