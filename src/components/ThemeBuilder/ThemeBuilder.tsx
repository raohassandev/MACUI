import { useState } from 'react';
import { useTheme } from '@/redux/hooks/useTheme';
import { ColorPicker } from './ColorPicker';
import { ThemeColors } from '@/redux/features/theme/themeSlice';

export const ThemeBuilder = () => {
  const { addTheme } = useTheme();
  const [themeName, setThemeName] = useState('');
  const [colors, setColors] = useState<ThemeColors>({
    primary: '#646cff',
    secondary: '#535bf2',
    accent: '#747bff',
    background: '#242424',
    text: '#ffffff',
  });

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setColors((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!themeName) {
      alert('Please enter a name for your theme');
      return;
    }
    
    const newTheme = {
      id: `theme-${Date.now()}`,
      name: themeName,
      colors,
    };
    
    addTheme(newTheme);
    setThemeName('');
    setColors({
      primary: '#646cff',
      secondary: '#535bf2',
      accent: '#747bff',
      background: '#242424',
      text: '#ffffff',
    });
  };

  return (
    <div className="p-4 bg-background text-text rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4">Create New Theme</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <label className="min-w-[100px] text-sm">Theme Name</label>
          <input
            type="text"
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            placeholder="My Custom Theme"
            className="flex-1 px-2 py-1 rounded bg-background border border-secondary"
          />
        </div>
        
        <div className="flex flex-col gap-3">
          <ColorPicker 
            label="Primary" 
            color={colors.primary} 
            onChange={(color) => handleColorChange('primary', color)} 
          />
          <ColorPicker 
            label="Secondary" 
            color={colors.secondary} 
            onChange={(color) => handleColorChange('secondary', color)} 
          />
          <ColorPicker 
            label="Accent" 
            color={colors.accent} 
            onChange={(color) => handleColorChange('accent', color)} 
          />
          <ColorPicker 
            label="Background" 
            color={colors.background} 
            onChange={(color) => handleColorChange('background', color)} 
          />
          <ColorPicker 
            label="Text" 
            color={colors.text} 
            onChange={(color) => handleColorChange('text', color)} 
          />
        </div>
        
        <div className="mt-2">
          <button 
            type="submit" 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition-colors"
          >
            Create Theme
          </button>
        </div>
        
        <div className="mt-2">
          <h3 className="text-sm font-bold mb-2">Preview</h3>
          <div 
            className="p-4 rounded-lg flex flex-col gap-2" 
            style={{ backgroundColor: colors.background, color: colors.text }}
          >
            <div className="text-sm font-bold">Theme Preview</div>
            <button 
              className="px-3 py-1 text-sm rounded-md" 
              style={{ backgroundColor: colors.primary, color: colors.text }}
            >
              Primary Button
            </button>
            <button 
              className="px-3 py-1 text-sm rounded-md" 
              style={{ backgroundColor: colors.secondary, color: colors.text }}
            >
              Secondary Button
            </button>
            <div 
              className="px-3 py-1 text-sm rounded-md" 
              style={{ backgroundColor: colors.accent, color: colors.text }}
            >
              Accent Element
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};