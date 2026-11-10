# OrderHub Admin Console — Mock API & Client Contract Documentation

> **Status**: Session 09 / D10 Baseline  
> **Applies to**: `src/lib/api/client.ts`, `src/features/orders/`, `src/mocks/`, `src/components/providers/mock-provider.tsx`

---

## 1. Overview & Architecture

OrderHub Admin Console implements client-side API mocking using **Mock Service Worker (MSW)**. The mocking architecture adheres strictly to Next.js 15 App Router principles:

1. **Client-Only Mocking**:
   - The MSW service worker intercepts network requests executed by the browser's `window.fetch`.
   - MSW browser worker **cannot** intercept Server Component requests. Consequently, data-fetching components are structured as small Client Islands (`OrdersList`) embedded within Server Component page layouts (`OrdersPage`).
2. **Deterministic & Realistic**:
   - Fixtures represent authentic B2B supply chain orders with realistic IDs, amounts, ISO 8601 timestamps, and statuses.
3. **Fail-Safe & Honest**:
   - When mocking is disabled (`NEXT_PUBLIC_API_MOCKING=disabled`), requests are dispatched to the real configured endpoint. If the backend route does not exist, the real HTTP error (e.g., 404) is surfaced directly; the system never fabricates a false successful response.

---

## 2. API Contract: `GET /api/orders`

### 2.1. Request Specification

- **Method**: `GET`
- **Endpoint**: `/api/orders` (or resolved via `NEXT_PUBLIC_API_BASE_URL`)
- **Headers**:
  - `Accept: application/json`
  - `x-mock-scenario?: "success" | "delay" | "empty" | "error"` (optional)
- **Query Parameters**:
  - `scenario?: "success" | "delay" | "empty" | "error"` (optional)

### 2.2. Response Schema & Entity Types

#### Success Response (`200 OK`)

```json
{
  "data": [
    {
      "id": "ord_001",
      "orderCode": "ORD-2026-001",
      "customerName": "Acme Logistics Inc.",
      "createdAt": "2026-11-06T10:30:00Z",
      "total": 1420.0,
      "currency": "USD",
      "status": "delivered",
      "itemCount": 12
    }
  ],
  "total": 1
}
```

#### TypeScript Contracts (`src/features/orders/types.ts`)

```typescript
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  createdAt: string; // ISO 8601
  total: number;
  currency: string;
  status: OrderStatus;
  itemCount: number;
}

export interface OrdersResponse {
  data: Order[];
  total: number;
}
```

### 2.3. Runtime Type Validation

All responses received by `apiClient` are treated as `unknown` and validated using explicit type guards (`isOrdersResponse`, `isOrder`, `isOrderStatus`) before returning to application code. Unsafe type assertions (`as OrdersResponse`) without validation are forbidden.

---

## 3. Environment Configuration

| Variable                   | Values                      | Default                                                   | Purpose                                                                                                                                                                                                                      |
| -------------------------- | --------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_MOCKING`  | `"enabled"` \| `"disabled"` | `"disabled"` (unset runtime) / `"enabled"` (.env.example) | Toggles MSW browser worker startup. When unset or any value other than `"enabled"`, MSW startup is skipped entirely and requests hit real network. `.env.example` sets this to `"enabled"` as default for local development. |
| `NEXT_PUBLIC_API_BASE_URL` | String URL                  | `""` (Same-origin)                                        | Custom API base URL prefix for backend integration.                                                                                                                                                                          |

---

## 4. Reproducible Mock Scenarios

The mock handler supports four deterministic scenarios designed for testing and review:

| Scenario            | Behavior                                              | Response                                             |
| ------------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| `success` (default) | Returns 10 deterministic B2B order fixtures.          | `200 OK` with full fixture array.                    |
| `empty`             | Simulates a tenant or filter state with zero records. | `200 OK` with `{ data: [], total: 0 }`.              |
| `error`             | Simulates an upstream database or network failure.    | `500 Internal Server Error` with JSON error payload. |
| `delay`             | Injects 1500ms latency before returning fixtures.     | `200 OK` after 1500ms delay.                         |

### How to Select Scenarios for Local Review

Scenarios can be selected without modifying source code or backend routes via any of the following mechanisms:

1. **Browser URL Query Parameter** (Recommended for review):
   - Navigate to `http://localhost:3000/orders?scenario=empty`
   - Navigate to `http://localhost:3000/orders?scenario=error`
   - Navigate to `http://localhost:3000/orders?scenario=delay`
   - Navigate to `http://localhost:3000/orders?scenario=success`
2. **API Request Query Parameter**:
   - Calling `getOrders({ scenario: "empty" })` automatically requests `/api/orders?scenario=empty`.
3. **HTTP Request Header**:
   - Pass header `x-mock-scenario: error`.
4. **Browser LocalStorage**:
   - Run in browser devtools: `localStorage.setItem("orderhub_mock_scenario", "error")`.

---

## 5. Mock-Disabled Behavior

When `NEXT_PUBLIC_API_MOCKING=disabled`:

1. `MockProvider` sets `isReady: true` immediately without initializing `public/mockServiceWorker.js` or importing `@/mocks/browser`.
2. The client application dispatches fetch requests directly to the network (`/api/orders`).
3. Since Next.js has no server route configured for `/api/orders`, the request returns a standard `404 Not Found`.
4. The client `apiClient` surfaces a typed `HttpError(404, "Not Found")`.
5. The `OrdersList` component renders the accessible error state with retry affordance, accurately reflecting the unavailable real backend rather than faking success.

---

## 6. Server/Client Boundaries & Gate 2 Rationale

- **`OrdersPage` (`src/app/(dashboard)/orders/page.tsx`)**:
  - Implemented as a **Server Component**.
  - Statically/server-renders page headers, description, and status tags during SSR.
  - Composes the interactive client island `<OrdersList />`.
- **`OrdersList` (`src/features/orders/components/orders-list.tsx`)**:
  - Implemented as a **Client Component** (`"use client"`).
  - Encapsulates async fetching, cancellation on unmount, loading skeletons, error retry, and empty state presentation.
  - Awaits `MockProvider` readiness before initiating data fetch to ensure zero unintercepted requests.
