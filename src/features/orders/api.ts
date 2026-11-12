/**
 * OrderHub Admin Console — Orders Feature API
 *
 * Provides typed data fetching and mutation functions for orders, customers,
 * and products using the shared API client.
 */

import { apiClient } from "@/lib/api/client";
import {
  isOrdersResponse,
  isCustomersResponse,
  isProductsResponse,
  isCreateOrderResponse,
  type OrdersResponse,
  type CustomersResponse,
  type ProductsResponse,
  type CreateOrderInput,
  type CreateOrderResponse,
} from "./types";

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

/**
 * Fetches customer fixtures from `/api/customers`.
 */
export async function getCustomers(
  options: { signal?: AbortSignal } = {}
): Promise<CustomersResponse> {
  return apiClient<CustomersResponse>("/api/customers", {
    signal: options.signal,
    validate: isCustomersResponse,
  });
}

/**
 * Fetches product fixtures from `/api/products`.
 */
export async function getProducts(
  options: { signal?: AbortSignal } = {}
): Promise<ProductsResponse> {
  return apiClient<ProductsResponse>("/api/products", {
    signal: options.signal,
    validate: isProductsResponse,
  });
}

/**
 * Submits a new order to `POST /api/orders`.
 */
export async function createOrder(
  input: CreateOrderInput,
  options: { signal?: AbortSignal; createScenario?: string } = {}
): Promise<CreateOrderResponse> {
  return apiClient<CreateOrderResponse>("/api/orders", {
    method: "POST",
    body: JSON.stringify(input),
    signal: options.signal,
    headers: {
      "Content-Type": "application/json",
      ...(options.createScenario
        ? { "x-mock-create": options.createScenario }
        : {}),
    },
    validate: isCreateOrderResponse,
  });
}
