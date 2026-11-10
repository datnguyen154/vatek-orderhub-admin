/**
 * OrderHub Admin Console — Orders Feature API
 *
 * Provides typed data fetching functions for orders using the shared API client.
 */

import { apiClient } from "@/lib/api/client";
import { isOrdersResponse, type OrdersResponse } from "./types";

export interface GetOrdersOptions {
  signal?: AbortSignal;
  scenario?: string;
}

/**
 * Fetches the orders list from `/api/orders`.
 * Supports scenario overrides for local testing and AbortSignal for cancellation.
 */
export async function getOrders(
  options: GetOrdersOptions = {}
): Promise<OrdersResponse> {
  const query = options.scenario
    ? `?scenario=${encodeURIComponent(options.scenario)}`
    : "";

  return apiClient<OrdersResponse>(`/api/orders${query}`, {
    signal: options.signal,
    headers: options.scenario
      ? { "x-mock-scenario": options.scenario }
      : undefined,
    validate: isOrdersResponse,
  });
}
