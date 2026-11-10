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
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Fetches the orders list from `/api/orders` with pagination and filters.
 * Validates the response at runtime using `isOrdersResponse`.
 */
export async function getOrders(
  options: GetOrdersOptions = {}
): Promise<OrdersResponse> {
  const params = new URLSearchParams();

  if (options.page !== undefined && options.page > 0) {
    params.set("page", String(options.page));
  }
  if (options.pageSize !== undefined && options.pageSize > 0) {
    params.set("pageSize", String(options.pageSize));
  }
  if (
    options.status !== undefined &&
    options.status !== "" &&
    options.status !== "all"
  ) {
    params.set("status", options.status);
  }
  if (options.search !== undefined && options.search.trim() !== "") {
    params.set("search", options.search.trim());
  }
  if (options.startDate !== undefined && options.startDate.trim() !== "") {
    params.set("startDate", options.startDate.trim());
  }
  if (options.endDate !== undefined && options.endDate.trim() !== "") {
    params.set("endDate", options.endDate.trim());
  }
  if (options.scenario) {
    params.set("scenario", options.scenario);
  }

  const queryString = params.toString() ? `?${params.toString()}` : "";

  return apiClient<OrdersResponse>(`/api/orders${queryString}`, {
    signal: options.signal,
    headers: options.scenario
      ? { "x-mock-scenario": options.scenario }
      : undefined,
    validate: isOrdersResponse,
  });
}
