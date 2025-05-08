import React from 'react';
import { cn } from '@/lib/utils';
import { ColorType } from '@/constants/theme';

export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'body' | 'small' | 'large' | 'lead';
  weight?: 'normal' | 'medium' | 'bold';
  color?: ColorType;
  className?: string;
  as?: React.ElementType;
}

export const Text = React.forwardRef<HTMLSpanElement, TextProps>(
  ({ 
    children, 
    variant = 'body', 
    weight = 'normal', 
    color, 
    className, 
    as: Component = 'span',
    ...props 
  }, ref) => {
    // Map variants to classes
    const variantClasses = {
      body: 'text-base',
      small: 'text-sm',
      large: 'text-lg',
      lead: 'text-xl leading-7',
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
          variantClasses[variant],
          weightClasses[weight],
          colorClasses,
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';