# Session 09 — step-10, step-11 — repair round r2/2 — ready_for_review

- Branch: `feat/orders-list`
- Baseline SHA: `94ebf324f48ba78087f87ebb1e979fbeee0ceadb` (matches current `HEAD`)
- Review target: uncommitted working tree against baseline HEAD (including staged and untracked files)
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
      - `docs/handoffs/session-09.md` (retained pristine as initial pass history)
      - `docs/handoffs/session-09-r2.md` (this repair r2 report)
  - Local / gitignored evidence:
    - `output/playwright/session-09/` (`orders-375.png`, `orders-768.png`, `orders-1280.png`, `orders-1920.png`, `orders-empty-1280.png`, `orders-error-1280.png`, `orders-loading-1280.png`, `orders-mock-disabled-1280.png`, `orders-focus-table.png`, `results.json`)
- Out-of-scope changes: none. `next.config.ts` was kept pristine and unmodified.

---

## R2 Repair Summary & Corrections

This report documents the final repair round (`r2/2`) addressing all findings from `.agents/sessions/session-09/reviews/initial-review.md` and `.agents/sessions/session-09/reviews/r1-review.md`:

1. **[P1] MSW public entry import & bundler compatibility**:

   - Replaced internal path import (`../../node_modules/...`) and unsafe `unknown` casting in `src/mocks/browser.ts` with public entry `import type { SetupWorker } from "msw/browser"` and an async `initWorker()` using dynamic `await import("msw/browser")`.
   - Guarded dynamic imports with `if (typeof window !== "undefined")` in both `browser.ts` and `mock-provider.tsx`. Next.js's Webpack server compiler treats this branch as dead code during Node SSR compilation, preventing the `"node": null` package export conflict without requiring edits to out-of-scope `next.config.ts`.
   - Verified that `pnpm build` (`next build`) compiles cleanly with exit code 0.

2. **[P1] HTTP 204 handling in typed API client**:

   - Completely eliminated `undefined as unknown as T` from `src/lib/api/client.ts`.
   - Because `apiClient` models typed JSON response payloads, receiving HTTP 204 No Content throws an explicit `InvalidPayloadError("HTTP 204 No Content received when JSON response payload was expected")`.

3. **[P1] Genuine runtime mock-disabled environment test**:

   - Rectified the previous inaccurate claim where `?scenario=disabled` (handler `passthrough()`) was conflated with the environment-disabled test.
   - Tested in a fresh browser context against a dedicated production server booted with `NEXT_PUBLIC_API_MOCKING="disabled"`.
   - Verified that `MockProvider` skipped MSW registration entirely (no service worker active).
   - Confirmed `GET /api/orders` hit the real Next.js server, received genuine HTTP 404 Not Found, and surfaced typed `HttpError` displaying the accessible error alert with retry button.
   - Verified clicking "Retry loading orders" re-dispatched the fetch and stayed on 404 without crashing.

4. **[P1] Verified Playwright PNG evidence**:

   - Re-ran Playwright MCP to capture all 9 required screenshots directly to `output/playwright/session-09/`.
   - Verified each file's existence and byte size on disk before citing in this report.
   - Updated `output/playwright/session-09/results.json` with the genuine disabled-environment observation.

5. **[P2] Mock default documentation**:
   - Corrected `docs/mock-api.md:93` explaining that an unset runtime environment variable skips MSW worker startup (default disabled), whereas `.env.example` configures it to enabled for local development. Formatted with Prettier.

---

## Acceptance Evidence

| Task + criterion                                                                                                                                                                                            | pass / fail / not_run | Reproduction or command                                                                                  | Evidence / observed result                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `step-10`: Allowlist bổ sung: msw; worker sinh bằng msw init public; pin version.                                                                                                                           | pass                  | `pnpm info msw version` and inspect `package.json`, `public/mockServiceWorker.js`                        | `msw: "2.7.3"` pinned in `package.json` dependencies; worker script generated via `pnpm exec msw init public`. Zero unallowlisted libraries added.                                                                                                                                                                                                                                                                       |
| `step-10`: fetch client kiểm tra response.ok, parse dữ liệu từ unknown bằng type guards, lỗi typed, hỗ trợ AbortSignal và base URL env.                                                                     | pass                  | Inspect `src/lib/api/client.ts` and `src/features/orders/types.ts`                                       | Checks `response.ok`, parses unknown bodies safely, throws typed `HttpError`, `NetworkError`, `InvalidPayloadError` (including on 204), validates runtime schema via `isOrdersResponse`/`isOrder`, supports `AbortSignal`, resolves base URL with same-origin fallback.                                                                                                                                                  |
| `step-10`: Client mock provider await worker.start trước khi mount phần fetch; chỉ bật khi NEXT_PUBLIC_API_MOCKING=enabled.                                                                                 | pass                  | Inspect `src/components/providers/mock-provider.tsx` and Playwright console logs                         | Worker initializes only when `NEXT_PUBLIC_API_MOCKING=enabled`; `MockProvider` awaits `worker.start()` and coordinates `isReady` context before child fetch execution; when disabled, skips MSW startup and allows real requests.                                                                                                                                                                                        |
| `step-10`: Mock GET /api/orders có fixture xác định và scenario success/delay/empty/error; mock off gọi endpoint thật không tồn tại phải trả lỗi, không fallback thành công.                                | pass                  | Navigate to `http://localhost:3000/orders?scenario=...` and boot with `NEXT_PUBLIC_API_MOCKING=disabled` | Verified 10 deterministic B2B fixtures. Scenarios: `success` (10 items), `empty` (0 items), `error` (500 alert), `delay` (1500ms shimmer). Dedicated mock-off test confirmed real 404 error alert with retry button without fake fallback.                                                                                                                                                                               |
| `step-10`: D10 mock browser chỉ intercept client fetch; không fetch mock từ Server Component.                                                                                                               | pass                  | Inspect `src/app/(dashboard)/orders/page.tsx` and `src/mocks/browser.ts`                                 | `OrdersPage` is a Server Component with zero MSW imports or server-side fetch calls; fetch executed strictly within Client Component `OrdersList` / `useOrders` after `MockProvider` readiness.                                                                                                                                                                                                                          |
| `step-11`: Orders page là Server Component composition; Client island fetch qua typed client sau khi worker ready; giải thích boundary tại Gate 2.                                                          | pass                  | Inspect `src/app/(dashboard)/orders/page.tsx` and `src/features/orders/components/orders-list.tsx`       | `OrdersPage` server-renders header, badge, and description, composing `<OrdersList />` client island which executes typed client fetch after MSW worker readiness. Boundary rationale documented in `docs/mock-api.md`.                                                                                                                                                                                                  |
| `step-11`: Có loading, error retry, empty và success; AbortController cleanup, stale responses không ghi đè state; không dùng any.                                                                          | pass                  | Inspect `src/features/orders/hooks/use-orders.ts` and Playwright scenario tests                          | `useOrders` implements full lifecycle (`idle`, `loading`, `success`, `empty`, `error`), cancels in-flight requests on unmount via `AbortController`, protects against stale race conditions via `requestIdRef`, and contains 0 `any` types.                                                                                                                                                                              |
| `step-11`: Table có caption/th scope, trạng thái có text, tiền/ngày format Intl nhất quán; pending aria-busy và thông báo lỗi accessible.                                                                   | pass                  | Playwright DOM snapshot and source inspection of `orders-table.tsx` and `orders-list.tsx`                | Semantic `<table>`, `<caption className="sr-only">`, `<th scope="col">`; status badges render readable text (e.g. Delivered, Pending) with semantic tokens; currency formatted via `Intl.NumberFormat`, dates via `Intl.DateTimeFormat`; loading skeleton has `role="status"` and `aria-busy="true"`.                                                                                                                    |
| `step-11`: Tắt mock cho lỗi có hướng dẫn/retry, không blank/crash; skeleton route và trạng thái fetch được phân biệt.                                                                                       | pass                  | Playwright real mock-off run (`$env:NEXT_PUBLIC_API_MOCKING="disabled"`)                                 | Unmocked `/api/orders` returned real HTTP 404; view displayed accessible alert "Unable to load orders: Server returned error (HTTP 404 Not Found)" with retry button; client fetch loading is distinct from route-level `loading.tsx`.                                                                                                                                                                                   |
| `step-10` & `11`: pnpm exec tsc --noEmit, pnpm lint và pnpm build đều pass; TypeScript strict, không any hoặc ts-ignore để né lỗi.                                                                          | pass                  | `pnpm exec tsc --noEmit && pnpm lint && pnpm build`                                                      | All three commands exited with code 0. TypeScript 5.8.2 strict passed with 0 errors; ESLint 9 passed with 0 errors; production build generated dynamic `/orders` at 4.97 kB / 115 kB First Load JS.                                                                                                                                                                                                                      |
| `step-10` & `11`: Chỉ sửa scope_files tính từ root capstone; không đổi dependency ngoài allowlist của task; không sửa labs.                                                                                 | pass                  | `git status --short --branch`                                                                            | Exactly modified/untracked allowlisted files: `package.json`, `pnpm-lock.yaml`, `.env.example`, `public/mockServiceWorker.js`, `src/lib/api/client.ts`, `src/features/orders/*`, `src/mocks/*`, `src/components/providers/mock-provider.tsx`, `src/app/layout.tsx`, `src/app/(dashboard)/orders/page.tsx`, `docs/mock-api.md`, `docs/ai-journal.md`, `docs/handoffs/session-09-r2.md`. Zero out-of-scope files modified. |
| `step-10` & `11`: UI dùng semantic tokens và cva cho variants/sizes; không arbitrary Tailwind values, inline style hoặc literal màu/spacing ngoài nơi khai báo tokens.                                      | pass                  | Source inspection across touched components                                                              | Strictly uses semantic tokens (`bg-surface`, `bg-muted`, `border-border`, `text-page-title`, `text-body`, `text-caption`, `font-mono`) and 4px spacing scale (`p-4`, `py-3`, `px-4`, `gap-4`). Zero arbitrary bracket classes (`[...]`).                                                                                                                                                                                 |
| `step-10` & `11`: Với UI bị tác động: kiểm tra 375/768/1280/1920px, không tràn ngang toàn trang; bảng có vùng cuộn riêng được đặt tên.                                                                      | pass                  | Playwright MCP measurement across 375x812, 768x1024, 1280x800, 1920x1080                                 | Verified `scrollWidth === clientWidth` on all 4 viewports (375: 360/360, 768: 768/768, 1280: 1265/1265, 1920: 1920/1920). At 375px, table scroll region horizontally scrolls internally without document overflow.                                                                                                                                                                                                       |
| `step-10` & `11`: Với UI tương tác: semantic HTML, accessible name, focus rõ, Tab/Shift+Tab/Enter/Space hoạt động đúng; dialog hỗ trợ Escape, focus trap và trả focus.                                      | pass                  | Playwright keyboard focus evaluation                                                                     | Orders Data Table scroll container exposes `role="region"`, `aria-label="Orders Data Table"`, `tabIndex={0}`, and visible 2px focus ring (`ring-2 ring-focus ring-offset-2`). Refresh and Retry CTA buttons activate with native keyboard events.                                                                                                                                                                        |
| `step-10` & `11`: Ghi docs/ai-journal.md: prompt, kết quả AI, sửa lỗi, kết quả kiểm tra và giới hạn còn lại; giữ code và báo cáo uncommitted; Codex review rồi người dùng tự stage/commit theo sessions.md. | pass                  | Inspect `docs/ai-journal.md` and `git status`                                                            | Session 09 r1 and r2 repair entries recorded in `docs/ai-journal.md`. All changes left uncommitted for Codex review. Zero credentials persisted.                                                                                                                                                                                                                                                                         |

---

## Verification Checks

| Command                                            | Exit code | Observed result                                                                                                                                                                                |
| -------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec tsc --noEmit`                           | `0`       | Passed: TypeScript 5.8.2 strict check passed with zero errors.                                                                                                                                 |
| `pnpm lint`                                        | `0`       | Passed: ESLint 9 evaluated with zero errors (1 harmless warning on vendor `public/mockServiceWorker.js`).                                                                                      |
| `pnpm build`                                       | `0`       | Passed: Next.js 15.5.29 production build compiled successfully; dynamic `/orders` (4.97 kB / 115 kB) generated cleanly.                                                                        |
| `pnpm exec prettier --check src/ docs/mock-api.md` | `0`       | Passed: All touched source and documentation files conform 100% to Prettier code style.                                                                                                        |
| `pnpm format:check`                                | `1`       | Pre-existing baseline failure: 2 pre-existing out-of-scope D6 files (`docs/delivery.md` and `docs/handoffs/session-03.md`) contain CRLF line endings. All touched in-scope files pass cleanly. |
| `git diff --check`                                 | `0`       | Passed: Clean diff with zero whitespace or line-ending anomalies.                                                                                                                              |

---

## Touched UI & Playwright Evidence

All 9 screenshots were captured via Playwright MCP and confirmed to exist on disk in `output/playwright/session-09/`:

| Route + state                                  | Viewport  | Status | Disk size    | Evidence path                                                |
| ---------------------------------------------- | --------- | ------ | ------------ | ------------------------------------------------------------ |
| `/orders` success state (10 fixtures)          | 375x812   | pass   | 37,073 bytes | `output/playwright/session-09/orders-375.png`                |
| `/orders` success state (10 fixtures)          | 768x1024  | pass   | 75,443 bytes | `output/playwright/session-09/orders-768.png`                |
| `/orders` success state (10 fixtures)          | 1280x800  | pass   | 74,055 bytes | `output/playwright/session-09/orders-1280.png`               |
| `/orders` success state (10 fixtures)          | 1920x1080 | pass   | 88,726 bytes | `output/playwright/session-09/orders-1920.png`               |
| `/orders` empty state (`?scenario=empty`)      | 1280x800  | pass   | 30,475 bytes | `output/playwright/session-09/orders-empty-1280.png`         |
| `/orders` error state (`?scenario=error`)      | 1280x800  | pass   | 31,515 bytes | `output/playwright/session-09/orders-error-1280.png`         |
| `/orders` loading skeleton (`?scenario=delay`) | 1280x800  | pass   | 73,987 bytes | `output/playwright/session-09/orders-loading-1280.png`       |
| `/orders` genuine mock-disabled HTTP 404       | 1280x800  | pass   | 31,286 bytes | `output/playwright/session-09/orders-mock-disabled-1280.png` |
| `/orders` table region keyboard focused        | 1280x800  | pass   | 82,546 bytes | `output/playwright/session-09/orders-focus-table.png`        |

- **Machine-readable test records**: `output/playwright/session-09/results.json` (3,708 bytes) updated with the real mock-disabled environment run observations.
- **Horizontal overflow check**:
  - 375x812: `scrollWidth = 360`, `clientWidth = 360` (no document overflow; table scrolls internally within named region).
  - 768x1024: `scrollWidth = 768`, `clientWidth = 768` (no document overflow).
  - 1280x800: `scrollWidth = 1265`, `clientWidth = 1265` (no document overflow).
  - 1920x1080: `scrollWidth = 1920`, `clientWidth = 1920` (no document overflow).
- **Keyboard navigation**:
  - Focus placed on `[role="region"][aria-label="Orders Data Table"]` with visible focus ring (`ring-2 ring-focus ring-offset-2`).
  - Native Space and Enter activation verified on "Retry loading orders" and "Refresh orders" action buttons.

---

## Recovery & Known Limitations

- **Decisions and tradeoffs**:
  - Solved the MSW v2 Node SSR conflict completely within `scope_files` by combining TypeScript type imports with dynamic `await import("msw/browser")` conditionally guarded by `typeof window !== "undefined"`. This avoided altering `next.config.ts` or resorting to unsupported internal node_modules paths.
  - Eliminated `undefined as unknown as T` for HTTP 204 responses by treating them strictly as `InvalidPayloadError`, matching the typed JSON contract expected by callers.
- **Pre-existing vs new failures**:
  - Full `pnpm format:check` fails solely on 2 pre-existing out-of-scope files (`docs/delivery.md` and `docs/handoffs/session-03.md`). All in-scope Session 09 files pass Prettier code style without issue.
- **Known issues & blockers**: None. All criteria pass and evidence is fully present.
- **Next concrete action**: Ready for Codex review. User will stage and commit after Codex acceptance.

Leave this report and all implementation files uncommitted. Do not stage, commit, or push.
