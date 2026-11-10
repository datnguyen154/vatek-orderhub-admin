/**
 * OrderHub Admin Console — Orders List Client Island
 *
 * Implements the interactive data island within the Orders route:
 * - URL-backed filter state: debounced search, status dropdown, date range
 * - Server pagination with persistent URL page query
 * - TanStack Query cache with background refetch distinction
 * - Accessible loading skeleton, error with retry, and empty state
 * - Strict adherence to B2B design tokens and 4px spacing scale
 */

"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useOrders } from "../hooks/use-orders";
import { OrdersTable } from "./orders-table";
import { OrdersFilters } from "./orders-filters";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function OrdersLoadingSkeleton() {
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

function OrdersListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read URL query parameters
  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");
  const hasStatusParam = searchParams.has("status");
  const hasSearchParam = searchParams.has("search");
  const hasStartDateParam = searchParams.has("startDate");
  const hasEndDateParam = searchParams.has("endDate");

  const statusParam = searchParams.get("status");
  const searchParam = searchParams.get("search");
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const scenarioParam = searchParams.get("scenario") ?? undefined;

  const page = Math.max(1, parseInt(pageParam || "1", 10) || 1);
  const pageSize = Math.max(1, parseInt(pageSizeParam || "5", 10) || 5);

  const {
    orders,
    total,
    page: currentPage,
    pageSize: currentPageSize,
    totalPages,
    isLoading,
    isFetching,
    isError,
    errorMessage,
    refetch,
    mockError,
  } = useOrders({
    page,
    pageSize,
    status: statusParam?.trim() || undefined,
    search: searchParam?.trim() || undefined,
    startDate: startDateParam?.trim() || undefined,
    endDate: endDateParam?.trim() || undefined,
    scenario: scenarioParam,
  });

  const handleFilterChange = (updates: {
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const newParams = new URLSearchParams(searchParams.toString());

    // Filter change always resets pagination to page 1
    newParams.delete("page");

    if ("status" in updates && updates.status !== undefined) {
      newParams.set("status", updates.status);
    }

    if ("search" in updates && updates.search !== undefined) {
      newParams.set("search", updates.search.trim());
    }

    if ("startDate" in updates && updates.startDate !== undefined) {
      newParams.set("startDate", updates.startDate.trim());
    }

    if ("endDate" in updates && updates.endDate !== undefined) {
      newParams.set("endDate", updates.endDate.trim());
    }

    const qs = newParams.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const handleResetFilters = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("page");
    newParams.set("status", "");
    newParams.set("search", "");
    newParams.set("startDate", "");
    newParams.set("endDate", "");

    const qs = newParams.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (newPage <= 1) {
      newParams.delete("page");
    } else {
      newParams.set("page", String(newPage));
    }

    const qs = newParams.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* 1. URL-Backed Filter Controls */}
      <OrdersFilters
        status={statusParam ?? ""}
        search={searchParam ?? ""}
        startDate={startDateParam ?? ""}
        endDate={endDateParam ?? ""}
        hasStatusParam={hasStatusParam}
        hasSearchParam={hasSearchParam}
        hasStartDateParam={hasStartDateParam}
        hasEndDateParam={hasEndDateParam}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        disabled={Boolean(mockError)}
      />

      {/* 2. Mock Initialization Error */}
      {mockError && (
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
      )}

      {/* 3. Initial Loading Skeleton */}
      {!mockError && isLoading && <OrdersLoadingSkeleton />}

      {/* 4. Query Error State */}
      {!mockError && !isLoading && isError && (
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
                {errorMessage ||
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
      )}

      {/* 5. Empty State */}
      {!mockError && !isLoading && !isError && orders.length === 0 && (
        <div role="status" aria-live="polite" className="space-y-4">
          <Card variant="default" size="md">
            <CardHeader>
              <CardTitle>No orders found</CardTitle>
              <CardDescription>
                There are currently no customer orders matching the active
                filter criteria.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={handleResetFilters}
              >
                Clear filters
              </Button>
              <Button variant="ghost" size="md" onClick={refetch}>
                Refresh
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 6. Success State: Table & Pagination */}
      {!mockError && !isLoading && !isError && orders.length > 0 && (
        <div className="space-y-4">
          {/* Background refetch indicator */}
          <div className="flex items-center justify-between h-control-sm">
            <div className="text-body text-muted-foreground">
              {isFetching && (
                <span
                  role="status"
                  aria-live="polite"
                  className="inline-flex items-center gap-2 text-caption text-primary font-medium"
                >
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Updating orders...
                </span>
              )}
            </div>
            <Button variant="secondary" size="sm" onClick={refetch}>
              Refresh
            </Button>
          </div>

          <OrdersTable
            orders={orders}
            page={currentPage}
            pageSize={currentPageSize}
            total={total}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isFetching={isFetching}
          />
        </div>
      )}
    </div>
  );
}

export function OrdersList() {
  return (
    <Suspense fallback={<OrdersLoadingSkeleton />}>
      <OrdersListContent />
    </Suspense>
  );
}
