import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/layout/Card';
import { Row } from '@/components/ui/layout/Row';
import { Column } from '@/components/ui/layout/Column';
import { Grid } from '@/components/ui/layout/Grid';
import { Heading } from '@/components/ui/text/Heading';
import { Text } from '@/components/ui/text/Text';
import { Button } from '@/components/ui/navigation/Button';
import { useTheme } from '@/redux/hooks/useTheme';
import { ThemeColors } from '@/redux/features/theme/themeSlice';
import { ThemeBuilder } from '@/components/ThemeBuilder/ThemeBuilder';
import { ThemeSelector } from '@/components/ThemeSelector';

interface EngineerLayoutProps {
  children?: React.ReactNode;
}

/**
 * EngineerLayout provides a technical interface with advanced theme customization 
 * options and debug tools intended for developers and engineers.
 */
export const EngineerLayout: React.FC<EngineerLayoutProps> = ({ children }) => {
  const { currentTheme, setTheme } = useTheme();

  // Display theme colors as CSS variables for debugging
  const cssVariables = Object.entries(currentTheme.colors).map(([key, value]) => (
    `--color-${key}: ${value}`
  )).join('\\n');

  return (
    <Column gap="lg" className="p-6 min-h-screen bg-background text-text">
      <Card>
        <CardHeader>
          <CardTitle>Engineer Tools</CardTitle>
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
              System Theme
            </Button>
          </Row>
          
          <Grid cols={1} mdCols={2} gap="lg">
            <Column gap="md">
              <Heading level={3}>Theme Builder</Heading>
              <ThemeBuilder />
            </Column>
            
            <Column gap="md">
              <Heading level={3}>Current Theme Configuration</Heading>
              <Card className="p-4 bg-muted/20">
                <pre className="text-xs overflow-auto">
                  <code>
                    {JSON.stringify(currentTheme, null, 2)}
                  </code>
                </pre>
              </Card>
              
              <Heading level={3}>CSS Variables</Heading>
              <Card className="p-4 bg-muted/20">
                <pre className="text-xs overflow-auto">
                  <code>{cssVariables}</code>
                </pre>
              </Card>
              
              <Heading level={3}>Theme Selector</Heading>
              <ThemeSelector />
            </Column>
          </Grid>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Layout Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg p-4">
            {children}
          </div>
        </CardContent>
      </Card>
    </Column>
  );
};