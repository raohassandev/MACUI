import React from 'react';
import { useLayout } from '@/contexts/LayoutContext';
import { EngineerLayout } from './EngineerLayout';
import { ClientLayout } from './ClientLayout';
import { LayoutSwitcher } from '@/components/LayoutSwitcher';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * MainLayout switches between different layout types based on the current setting.
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { layout } = useLayout();

  // Choose the appropriate layout based on current setting
  const LayoutComponent = layout === 'engineer' ? EngineerLayout : ClientLayout;

  return (
    <>
      <LayoutComponent>
        {children}
      </LayoutComponent>
    </>
  );
};

export default MainLayout;