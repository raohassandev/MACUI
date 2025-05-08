import React from 'react';
import { cn } from '@/lib/utils';
import { ColorType } from '@/constants/theme';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  weight?: 'normal' | 'medium' | 'bold';
  color?: ColorType;
  className?: string;
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ 
    children, 
    level = 2, 
    weight = 'bold', 
    color, 
    className, 
    ...props 
  }, ref) => {
    const Component = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

    // Map levels to classes for consistent styling
    const levelClasses = {
      1: 'text-4xl leading-[3rem] lg:text-5xl lg:leading-[3.5rem] tracking-tight',
      2: 'text-3xl leading-[2.5rem] tracking-tight',
      3: 'text-2xl leading-[2.25rem] tracking-tight',
      4: 'text-xl leading-7',
      5: 'text-lg leading-6',
      6: 'text-base leading-6',
    };

    // Map weights to classes
    const weightClasses = {
      normal: 'font-normal',
      medium: 'font-medium',
      bold: 'font-bold',
    };

    // Map colors to classes
    const colorClasses = color ? `text-${color}` : '';

    return (
      <Component
        ref={ref}
        className={cn(
          levelClasses[level],
          weightClasses[weight],
          colorClasses,
          'scroll-m-20',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Heading.displayName = 'Heading';