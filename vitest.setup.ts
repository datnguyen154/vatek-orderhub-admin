import "@testing-library/jest-dom/vitest";
import React from "react";
import { setupServer } from "msw/node";
import { handlers } from "@/mocks/handlers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "./messages/en.json";
import { vi, beforeAll, afterEach, afterAll } from "vitest";

// Ensure base URL is set for isomorphic fetch in jsdom
process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3000";

// 1. MSW Node Server
export const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

// 2. Auth Mocking
let currentMockRole = "admin";

export function setMockAuthRole(role: string) {
  currentMockRole = role;
}

export const mockSignOut = vi.fn();

vi.mock("@/features/auth/token-store", () => ({
  getAccessToken: vi.fn(
    () => `demo.${currentMockRole}.${Date.now() + 3600000}.test`
  ),
  refreshAccessToken: vi.fn(
    async () => `demo.${currentMockRole}.${Date.now() + 3600000}.test`
  ),
  setAccessToken: vi.fn(),
  signOut: mockSignOut,
}));

// 3. Navigation Mocking
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

let currentMockPathname = "/";
let currentMockSearchParams = new URLSearchParams();

export function setMockNavigation({
  pathname,
  searchParams,
}: {
  pathname?: string;
  searchParams?: URLSearchParams | Record<string, string> | string;
}) {
  if (pathname !== undefined) currentMockPathname = pathname;
  if (searchParams !== undefined) {
    currentMockSearchParams =
      searchParams instanceof URLSearchParams
        ? searchParams
        : new URLSearchParams(searchParams);
  }
}

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => currentMockPathname,
  useSearchParams: () => currentMockSearchParams,
}));

// 4. Browser API Stubs for JSDOM
if (typeof window !== "undefined") {
  window.scrollTo = vi.fn();
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = vi.fn(() => "blob:mock-url");
  }
  if (!window.URL.revokeObjectURL) {
    window.URL.revokeObjectURL = vi.fn();
  }
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }
  if (!global.ResizeObserver) {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
}

// 5. Test Providers & Cleanup
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  currentMockRole = "admin";
  currentMockPathname = "/";
  currentMockSearchParams = new URLSearchParams();
  mockRouter.push.mockClear();
  mockRouter.replace.mockClear();
  mockRouter.back.mockClear();
  mockRouter.forward.mockClear();
  mockRouter.refresh.mockClear();
  mockRouter.prefetch.mockClear();
  mockSignOut.mockClear();
});

afterAll(() => {
  server.close();
});

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function TestProviders({
  children,
  queryClient = createTestQueryClient(),
}: {
  children: React.ReactNode;
  queryClient?: QueryClient;
}) {
  return React.createElement(NextIntlClientProvider, {
    locale: "en",
    messages: enMessages,
    children: React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    ),
  });
}
