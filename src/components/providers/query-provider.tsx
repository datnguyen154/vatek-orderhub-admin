/**
 * OrderHub Admin Console — TanStack Query Client Provider
 *
 * Configures the application-wide QueryClient instance for client data caching.
 * Maintains client-side singleton QueryClient per browser session.
 */

"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 60-second stale time: prevents redundant refetches during operational navigation
            staleTime: 60 * 1000,
            // 5-minute garbage collection time: retains inactive query data in memory
            gcTime: 5 * 60 * 1000,
            // Avoid refetching when window regains focus in local admin console
            refetchOnWindowFocus: false,
            // Retry twice for transient network errors, avoid retrying 4xx client errors
            retry: (failureCount, error) => {
              if (
                error &&
                typeof error === "object" &&
                "status" in error &&
                typeof error.status === "number"
              ) {
                if (error.status >= 400 && error.status < 500) {
                  return false;
                }
              }
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
