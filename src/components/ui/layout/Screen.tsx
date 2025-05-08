import React from 'react';
import { cn } from '@/lib/utils';
import { SpacingType, WidthType } from '@/constants/theme';

export interface ScreenProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: SpacingType;
  maxWidth?: WidthType;
  className?: string;
  centered?: boolean;
}

export const Screen = React.forwardRef<HTMLDivElement, ScreenProps>(
  ({ 
    children, 
    padding = 'lg', 
    maxWidth = 'xl', 
    className, 
    centered = false,
    ...props 
  }, ref) => {
    // Map padding to classes
    const paddingClasses = {
      none: 'p-0',
      xs: 'p-1',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
      '2xl': 'p-10',
      '3xl': 'p-12',
      '4xl': 'p-16',
    };

    // Map max width to classes
    const maxWidthClasses = {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      full: 'max-w-full',
      auto: '',  // No max-width
    };

    // Centered class
    const centeredClass = centered ? 'mx-auto' : '';

    return (
      <div
        ref={ref}
        className={cn(
          'min-h-screen bg-background text-text',
          paddingClasses[padding],
          maxWidthClasses[maxWidth],
          centeredClass,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Screen.displayName = 'Screen';