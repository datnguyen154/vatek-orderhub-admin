/**
 * OrderHub Admin Console — Orders List Client Island
 *
 * Implements the interactive data island within the Orders route:
 * - Loading state with accessible skeleton rows (distinct from route loading.tsx)
 * - Empty state with clear messaging and refresh action
 * - Error state with retry action and accessible alert announcements
 * - Success state rendering the semantic OrdersTable within a named scroll region
 * - Awaits MockProvider readiness before rendering and fetching data
 */

"use client";

import { useOrders } from "../hooks/use-orders";
import { OrdersTable } from "./orders-table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function OrdersList() {
  const { state, refetch, isReady, mockError } = useOrders();

  // 1. Mock Initialization Failure
  if (mockError) {
    return (
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
            <CardTitle>Mock Service Error</CardTitle>
          </div>
          <CardDescription>
            The browser mock service worker failed to start.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-body text-destructive font-mono text-caption">
            {mockError}
          </p>
          <Button variant="primary" size="md" onClick={refetch}>
            Retry Initialization
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 2. Client Loading State (before mock worker ready or while fetching)
  if (!isReady || state.status === "loading" || state.status === "idle") {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-live="polite"
        className="space-y-4"
      >
        <span className="sr-only">Loading customer orders data...</span>
        <div className="flex items-center justify-between pb-2">
          <div className="h-6 w-32 bg-muted animate-pulse rounded-md motion-reduce:animate-none" />
          <div className="h-9 w-24 bg-muted animate-pulse rounded-md motion-reduce:animate-none" />
        </div>
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="border-b border-border bg-muted/60 py-3 px-4 flex gap-4">
            <div className="h-4 w-24 bg-muted animate-pulse rounded motion-reduce:animate-none" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded motion-reduce:animate-none" />
            <div className="h-4 w-20 bg-muted animate-pulse rounded motion-reduce:animate-none" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded motion-reduce:animate-none ml-auto" />
            <div className="h-4 w-20 bg-muted animate-pulse rounded motion-reduce:animate-none ml-4" />
          </div>
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className="py-4 px-4 flex items-center gap-4"
                aria-hidden="true"
              >
                <div className="h-4 w-28 bg-muted animate-pulse rounded motion-reduce:animate-none" />
                <div className="space-y-1">
                  <div className="h-4 w-40 bg-muted animate-pulse rounded motion-reduce:animate-none" />
                  <div className="h-3 w-16 bg-muted animate-pulse rounded motion-reduce:animate-none" />
                </div>
                <div className="h-4 w-24 bg-muted animate-pulse rounded motion-reduce:animate-none" />
                <div className="h-4 w-20 bg-muted animate-pulse rounded motion-reduce:animate-none ml-auto" />
                <div className="h-6 w-20 bg-muted animate-pulse rounded-full motion-reduce:animate-none ml-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. Error State with Retry
  if (state.status === "error") {
    return (
      <div role="alert" aria-live="assertive" className="space-y-4">
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
              <CardTitle>Unable to load orders</CardTitle>
            </div>
            <CardDescription>
              {state.errorMessage ||
                "An unexpected network or server error occurred while retrieving order data."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="primary" size="md" onClick={refetch}>
              Retry loading orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 4. Empty State
  if (state.status === "empty") {
    return (
      <div role="status" aria-live="polite" className="space-y-4">
        <Card variant="default" size="md">
          <CardHeader>
            <CardTitle>No orders found</CardTitle>
            <CardDescription>
              There are currently no customer orders matching the active
              criteria.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" size="md" onClick={refetch}>
              Refresh orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 5. Success State
  return (
    <div className="space-y-4">
      {/* Table Toolbar & Meta Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-body text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {state.data.length}
          </span>{" "}
          of <span className="font-medium text-foreground">{state.total}</span>{" "}
          orders
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={refetch}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Semantic Orders Table */}
      <OrdersTable orders={state.data} />
    </div>
  );
}
