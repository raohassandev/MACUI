import React from 'react';

export type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LoaderType = 'spinner' | 'dots' | 'ring' | 'bars' | 'pulse';

export interface LoaderProps {
  size?: LoaderSize;
  type?: LoaderType;
  color?: string;
  className?: string;
  label?: string;
  labelPosition?: 'top' | 'right' | 'bottom' | 'left';
  fullPage?: boolean;
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  type = 'spinner',
  color,
  className = '',
  label,
  labelPosition = 'bottom',
  fullPage = false,
  overlay = false,
  overlayColor = '#000',
  overlayOpacity = 0.5,
}) => {
  // Size mapping
  const sizeMap: Record<LoaderSize, number> = {
    xs: 16,
    sm: 24,
    md: 32,
    lg: 48,
    xl: 64,
  };
  
  const pixelSize = sizeMap[size];
  
  // Color class logic
  let colorClass = '';
  
  if (color) {
    // Custom color is provided as a prop
    // We'll apply it directly in the style
  } else {
    // Use theme colors
    colorClass = 'text-blue-500 dark:text-blue-400';
  }
  
  // Render different loader types
  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return (
          <div 
            className={`animate-spin rounded-full border-t-2 border-b-2 ${colorClass}`}
            style={{
              width: pixelSize,
              height: pixelSize,
              borderColor: color,
              borderTopColor: 'transparent',
            }}
          ></div>
        );
        
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`rounded-full ${colorClass}`}
                style={{
                  width: pixelSize / 4,
                  height: pixelSize / 4,
                  backgroundColor: color,
                  animation: `bounce 1.4s infinite ease-in-out ${i * 0.16}s`,
                }}
              ></div>
            ))}
            <style jsx>{`
              @keyframes bounce {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1.0); }
              }
            `}</style>
          </div>
        );
        
      case 'ring':
        return (
          <div className="relative">
            <div
              className={`rounded-full border-4 opacity-30 ${colorClass}`}
              style={{
                width: pixelSize,
                height: pixelSize,
                borderColor: color,
              }}
            ></div>
            <div
              className={`absolute top-0 left-0 rounded-full border-4 border-t-transparent animate-spin ${colorClass}`}
              style={{
                width: pixelSize,
                height: pixelSize,
                borderColor: color,
                borderTopColor: 'transparent',
              }}
            ></div>
          </div>
        );
        
      case 'bars':
        return (
          <div className="flex space-x-1 items-end">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`${colorClass}`}
                style={{
                  width: pixelSize / 8,
                  height: (i % 2 === 0 ? 0.6 : 1) * (pixelSize / 2),
                  backgroundColor: color,
                  animation: `barLoader 1.2s infinite ease-in-out ${i * 0.1}s`,
                }}
              ></div>
            ))}
            <style jsx>{`
              @keyframes barLoader {
                0%, 40%, 100% { transform: scaleY(0.4); }
                20% { transform: scaleY(1.0); }
              }
            `}</style>
          </div>
        );
        
      case 'pulse':
        return (
          <div 
            className={`rounded-full animate-pulse ${colorClass}`}
            style={{
              width: pixelSize,
              height: pixelSize,
              backgroundColor: color,
            }}
          ></div>
        );
        
      default:
        return null;
    }
  };
  
  // Container classes for layout
  const containerClasses = `flex items-center justify-center ${
    ['top', 'bottom'].includes(labelPosition) ? 'flex-col' : 'flex-row'
  } ${
    labelPosition === 'right' ? 'space-x-3' : 
    labelPosition === 'left' ? 'flex-row-reverse space-x-3 space-x-reverse' : 
    labelPosition === 'top' ? 'flex-col-reverse space-y-2 space-y-reverse' : 'space-y-2'
  } ${className}`;
  
  // Full page container
  if (fullPage) {
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          backgroundColor: overlay ? overlayColor : 'transparent',
          opacity: overlay ? overlayOpacity : 1,
        }}
      >
        <div className={containerClasses}>
          {renderLoader()}
          {label && (
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {label}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Regular container
  return (
    <div className={containerClasses}>
      {renderLoader()}
      {label && (
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </div>
      )}
    </div>
  );
};

export default Loader;