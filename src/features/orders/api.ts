/**
 * OrderHub Admin Console — Orders Feature API
 *
 * Provides typed data fetching and mutation functions for orders, customers,
 * and products using the shared API client.
 */

import { apiClient } from "@/lib/api/client";
import {
  getAccessToken,
  refreshAccessToken,
  signOut,
} from "@/features/auth/token-store";
import {
  isOrdersResponse,
  isCustomersResponse,
  isProductsResponse,
  isCreateOrderResponse,
  isOrderDetailResponse,
  isUpdateOrderStatusResponse,
  isUploadInvoiceResponse,
  type OrdersResponse,
  type CustomersResponse,
  type ProductsResponse,
  type CreateOrderInput,
  type CreateOrderResponse,
  type OrderDetailResponse,
  type UpdateOrderStatusResponse,
  type UploadInvoiceResponse,
  type OrderStatus,
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

/**
 * Fetches order details for a specific orderId from `/api/orders/:orderId`.
 */
export async function getOrderDetail(
  orderId: string,
  options: { signal?: AbortSignal } = {}
): Promise<OrderDetailResponse> {
  return apiClient<OrderDetailResponse>(`/api/orders/${orderId}`, {
    signal: options.signal,
    validate: isOrderDetailResponse,
  });
}

/**
 * Updates an order's status via `PATCH /api/orders/:orderId/status`.
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  options: { signal?: AbortSignal; statusScenario?: string } = {}
): Promise<UpdateOrderStatusResponse> {
  const scenario =
    options.statusScenario ||
    (typeof window !== "undefined"
      ? window.localStorage?.getItem("orderhub_mock_status") || undefined
      : undefined);

  return apiClient<UpdateOrderStatusResponse>(`/api/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    signal: options.signal,
    headers: {
      "Content-Type": "application/json",
      ...(scenario ? { "x-mock-status": scenario } : {}),
    },
    validate: isUpdateOrderStatusResponse,
  });
}

export class UploadError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly body?: unknown;

  constructor(status: number, statusText: string, body?: unknown) {
    super(`HTTP ${status} ${statusText}`);
    this.name = "UploadError";
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percent: number;
}

export interface UploadInvoiceOptions {
  onProgress?: (event: UploadProgressEvent) => void;
  signal?: AbortSignal;
  uploadScenario?: string;
}

/**
 * Uploads an invoice PDF to `/api/orders/:orderId/invoice` using XMLHttpRequest
 * to support native upload progress tracking.
 * Attaches the demo Bearer token and handles 401 refresh/retry once.
 */
export async function uploadInvoice(
  orderId: string,
  file: File,
  options: UploadInvoiceOptions = {}
): Promise<UploadInvoiceResponse> {
  let token = getAccessToken();
  if (!token) {
    if (options.signal?.aborted) {
      throw new DOMException("The user aborted a request.", "AbortError");
    }
    token = await refreshAccessToken();
    if (!token) {
      await signOut("session_expired");
      throw new UploadError(401, "Unauthorized", {
        code: "token_expired",
        message: "Failed to acquire demo access token",
      });
    }
  }

  const executeUpload = (
    bearerToken: string
  ): Promise<UploadInvoiceResponse> => {
    return new Promise((resolve, reject) => {
      if (options.signal?.aborted) {
        return reject(
          new DOMException("The user aborted a request.", "AbortError")
        );
      }

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/api/orders/${orderId}/invoice`);
      xhr.setRequestHeader("Authorization", `Bearer ${bearerToken}`);

      const scenario =
        options.uploadScenario ||
        (typeof window !== "undefined"
          ? window.localStorage?.getItem("orderhub_mock_upload") || undefined
          : undefined);

      if (scenario) {
        xhr.setRequestHeader("x-mock-upload", scenario);
      }

      if (options.onProgress) {
        xhr.upload.onprogress = (e: ProgressEvent) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            options.onProgress?.({
              loaded: e.loaded,
              total: e.total,
              percent,
            });
          }
        };
      }

      const onAbort = () => {
        xhr.abort();
      };

      if (options.signal) {
        options.signal.addEventListener("abort", onAbort, { once: true });
      }

      xhr.onload = () => {
        if (options.signal) {
          options.signal.removeEventListener("abort", onAbort);
        }

        if (xhr.status === 201) {
          let parsed: unknown;
          try {
            parsed = JSON.parse(xhr.responseText);
          } catch {
            return reject(
              new UploadError(
                500,
                "Invalid JSON",
                "Failed to parse JSON response"
              )
            );
          }
          if (!isUploadInvoiceResponse(parsed)) {
            return reject(
              new UploadError(
                500,
                "Schema mismatch",
                "Received invalid invoice response"
              )
            );
          }
          return resolve(parsed);
        }

        let errorBody: unknown;
        try {
          errorBody = JSON.parse(xhr.responseText);
        } catch {
          errorBody = xhr.responseText;
        }
        reject(new UploadError(xhr.status, xhr.statusText, errorBody));
      };

      xhr.onerror = () => {
        if (options.signal) {
          options.signal.removeEventListener("abort", onAbort);
        }
        reject(new Error("Network connection failed during upload"));
      };

      xhr.onabort = () => {
        if (options.signal) {
          options.signal.removeEventListener("abort", onAbort);
        }
        reject(new DOMException("The user aborted a request.", "AbortError"));
      };

      const formData = new FormData();
      formData.append("file", file);
      xhr.send(formData);
    });
  };

  try {
    return await executeUpload(token);
  } catch (error: unknown) {
    if (
      error instanceof UploadError &&
      error.status === 401 &&
      !options.signal?.aborted
    ) {
      const refreshedToken = await refreshAccessToken();
      if (!refreshedToken) {
        await signOut("session_expired");
        throw error;
      }
      try {
        return await executeUpload(refreshedToken);
      } catch (retryError: unknown) {
        if (
          retryError instanceof UploadError &&
          retryError.status === 401 &&
          !options.signal?.aborted
        ) {
          await signOut("session_expired");
        }
        throw retryError;
      }
    }
    throw error;
  }
}
