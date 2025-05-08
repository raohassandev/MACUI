import React from 'react';
import { Button } from '@/components/ui/navigation/Button';
import { Row } from '@/components/ui/layout/Row';
import { useLayout, LayoutType } from '@/contexts/LayoutContext';

/**
 * LayoutSwitcher component provides UI for switching between different layout types.
 */
export const LayoutSwitcher: React.FC = () => {
  const { layout, setLayout } = useLayout();

  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayout(newLayout);
  };

  return (
    <Row gap="sm" className="fixed top-0 right-0 p-2 z-50">
      <Button
        size="sm"
        variant={layout === 'engineer' ? 'default' : 'outline'}
        onClick={() => handleLayoutChange('engineer')}
      >
        Engineer
      </Button>
      <Button
        size="sm"
        variant={layout === 'client' ? 'default' : 'outline'}
        onClick={() => handleLayoutChange('client')}
      >
        Client
      </Button>
    </Row>
  );
};