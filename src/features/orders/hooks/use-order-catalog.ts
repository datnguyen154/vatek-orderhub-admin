/**
 * OrderHub Admin Console — Catalog Data Hooks
 *
 * Provides cached client data fetching for Customers and Products using TanStack Query.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { getCustomers, getProducts } from "../api";
import { useMock } from "@/components/providers/mock-provider";

export function useCustomers() {
  const { isReady, error: mockError } = useMock();

  return useQuery({
    queryKey: ["customers"],
    queryFn: ({ signal }) => getCustomers({ signal }),
    enabled: isReady && !mockError,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProducts() {
  const { isReady, error: mockError } = useMock();

  return useQuery({
    queryKey: ["products"],
    queryFn: ({ signal }) => getProducts({ signal }),
    enabled: isReady && !mockError,
    staleTime: 5 * 60 * 1000,
  });
}
