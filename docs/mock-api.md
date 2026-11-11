# OrderHub Admin Console — Mock API & Client Contract Documentation

> **Status**: Session 11 / D11 Baseline
> **Applies to**: `src/lib/api/client.ts`, `src/features/orders/`, `src/mocks/`, `src/components/providers/query-provider.tsx`, `src/components/providers/mock-provider.tsx`

---

## 1. Overview & Architecture

OrderHub Admin Console implements client-side API mocking using **Mock Service Worker (MSW)** combined with **TanStack Query (v5)** client caching. The mocking architecture adheres strictly to Next.js 15 App Router principles:

1. **Client-Only Mocking**:
   - The MSW service worker intercepts network requests executed by the browser's `window.fetch`.
   - MSW browser worker **cannot** intercept Server Component requests. Consequently, data-fetching components are structured as small Client Islands (`OrdersList`) embedded within Server Component page layouts (`OrdersPage`).
2. **Deterministic & Realistic**:
   - Fixtures represent authentic B2B supply chain orders with realistic IDs, amounts, ISO 8601 timestamps, and statuses.
   - Built against 10 known deterministic fixtures in `src/mocks/data/orders.ts`.
3. **Fail-Safe & Honest**:
   - When mocking is disabled (`NEXT_PUBLIC_API_MOCKING=disabled`), requests are dispatched to the real configured endpoint. If the backend route does not exist, the real HTTP error (e.g., 404) is surfaced directly; the system never fabricates a false successful response.
   - This document defines a deterministic browser/MSW mock contract for local development, automated verification, and demonstration. It does **not** claim a real Orders backend contract.

---

## 2. API Contract: `GET /api/orders`

### 2.1. Request Specification

- **Method**: `GET`
- **Endpoint**: `/api/orders` (or resolved via `NEXT_PUBLIC_API_BASE_URL`)
- **Headers**:
  - `Accept: application/json`
  - `x-mock-scenario?: "success" | "delay" | "empty" | "error" | "disabled"` (optional)
- **Query Parameters**:

| Parameter   | Type     | Required | Default     | Description                                                                                          |
| :---------- | :------- | :------- | :---------- | :--------------------------------------------------------------------------------------------------- |
| `page`      | `number` | No       | `1`         | 1-based page index (must be an integer >= 1).                                                        |
| `pageSize`  | `number` | No       | `5`         | Number of order records per page. `5` is selected to expose at least 2 pages across the 10 fixtures. |
| `status`    | `string` | No       | `""` (all)  | Filter by exact `OrderStatus` (`pending`, `processing`, `shipped`, `delivered`, `cancelled`).        |
| `search`    | `string` | No       | `""`        | Case-insensitive substring search matching order code (`orderCode`). Debounced in client UI.         |
| `startDate` | `string` | No       | `""`        | Inclusive ISO 8601 date string (`YYYY-MM-DD`). Start boundary is UTC `00:00:00.000Z`.                |
| `endDate`   | `string` | No       | `""`        | Inclusive ISO 8601 date string (`YYYY-MM-DD`). End boundary is UTC `23:59:59.999Z`.                  |
| `scenario`  | `string` | No       | `"success"` | Mock scenario override (`"success"`, `"delay"`, `"empty"`, `"error"`, `"disabled"`).                 |

### 2.2. Deterministic Date Boundaries

All date filtering operates deterministically using UTC boundaries against the order's `createdAt` ISO 8601 timestamp:

- `startDate=YYYY-MM-DD` expands to `new Date("${startDate}T00:00:00.000Z").getTime()`. Orders with `createdAt >= startMs` match.
- `endDate=YYYY-MM-DD` expands to `new Date("${endDate}T23:59:59.999Z").getTime()`. Orders with `createdAt <= endMs` match.
- When both are specified, orders matching `createdAt >= startMs && createdAt <= endMs` are included.

### 2.3. Response Schema & Entity Types

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
  "total": 10,
  "page": 1,
  "pageSize": 5,
  "totalPages": 2
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
  page?: number;
  pageSize?: number;
  totalPages?: number;
}
```

### 2.4. Runtime Type Validation

All responses received by `apiClient` are treated as `unknown` and validated using explicit type guards (`isOrdersResponse`, `isOrder`, `isOrderStatus`) before returning to application code. Unsafe type assertions (`as OrdersResponse`) without runtime structural validation are strictly forbidden.

---

## 3. Query Cache Policy & Invalidation Contract

### 3.1. TanStack Query Configuration

Client data caching is managed via `@tanstack/react-query` configured in `src/components/providers/query-provider.tsx`:

- **Cache `staleTime`**: `60 * 1000` (60 seconds)
  - _Rationale_: In B2B operational consoles, orders data should not trigger redundant network refetches during routine navigation between views (e.g. visiting Preferences, opening navigation drawer, returning to Orders within the same minute). 60 seconds provides an optimal balance between freshness and UI responsiveness.
- **Garbage Collection (`gcTime`)**: `5 * 60 * 1000` (5 minutes)
  - _Rationale_: Retains inactive cache entries in memory so back/forward browser navigation or returning to page 1 serves immediately from memory without loading flicker.
- **Window Focus Refetch**: `refetchOnWindowFocus: false` (avoids unexpected network refetches during multi-window admin operations).

### 3.2. Stable Query Keys

Orders query keys strictly incorporate every active parameter:

```typescript
const queryKey = [
  "orders",
  {
    page: number,
    pageSize: number,
    status: string | null,
    search: string | null,
    startDate: string | null,
    endDate: string | null,
    scenario: string | null,
  },
] as const;
```

### 3.3. Misleading Page State Avoidance (`placeholderData`)

To comply with the requirement that previous-page data must never produce a misleading page state:

- When the query key changes (due to page change or filter change), `placeholderData` returns `undefined`. This triggers the skeleton loading state for the newly selected page rather than showing stale rows from the previous page with the new page indicator.
- When refetching the exact same query key (e.g., clicking "Refresh" or background refetch), `placeholderData` retains the current data while `isFetching` indicates background activity.

### 3.4. Future Invalidation Contract (Session 14 & 15)

Later Week 3 tasks introduce mutation operations:

1. **Create Order Wizard (Session 14 / D13 / step-16)**:
   - On successful order creation, the mutation must invalidate the Orders list cache via:
     ```typescript
     queryClient.invalidateQueries({ queryKey: ["orders"] });
     ```
   - This ensures the newly created order appears on Page 1 upon return to `/orders`.
2. **Order Status Change (Session 15 / D14 / step-17)**:
   - On status transition (e.g. pending -> processing), the mutation must invalidate:
     ```typescript
     queryClient.invalidateQueries({ queryKey: ["orders"] });
     queryClient.invalidateQueries({ queryKey: ["order", orderId] });
     ```
   - This keeps both the Orders list and the Order detail view synchronized.

---

## 4. Forward-Compatible Filter & Preference Fallback Decision

The user approved this rule for Session 12 (D12):

> **Rule**: URL query parameters always take priority; a saved `defaultFilters` value is used only when its corresponding URL parameter is absent. A present empty parameter is an explicit override.

### 4.1. URL Filter Presence vs. Explicit Empty Override Convention

The client URL query string distinguishes between **parameter absence** and **present empty overrides**:

- **Parameter Absence (`!searchParams.has(key)`)**:
  - Indicates the user has not explicitly configured or touched this filter in the current URL session.
  - An untouched visit to `/orders` produces an empty search query (`""`), where all filter parameters (`status`, `search`, `startDate`, `endDate`) are absent.
  - In Session 12 (D12), absent parameters allow saved Preferences `defaultFilters` to apply as the fallback.
- **Present Empty Override (`searchParams.has(key) === true && searchParams.get(key) === ""`)**:
  - Formatted in the URL query string as `?status=`, `?search=`, `?startDate=`, or `?endDate=`.
  - Signifies an explicit user action to clear or bypass filtering (e.g., selecting "All Statuses", clearing the search input, clearing date boundaries, or clicking "Clear all").
  - In Session 12 (D12), present empty overrides explicitly suppress saved `defaultFilters`, enforcing an unfiltered state for that dimension.
- **Independent Filter Updates**:
  - Updating one filter dimension (e.g. typing a search query) only mutates its own key and never erases existing empty overrides on other dimensions (e.g. `?status=&search=ORD-1` preserves `status=`).
- **"Clear all" Behavior**:
  - The "Clear all" affordance explicitly writes empty overrides for all four filter dimensions (`?status=&search=&startDate=&endDate=`), deletes the `page` pagination parameter to return to page 1, and preserves all unrelated query parameters (such as `pageSize=5` or `scenario=latency`).
- **Client Resolution & Mock API Query**:
  - The client island resolves effective filter values before dispatching network requests. Empty strings (`""`) and absent parameters (`null`) are normalized to `undefined` when invoking `useOrders` / `getOrders`, allowing MSW to return unfiltered records cleanly while maintaining URL state integrity.

### 4.2. Session 12 Integration Contract

Session 11 implements URL-backed D11 filters only. The Preferences store is out of Session 11 scope (no Zustand or preferences store added).

When Session 12 introduces `usePreferencesStore`, it can cleanly evaluate:

```typescript
const effectiveStatus = searchParams.has("status")
  ? (searchParams.get("status") ?? "") // Present: explicit value or explicit override ("")
  : preferences.defaultFilters.status; // Absent: fallback to saved default
```

This ensures complete backward and forward compatibility without breaking changes.

---

## 5. Environment Configuration

| Variable                   | Values                      | Default                                                   | Purpose                                                                                                                                                                                                                      |
| -------------------------- | --------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_MOCKING`  | `"enabled"` \| `"disabled"` | `"disabled"` (unset runtime) / `"enabled"` (.env.example) | Toggles MSW browser worker startup. When unset or any value other than `"enabled"`, MSW startup is skipped entirely and requests hit real network. `.env.example` sets this to `"enabled"` as default for local development. |
| `NEXT_PUBLIC_API_BASE_URL` | String URL                  | `""` (Same-origin)                                        | Custom API base URL prefix for backend integration.                                                                                                                                                                          |

---

## 6. Reproducible Mock Scenarios

The mock handler supports four deterministic scenarios designed for testing and review:

| Scenario            | Behavior                                              | Response                                                                     |
| ------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| `success` (default) | Returns paginated & filtered deterministic fixtures.  | `200 OK` with `{ data, total, page, pageSize, totalPages }`.                 |
| `empty`             | Simulates a tenant or filter state with zero records. | `200 OK` with `{ data: [], total: 0, page: 1, pageSize: 5, totalPages: 0 }`. |
| `error`             | Simulates an upstream database or network failure.    | `500 Internal Server Error` with JSON error payload.                         |
| `delay`             | Injects 1500ms latency before returning fixtures.     | `200 OK` after 1500ms delay with full pagination/filters.                    |
| `disabled`          | Bypasses MSW interception to hit real network.        | Real network response (e.g., 404 from Next.js server).                       |

### How to Select Scenarios for Local Review

Scenarios can be selected without modifying source code via:

1. **Browser URL Query Parameter** (Recommended for review):
   - `http://localhost:3000/orders?scenario=empty`
   - `http://localhost:3000/orders?scenario=error`
   - `http://localhost:3000/orders?scenario=delay`
   - `http://localhost:3000/orders?scenario=success`
2. **API Request Query Parameter**:
   - Calling `getOrders({ scenario: "empty" })`.
3. **HTTP Request Header**:
   - Pass header `x-mock-scenario: error`.
4. **Browser LocalStorage**:
   - In devtools console: `localStorage.setItem("orderhub_mock_scenario", "error")`.

---

## 7. Mock-Disabled Behavior

When `NEXT_PUBLIC_API_MOCKING=disabled`:

1. `MockProvider` sets `isReady: true` immediately without initializing `public/mockServiceWorker.js` or importing `@/mocks/browser`.
2. The client application dispatches fetch requests directly to the network (`/api/orders`).
3. Since Next.js has no server route configured for `/api/orders`, the request returns a standard `404 Not Found`.
4. The client `apiClient` surfaces a typed `HttpError(404, "Not Found")`.
5. The `OrdersList` component renders the accessible error state with retry affordance, accurately reflecting the unavailable real backend rather than faking success.

---

## 8. Server/Client Boundaries & Architecture Rationale

- **`OrdersPage` (`src/app/(dashboard)/orders/page.tsx`)**:
  - Implemented as a **Server Component**.
  - Statically/server-renders page headers, description, and status tags during SSR.
  - Composes the interactive client island `<OrdersList />`.
- **`OrdersList` (`src/features/orders/components/orders-list.tsx`)**:
  - Implemented as a **Client Component** (`"use client"`).
  - Wrapped in `<Suspense>` to ensure `useSearchParams()` never causes Next.js build deopt.
  - Encapsulates URL synchronization, debounced search, status dropdown, date range controls, and pagination.
  - Uses TanStack Query `useQuery` for cached order fetching with stable query keys.
  - Awaits `MockProvider` readiness before initiating data fetch to ensure zero unintercepted requests.

---

## 9. Auth (demo) Architecture & Contract

OrderHub Admin Console implements an approved two-layer demo authentication architecture for capstone evaluation (Session 13 / step-15 / D12):

### 9.1. Two-Layer Architecture

1. **Layer A — Server-Side Session Cookie (`orderhub_demo_session`)**:
   - **Type**: HTTP-only, SameSite=Lax signed cookie.
   - **Payload**: `{ email: string, role: Role, createdAt: number, expiresAt: number }`.
   - **Cryptographic Security**: Signed using HMAC-SHA256 with `DEMO_SESSION_SECRET` (minimum 32 characters, constant-time comparison). Fails closed if secret is missing or insufficient.
   - **Route Guard Authority**: Middleware verifies presence (`/orders/*`, `/preferences/*`); Server Component dashboard layout cryptographically verifies validity and verified role. Invalid or missing cookies immediately redirect to `/login`.
2. **Layer B — Demo Access Token (Client In-Memory API Token)**:
   - **Token Format**: `demo.<role>.<expiresAtMs>.<random>` (e.g. `demo.admin.1731304500000.a1b2c3d4`).
   - **Token Lifespan (TTL)**: 5 minutes (300,000 ms).
   - **Storage Policy**: Kept **strictly in memory** as a JavaScript module variable in `src/features/auth/token-store.ts`. It is **never** persisted to `localStorage`, `sessionStorage`, cookies, or Zustand state.
   - **Minting Mechanism**: Server Action `refreshAccessTokenAction()` in `src/features/auth/actions.ts`. Validates the HTTP-only session cookie server-side; if valid, mints and returns `{ ok: true, accessToken, expiresAt }`, otherwise `{ ok: false }`.

### 9.2. Sequence: Token Acquisition, 401 Refresh, Retry, and Sign-Out

The shared `apiClient` (`src/lib/api/client.ts`) handles request authentication and token lifecycle for same-origin `/api/` endpoints:

1. **Initial Acquisition**: If no in-memory token exists, `apiClient` silently acquires one via `refreshAccessToken()` before dispatching the request. If acquisition fails (`{ ok: false }`), the client immediately calls `signOut("session_expired")`.
2. **Bearer Attachment**: Requests include `Authorization: Bearer <token>`.
3. **On 401 Unauthorized**:
   - Exactly **one** silent token refresh attempt is performed via `refreshAccessToken()`. A shared in-flight promise ensures that concurrent requests trigger only a single refresh operation.
   - Once refreshed, the original request is retried **once** with the new token.
4. **Sign-Out Termination (No Infinite Loops)**:
   - If the refresh attempt fails (`{ ok: false }`), or if the retried request returns `401` again, client execution immediately aborts and triggers `signOut("session_expired")`.
   - `signOut()` clears the in-memory token, calls the server action to remove the HTTP-only cookie, and executes `window.location.replace("/login?reason=session_expired")`. This hard navigation flushes the TanStack Query in-memory cache and prevents any retry loop.
5. **Abort Signal Safety**: Any aborted request (`AbortSignal`) never triggers a refresh attempt or sign-out redirect.

### 9.3. MSW Auth Scenarios (`src/mocks/handlers.ts`)

MSW intercepts `GET /api/orders` and requires a valid `Bearer demo.*` token with a future expiry timestamp. It resolves auth testing scenarios via query parameter `?auth=`, request header `x-mock-auth`, or `localStorage.orderhub_mock_auth`:

| Auth Scenario       | Trigger / Activation                                           | Behavior                                                                                                             | Purpose                                                                                            |
| ------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `expire-once`       | `?auth=expire-once` or `orderhub_mock_auth="expire-once"`      | Rejects the first token seen while active with `401 { code: "token_expired" }`; accepts subsequent refreshed tokens. | Proves silent 1 refresh + 1 retry sequence recovers seamlessly to render order data.               |
| `always-401`        | `?auth=always-401` or `orderhub_mock_auth="always-401"`        | Rejects all tokens unconditionally with `401 { code: "token_expired" }`.                                             | Proves 1 refresh + 1 retry, followed by clean termination and redirect without loop.               |
| Cookie Invalidation | Mutate/clear `orderhub_demo_session` cookie in browser context | On refetch, server action returns `{ ok: false }`.                                                                   | Proves real server-side session invalidation triggers sign out to `/login?reason=session_expired`. |

### 9.4. Role-Based Access Control (RBAC) Matrix

Roles are resolved from demo fixture emails in `src/mocks/data/auth.ts`:

- `admin@orderhub.test` → `admin`
- `staff@orderhub.test` → `staff`
- `viewer@orderhub.test` → `viewer`
- Any other valid email format → `viewer`

| Permission             | admin | staff | viewer | UI Affordance / Impact                                             |
| ---------------------- | :---: | :---: | :----: | ------------------------------------------------------------------ |
| `orders:view`          |   ✓   |   ✓   |   ✓    | Access to `/orders` route and sidebar nav link                     |
| `preferences:manage`   |   ✓   |   ✓   |   ✓    | Access to `/preferences` route and sidebar nav link                |
| `orders:create`        |   ✓   |   ✓   |   ✗    | Rendered in sidebar "Your access" list; future Create Order button |
| `orders:updateStatus`  |   ✓   |   ✓   |   ✗    | Rendered in sidebar "Your access" list; future status actions      |
| `orders:uploadInvoice` |   ✓   |   ✓   |   ✗    | Rendered in sidebar "Your access" list; future upload affordance   |
| `reports:view`         |   ✓   |   ✓   |   ✗    | Rendered in sidebar "Your access" list; future reports view        |
| `reports:export`       |   ✓   |   ✗   |   ✗    | Rendered in sidebar "Your access" list; future export affordance   |

### 9.5. Limits & Demo Boundary Notice

- **Unsigned Access Tokens**: Demo access tokens are simple strings with TTL metadata and random salt. They are designed for client-side MSW verification and capstone flow demonstration, **not production authentication**.
- **No Password Fixtures**: The application stores no user passwords. Any 8+ character password is accepted during login validation and immediately discarded.
- **Client UI Hiding vs. Authorization Boundary**: Hiding navigation items or actions in the UI is an ergonomic affordance, **not authorization**. Future backend/MSW mutations must enforce 403 Forbidden responses on the server side for disallowed roles regardless of client state.
