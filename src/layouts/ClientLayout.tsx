import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/layout/Card';
import { Row } from '@/components/ui/layout/Row';
import { Column } from '@/components/ui/layout/Column';
import { Button } from '@/components/ui/navigation/Button';
import { useTheme } from '@/redux/hooks/useTheme';
import { ThemeSelector } from '@/components/ThemeSelector';
import LayoutBuilder from '@/components/layout-builder/LayoutBuilder';

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
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  return (
    <div className="relative w-full min-h-screen bg-background text-text">
      <Column gap="lg" className="p-6 w-full">
        <Card className="w-full z-10">
          <CardHeader>
            <CardTitle>Theme Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Row gap="md" className="mb-4">
              <Button 
                variant="default"
                onClick={() => setTheme('dark')}
              >
                Dark Mode
              </Button>
              <Button 
                variant="outline"
                onClick={() => setTheme('light')}
              >
                Light Mode
              </Button>
              <Button 
                variant="secondary"
                onClick={() => setTheme('system')}
              >
                System
              </Button>
            </Row>
            
            <ThemeSelector />
          </CardContent>
          <CardFooter>
            <Row gap="md" justifyContent="end">
              <Button 
                variant={mode === 'view' ? 'outline' : 'default'}
                onClick={() => setMode(mode === 'view' ? 'edit' : 'view')}
              >
                {mode === 'view' ? 'Customize Layout' : 'Exit Layout Editor'}
              </Button>
            </Row>
          </CardFooter>
        </Card>
        
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