import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const inputVariants = cva(
  "flex w-full rounded-md border bg-surface text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      type = "text",
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref
  ) => {
    const isInvalid = ariaInvalid === true || ariaInvalid === "true";
    const resolvedVariant = variant ?? (isInvalid ? "error" : "default");

    return (
      <input
        ref={ref}
        type={type}
        aria-invalid={isInvalid ? "true" : ariaInvalid}
        className={cn(
          inputVariants({ variant: resolvedVariant, size }),
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
