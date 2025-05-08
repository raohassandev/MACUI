import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";
import { AlertCircle, Check } from "lucide-react";

const inputVariants = cva(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        filled: "bg-muted/50 border-0 focus-visible:bg-background",
        outline: "border border-input",
      },
      size: {
        default: "h-10 px-3 py-2",
        sm: "h-8 px-2 py-1 text-xs",
        lg: "h-12 px-4 py-3 text-base",
      } as Record<string, string>,
      state: {
        default: "",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-green-500 focus-visible:ring-green-500",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  fullWidth?: boolean;
  wrapperClassName?: string;
}

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      state: {
        default: "text-foreground",
        error: "text-destructive",
        success: "text-green-500",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

const helperTextVariants = cva(
  "text-xs mt-1",
  {
    variants: {
      state: {
        default: "text-muted-foreground",
        error: "text-destructive",
        success: "text-green-500",
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = "text", 
    variant,
    size,
    state,
    label,
    helperText,
    error,
    startAdornment,
    endAdornment,
    fullWidth = false,
    wrapperClassName,
    ...props 
  }, ref) => {
    // Determine state based on error
    const inputState = error ? "error" : state;
    
    // Icon based on state
    const stateIcon = () => {
      if (inputState === "error") {
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      } 
      if (inputState === "success") {
        return <Check className="h-4 w-4 text-green-500" />;
      }
      return null;
    };
    
    return (
      <div className={cn(
        "flex flex-col", 
        fullWidth ? "w-full" : "",
        wrapperClassName
      )}>
        {label && (
          <LabelPrimitive.Root
            className={cn(
              labelVariants({ state: inputState }),
              "mb-2"
            )}
          >
            {label}
          </LabelPrimitive.Root>
        )}
        
        <div className="relative flex items-center">
          {startAdornment && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              {startAdornment}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              inputVariants({ variant, size: size as any, state: inputState }),
              startAdornment && "pl-10",
              (endAdornment || inputState !== "default") && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          
          {(endAdornment || inputState !== "default") && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              {endAdornment}
              {!endAdornment && stateIcon()}
            </div>
          )}
        </div>
        
        {(helperText || error) && (
          <div className={cn(
            helperTextVariants({ state: inputState }),
            "mt-1"
          )}>
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants, labelVariants, helperTextVariants };