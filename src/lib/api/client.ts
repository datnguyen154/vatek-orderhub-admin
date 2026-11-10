/**
 * OrderHub Admin Console — Typed Shared API Client
 *
 * Provides a resilient browser HTTP client with:
 * - Configured base URL (NEXT_PUBLIC_API_BASE_URL) with same-origin fallback
 * - Strict response.ok validation
 * - Typed errors: HttpError, NetworkError, InvalidPayloadError
 * - AbortSignal support for request lifecycle cancellation
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

  let response: Response;

  try {
    response = await fetch(url, {
      ...restOptions,
      headers: {
        Accept: "application/json",
        ...headers,
      },
    });
  } catch (error) {
    // If request was aborted by AbortSignal, propagate standard AbortError
    if (
      (error instanceof DOMException && error.name === "AbortError") ||
      (error instanceof Error && error.name === "AbortError")
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

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      try {
        errorBody = await response.text();
      } catch {
        errorBody = undefined;
      }
    }

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
