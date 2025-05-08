import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { labelVariants, helperTextVariants } from "./Input";

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string;
  helperText?: string;
  error?: string;
  wrapperClassName?: string;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ 
    className, 
    label, 
    helperText, 
    error, 
    wrapperClassName,
    ...props 
  }, ref) => {
  // Determine state based on error
  const state = error ? "error" : "default";
  
  return (
    <div className={cn("flex flex-col", wrapperClassName)}>
      <div className="flex items-start space-x-2">
        <CheckboxPrimitive.Root
          ref={ref}
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        >
          <CheckboxPrimitive.Indicator
            className={cn("flex items-center justify-center text-current")}
          >
            <Check className="h-3 w-3" />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        
        {label && (
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor={props.id}
              className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                labelVariants({ state })
              )}
            >
              {label}
            </label>
          </div>
        )}
      </div>
      
      {(helperText || error) && (
        <div className={cn(
          helperTextVariants({ state }),
          "mt-1 pl-6"
        )}>
          {error || helperText}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };