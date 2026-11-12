/**
 * OrderHub Admin Console — useOrderDetail Hook
 *
 * TanStack Query backed hook for Order Detail data management:
 * - Query key: ["order", orderId]
 * - Connects to MockProvider readiness boundary before fetching
 * - Exposes order, loading, error, not_found, and refetch states
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrderDetail } from "../api";
import type { OrderDetail } from "../types";
import { useMock } from "@/components/providers/mock-provider";
import { HttpError } from "@/lib/api/client";

export function useOrderDetail(orderId: string) {
  const { isReady, error: mockError } = useMock();

  const query = useQuery<OrderDetail, unknown>({
    queryKey: ["order", orderId],
    queryFn: async ({ signal }) => {
      const res = await getOrderDetail(orderId, { signal });
      return res.data;
    },
    enabled: isReady && !mockError && !!orderId,
    staleTime: 60 * 1000,
  });

  const isNotFound =
    query.error instanceof HttpError && query.error.status === 404;

  return {
    order: query.data,
    isLoading: query.isLoading || !isReady,
    isError: query.isError && !isNotFound,
    isNotFound,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
