import React from 'react';
import { cn } from '@/lib/utils';
import { ColorType } from '@/constants/theme';

export interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  size?: 'default' | 'small' | 'large' | 'lead';
  weight?: 'normal' | 'medium' | 'bold';
  color?: ColorType;
  className?: string;
}

export const Paragraph = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ 
    children, 
    size = 'default', 
    weight = 'normal', 
    color, 
    className, 
    ...props 
  }, ref) => {
    // Map sizes to classes
    const sizeClasses = {
      default: 'text-base leading-7',
      small: 'text-sm leading-5',
      large: 'text-lg leading-7',
      lead: 'text-xl leading-8',
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
      <p
        ref={ref}
        className={cn(
          sizeClasses[size],
          weightClasses[weight],
          colorClasses,
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);

Paragraph.displayName = 'Paragraph';