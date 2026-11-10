# Session 09 — step-10, step-11 — ready_for_review

- Branch: `feat/orders-list`
- Baseline SHA (or unborn): `94ebf324f48ba78087f87ebb1e979fbeee0ceadb`
- Review target: uncommitted working tree against baseline HEAD (include staged and untracked files)
- Changed/untracked files by task:
  - `step-10` (D10):
    - Modified:
      - `package.json`
      - `pnpm-lock.yaml`
      - `.env.example`
      - `src/app/layout.tsx`
    - Untracked:
      - `public/mockServiceWorker.js`
      - `src/lib/api/client.ts`
      - `src/features/orders/types.ts`
      - `src/features/orders/api.ts`
      - `src/mocks/browser.ts`
      - `src/mocks/handlers.ts`
      - `src/mocks/data/orders.ts`
      - `src/components/providers/mock-provider.tsx`
      - `docs/mock-api.md`
  - `step-11` (D10):
    - Modified:
      - `src/app/(dashboard)/orders/page.tsx`
    - Untracked:
      - `src/features/orders/components/orders-list.tsx`
      - `src/features/orders/components/orders-table.tsx`
      - `src/features/orders/hooks/use-orders.ts`
  - Documentation / reporting:
    - Modified:
      - `docs/ai-journal.md`
    - Untracked:
      - `docs/handoffs/session-09.md`
  - Local / gitignored evidence:
    - `output/playwright/session-09/` (`orders-375.png`, `orders-768.png`, `orders-1280.png`, `orders-1920.png`, `orders-empty-1280.png`, `orders-error-1280.png`, `orders-loading-1280.png`, `orders-mock-disabled-1280.png`, `orders-focus-table.png`, `results.json`)
- Objective and changed files:
  - Implemented Session 09 covering step-10 (typed browser API client, MSW browser mock, mock provider) and step-11 (Orders rendered list, loading/error/empty/success states, keyboard-accessible table scroll region).
  - Preserved `src/app/(dashboard)/orders/page.tsx` as a Server Component that renders metadata, title, and description, composing client island `<OrdersList />`.
  - Added allowlisted dependency `msw@2.7.3` and generated `public/mockServiceWorker.js` via MSW CLI initializer.
- Out-of-scope changes: none.

## Acceptance evidence

| Task + criterion                                                                                                                                                                                            | pass / fail / not_run / not_applicable | Reproduction or command                                                                            | Evidence / observed result                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `step-10`: Allowlist bổ sung: msw; worker sinh bằng msw init public; pin version.                                                                                                                           | pass                                   | `pnpm info msw version` and inspect `package.json`, `public/mockServiceWorker.js`                  | `msw: "2.7.3"` pinned in `package.json` dependencies; `public/mockServiceWorker.js` generated using `pnpm exec msw init public`. Zero unallowlisted libraries added.                                                                                                                                                                                                                                                  |
| `step-10`: fetch client kiểm tra response.ok, parse dữ liệu từ unknown bằng type guards, lỗi typed, hỗ trợ AbortSignal và base URL env.                                                                     | pass                                   | Inspect `src/lib/api/client.ts` and `src/features/orders/types.ts`                                 | Shared client checks `response.ok`, parses unknown bodies safely, throws typed `HttpError`, `NetworkError`, `InvalidPayloadError`, supports `AbortSignal`, validates via type guards `isOrdersResponse`/`isOrder`, and resolves base URL with same-origin fallback.                                                                                                                                                   |
| `step-10`: Client mock provider await worker.start trước khi mount phần fetch; chỉ bật khi NEXT_PUBLIC_API_MOCKING=enabled.                                                                                 | pass                                   | Inspect `src/components/providers/mock-provider.tsx` and Playwright console logs                   | Worker initializes only when `NEXT_PUBLIC_API_MOCKING=enabled`; `MockProvider` awaits `worker.start()` and coordinates `isReady` context before child fetch execution; when disabled, skips MSW startup and allows real requests.                                                                                                                                                                                     |
| `step-10`: Mock GET /api/orders có fixture xác định và scenario success/delay/empty/error; mock off gọi endpoint thật không tồn tại phải trả lỗi, không fallback thành công.                                | pass                                   | Navigate to `http://localhost:3000/orders?scenario=...` in Playwright                              | Verified 10 deterministic B2B fixtures. Exercised scenarios: `success` (10 items), `empty` (0 items), `error` (500 alert), `delay` (1500ms latency), and `disabled` (real 404 surfaced with retry CTA without fake success fallback).                                                                                                                                                                                 |
| `step-10`: D10 mock browser chỉ intercept client fetch; không fetch mock từ Server Component.                                                                                                               | pass                                   | Inspect `src/app/(dashboard)/orders/page.tsx` and `src/mocks/browser.ts`                           | `OrdersPage` is a Server Component with zero MSW imports or server-side fetch calls; fetch executed strictly within Client Component `OrdersList` / `useOrders` after `MockProvider` readiness.                                                                                                                                                                                                                       |
| `step-11`: Orders page là Server Component composition; Client island fetch qua typed client sau khi worker ready; giải thích boundary tại Gate 2.                                                          | pass                                   | Inspect `src/app/(dashboard)/orders/page.tsx` and `src/features/orders/components/orders-list.tsx` | `OrdersPage` server-renders header, badge, and description, composing `<OrdersList />` client island which executes typed client fetch after MSW worker readiness. Detailed boundary rationale documented in `docs/mock-api.md`.                                                                                                                                                                                      |
| `step-11`: Có loading, error retry, empty và success; AbortController cleanup, stale responses không ghi đè state; không dùng any.                                                                          | pass                                   | Inspect `src/features/orders/hooks/use-orders.ts` and Playwright scenario tests                    | `useOrders` implements full lifecycle (`idle`, `loading`, `success`, `empty`, `error`), cancels in-flight requests on unmount via `AbortController`, protects against stale race conditions via `requestIdRef`, and contains 0 `any` types.                                                                                                                                                                           |
| `step-11`: Table có caption/th scope, trạng thái có text, tiền/ngày format Intl nhất quán; pending aria-busy và thông báo lỗi accessible.                                                                   | pass                                   | Playwright DOM snapshot and source inspection of `orders-table.tsx` and `orders-list.tsx`          | Semantic `<table>`, `<caption className="sr-only">`, `<th scope="col">`, `<td scope="row">`; status badges render readable text (e.g. Delivered, Pending) with semantic tokens; currency formatted via `Intl.NumberFormat`, dates via `Intl.DateTimeFormat`; loading skeleton has `role="status"` and `aria-busy="true"`.                                                                                             |
| `step-11`: Tắt mock cho lỗi có hướng dẫn/retry, không blank/crash; skeleton route và trạng thái fetch được phân biệt.                                                                                       | pass                                   | Playwright simulation at `/orders?scenario=disabled` and mock-off run                              | When mocking is disabled, real unmocked `/api/orders` returns 404; view displays accessible alert "Server returned error (HTTP 404 Not Found)" with retry CTA; client fetch loading is distinct from route-level `loading.tsx`.                                                                                                                                                                                       |
| `step-10` & `11`: pnpm exec tsc --noEmit, pnpm lint và pnpm build đều pass; TypeScript strict, không any hoặc ts-ignore để né lỗi.                                                                          | pass                                   | `pnpm exec tsc --noEmit && pnpm lint && pnpm build`                                                | All three commands exited with code 0. TypeScript 5.8.2 strict check passed with 0 errors; ESLint 9 passed with 0 errors (non-blocking unused disable warning on vendor `mockServiceWorker.js` noted); production build generated dynamic `/orders` at 4.9 kB / 115 kB.                                                                                                                                               |
| `step-10` & `11`: Chỉ sửa scope_files tính từ root capstone; không đổi dependency ngoài allowlist của task; không sửa labs.                                                                                 | pass                                   | `git status --short --branch`                                                                      | Exactly modified/untracked allowlisted files: `package.json`, `pnpm-lock.yaml`, `.env.example`, `public/mockServiceWorker.js`, `src/lib/api/client.ts`, `src/features/orders/*`, `src/mocks/*`, `src/components/providers/mock-provider.tsx`, `src/app/layout.tsx`, `src/app/(dashboard)/orders/page.tsx`, `docs/mock-api.md`, `docs/ai-journal.md`, `docs/handoffs/session-09.md`. Zero out-of-scope files modified. |
| `step-10` & `11`: UI dùng semantic tokens và cva cho variants/sizes; không arbitrary Tailwind values, inline style hoặc literal màu/spacing ngoài nơi khai báo tokens.                                      | pass                                   | Source inspection across touched components                                                        | Strictly uses semantic tokens (`bg-surface`, `bg-muted`, `border-border`, `text-page-title`, `text-body`, `text-caption`, `font-mono`) and 4px spacing scale (`p-4`, `py-3`, `px-4`, `gap-4`). Zero arbitrary bracket classes (`[...]`).                                                                                                                                                                              |
| `step-10` & `11`: Với UI bị tác động: kiểm tra 375/768/1280/1920px, không tràn ngang toàn trang; bảng có vùng cuộn riêng được đặt tên.                                                                      | pass                                   | Playwright MCP measurement across 375x812, 768x1024, 1280x800, 1920x1080                           | Verified `scrollWidth === clientWidth` on all 4 viewports (375: 360/360, 768: 768/768, 1280: 1265/1265, 1920: 1920/1920). At 375px, table scroll region (`scrollWidth: 618, clientWidth: 326`) horizontally scrolls internally without document overflow.                                                                                                                                                             |
| `step-10` & `11`: Với UI tương tác: semantic HTML, accessible name, focus rõ, Tab/Shift+Tab/Enter/Space hoạt động đúng; dialog hỗ trợ Escape, focus trap và trả focus.                                      | pass                                   | Playwright keyboard focus evaluation                                                               | Orders Data Table scroll container exposes `role="region"`, `aria-label="Orders Data Table"`, `tabIndex={0}`, and visible 2px focus ring (`ring-2 ring-focus ring-offset-2`). Refresh and Retry CTA buttons activate with native keyboard events.                                                                                                                                                                     |
| `step-10` & `11`: Ghi docs/ai-journal.md: prompt, kết quả AI, sửa lỗi, kết quả kiểm tra và giới hạn còn lại; giữ code và báo cáo uncommitted; Codex review rồi người dùng tự stage/commit theo sessions.md. | pass                                   | Inspect `docs/ai-journal.md` and `git status`                                                      | Session 09 entry recorded in `docs/ai-journal.md`. All changes left uncommitted for Codex review. Zero credentials persisted.                                                                                                                                                                                                                                                                                         |

## Checks

| Command                                      | Exit code | Result                                                                                                                                                                                         |
| -------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec tsc --noEmit`                     | `0`       | Passed: TypeScript 5.8.2 strict check passed with zero errors.                                                                                                                                 |
| `pnpm lint`                                  | `0`       | Passed: ESLint 9 evaluated with zero errors (non-blocking unused disable warning on vendor `mockServiceWorker.js` noted).                                                                      |
| `pnpm build`                                 | `0`       | Passed: Next.js 15.5.29 production build compiled successfully; dynamic `/orders` (4.9 kB / 115 kB) generated cleanly.                                                                         |
| `pnpm exec prettier --check <touched_files>` | `0`       | Passed: All touched source and documentation files conform 100% to Prettier code style.                                                                                                        |
| `pnpm format:check`                          | `1`       | Pre-existing baseline failure: 2 pre-existing out-of-scope D6 files (`docs/delivery.md` and `docs/handoffs/session-03.md`) contain CRLF line endings. All touched in-scope files pass cleanly. |
| `git diff --check`                           | `0`       | Passed: Clean diff with zero whitespace or line-ending anomalies.                                                                                                                              |

## Touched UI

| Route + state                                  | 375  | 768  | 1280 | 1920 | Evidence                                                                                              |
| ---------------------------------------------- | ---- | ---- | ---- | ---- | ----------------------------------------------------------------------------------------------------- |
| `/orders` success state (10 fixtures)          | pass | pass | pass | pass | `output/playwright/session-09/orders-375.png`, `orders-768.png`, `orders-1280.png`, `orders-1920.png` |
| `/orders` empty state (`?scenario=empty`)      | n/a  | n/a  | pass | n/a  | `output/playwright/session-09/orders-empty-1280.png`                                                  |
| `/orders` error state (`?scenario=error`)      | n/a  | n/a  | pass | n/a  | `output/playwright/session-09/orders-error-1280.png`                                                  |
| `/orders` loading skeleton (`?scenario=delay`) | n/a  | n/a  | pass | n/a  | `output/playwright/session-09/orders-loading-1280.png`                                                |
| `/orders` mock-disabled HTTP 404 failure       | n/a  | n/a  | pass | n/a  | `output/playwright/session-09/orders-mock-disabled-1280.png`                                          |
| `/orders` table region keyboard focused        | n/a  | n/a  | pass | n/a  | `output/playwright/session-09/orders-focus-table.png`                                                 |

- **Keyboard sequence and observed focus behavior**:
  - The table container is an accessible region: `role="region" aria-label="Orders Data Table" tabIndex={0}`.
  - Tab navigation focuses the region with visible focus ring (`ring-2 ring-focus ring-offset-2`).
  - Table can be navigated horizontally using Arrow keys inside the region without causing window scrolling.
  - Action buttons ("Refresh", "Retry loading orders", "Refresh orders") support Space and Enter activation.
- **Contrast measurement and method**:
  - Measured against WCAG 2.1 relative luminance standards using design tokens:
    - Table header text: `text-muted-foreground` (`#475569`) on `bg-muted/60` (`#F1F5F9`): **6.92:1** (AAA).
    - Table body text: `text-foreground` (`#0F172A`) on `bg-surface` (`#FFFFFF`): **17.85:1** (AAA).
    - Order code / total font: `font-mono text-foreground` on `bg-surface`: **17.85:1** (AAA).
    - Status badge text:
      - Delivered: `text-success-muted-foreground` (`#166534`) on `bg-success-muted` (`#DCFCE7`): **6.49:1** (AA).
      - Pending: `text-warning-muted-foreground` (`#92400E`) on `bg-warning-muted` (`#FEF3C7`): **6.37:1** (AA).
      - Cancelled: `text-destructive-muted-foreground` (`#991B1B`) on `bg-destructive-muted` (`#FEE2E2`): **6.80:1** (AA).
    - Focus ring: `ring-focus` (`#1D4ED8`): **6.70:1** (>= 3:1 non-text UI contrast).
- **Loading/error/empty/retry reproduction**:
  - `loading`: Append `?scenario=delay` to `/orders`. Awaits 1500ms before returning fixtures. During load, renders `<span className="sr-only">Loading customer orders data...</span>` and skeleton shimmer table rows with `aria-busy="true"`.
  - `empty`: Append `?scenario=empty` to `/orders`. Handler returns `{ data: [], total: 0 }`. Renders accessible empty state card with "No orders found" and "Refresh orders" CTA.
  - `error`: Append `?scenario=error` to `/orders`. Handler returns HTTP 500. Renders accessible error card with "Unable to load orders" and "Retry loading orders" CTA.
  - `retry`: Clicking "Retry loading orders" re-executes `fetchOrders` without page reload, successfully fetching data and restoring the table once the scenario resolves.
  - `mock_disabled`: Append `?scenario=disabled` to `/orders`. Handler invokes MSW `passthrough()`, dispatching real fetch to `/api/orders`. Real endpoint returns 404; client surfaces `HttpError(404, "Not Found")` with retry affordance.
- **Server/client boundary explanation**:
  - `src/app/(dashboard)/orders/page.tsx`: Server Component. Statically/server-renders page headers, SEO metadata, category badge, and operational description.
  - `src/features/orders/components/orders-list.tsx`: Client Component (`"use client"`). Encapsulates client-side data fetching, `useOrders` lifecycle, loading shimmer, error boundary, and empty states.
  - `src/features/orders/components/orders-table.tsx`: Presentational component rendered within the client island, providing semantic HTML table and named scroll region.
  - `src/components/providers/mock-provider.tsx`: Client Component (`"use client"`). Coordinates MSW worker startup before child components initiate fetches.
- **Design baseline and deviations**:
  - Conforms strictly to `docs/design-system.md` visual baseline.
  - 4px spacing scale throughout (`py-3`, `px-4`, `p-4`, `space-y-4`, `gap-4`).
  - Zero arbitrary bracket values (`[...]`) in authored CSS.
- **Playwright smoke: commands, tested routes/states, viewport sizes, observed failures and screenshot/trace paths**:
  - Automation executed against Next.js production server (`next start -p 3000`).
  - Viewports: 375x812, 768x1024, 1280x800, 1920x1080.
  - Observed failures: 0. Zero page-level horizontal window overflow across all viewports.
  - Evidence directory: `output/playwright/session-09/`:
    - `orders-375.png` (25.1 KB) — Mobile viewport at 375x812 showing contained table scroll region
    - `orders-768.png` (33.8 KB) — Tablet viewport at 768x1024
    - `orders-1280.png` (42.5 KB) — Desktop viewport at 1280x800 showing 10 fixtures
    - `orders-1920.png` (47.2 KB) — Large display viewport at 1920x1080
    - `orders-empty-1280.png` (22.4 KB) — Empty scenario state at 1280x800
    - `orders-error-1280.png` (26.9 KB) — HTTP 500 error scenario state at 1280x800
    - `orders-loading-1280.png` (24.1 KB) — Client loading skeleton state at 1280x800
    - `orders-mock-disabled-1280.png` (26.8 KB) — Real HTTP 404 unmocked failure state at 1280x800
    - `orders-focus-table.png` (42.6 KB) — Visible focus ring on named Orders Data Table scroll container
    - `results.json` (3.2 KB) — Complete machine-readable test records

## Recovery

- Decisions and tradeoffs:
  - In MSW v2, `package.json` specifies `"node": null` under `"./browser"`, which causes Webpack server compilation to fail when analyzing `msw/browser` imports within client components during SSR. Rather than modifying out-of-scope `next.config.ts` or introducing patch files outside `scope_files`, resolved this in `src/mocks/browser.ts` by importing from the ESM bundle `../../node_modules/msw/lib/browser/index.mjs` with explicit TypeScript typing, preserving strict types with zero `@ts-ignore` or `@ts-expect-error` directives.
  - Handled request lifecycle concurrency in `useOrders` with `requestIdRef` and `AbortController` cleanup to ensure stale responses from delayed requests never overwrite newer state.
  - Designed scenario controls to be development-friendly via URL query parameter `?scenario=...`, request header `x-mock-scenario`, or localStorage without injecting product settings UI or server backend routes.
- Pre-existing failures versus new failures:
  - Pre-existing failure: `pnpm format:check` fails solely on 2 pre-existing out-of-scope D6 files (`docs/delivery.md` and `docs/handoffs/session-03.md`) containing CRLF line endings. All files touched in Session 09 pass Prettier cleanly.
- Known issues, not-run checks and blockers:
  - None. All acceptance criteria, quality checks, and real-browser Playwright tests passed.
- Reproduction and next concrete action:
  - Next action: Stop and hand over uncommitted working tree to Codex for review. User stages and commits after Codex acceptance.
- AI journal entry:
  - Recorded in `docs/ai-journal.md` under `Session 09 — Step-10 & Step-11 / D10: Typed API client, MSW and Orders list`.
- Suggested next session (not executed):
  - Session 10 / step-12 (D10): Gate 2 audit and delivery handoff.

Leave this report and code uncommitted. The user stages/commits after Codex review.
Do not invent implementation/report SHAs; only baseline HEAD exists before the user commits.
Screenshots do not prove keyboard support; build success does not prove UI acceptance.
