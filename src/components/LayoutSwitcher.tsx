import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/navigation/Button';
import { useLayout, LayoutType } from '@/contexts/LayoutContext';

/**
 * LayoutSwitcher component provides UI for switching between different layout types.
 * Now positioned at the bottom of the sidebar.
 */
export const LayoutSwitcher: React.FC = () => {
  const { layout, setLayout } = useLayout();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check sidebar collapsed state from localStorage
  useEffect(() => {
    const checkCollapseState = () => {
      const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
      setIsCollapsed(collapsed);
    };

    // Check on initial load
    checkCollapseState();

    // Listen for changes
    window.addEventListener('storage', checkCollapseState);
    return () => window.removeEventListener('storage', checkCollapseState);
  }, []);

  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayout(newLayout);
  };

  return (
    <div className={`layout-switcher-container fixed left-0 bottom-0 w-64 p-4 z-50 bg-background border-t border-border ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className={`flex ${isCollapsed ? 'flex-col space-y-2' : 'space-x-2'} w-full`}>
        <Button
          size="sm"
          variant={layout === 'engineer' ? 'default' : 'outline'}
          onClick={() => handleLayoutChange('engineer')}
          className={`flex-1 layout-switcher-btn ${layout === 'engineer' ? 'active' : 'inactive'}`}
          title="Engineer Mode"
        >
          {isCollapsed ? 'E' : 'Engineer'}
        </Button>
        <Button
          size="sm"
          variant={layout === 'client' ? 'default' : 'outline'}
          onClick={() => handleLayoutChange('client')}
          className={`flex-1 layout-switcher-btn ${layout === 'client' ? 'active' : 'inactive'}`}
          title="Client Mode"
        >
          {isCollapsed ? 'C' : 'Client'}
        </Button>
      </div>
    </div>
  );
};