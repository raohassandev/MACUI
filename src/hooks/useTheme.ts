import { useAppSelector, useAppDispatch } from './index';
import { 
  selectCurrentTheme, 
  selectThemes, 
  setCurrentTheme,
  addTheme,
  updateTheme,
  deleteTheme,
  Theme
} from '../redux/slices/themeSlice';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(selectCurrentTheme);
  const themes = useAppSelector(selectThemes);
  
  return {
    currentTheme,
    themes,
    setCurrentTheme: (theme: Theme) => dispatch(setCurrentTheme(theme)),
    addTheme: (theme: Theme) => dispatch(addTheme(theme)),
    updateTheme: (id: string, updatedTheme: Partial<Theme>) => 
      dispatch(updateTheme({ id, updatedTheme })),
    deleteTheme: (id: string) => dispatch(deleteTheme(id)),
  };
};