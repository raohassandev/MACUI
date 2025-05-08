import { createContext, useState, useEffect, ReactNode } from 'react';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
}

interface ThemeContextType {
  currentTheme: Theme;
  themes: Theme[];
  setCurrentTheme: (theme: Theme) => void;
  addTheme: (theme: Theme) => void;
  updateTheme: (id: string, updatedTheme: Partial<Theme>) => void;
  deleteTheme: (id: string) => void;
}

export const defaultTheme: Theme = {
  id: 'default',
  name: 'Default',
  colors: {
    primary: '#646cff',
    secondary: '#535bf2',
    accent: '#747bff',
    background: '#242424',
    text: 'rgba(255, 255, 255, 0.87)',
  },
};

export const lightTheme: Theme = {
  id: 'light',
  name: 'Light',
  colors: {
    primary: '#646cff',
    secondary: '#535bf2',
    accent: '#747bff',
    background: '#ffffff',
    text: '#213547',
  },
};

export const ThemeContext = createContext<ThemeContextType>({
  currentTheme: defaultTheme,
  themes: [defaultTheme, lightTheme],
  setCurrentTheme: () => {},
  addTheme: () => {},
  updateTheme: () => {},
  deleteTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [themes, setThemes] = useState<Theme[]>(() => {
    const savedThemes = localStorage.getItem('themes');
    return savedThemes 
      ? JSON.parse(savedThemes) 
      : [defaultTheme, lightTheme];
  });

  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const savedCurrentTheme = localStorage.getItem('currentTheme');
    return savedCurrentTheme 
      ? JSON.parse(savedCurrentTheme) 
      : defaultTheme;
  });

  useEffect(() => {
    localStorage.setItem('themes', JSON.stringify(themes));
  }, [themes]);

  useEffect(() => {
    localStorage.setItem('currentTheme', JSON.stringify(currentTheme));
    
    // Apply theme to CSS variables
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
  }, [currentTheme]);

  const addTheme = (theme: Theme) => {
    setThemes((prev) => [...prev, theme]);
  };

  const updateTheme = (id: string, updatedTheme: Partial<Theme>) => {
    setThemes((prev) => 
      prev.map((theme) => 
        theme.id === id ? { ...theme, ...updatedTheme } : theme
      )
    );
    
    if (currentTheme.id === id) {
      setCurrentTheme((prev) => ({ ...prev, ...updatedTheme }));
    }
  };

  const deleteTheme = (id: string) => {
    // Prevent deleting if it's the last theme
    if (themes.length <= 1) {
      return;
    }
    
    // If deleting current theme, switch to the first available theme
    if (currentTheme.id === id) {
      const newCurrentTheme = themes.find((t) => t.id !== id) || defaultTheme;
      setCurrentTheme(newCurrentTheme);
    }
    
    setThemes((prev) => prev.filter((theme) => theme.id !== id));
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themes,
        setCurrentTheme,
        addTheme,
        updateTheme,
        deleteTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};