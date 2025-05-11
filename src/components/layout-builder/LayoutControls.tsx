import React, { useState } from 'react';
import { useLayoutBuilder } from '../../contexts/LayoutBuilderContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/layout/Card';
import { Button } from '../../components/ui/navigation/Button';
import { Input } from '../../components/ui/inputs/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/inputs/Select';
import { Row } from '../../components/ui/layout/Row';
import { Column } from '../../components/ui/layout/Column';

export const LayoutControls: React.FC = () => {
  const { state, createLayout, setCurrentLayout, saveLayout } = useLayoutBuilder();
  const { layouts, currentLayout } = state;
  const [newLayoutName, setNewLayoutName] = useState('');
  const [showNewLayoutForm, setShowNewLayoutForm] = useState(false);

  // Handle creating a new layout
  const handleCreateLayout = () => {
    if (newLayoutName.trim()) {
      createLayout(newLayoutName.trim());
      setNewLayoutName('');
      setShowNewLayoutForm(false);
    }
  };

  // Handle changing the current layout
  const handleChangeLayout = (layoutId: string) => {
    setCurrentLayout(layoutId);
  };

  // Handle saving the current layout
  const handleSaveLayout = () => {
    saveLayout();
  };

  // Create an initial layout if none exists
  React.useEffect(() => {
    if (layouts.length === 0) {
      createLayout('Default Layout');
    }
  }, [layouts.length, createLayout]);

  return (
    <Card className="w-full overflow-visible relative z-20">
      <CardHeader>
        <CardTitle>Layout Controls</CardTitle>
      </CardHeader>
      <CardContent className="overflow-visible">
        <Column gap="md" className="w-full overflow-visible">
          {/* Layout selector */}
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Current Layout</label>
            {layouts.length > 0 ? (
              <div className="relative z-30">
                <Select 
                  value={currentLayout?.id || ''} 
                  onValueChange={handleChangeLayout}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a layout" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {layouts.map((layout) => (
                      <SelectItem key={layout.id} value={layout.id}>
                        {layout.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No layouts available</div>
            )}
          </div>

          {/* New layout form */}
          {showNewLayoutForm ? (
            <div className="mt-4 w-full">
              <label className="block text-sm font-medium mb-1">Layout Name</label>
              <Row gap="sm" className="w-full">
                <div className="flex-1">
                  <Input
                    className="w-full"
                    placeholder="Enter layout name"
                    value={newLayoutName}
                    onChange={(e) => setNewLayoutName(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateLayout}>Create</Button>
                <Button variant="outline" onClick={() => setShowNewLayoutForm(false)}>
                  Cancel
                </Button>
              </Row>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={() => setShowNewLayoutForm(true)}
            >
              New Layout
            </Button>
          )}
        </Column>
      </CardContent>
      <CardFooter>
        <Row gap="sm" justifyContent="end" className="w-full">
          <Button 
            disabled={!currentLayout} 
            onClick={handleSaveLayout}
          >
            Save Layout
          </Button>
        </Row>
      </CardFooter>
    </Card>
  );
};

export default LayoutControls;