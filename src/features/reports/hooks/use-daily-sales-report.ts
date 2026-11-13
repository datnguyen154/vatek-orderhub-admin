/**
 * OrderHub Admin Console — useDailySalesReport Hook
 *
 * TanStack Query backed hook for daily sales report data management:
 * - Query key: ["reports", "daily", from, to]
 * - Gated by MockProvider readiness boundary (useMock().isReady)
 * - Retains previous data with refreshing indicator using keepPreviousData
 * - Validates date range before dispatching (disables query on invalid range)
 */

"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getDailySalesReport } from "../api";
import type {
  DailySalesReportResponse,
  DailySalesResponseData,
} from "../types";
import { useMock } from "@/components/providers/mock-provider";

export interface UseDailySalesReportOptions {
  from: string;
  to: string;
  scenario?: string;
  isValidRange?: boolean;
}

export interface UseDailySalesReportResult {
  data: DailySalesResponseData | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
  isReady: boolean;
  isPlaceholderData: boolean;
}

export function useDailySalesReport(
  options: UseDailySalesReportOptions
): UseDailySalesReportResult {
  const { from, to, scenario, isValidRange = true } = options;
  const { isReady, error: mockError } = useMock();

  const queryKey = ["reports", "daily", from, to, scenario ?? null] as const;

  const query = useQuery<DailySalesReportResponse>({
    queryKey,
    queryFn: ({ signal }) =>
      getDailySalesReport({
        from,
        to,
        scenario,
        signal,
      }),
    enabled: isReady && !mockError && isValidRange && Boolean(from && to),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  return {
    data: query.data?.data,
    isLoading: !isReady || (query.isLoading && !query.data),
    isFetching: query.isFetching,
    isError: Boolean(mockError) || query.isError,
    refetch: () => {
      void query.refetch();
    },
    isReady,
    isPlaceholderData: query.isPlaceholderData,
  };
}
