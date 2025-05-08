import { useTheme as useReduxTheme } from '../../../redux/hooks/useTheme';

// Re-export the UI theme hook (light/dark mode)
export const useTheme = useReduxTheme;