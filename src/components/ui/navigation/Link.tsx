import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from "class-variance-authority";

const linkVariants = cva(
  "inline-flex items-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "text-primary hover:text-primary/80 underline-offset-4 hover:underline",
        underlined: "text-primary underline underline-offset-4 hover:text-primary/80",
        muted: "text-muted-foreground hover:text-foreground",
        nav: "text-foreground/60 hover:text-foreground transition-colors",
        button: "inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary text-white h-10 px-4 py-2 hover:bg-primary/90",
      },
      size: {
        default: "text-base",
        sm: "text-sm",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  href: string;
  external?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, size, href, external = false, startIcon, endIcon, children, ...props }, ref) => {
    const externalProps = external ? {
      target: "_blank",
      rel: "noopener noreferrer",
    } : {};
    
    return (
      <a
        ref={ref}
        href={href}
        className={cn(linkVariants({ variant, size, className }))}
        {...externalProps}
        {...props}
      >
        {startIcon && <span className="mr-2">{startIcon}</span>}
        {children}
        {endIcon && <span className="ml-2">{endIcon}</span>}
        {external && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-1 h-3 w-3"
          >
            <path d="M7 7h10v10" />
            <path d="M7 17 17 7" />
          </svg>
        )}
      </a>
    );
  }
);

Link.displayName = "Link";