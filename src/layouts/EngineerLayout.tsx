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

  // Determine if we're on a specific page that shouldn't show the engineering tools
  const isSpecificPage =
    location.pathname.startsWith('/dashboards') ||
    location.pathname.startsWith('/dashboard/') ||
    location.pathname.startsWith('/theme-settings') ||
    location.pathname.startsWith('/components');

  return (
    <div className="flex min-h-screen bg-background text-text">
      {/* Sidebar */}
      <EngineerSidebar />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        {isSpecificPage ? (
          <div className="w-full">
            {children}
          </div>
        ) : (
          <Column gap="lg" className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Engineer Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Select an option from the sidebar to get started.</p>

                <Grid cols={1} mdCols={2} gap="lg" className="mt-4">
                  <Card className="p-4 shadow-sm hover:shadow-md transition-shadow">
                    <CardTitle className="text-lg mb-2">Theme Settings</CardTitle>
                    <p className="text-sm mb-4">Configure and customize the application theme</p>
                  </Card>

                  <Card className="p-4 shadow-sm hover:shadow-md transition-shadow">
                    <CardTitle className="text-lg mb-2">Dashboards</CardTitle>
                    <p className="text-sm mb-4">Manage and configure industrial dashboards</p>
                  </Card>

                  <Card className="p-4 shadow-sm hover:shadow-md transition-shadow">
                    <CardTitle className="text-lg mb-2">Component Library</CardTitle>
                    <p className="text-sm mb-4">Explore available UI components</p>
                  </Card>

                  <Card className="p-4 shadow-sm hover:shadow-md transition-shadow">
                    <CardTitle className="text-lg mb-2">Current Theme</CardTitle>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {Object.entries(currentTheme.colors).slice(0, 8).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div
                            className="w-full aspect-square rounded-md mb-1"
                            style={{ backgroundColor: value as string }}
                          />
                          <span className="text-xs">{key}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </Grid>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-border rounded-lg p-4">
                  {children}
                </div>
              </CardContent>
            </Card>
          </Column>
        )}
      </div>
    </div>
  );
};