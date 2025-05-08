import React from 'react';
import { cn } from '@/lib/utils';
import { SpacingType } from '@/constants/theme';

export interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gap?: SpacingType;
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  className?: string;
}

export const Row = React.forwardRef<HTMLDivElement, RowProps>(
  ({ 
    children, 
    gap = 'md', 
    alignItems = 'center', 
    justifyContent = 'start', 
    wrap = false, 
    className, 
    ...props 
  }, ref) => {
    // Map gap to classes
    const gapClasses = {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
      '2xl': 'gap-10',
      '3xl': 'gap-12',
      '4xl': 'gap-16',
    };

    // Map alignItems to classes
    const alignItemsClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    };

    // Map justifyContent to classes
    const justifyContentClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    };

    // Wrap class
    const wrapClass = wrap ? 'flex-wrap' : 'flex-nowrap';

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          gapClasses[gap],
          alignItemsClasses[alignItems],
          justifyContentClasses[justifyContent],
          wrapClass,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Row.displayName = 'Row';