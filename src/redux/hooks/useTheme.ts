import { useContext } from 'react';
import { ThemeProviderContext } from '../../components/ui/theme/ThemeProvider';
import { useAppSelector, useAppDispatch } from './hooks';
import { 
  selectCurrentTheme,
  selectThemes,
  setCurrentTheme as setReduxTheme,
  addTheme as addReduxTheme
} from '../features/theme/themeSlice';
import { Theme } from '../features/theme/themeSlice';

export const useTheme = () => {
  // Get theme mode from context
  const context = useContext(ThemeProviderContext);
  const dispatch = useAppDispatch();
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  // Get theme colors and configuration from Redux
  const currentReduxTheme = useAppSelector(selectCurrentTheme);
  const themes = useAppSelector(selectThemes);
  
  // Handle theme changes
  const setCurrentTheme = (theme: Theme) => {
    dispatch(setReduxTheme(theme));
  };
  
  // Add new theme
  const addTheme = (theme: Theme) => {
    dispatch(addReduxTheme(theme));
  };
  
  return {
    // Theme mode from context
    ...context,
    // Theme colors and configuration from Redux
    currentTheme: currentReduxTheme,
    themes,
    setCurrentTheme,
    addTheme
  };
};