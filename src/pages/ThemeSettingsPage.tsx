import React, { useState } from 'react';
import { useTheme } from '../redux/hooks/useTheme';
import { Theme, ThemeColors } from '../redux/features/theme/themeSlice';
import { v4 as uuidv4 } from 'uuid';

const ThemeSettingsPage: React.FC = () => {
  const { currentTheme, themes, setCurrentTheme, addTheme } = useTheme();
  const [newThemeName, setNewThemeName] = useState('');
  const [editingColors, setEditingColors] = useState<ThemeColors>({
    primary: '#646cff',
    secondary: '#535bf2',
    accent: '#747bff',
    background: '#ffffff',
    text: '#213547',
  });
  const [colorPickerVisible, setColorPickerVisible] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'themes' | 'typography' | 'spacing'>('themes');
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');

  // Handle theme selection
  const handleSelectTheme = (theme: Theme) => {
    setCurrentTheme(theme);
  };

  // Create a new theme
  const handleCreateTheme = () => {
    if (!newThemeName.trim()) {
      alert('Please enter a theme name');
      return;
    }

    const newTheme: Theme = {
      id: `theme-${uuidv4()}`,
      name: newThemeName,
      colors: editingColors,
    };

    addTheme(newTheme);
    setNewThemeName('');
    setEditingColors({
      primary: '#646cff',
      secondary: '#535bf2',
      accent: '#747bff',
      background: '#ffffff',
      text: '#213547',
    });
  };

  // Handle color change
  const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
    setEditingColors(prev => ({
      ...prev,
      [colorKey]: value,
    }));
  };

  // Export theme as JSON
  const handleExportTheme = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentTheme));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${currentTheme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Color preview box component
  const ColorBox: React.FC<{
    label: string;
    colorKey: keyof ThemeColors;
    value: string;
    onChange: (value: string) => void;
  }> = ({ label, colorKey, value, onChange }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="flex items-center">
        <div 
          className="w-10 h-10 rounded-md border border-gray-300 dark:border-gray-700 cursor-pointer mr-3"
          style={{ backgroundColor: value }}
          onClick={() => setColorPickerVisible(colorPickerVisible === colorKey ? null : colorKey)}
        />
        <input
          type="text"
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {colorPickerVisible === colorKey && (
        <div className="mt-2 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
          <div className="grid grid-cols-6 gap-2">
            {[
              '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
              '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
              '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#6b7280',
            ].map(color => (
              <div
                key={color}
                className="w-6 h-6 rounded-md cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => {
                  onChange(color);
                  setColorPickerVisible(null);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Theme Settings
      </h1>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'themes'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('themes')}
            >
              Themes
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'typography'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('typography')}
            >
              Typography
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'spacing'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('spacing')}
            >
              Spacing & Layout
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'themes' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Available Themes */}
              <div className="col-span-1 lg:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Available Themes
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {themes.map(theme => (
                    <div 
                      key={theme.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        currentTheme.id === theme.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                      onClick={() => handleSelectTheme(theme)}
                      style={{
                        backgroundColor: previewMode === 'light' ? '#ffffff' : '#1f2937',
                      }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100" style={{ color: theme.colors.text }}>
                          {theme.name}
                        </h3>
                        {currentTheme.id === theme.id && (
                          <div className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                            Active
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-5 gap-2 mb-3">
                        {Object.entries(theme.colors).map(([key, color]) => (
                          <div 
                            key={key} 
                            className="h-6 rounded"
                            style={{ backgroundColor: color }}
                            title={`${key}: ${color}`}
                          />
                        ))}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <button 
                          className="px-3 py-1 text-sm rounded"
                          style={{ backgroundColor: theme.colors.primary, color: '#ffffff' }}
                        >
                          Primary
                        </button>
                        <button 
                          className="px-3 py-1 text-sm rounded"
                          style={{ backgroundColor: theme.colors.secondary, color: '#ffffff' }}
                        >
                          Secondary
                        </button>
                        <button 
                          className="px-3 py-1 text-sm rounded"
                          style={{ backgroundColor: theme.colors.accent, color: '#ffffff' }}
                        >
                          Accent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Preview Mode:</span>
                    <div className="flex rounded-md shadow-sm">
                      <button
                        className={`px-3 py-1 text-sm ${
                          previewMode === 'light'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white'
                            : 'bg-white text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        } border border-gray-300 dark:border-gray-600 rounded-l-md`}
                        onClick={() => setPreviewMode('light')}
                      >
                        Light
                      </button>
                      <button
                        className={`px-3 py-1 text-sm ${
                          previewMode === 'dark'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white'
                            : 'bg-white text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        } border border-gray-300 dark:border-gray-600 rounded-r-md border-l-0`}
                        onClick={() => setPreviewMode('dark')}
                      >
                        Dark
                      </button>
                    </div>
                  </div>
                  
                  <button
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                    onClick={handleExportTheme}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Current Theme
                  </button>
                </div>
              </div>
              
              {/* Create New Theme */}
              <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Create New Theme
                </h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Theme Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
                    placeholder="My Custom Theme"
                    value={newThemeName}
                    onChange={(e) => setNewThemeName(e.target.value)}
                  />
                </div>
                
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3 mt-4">
                  Theme Colors
                </h3>
                
                <ColorBox
                  label="Primary Color"
                  colorKey="primary"
                  value={editingColors.primary}
                  onChange={(value) => handleColorChange('primary', value)}
                />
                
                <ColorBox
                  label="Secondary Color"
                  colorKey="secondary"
                  value={editingColors.secondary}
                  onChange={(value) => handleColorChange('secondary', value)}
                />
                
                <ColorBox
                  label="Accent Color"
                  colorKey="accent"
                  value={editingColors.accent}
                  onChange={(value) => handleColorChange('accent', value)}
                />
                
                <ColorBox
                  label="Background Color"
                  colorKey="background"
                  value={editingColors.background}
                  onChange={(value) => handleColorChange('background', value)}
                />
                
                <ColorBox
                  label="Text Color"
                  colorKey="text"
                  value={editingColors.text}
                  onChange={(value) => handleColorChange('text', value)}
                />
                
                <button
                  className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  onClick={handleCreateTheme}
                >
                  Create Theme
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'typography' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Typography Settings
              </h2>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                  Typography settings will be implemented in a future update.
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Heading 1</h3>
                    <div className="text-3xl font-bold">This is a heading</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Heading 2</h3>
                    <div className="text-2xl font-bold">This is a heading</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Body Text</h3>
                    <div className="text-base">This is regular body text that would appear in paragraphs throughout the application.</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Small Text</h3>
                    <div className="text-sm">This is smaller text often used for captions or secondary information.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'spacing' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Spacing & Layout Settings
              </h2>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                  Spacing and layout settings will be implemented in a future update.
                </p>
                <div className="mt-4 grid grid-cols-4 gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded text-center">
                    <div className="text-sm text-blue-800 dark:text-blue-200">Small</div>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900 p-6 rounded text-center">
                    <div className="text-sm text-blue-800 dark:text-blue-200">Medium</div>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900 p-8 rounded text-center">
                    <div className="text-sm text-blue-800 dark:text-blue-200">Large</div>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900 p-10 rounded text-center">
                    <div className="text-sm text-blue-800 dark:text-blue-200">X-Large</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeSettingsPage;