import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-medium transition-colors border",
  {
    variants: {
      variant: {
        neutral: "bg-muted text-muted-foreground border-border",
        success:
          "bg-success-muted text-success-muted-foreground border-success/20",
        warning:
          "bg-warning-muted text-warning-muted-foreground border-warning/20",
        destructive:
          "bg-destructive-muted text-destructive-muted-foreground border-destructive/20",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        md: "px-3 py-1 text-xs",
        lg: "px-4 py-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
