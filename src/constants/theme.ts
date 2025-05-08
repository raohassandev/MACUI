// Theme constants used throughout the application

export type ColorSchemeType = 'default' | 'light' | 'dark' | 'blue' | 'green' | 'purple';
export type ThemeMode = 'light' | 'dark' | 'system';

export type SpacingType = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
export type WidthType = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'auto';
export type ColorType = 
  | 'primary' 
  | 'secondary' 
  | 'accent' 
  | 'background' 
  | 'text'
  | 'muted'
  | 'card'
  | 'destructive'
  | 'success'
  | 'warning'
  | 'info';

export type ThemeType = {
  colorScheme?: ColorSchemeType;
  mode?: ThemeMode;
};

// Spacing values (can be used for padding, margin, gap, etc.)
export const spacing = {
  none: '0',
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '2.5rem',
  '3xl': '3rem',
  '4xl': '4rem',
};

// Container max widths
export const containerWidths = {
  xs: '20rem',    // 320px
  sm: '36rem',    // 576px
  md: '48rem',    // 768px
  lg: '64rem',    // 1024px
  xl: '80rem',    // 1280px
  '2xl': '96rem', // 1536px
  full: '100%',
  auto: 'auto',
};

// Predefined color schemes
export const colorSchemes: Record<ColorSchemeType, any> = {
  default: {
    primary: '#646cff',
    secondary: '#535bf2',
    accent: '#747bff',
    background: '#242424',
    text: 'rgba(255, 255, 255, 0.87)',
  },
  light: {
    primary: '#646cff',
    secondary: '#535bf2',
    accent: '#747bff',
    background: '#ffffff',
    text: '#213547',
  },
  dark: {
    primary: '#747bff',
    secondary: '#535bf2',
    accent: '#646cff',
    background: '#1a1a1a',
    text: '#ffffff',
  },
  blue: {
    primary: '#0070f3',
    secondary: '#0050c5',
    accent: '#00cffd',
    background: '#ffffff',
    text: '#333333',
  },
  green: {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#34d399',
    background: '#ffffff',
    text: '#1f2937',
  },
  purple: {
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#a78bfa',
    background: '#ffffff',
    text: '#111827',
  },
};