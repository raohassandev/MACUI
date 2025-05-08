import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useAppSelector } from '@/redux/hooks/hooks';
import { selectCurrentTheme } from '@/redux/features/theme/themeSlice';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('ui-theme') as Theme) || defaultTheme
  );
  
  // Access the Redux theme for color values
  const currentReduxTheme = useAppSelector(selectCurrentTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove the previous theme class
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    // Save the theme preference to localStorage
    localStorage.setItem('ui-theme', theme);
  }, [theme]);
  
  // Apply Redux theme colors as CSS variables
  useEffect(() => {
    // Apply theme to CSS variables
    if (currentReduxTheme && currentReduxTheme.colors) {
      Object.entries(currentReduxTheme.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--color-${key}`, value);
      });
    }
  }, [currentReduxTheme]);

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}