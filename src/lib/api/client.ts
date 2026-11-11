import {
  getAccessToken,
  refreshAccessToken,
  signOut,
} from "@/features/auth/token-store";

/**
 * OrderHub Admin Console — Typed Shared API Client
 *
 * Provides a resilient browser HTTP client with:
 * - Configured base URL (NEXT_PUBLIC_API_BASE_URL) with same-origin fallback
 * - Automatic demo access token attachment for same-origin `/api/` endpoints
 * - Resilient 401 handling: one silent token refresh and one retry
 * - Safe sign-out redirect upon refresh failure or retry 401 without retry loop
 * - Strict response.ok validation
 * - Typed errors: HttpError, NetworkError, InvalidPayloadError
 * - AbortSignal support for request lifecycle cancellation (aborted requests never trigger refresh/signOut)
 * - Runtime payload validation via type guards
 */

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export class HttpError extends ApiError {
  readonly status: number;
  readonly statusText: string;
  readonly body?: unknown;

  constructor(status: number, statusText: string, body?: unknown) {
    super(`HTTP ${status} ${statusText}`);
    this.name = "HttpError";
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

export class NetworkError extends ApiError {
  readonly originalError?: unknown;

  constructor(message = "Network connection failed", originalError?: unknown) {
    super(message);
    this.name = "NetworkError";
    this.originalError = originalError;
  }
}

export class InvalidPayloadError extends ApiError {
  constructor(message = "Response payload failed validation") {
    super(message);
    this.name = "InvalidPayloadError";
  }
}

export interface RequestOptions extends Omit<RequestInit, "signal"> {
  signal?: AbortSignal;
  validate?: (data: unknown) => boolean;
}

/**
 * Resolves full URL from endpoint and NEXT_PUBLIC_API_BASE_URL.
 * If endpoint starts with http:// or https://, uses it directly.
 * Otherwise prefixes with configured base URL or defaults to relative same-origin.
 */
export function resolveApiUrl(endpoint: string): string {
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }

  const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!rawBaseUrl) {
    return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  }

  const baseUrl = rawBaseUrl.endsWith("/")
    ? rawBaseUrl.slice(0, -1)
    : rawBaseUrl;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
}

/**
 * Determines whether an endpoint represents a same-origin `/api/` route
 * subject to demo token attachment and 401 refresh handling.
 */
function isSameOriginApiRoute(endpoint: string, resolvedUrl: string): boolean {
  if (endpoint.startsWith("/api/") || endpoint.startsWith("api/")) {
    return true;
  }
  if (typeof window !== "undefined") {
    try {
      const parsed = new URL(resolvedUrl, window.location.origin);
      return (
        parsed.origin === window.location.origin &&
        parsed.pathname.startsWith("/api/")
      );
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Safely parses response error body.
 */
async function extractErrorBody(res: Response): Promise<unknown> {
  try {
    return await res.clone().json();
  } catch {
    try {
      return await res.clone().text();
    } catch {
      return undefined;
    }
  }
}

/**
 * Shared typed API client for browser requests.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions & { validate: (data: unknown) => data is T }
): Promise<T>;
export async function apiClient<T = unknown>(
  endpoint: string,
  options?: RequestOptions
): Promise<T>;
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = resolveApiUrl(endpoint);
  const { validate, headers, ...restOptions } = options;
  const isApi = isSameOriginApiRoute(endpoint, url);

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...((headers as Record<string, string>) || {}),
  };

  // 1. Initial demo access token acquisition for same-origin /api/ routes
  if (
    isApi &&
    typeof window !== "undefined" &&
    !requestHeaders["Authorization"] &&
    !requestHeaders["authorization"]
  ) {
    let token = getAccessToken();
    if (!token) {
      if (options.signal?.aborted) {
        throw new DOMException("The user aborted a request.", "AbortError");
      }
      token = await refreshAccessToken();
      if (!token) {
        await signOut("session_expired");
        throw new HttpError(401, "Unauthorized", {
          code: "token_expired",
          message: "Failed to acquire demo access token",
        });
      }
    }
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...restOptions,
      headers: requestHeaders,
    });
  } catch (error) {
    // If request was aborted by AbortSignal, propagate standard AbortError without refresh/signOut
    if (
      (error instanceof DOMException && error.name === "AbortError") ||
      (error instanceof Error && error.name === "AbortError") ||
      options.signal?.aborted
    ) {
      throw error;
    }

    throw new NetworkError(
      error instanceof Error
        ? error.message
        : "Failed to execute fetch request",
      error
    );
  }

  // 2. Handle 401: one refresh attempt followed by one retry
  if (response.status === 401 && isApi && typeof window !== "undefined") {
    // Aborted requests must never trigger refresh/signOut
    if (options.signal?.aborted) {
      throw new DOMException("The user aborted a request.", "AbortError");
    }

    const refreshedToken = await refreshAccessToken();
    if (!refreshedToken) {
      await signOut("session_expired");
      const errorBody = await extractErrorBody(response);
      throw new HttpError(response.status, response.statusText, errorBody);
    }

    if (options.signal?.aborted) {
      throw new DOMException("The user aborted a request.", "AbortError");
    }

    const retryHeaders: Record<string, string> = {
      ...requestHeaders,
      Authorization: `Bearer ${refreshedToken}`,
    };

    try {
      response = await fetch(url, {
        ...restOptions,
        headers: retryHeaders,
      });
    } catch (retryError) {
      if (
        (retryError instanceof DOMException &&
          retryError.name === "AbortError") ||
        (retryError instanceof Error && retryError.name === "AbortError") ||
        options.signal?.aborted
      ) {
        throw retryError;
      }

      throw new NetworkError(
        retryError instanceof Error
          ? retryError.message
          : "Failed to execute retry fetch request",
        retryError
      );
    }

    // If retry also 401s -> sign out and fail without a loop
    if (response.status === 401) {
      if (!options.signal?.aborted) {
        await signOut("session_expired");
      }
      const errorBody = await extractErrorBody(response);
      throw new HttpError(response.status, response.statusText, errorBody);
    }
  }

  if (!response.ok) {
    const errorBody = await extractErrorBody(response);
    throw new HttpError(response.status, response.statusText, errorBody);
  }

  // Handle 204 No Content (client models typed JSON payloads; 204 has no body)
  if (response.status === 204) {
    throw new InvalidPayloadError(
      "HTTP 204 No Content received when JSON response payload was expected"
    );
  }

  let rawData: unknown;
  try {
    rawData = await response.json();
  } catch (err) {
    throw new InvalidPayloadError(
      `Failed to parse response body as JSON: ${err instanceof Error ? err.message : "Malformed body"}`
    );
  }

  if (validate && !validate(rawData)) {
    throw new InvalidPayloadError(
      "Received payload failed runtime schema validation"
    );
  }

  return rawData as T;
}
