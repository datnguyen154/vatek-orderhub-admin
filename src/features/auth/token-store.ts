/**
 * OrderHub Admin Console — In-Memory Demo Token Store
 *
 * NOTE: Token is kept IN MEMORY ONLY as a module variable.
 * Never persisted in localStorage, sessionStorage, cookies, or Zustand state.
 * Shared in-flight promise deduplicates concurrent refresh requests.
 */

import { refreshAccessTokenAction, logoutAction } from "./actions";

let inMemoryToken: string | null = null;
let inFlightRefreshPromise: Promise<string | null> | null = null;

/**
 * Returns the currently cached in-memory demo access token, or null.
 */
export function getAccessToken(): string | null {
  return inMemoryToken;
}

/**
 * Directly updates or clears the in-memory token.
 */
export function setAccessToken(token: string | null): void {
  inMemoryToken = token;
}

/**
 * Refreshes the demo access token using the server session.
 * Shares a single in-flight promise so concurrent callers (e.g. parallel 401s)
 * execute exactly one refresh call.
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (inFlightRefreshPromise) {
    return inFlightRefreshPromise;
  }

  inFlightRefreshPromise = (async () => {
    try {
      const result = await refreshAccessTokenAction();
      if (result.ok) {
        inMemoryToken = result.accessToken;
        return result.accessToken;
      }
      inMemoryToken = null;
      return null;
    } catch {
      inMemoryToken = null;
      return null;
    } finally {
      inFlightRefreshPromise = null;
    }
  })();

  return inFlightRefreshPromise;
}

/**
 * Performs client-side sign out:
 * 1. Clears in-memory token and resets refresh promise
 * 2. Invokes cookie-clearing server action
 * 3. Uses window.location.replace to hard-navigate and drop TanStack Query cache
 */
export async function signOut(reason = "session_expired"): Promise<void> {
  inMemoryToken = null;
  inFlightRefreshPromise = null;

  try {
    await logoutAction();
  } catch {
    // Proceed even if server action encounters an issue
  }

  if (typeof window !== "undefined") {
    const target = reason
      ? `/login?reason=${encodeURIComponent(reason)}`
      : "/login";
    window.location.replace(target);
  }
}
