import { useTheme } from '../redux/hooks/useTheme';

export const ThemeSelector = () => {
  const { themes = [], currentTheme, setCurrentTheme } = useTheme();
  
  if (!themes.length || !currentTheme) {
    return (
      <div className="flex flex-col gap-3 p-4 bg-background text-text rounded-lg shadow-md">
        <h2 className="text-lg font-bold">Select Theme</h2>
        <div className="text-sm text-muted">No themes available</div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-3 p-4 bg-background text-text rounded-lg shadow-md">
      <h2 className="text-lg font-bold">Select Theme</h2>
      <div className="flex flex-wrap gap-2">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setCurrentTheme(theme)}
            className={`
              p-2 rounded-md transition-all
              ${currentTheme.id === theme.id ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary'}
            `}
            style={{
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
            }}
          >
            <div className="flex gap-1 items-center">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: theme.colors.primary }}
              />
              <div>{theme.name}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};