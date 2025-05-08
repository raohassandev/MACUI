import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define layout types
export type LayoutType = 'engineer' | 'client';

// Define context interface
interface LayoutContextType {
  layout: LayoutType;
  setLayout: (layout: LayoutType) => void;
}

// Create context with default values
const LayoutContext = createContext<LayoutContextType>({
  layout: 'client',
  setLayout: () => {},
});

// Define provider props
interface LayoutProviderProps {
  children: ReactNode;
  defaultLayout?: LayoutType;
}

// Layout provider component
export const LayoutProvider: React.FC<LayoutProviderProps> = ({
  children,
  defaultLayout = 'client',
}) => {
  const [layout, setLayout] = useState<LayoutType>(
    // Try to get from localStorage first, otherwise use defaultLayout
    () => (localStorage.getItem('layout') as LayoutType) || defaultLayout
  );

  // Update layout and save to localStorage
  const handleSetLayout = (newLayout: LayoutType) => {
    setLayout(newLayout);
    localStorage.setItem('layout', newLayout);
  };

  return (
    <LayoutContext.Provider
      value={{
        layout,
        setLayout: handleSetLayout,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

// Custom hook for easy context access
export const useLayout = () => useContext(LayoutContext);