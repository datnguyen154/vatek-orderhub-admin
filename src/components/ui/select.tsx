import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const selectVariants = cva(
  "flex w-full rounded-md border bg-surface text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-control-border hover:border-control-border-hover focus-visible:border-primary",
        error:
          "border-destructive hover:border-destructive-hover focus-visible:border-destructive focus-visible:ring-destructive",
      },
      size: {
        sm: "h-control-sm px-3 text-xs",
        md: "h-control-md px-3 text-sm",
        lg: "h-control-lg px-4 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
    VariantProps<typeof selectVariants> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      variant,
      size,
      "aria-invalid": ariaInvalid,
      children,
      ...props
    },
    ref
  ) => {
    const isInvalid = ariaInvalid === true || ariaInvalid === "true";
    const resolvedVariant = variant ?? (isInvalid ? "error" : "default");

    return (
      <select
        ref={ref}
        aria-invalid={isInvalid ? "true" : ariaInvalid}
        className={cn(
          selectVariants({ variant: resolvedVariant, size }),
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";
