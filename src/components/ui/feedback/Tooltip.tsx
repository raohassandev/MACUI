import React, { useState, useRef, useEffect } from 'react';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';
export type TooltipTrigger = 'hover' | 'click' | 'focus';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: TooltipPosition;
  trigger?: TooltipTrigger | TooltipTrigger[];
  delay?: number;
  maxWidth?: number | string;
  className?: string;
  arrow?: boolean;
  interactive?: boolean;
  disabled?: boolean;
  dark?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  trigger = 'hover',
  delay = 0,
  maxWidth = 200,
  className = '',
  arrow = true,
  interactive = false,
  disabled = false,
  dark = false,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  
  const tooltipRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<number | null>(null);
  
  const triggers = Array.isArray(trigger) ? trigger : [trigger];
  
  // Calculate tooltip position based on the parent element
  const calculatePosition = () => {
    if (!childRef.current || !tooltipRef.current) return;
    
    const childRect = childRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    
    // Default positions
    let top = 0;
    let left = 0;
    
    // Arrow positions
    let arrowTop = 0;
    let arrowLeft = 0;
    
    const gap = 8; // Gap between child and tooltip
    
    switch (position) {
      case 'top':
        top = childRect.top + scrollTop - tooltipRect.height - gap;
        left = childRect.left + scrollLeft + (childRect.width / 2) - (tooltipRect.width / 2);
        arrowTop = tooltipRect.height;
        arrowLeft = tooltipRect.width / 2 - 5; // 5 is half the arrow width
        break;
      case 'right':
        top = childRect.top + scrollTop + (childRect.height / 2) - (tooltipRect.height / 2);
        left = childRect.right + scrollLeft + gap;
        arrowTop = tooltipRect.height / 2 - 5;
        arrowLeft = -5;
        break;
      case 'bottom':
        top = childRect.bottom + scrollTop + gap;
        left = childRect.left + scrollLeft + (childRect.width / 2) - (tooltipRect.width / 2);
        arrowTop = -5;
        arrowLeft = tooltipRect.width / 2 - 5;
        break;
      case 'left':
        top = childRect.top + scrollTop + (childRect.height / 2) - (tooltipRect.height / 2);
        left = childRect.left + scrollLeft - tooltipRect.width - gap;
        arrowTop = tooltipRect.height / 2 - 5;
        arrowLeft = tooltipRect.width;
        break;
    }
    
    // Boundary checking
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Ensure tooltip is fully visible in viewport
    if (left < 10) {
      const adjustment = 10 - left;
      left = 10;
      arrowLeft -= adjustment;
    } else if (left + tooltipRect.width > viewportWidth - 10) {
      const adjustment = left + tooltipRect.width - (viewportWidth - 10);
      left -= adjustment;
      arrowLeft += adjustment;
    }
    
    if (top < 10) {
      const adjustment = 10 - top;
      top = 10;
      arrowTop -= adjustment;
    } else if (top + tooltipRect.height > viewportHeight - 10) {
      const adjustment = top + tooltipRect.height - (viewportHeight - 10);
      top -= adjustment;
      arrowTop += adjustment;
    }
    
    setTooltipPosition({ top, left });
    setArrowPosition({ top: arrowTop, left: arrowLeft });
  };
  
  // Handle showing and hiding the tooltip
  const showTooltip = () => {
    if (disabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (delay > 0) {
      timeoutRef.current = window.setTimeout(() => {
        setIsVisible(true);
        requestAnimationFrame(calculatePosition);
      }, delay);
    } else {
      setIsVisible(true);
      requestAnimationFrame(calculatePosition);
    }
  };
  
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setIsVisible(false);
  };
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (isVisible) {
        calculatePosition();
      }
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible]);
  
  // Add event listeners based on trigger type
  const getEventHandlers = () => {
    const handlers: Record<string, any> = {};
    
    if (triggers.includes('hover')) {
      handlers.onMouseEnter = showTooltip;
      handlers.onMouseLeave = hideTooltip;
    }
    
    if (triggers.includes('click')) {
      handlers.onClick = () => (isVisible ? hideTooltip() : showTooltip());
    }
    
    if (triggers.includes('focus')) {
      handlers.onFocus = showTooltip;
      handlers.onBlur = hideTooltip;
    }
    
    return handlers;
  };
  
  // Tooltip handlers for interactive mode
  const getTooltipHandlers = () => {
    if (!interactive) return {};
    
    return {
      onMouseEnter: showTooltip,
      onMouseLeave: hideTooltip,
    };
  };
  
  // Clone child with ref and event handlers
  const childWithProps = React.cloneElement(children, {
    ref: childRef,
    ...getEventHandlers(),
  });
  
  // Calculate arrow styles based on position
  const getArrowStyles = () => {
    const base = {
      position: 'absolute',
      width: '10px',
      height: '10px',
      transform: 'rotate(45deg)',
      backgroundColor: dark ? '#374151' : 'white',
      top: `${arrowPosition.top}px`,
      left: `${arrowPosition.left}px`,
    };
    
    switch (position) {
      case 'top':
        return {
          ...base,
          borderRight: '1px solid rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          top: `${arrowPosition.top}px`,
          boxShadow: dark ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)',
        };
      case 'right':
        return {
          ...base,
          borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          left: `${arrowPosition.left}px`,
          boxShadow: dark ? 'none' : '-1px 1px 2px rgba(0, 0, 0, 0.05)',
        };
      case 'bottom':
        return {
          ...base,
          borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          top: `${arrowPosition.top}px`,
          boxShadow: dark ? 'none' : '-1px -1px 2px rgba(0, 0, 0, 0.05)',
        };
      case 'left':
        return {
          ...base,
          borderRight: '1px solid rgba(0, 0, 0, 0.1)',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          left: `${arrowPosition.left}px`,
          boxShadow: dark ? 'none' : '1px -1px 2px rgba(0, 0, 0, 0.05)',
        };
      default:
        return base;
    }
  };
  
  return (
    <>
      {childWithProps}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`fixed z-50 ${className}`}
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.15s ease-in-out',
          }}
          {...getTooltipHandlers()}
        >
          <div
            className={`rounded py-2 px-3 text-sm shadow-md ${
              dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
            }`}
          >
            {content}
          </div>
          
          {arrow && <div style={getArrowStyles()} />}
        </div>
      )}
    </>
  );
};

export default Tooltip;