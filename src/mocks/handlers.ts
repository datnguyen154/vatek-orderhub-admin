/**
 * OrderHub Admin Console — MSW Request Handlers
 *
 * Intercepts GET /api/orders in the browser worker and provides:
 * - Pagination: page, pageSize (default 5, exposing 2 pages across 10 deterministic fixtures)
 * - Filtering: status, order-code search, deterministic date-range boundaries (UTC 00:00:00 to 23:59:59.999)
 * - Reproducible scenarios: "success", "delay" (1500ms), "empty", "error" (500), "disabled" (passthrough)
 */

import { http, HttpResponse, delay, passthrough } from "msw";
import { mockOrders } from "./data/orders";

export type MockScenario = "success" | "delay" | "empty" | "error" | "disabled";

export const DEFAULT_PAGE_SIZE = 5;

// Tracks first token seen under expire-once scenario
let expireOnceFirstToken: string | null = null;

export const handlers = [
  http.get("/api/orders", async ({ request }) => {
    const url = new URL(request.url);

    // Auth scenario resolution:
    // 1. Direct request query parameter (?auth=...)
    // 2. Request header (x-mock-auth: ...)
    // 3. Browser active URL query parameter (?auth=...)
    // 4. LocalStorage override ("orderhub_mock_auth")
    let authScenario: string | null =
      url.searchParams.get("auth") || request.headers.get("x-mock-auth");

    if (!authScenario && typeof window !== "undefined") {
      try {
        const pageParams = new URLSearchParams(window.location.search);
        authScenario =
          pageParams.get("auth") ||
          window.localStorage?.getItem("orderhub_mock_auth") ||
          null;
      } catch {
        authScenario = null;
      }
    }

    if (authScenario !== "expire-once") {
      expireOnceFirstToken = null;
    }

    // Require valid demo Bearer token with future expiration
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json({ code: "token_expired" }, { status: 401 });
    }

    const token = authHeader.slice(7).trim();
    // Validate format: demo.<role>.<expiresAtMs>.<random>
    const tokenParts = token.split(".");
    if (tokenParts[0] !== "demo" || tokenParts.length < 3) {
      return HttpResponse.json({ code: "token_expired" }, { status: 401 });
    }

    const expiresAt = Number(tokenParts[2]);
    if (!expiresAt || Number.isNaN(expiresAt) || Date.now() > expiresAt) {
      return HttpResponse.json({ code: "token_expired" }, { status: 401 });
    }

    // Auth scenarios:
    // 1. always-401: rejects all tokens unconditionally
    if (authScenario === "always-401") {
      return HttpResponse.json({ code: "token_expired" }, { status: 401 });
    }

    // 2. expire-once: rejects the first token seen while active, accepts subsequent refreshed tokens
    if (authScenario === "expire-once") {
      if (!expireOnceFirstToken) {
        expireOnceFirstToken = token;
        return HttpResponse.json({ code: "token_expired" }, { status: 401 });
      }
      if (token === expireOnceFirstToken) {
        return HttpResponse.json({ code: "token_expired" }, { status: 401 });
      }
      // Refreshed subsequent token accepted -> proceed to data
    }

    // Scenario priority resolution:
    // 1. Direct request query parameter (?scenario=...)
    // 2. Request header (x-mock-scenario: ...)
    // 3. Browser active URL query parameter (?scenario=...)
    // 4. LocalStorage override ("orderhub_mock_scenario")
    // 5. Default fallback: "success"
    let scenario: string | null =
      url.searchParams.get("scenario") ||
      request.headers.get("x-mock-scenario");

    if (!scenario && typeof window !== "undefined") {
      try {
        const pageParams = new URLSearchParams(window.location.search);
        scenario =
          pageParams.get("scenario") ||
          window.localStorage?.getItem("orderhub_mock_scenario") ||
          null;
      } catch {
        scenario = null;
      }
    }

    if (scenario === "disabled" || scenario === "mock_disabled") {
      // Bypass mock interception and perform real network fetch to test mock-disabled behavior
      return passthrough();
    }

    if (scenario === "error") {
      return HttpResponse.json(
        {
          message: "Simulated upstream database connection failure",
        },
        { status: 500 }
      );
    }

    if (scenario === "empty") {
      return HttpResponse.json(
        {
          data: [],
          total: 0,
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          totalPages: 0,
        },
        { status: 200 }
      );
    }

    if (scenario === "delay") {
      await delay(1500);
    }

    // Parse pagination and filter parameters
    const pageParam = url.searchParams.get("page");
    const pageSizeParam = url.searchParams.get("pageSize");
    const statusParam = url.searchParams.get("status")?.trim().toLowerCase();
    const searchParam = url.searchParams.get("search")?.trim().toLowerCase();
    const startDateParam = url.searchParams.get("startDate")?.trim();
    const endDateParam = url.searchParams.get("endDate")?.trim();

    const page = Math.max(1, parseInt(pageParam || "1", 10) || 1);
    const pageSize = Math.max(
      1,
      parseInt(pageSizeParam || String(DEFAULT_PAGE_SIZE), 10) ||
        DEFAULT_PAGE_SIZE
    );

    let filtered = [...mockOrders];

    // 1. Status filter (if provided and not "all" or empty)
    if (statusParam && statusParam !== "all" && statusParam !== "") {
      filtered = filtered.filter(
        (order) => order.status.toLowerCase() === statusParam
      );
    }

    // 2. Order code search (case-insensitive substring match)
    if (searchParam) {
      filtered = filtered.filter((order) =>
        order.orderCode.toLowerCase().includes(searchParam)
      );
    }

    // 3. Date range filter (deterministic UTC day boundaries)
    if (startDateParam) {
      const startMs = new Date(`${startDateParam}T00:00:00.000Z`).getTime();
      if (!Number.isNaN(startMs)) {
        filtered = filtered.filter((order) => {
          const orderMs = new Date(order.createdAt).getTime();
          return orderMs >= startMs;
        });
      }
    }

    if (endDateParam) {
      const endMs = new Date(`${endDateParam}T23:59:59.999Z`).getTime();
      if (!Number.isNaN(endMs)) {
        filtered = filtered.filter((order) => {
          const orderMs = new Date(order.createdAt).getTime();
          return orderMs <= endMs;
        });
      }
    }

    const total = filtered.length;
    const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
    const startIndex = (page - 1) * pageSize;
    const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

    return HttpResponse.json(
      {
        data: paginatedData,
        total,
        page,
        pageSize,
        totalPages,
      },
      { status: 200 }
    );
  }),
];
