/**
 * OrderHub Admin Console — MSW Request Handlers
 *
 * Intercepts:
 * - GET /api/orders: Paginated & filtered orders, prepending in-memory created orders
 * - POST /api/orders: Order creation with Bearer auth, RBAC (403), Zod validation,
 *   idempotency, create scenarios ("success", "fail", "fail-once"), and 1200ms delay
 * - GET /api/customers: Returns customer fixtures (requires Bearer token)
 * - GET /api/products: Returns product fixtures (requires Bearer token)
 */

import { http, HttpResponse, delay, passthrough } from "msw";
import { mockOrders } from "./data/orders";
import { mockCustomers } from "./data/customers";
import { mockProducts } from "./data/products";
import { hasPermission, type Role } from "@/features/auth/types";
import type { Order } from "@/features/orders/types";
import {
  createOrderSchema,
  calculateOrderTotals,
} from "@/features/orders/schemas/create-order";

export type MockScenario = "success" | "delay" | "empty" | "error" | "disabled";

export const DEFAULT_PAGE_SIZE = 5;

// Tracks first token seen under expire-once scenario
let expireOnceFirstToken: string | null = null;

// Module-level in-memory storage for created orders (resets on full page reload)
export const createdOrders: Order[] = [];

// Module-level idempotency cache for created orders
const completedOrdersByIdempotency = new Map<string, Order>();

// Tracks keys failed once under fail-once scenario
const failOnceSeenKeys = new Set<string>();

/**
 * Shared helper to validate demo Bearer tokens and process auth scenarios.
 */
function authenticateRequest(
  request: Request,
  url: URL
): { ok: true; role: Role } | { ok: false; response: HttpResponse } {
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
    return {
      ok: false,
      response: HttpResponse.json({ code: "token_expired" }, { status: 401 }),
    };
  }

  const token = authHeader.slice(7).trim();
  // Validate format: demo.<role>.<expiresAtMs>.<random>
  const tokenParts = token.split(".");
  if (tokenParts[0] !== "demo" || tokenParts.length < 3) {
    return {
      ok: false,
      response: HttpResponse.json({ code: "token_expired" }, { status: 401 }),
    };
  }

  const role = tokenParts[1] as Role;
  const expiresAt = Number(tokenParts[2]);
  if (!expiresAt || Number.isNaN(expiresAt) || Date.now() > expiresAt) {
    return {
      ok: false,
      response: HttpResponse.json({ code: "token_expired" }, { status: 401 }),
    };
  }

  // Auth scenarios:
  // 1. always-401: rejects all tokens unconditionally
  if (authScenario === "always-401") {
    return {
      ok: false,
      response: HttpResponse.json({ code: "token_expired" }, { status: 401 }),
    };
  }

  // 2. expire-once: rejects first token seen, accepts subsequent refreshed tokens
  if (authScenario === "expire-once") {
    if (!expireOnceFirstToken) {
      expireOnceFirstToken = token;
      return {
        ok: false,
        response: HttpResponse.json({ code: "token_expired" }, { status: 401 }),
      };
    }
    if (token === expireOnceFirstToken) {
      return {
        ok: false,
        response: HttpResponse.json({ code: "token_expired" }, { status: 401 }),
      };
    }
  }

  return { ok: true, role };
}

export const handlers = [
  // GET /api/customers
  http.get("/api/customers", async ({ request }) => {
    const url = new URL(request.url);
    const authResult = authenticateRequest(request, url);
    if (!authResult.ok) {
      return authResult.response;
    }
    return HttpResponse.json({ data: mockCustomers }, { status: 200 });
  }),

  // GET /api/products
  http.get("/api/products", async ({ request }) => {
    const url = new URL(request.url);
    const authResult = authenticateRequest(request, url);
    if (!authResult.ok) {
      return authResult.response;
    }
    return HttpResponse.json({ data: mockProducts }, { status: 200 });
  }),

  // POST /api/orders
  http.post("/api/orders", async ({ request }) => {
    const url = new URL(request.url);
    const authResult = authenticateRequest(request, url);
    if (!authResult.ok) {
      return authResult.response;
    }

    // Role check: RBAC enforcement on order creation
    if (!hasPermission(authResult.role, "orders:create")) {
      return HttpResponse.json({ code: "forbidden" }, { status: 403 });
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      await delay(1200);
      return HttpResponse.json({ code: "validation_error" }, { status: 400 });
    }

    if (
      typeof rawBody !== "object" ||
      rawBody === null ||
      !("idempotencyKey" in rawBody) ||
      typeof (rawBody as { idempotencyKey: unknown }).idempotencyKey !==
        "string" ||
      !(rawBody as { idempotencyKey: string }).idempotencyKey.trim()
    ) {
      await delay(1200);
      return HttpResponse.json({ code: "validation_error" }, { status: 400 });
    }

    const idempotencyKey = (
      rawBody as { idempotencyKey: string }
    ).idempotencyKey.trim();

    // Create scenario resolution: header first, then localStorage
    let createScenario = request.headers.get("x-mock-create");
    if (!createScenario && typeof window !== "undefined") {
      try {
        createScenario =
          window.localStorage?.getItem("orderhub_mock_create") || null;
      } catch {
        createScenario = null;
      }
    }
    if (!createScenario) {
      createScenario = "success";
    }

    // Scenario: fail
    if (createScenario === "fail") {
      await delay(1200);
      return HttpResponse.json({ code: "create_failed" }, { status: 500 });
    }

    // Scenario: fail-once (fails first attempt for a given key, succeeds on retry)
    if (createScenario === "fail-once") {
      if (!failOnceSeenKeys.has(idempotencyKey)) {
        failOnceSeenKeys.add(idempotencyKey);
        await delay(1200);
        return HttpResponse.json({ code: "create_failed" }, { status: 500 });
      }
    }

    // Idempotency: repeated key after success returns 200 with the exact same order
    if (completedOrdersByIdempotency.has(idempotencyKey)) {
      await delay(1200);
      const existing = completedOrdersByIdempotency.get(idempotencyKey)!;
      return HttpResponse.json({ data: existing }, { status: 200 });
    }

    // Validation using the client Zod schema
    const parsed = createOrderSchema.safeParse(rawBody);
    if (!parsed.success) {
      await delay(1200);
      return HttpResponse.json(
        { code: "validation_error", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { customerId, poNumber, items } = parsed.data;

    // Verify customer exists
    const customer = mockCustomers.find((c) => c.id === customerId);
    if (!customer) {
      await delay(1200);
      return HttpResponse.json({ code: "validation_error" }, { status: 400 });
    }

    // Verify all products exist
    const allProductsValid = items.every((item) =>
      mockProducts.some((p) => p.id === item.productId)
    );
    if (!allProductsValid) {
      await delay(1200);
      return HttpResponse.json({ code: "validation_error" }, { status: 400 });
    }

    // Server calculates authoritative totals from fixtures
    const { total } = calculateOrderTotals(items, mockProducts);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const nextIndex = 10 + createdOrders.length + 1;
    const orderCode = `ORD-2026-${String(nextIndex).padStart(3, "0")}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      orderCode,
      customerName: customer.name,
      createdAt: new Date().toISOString(),
      total,
      currency: "USD",
      status: "pending",
      itemCount,
    };

    createdOrders.unshift(newOrder);
    completedOrdersByIdempotency.set(idempotencyKey, newOrder);

    await delay(1200);
    return HttpResponse.json({ data: newOrder }, { status: 201 });
  }),

  // GET /api/orders
  http.get("/api/orders", async ({ request }) => {
    const url = new URL(request.url);
    const authResult = authenticateRequest(request, url);
    if (!authResult.ok) {
      return authResult.response;
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

    // Merge in-memory created orders with standard mockOrders
    let filtered = [...createdOrders, ...mockOrders];

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
