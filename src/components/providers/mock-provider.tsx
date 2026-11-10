/**
 * OrderHub Admin Console — Browser Mock Service Worker Provider
 *
 * Coordinates the initialization and readiness lifecycle of the MSW browser worker.
 * Client-only provider boundary.
 */

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface MockContextValue {
  isReady: boolean;
  error: string | null;
  isMockingEnabled: boolean;
}

const isMockingEnabledEnv = process.env.NEXT_PUBLIC_API_MOCKING === "enabled";

const MockContext = createContext<MockContextValue>({
  isReady: !isMockingEnabledEnv,
  error: null,
  isMockingEnabled: isMockingEnabledEnv,
});

/**
 * Accesses mock worker readiness and error state.
 */
export function useMock(): MockContextValue {
  return useContext(MockContext);
}

export interface MockProviderProps {
  children: ReactNode;
}

/**
 * MockProvider — Client Component
 *
 * Coordinates MSW browser worker startup lifecycle:
 * - When NEXT_PUBLIC_API_MOCKING=enabled, dynamically imports and awaits worker.start()
 * - Sets isReady=true only after the service worker is active
 * - If worker fails to start, surfaces an accessible initialization error and blocks fetch subtree
 * - When NEXT_PUBLIC_API_MOCKING is disabled, skips MSW entirely; requests hit real network
 */
export function MockProvider({ children }: MockProviderProps) {
  const [isReady, setIsReady] = useState(!isMockingEnabledEnv);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isMockingEnabledEnv) {
      setIsReady(true);
      return;
    }

    let mounted = true;

    async function startWorker() {
      try {
        if (typeof window !== "undefined") {
          const { initWorker } = await import("@/mocks/browser");
          const worker = await initWorker();
          if (worker) {
            await worker.start({
              onUnhandledRequest: "bypass",
              serviceWorker: {
                url: "/mockServiceWorker.js",
              },
            });
          }
        }

        if (mounted) {
          setIsReady(true);
        }
      } catch (err) {
        if (mounted) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to initialize Mock Service Worker";
          setError(message);
        }
      }
    }

    startWorker();

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="m-4 p-4 rounded-lg border border-destructive/20 bg-destructive-muted text-destructive-muted-foreground"
      >
        <h2 className="text-section-title font-semibold">
          Mock Service Initialization Failed
        </h2>
        <p className="mt-1 text-body">
          The browser mock service worker failed to start. Mocked API endpoints
          cannot be intercepted.
        </p>
        <p className="mt-2 text-caption font-mono">{error}</p>
      </div>
    );
  }

  return (
    <MockContext.Provider
      value={{
        isReady,
        error,
        isMockingEnabled: isMockingEnabledEnv,
      }}
    >
      {children}
    </MockContext.Provider>
  );
}
