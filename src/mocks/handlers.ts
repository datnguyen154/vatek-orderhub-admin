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
import { mockSalesData } from "./data/sales";
import { hasPermission, type Role } from "@/features/auth/types";
import type { Order, OrderDetail, OrderStatus } from "@/features/orders/types";
import {
  createOrderSchema,
  calculateOrderTotals,
} from "@/features/orders/schemas/create-order";

export type MockScenario = "success" | "delay" | "empty" | "error" | "disabled";

export const DEFAULT_PAGE_SIZE = 5;

// Tracks first token seen under expire-once scenario
let expireOnceFirstToken: string | null = null;

// Module-level in-memory storage for orders (resets on full page reload)
export const inMemoryOrders: OrderDetail[] = [...mockOrders];
export const createdOrders: OrderDetail[] = [];

// Module-level idempotency cache for created orders
const completedOrdersByIdempotency = new Map<string, OrderDetail>();

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

    const newOrder: OrderDetail = {
      id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      orderCode,
      customerName: customer.name,
      createdAt: new Date().toISOString(),
      total,
      currency: "USD",
      status: "pending",
      itemCount,
      poNumber: poNumber?.trim() || null,
      invoice: null,
      timeline: [
        {
          id: `evt_${Date.now()}_0`,
          type: "created",
          at: new Date().toISOString(),
          actorRole: authResult.role,
        },
      ],
    };

    createdOrders.unshift(newOrder);
    inMemoryOrders.unshift(newOrder);
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

    // In-memory order store
    let filtered = [...inMemoryOrders];

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

  // GET /api/orders/:orderId
  http.get("/api/orders/:orderId", async ({ request, params }) => {
    const url = new URL(request.url);
    const authResult = authenticateRequest(request, url);
    if (!authResult.ok) {
      return authResult.response;
    }

    const { orderId } = params;
    const order = inMemoryOrders.find((o) => o.id === orderId);
    if (!order) {
      return HttpResponse.json({ code: "not_found" }, { status: 404 });
    }

    return HttpResponse.json({ data: order }, { status: 200 });
  }),

  // PATCH /api/orders/:orderId/status
  http.patch("/api/orders/:orderId/status", async ({ request, params }) => {
    const url = new URL(request.url);
    const authResult = authenticateRequest(request, url);
    if (!authResult.ok) {
      return authResult.response;
    }

    if (!hasPermission(authResult.role, "orders:updateStatus")) {
      return HttpResponse.json({ code: "forbidden" }, { status: 403 });
    }

    const { orderId } = params;
    const order = inMemoryOrders.find((o) => o.id === orderId);
    if (!order) {
      return HttpResponse.json({ code: "not_found" }, { status: 404 });
    }

    let statusScenario: string | null = request.headers.get("x-mock-status");
    if (!statusScenario && typeof window !== "undefined") {
      try {
        statusScenario =
          window.localStorage?.getItem("orderhub_mock_status") || null;
      } catch {
        statusScenario = null;
      }
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json({ code: "invalid_payload" }, { status: 400 });
    }

    const rawStatus = (body as Record<string, unknown>)?.status;
    if (typeof rawStatus !== "string") {
      return HttpResponse.json({ code: "invalid_payload" }, { status: 400 });
    }
    const newStatus = rawStatus as OrderStatus;

    // Allowed transitions:
    // pending -> processing or cancelled
    // processing -> shipped or cancelled
    // shipped -> delivered
    // delivered and cancelled are terminal
    const currentStatus = order.status;
    const isValidTransition =
      (currentStatus === "pending" &&
        (newStatus === "processing" || newStatus === "cancelled")) ||
      (currentStatus === "processing" &&
        (newStatus === "shipped" || newStatus === "cancelled")) ||
      (currentStatus === "shipped" && newStatus === "delivered");

    if (!isValidTransition) {
      return HttpResponse.json({ code: "invalid_transition" }, { status: 409 });
    }

    if (statusScenario === "fail") {
      await delay(800);
      return HttpResponse.json(
        { code: "status_update_failed" },
        { status: 500 }
      );
    }

    await delay(800);

    order.status = newStatus;
    order.timeline.push({
      id: `evt_${Date.now()}_status`,
      type: "status_changed",
      at: new Date().toISOString(),
      actorRole: authResult.role,
      fromStatus: currentStatus,
      toStatus: newStatus,
    });

    return HttpResponse.json({ data: order }, { status: 200 });
  }),

  // POST /api/orders/:orderId/invoice
  http.post("/api/orders/:orderId/invoice", async ({ request, params }) => {
    const url = new URL(request.url);
    const authResult = authenticateRequest(request, url);
    if (!authResult.ok) {
      return authResult.response;
    }

    if (!hasPermission(authResult.role, "orders:uploadInvoice")) {
      return HttpResponse.json({ code: "forbidden" }, { status: 403 });
    }

    const { orderId } = params;
    const order = inMemoryOrders.find((o) => o.id === orderId);
    if (!order) {
      return HttpResponse.json({ code: "not_found" }, { status: 404 });
    }

    let uploadScenario: string | null = request.headers.get("x-mock-upload");
    if (!uploadScenario && typeof window !== "undefined") {
      try {
        uploadScenario =
          window.localStorage?.getItem("orderhub_mock_upload") || null;
      } catch {
        uploadScenario = null;
      }
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return HttpResponse.json({ code: "invalid_form_data" }, { status: 400 });
    }

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return HttpResponse.json({ code: "invalid_file" }, { status: 400 });
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return HttpResponse.json({ code: "unsupported_type" }, { status: 415 });
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return HttpResponse.json({ code: "file_too_large" }, { status: 413 });
    }

    if (uploadScenario === "fail") {
      await delay(600);
      return HttpResponse.json({ code: "upload_failed" }, { status: 500 });
    }

    await delay(600);

    const invoice = {
      fileName: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };

    order.invoice = invoice;
    order.timeline.push({
      id: `evt_${Date.now()}_invoice`,
      type: "invoice_uploaded",
      at: invoice.uploadedAt,
      actorRole: authResult.role,
      fileName: file.name,
    });

    return HttpResponse.json({ data: invoice }, { status: 201 });
  }),

  /**
   * GET /api/reports/daily
   *
   * Returns daily sales aggregates for range [from..to] inclusive (max 92 days).
   * Supports scenarios: x-mock-report header or localStorage "orderhub_mock_report"
   * - "fail": 500 { code: "report_failed" }
   * - "delay": 1500ms delay then success
   * - default: 400ms delay then success
   */
  http.get("/api/reports/daily", async ({ request }) => {
    const url = new URL(request.url);

    // 1. Authenticate request via demo Bearer token
    const authResult = authenticateRequest(request, url);
    if (!authResult.ok) {
      return authResult.response;
    }

    // 2. Permission check: reports:view
    if (!hasPermission(authResult.role, "reports:view")) {
      return HttpResponse.json({ code: "forbidden" }, { status: 403 });
    }

    // 3. Date range validation
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    function isValidYmd(str: string | null): str is string {
      if (!str) return false;
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
      if (!match) return false;
      const y = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const d = parseInt(match[3], 10);
      const dt = new Date(Date.UTC(y, m - 1, d));
      return (
        dt.getUTCFullYear() === y &&
        dt.getUTCMonth() === m - 1 &&
        dt.getUTCDate() === d
      );
    }

    if (!isValidYmd(from) || !isValidYmd(to)) {
      return HttpResponse.json({ code: "invalid_range" }, { status: 400 });
    }

    const [fy, fm, fd] = from.split("-").map(Number);
    const [ty, tm, td] = to.split("-").map(Number);
    const fromTs = Date.UTC(fy, fm - 1, fd);
    const toTs = Date.UTC(ty, tm - 1, td);

    if (fromTs > toTs) {
      return HttpResponse.json({ code: "invalid_range" }, { status: 400 });
    }

    const dayCount = Math.round((toTs - fromTs) / 86400000) + 1; // inclusive
    if (dayCount > 92) {
      return HttpResponse.json({ code: "invalid_range" }, { status: 400 });
    }

    // 4. Resolve scenarios
    let reportScenario: string | null = request.headers.get("x-mock-report");
    if (!reportScenario && typeof window !== "undefined") {
      try {
        reportScenario =
          window.localStorage?.getItem("orderhub_mock_report") || null;
      } catch {
        reportScenario = null;
      }
    }

    if (reportScenario === "fail") {
      await delay(400);
      return HttpResponse.json({ code: "report_failed" }, { status: 500 });
    }

    if (reportScenario === "delay") {
      await delay(1500);
    } else {
      await delay(400);
    }

    // 5. Build daily array and summary
    const daily: Array<{
      date: string;
      totalOrders: number;
      completedOrders: number;
      cancelledOrders: number;
      revenueCents: number;
      aovCents: number | null;
    }> = [];

    let totalOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;
    let revenueCents = 0;

    for (let i = 0; i < dayCount; i++) {
      const currentTs = fromTs + i * 86400000;
      const d = new Date(currentTs);
      const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

      const record = mockSalesData.get(dateStr);
      if (record) {
        const dayCompleted = record.totalOrders - record.cancelledOrders;
        const aovCents =
          dayCompleted > 0
            ? Math.round(record.revenueCents / dayCompleted)
            : null;
        daily.push({
          date: dateStr,
          totalOrders: record.totalOrders,
          completedOrders: dayCompleted,
          cancelledOrders: record.cancelledOrders,
          revenueCents: record.revenueCents,
          aovCents,
        });
        totalOrders += record.totalOrders;
        completedOrders += dayCompleted;
        cancelledOrders += record.cancelledOrders;
        revenueCents += record.revenueCents;
      } else {
        daily.push({
          date: dateStr,
          totalOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          revenueCents: 0,
          aovCents: null,
        });
      }
    }

    const summaryAov =
      completedOrders > 0 ? Math.round(revenueCents / completedOrders) : null;
    const cancellationRate =
      totalOrders > 0 ? cancelledOrders / totalOrders : null;

    return HttpResponse.json({
      data: {
        range: { from, to },
        currency: "USD",
        summary: {
          totalOrders,
          completedOrders,
          cancelledOrders,
          revenueCents,
          aovCents: summaryAov,
          cancellationRate,
        },
        daily,
      },
    });
  }),
];
