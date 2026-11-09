"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OrdersErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Orders Error Boundary — Client Component
 *
 * Next.js 15 App Router route error boundary for `/orders`.
 * - Required to be a Client Component for route error boundary and `reset` action.
 * - Renders a calm, useful error heading and retry button.
 * - Secure: Does not expose `error.message`, stack traces, cookies, or secrets to the UI.
 * - Retry button triggers router.refresh() and reset() to re-render server and client segments.
 */
export default function OrdersError({
  error: _error,
  reset,
}: OrdersErrorProps) {
  const router = useRouter();

  const handleRetry = () => {
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

  return (
    <div role="alert" aria-live="assertive" className="space-y-6">
      <header className="pb-2">
        <h1 className="text-page-title font-semibold text-foreground tracking-tight">
          Orders
        </h1>
        <p className="mt-1 text-body text-muted-foreground">
          Fulfillment and lifecycle operations for customer orders
        </p>
      </header>

      <Card variant="default" size="md">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <span
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive-muted text-destructive-muted-foreground"
              aria-hidden="true"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </span>
            <CardTitle>Unable to load orders workspace</CardTitle>
          </div>
          <CardDescription>
            An unexpected error occurred while loading this view. You can retry
            loading the workspace or return later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="primary" size="md" onClick={handleRetry}>
            Retry loading
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
