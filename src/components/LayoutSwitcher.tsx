import React from 'react';
import { Button } from '@/components/ui/navigation/Button';
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
    <div className="layout-switcher-container">
      <Button
        size="sm"
        variant={layout === 'engineer' ? 'default' : 'outline'}
        onClick={() => handleLayoutChange('engineer')}
        className={`layout-switcher-btn ${layout === 'engineer' ? 'active' : 'inactive'}`}
      >
        Engineer
      </Button>
      <Button
        size="sm"
        variant={layout === 'client' ? 'default' : 'outline'}
        onClick={() => handleLayoutChange('client')}
        className={`layout-switcher-btn ${layout === 'client' ? 'active' : 'inactive'}`}
      >
        Client
      </Button>
    </div>
  );
};