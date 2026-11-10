/**
 * OrderHub Admin Console — useOrders Hook
 *
 * TanStack Query backed hook for Orders data management:
 * - Stable query keys containing current page and active filters
 * - Avoids showing old-page rows as if they belonged to the newly selected page
 * - Connects to MockProvider readiness boundary before fetching
 * - 60s staleTime for administrative caching efficiency
 * - Exposes loading, background fetching, error, empty, and success states
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../api";
import type { Order, OrdersResponse } from "../types";
import { useMock } from "@/components/providers/mock-provider";

export interface UseOrdersOptions {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  scenario?: string;
}

export type OrdersFetchStatus =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error";

export interface OrdersState {
  status: OrdersFetchStatus;
  data: Order[];
  total: number;
  errorMessage: string | null;
}

export interface UseOrdersResult {
  data: OrdersResponse | undefined;
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => void;
  isReady: boolean;
  mockError: string | null;
  isPlaceholderData: boolean;
  state: OrdersState;
}

export function useOrders(options: UseOrdersOptions = {}): UseOrdersResult {
  const { isReady, error: mockError } = useMock();

  const page = options.page && options.page > 0 ? options.page : 1;
  const pageSize =
    options.pageSize && options.pageSize > 0 ? options.pageSize : 5;
  const status = options.status || undefined;
  const search = options.search?.trim() || undefined;
  const startDate = options.startDate?.trim() || undefined;
  const endDate = options.endDate?.trim() || undefined;
  const scenario = options.scenario || undefined;

  // Stable query key incorporating every active filter and page
  const queryKey = [
    "orders",
    {
      page,
      pageSize,
      status: status ?? null,
      search: search ?? null,
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      scenario: scenario ?? null,
    },
  ] as const;

  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) =>
      getOrders({
        signal,
        page,
        pageSize,
        status,
        search,
        startDate,
        endDate,
        scenario,
      }),
    enabled: isReady && !mockError,
    staleTime: 60 * 1000, // 60 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData, previousQuery) => {
      // Re-use previous data only when refetching the exact same page & filters.
      // Avoid showing previous-page data when the page or filter changes,
      // preventing misleading page state.
      if (!previousData || !previousQuery) return undefined;
      const prevKey = previousQuery.queryKey;
      const isSameKey =
        Array.isArray(prevKey) &&
        prevKey[0] === "orders" &&
        JSON.stringify(prevKey[1]) === JSON.stringify(queryKey[1]);
      return isSameKey ? previousData : undefined;
    },
  });

  const orders = query.data?.data ?? [];
  const total = query.data?.total ?? 0;
  const totalPages =
    query.data?.totalPages ?? (total > 0 ? Math.ceil(total / pageSize) : 0);

  let errorMessage: string | null = null;
  if (mockError) {
    errorMessage = `Mock service worker failed to start: ${mockError}`;
  } else if (query.error) {
    const err = query.error;
    if (err.name === "HttpError") {
      errorMessage = `Server returned error (${err.message}).`;
    } else if (err.name === "NetworkError") {
      errorMessage =
        "Network connection failed. Please verify your connection.";
    } else if (err.name === "InvalidPayloadError") {
      errorMessage = "Received invalid data structure from API.";
    } else {
      errorMessage = err.message || "Unable to load orders. Please try again.";
    }
  }

  let statusState: OrdersFetchStatus = "idle";
  if (mockError || query.isError) {
    statusState = "error";
  } else if (!isReady || query.isLoading) {
    statusState = "loading";
  } else if (query.data) {
    statusState = orders.length === 0 ? "empty" : "success";
  }

  const state: OrdersState = {
    status: statusState,
    data: orders,
    total,
    errorMessage,
  };

  return {
    data: query.data,
    orders,
    total,
    page,
    pageSize,
    totalPages,
    isLoading: !isReady || query.isLoading,
    isFetching: query.isFetching,
    isError: Boolean(mockError) || query.isError,
    errorMessage,
    refetch: () => {
      void query.refetch();
    },
    isReady,
    mockError,
    isPlaceholderData: query.isPlaceholderData,
    state,
  };
}
