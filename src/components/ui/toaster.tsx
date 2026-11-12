/**
 * OrderHub Admin Console — Toaster Component
 *
 * Wraps Sonner Toaster in unstyled mode with design tokens and next-themes synchronization.
 */

"use client";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  const { theme = "system" } = useTheme();

  return (
    <SonnerToaster
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      position="bottom-right"
      icons={{
        success: (
          <svg
            className="h-4 w-4 text-success shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ),
        error: (
          <svg
            className="h-4 w-4 text-destructive shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ),
        warning: (
          <svg
            className="h-4 w-4 text-warning shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        ),
        info: (
          <svg
            className="h-4 w-4 text-primary shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group flex w-full items-center justify-between gap-3 overflow-hidden rounded-lg border p-4 shadow-lg text-sm data-[type=default]:border-border data-[type=default]:bg-surface data-[type=default]:text-foreground data-[type=error]:border-destructive/30 data-[type=error]:bg-destructive-muted data-[type=error]:text-destructive-muted-foreground data-[type=success]:border-success/30 data-[type=success]:bg-success-muted data-[type=success]:text-success-muted-foreground data-[type=warning]:border-warning/30 data-[type=warning]:bg-warning-muted data-[type=warning]:text-warning-muted-foreground data-[type=info]:border-primary/30 data-[type=info]:bg-primary-muted data-[type=info]:text-primary-muted-foreground",
          title: "font-medium text-inherit text-sm",
          description: "text-xs opacity-90",
          actionButton:
            "inline-flex h-control-sm items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
          cancelButton:
            "inline-flex h-control-sm items-center justify-center rounded-md bg-muted px-3 text-xs font-medium text-muted-foreground hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
          error:
            "border-destructive/30 bg-destructive-muted text-destructive-muted-foreground",
          success:
            "border-success/30 bg-success-muted text-success-muted-foreground",
          warning:
            "border-warning/30 bg-warning-muted text-warning-muted-foreground",
          info: "border-primary/30 bg-primary-muted text-primary-muted-foreground",
        },
      }}
    />
  );
}
