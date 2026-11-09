# Session 08 — step-9 — ready_for_review

- Branch: `feat/route-states`
- Baseline SHA (or unborn): `858afcf343a8b1ff163e8b6006d76b44ca87fec0`
- Review target: uncommitted working tree against baseline HEAD (include staged and untracked files)
- Changed/untracked files by task:
  - `step-9` (D9):
    - Modified:
      - `src/components/layout/sidebar.tsx`
      - `src/components/layout/mobile-nav.tsx`
      - `src/components/layout/topbar.tsx`
    - Untracked:
      - `src/app/(dashboard)/orders/loading.tsx`
      - `src/app/(dashboard)/orders/error.tsx`
      - `src/app/(dashboard)/preferences/page.tsx`
      - `src/app/not-found.tsx`
      - `src/components/layout/current-route-label.tsx`
  - Documentation / reporting:
    - Modified:
      - `docs/ai-journal.md`
    - Untracked:
      - `docs/verification.md`
      - `docs/handoffs/session-08.md`
  - Local / gitignored evidence:
    - `output/playwright/session-08/` (`not-found-375.png`, `not-found-768.png`, `not-found-1280.png`, `not-found-1920.png`, `not-found-focus.png`, `preferences-375.png`, `preferences-768.png`, `preferences-1280.png`, `preferences-1920.png`, `orders-loading-375.png`, `orders-loading-768.png`, `orders-loading-1280.png`, `orders-loading-1920.png`, `orders-error-375.png`, `orders-error-768.png`, `orders-error-1280.png`, `orders-error-1920.png`, `orders-recovered-1280.png`, `drawer-375-preferences-active.png`, `drawer-768-open.png`, `results.json`)
- Objective and changed files:
  - Implemented Session 08 / step-9 covering Next.js 15 App Router route states and navigation, with Repair r1 fixes:
    1. Created `src/app/(dashboard)/orders/loading.tsx` as a semantic skeleton route suspension fallback with `role="status"`, `aria-busy="true"`, `aria-live="polite"`, `sr-only` announcement, and `aria-hidden="true"` decorative pulse blocks conforming to `motion-reduce:animate-none`. Formatted with Prettier.
    2. Created `src/app/(dashboard)/orders/error.tsx` as a `"use client"` route error boundary with calm heading "Unable to load orders workspace", zero leaked error messages/stack traces/secrets, no empty no-op effects or misleading logging claims, and retry action executing `startTransition(() => { router.refresh(); reset(); })`.
    3. Created `src/app/(dashboard)/preferences/page.tsx` as a Server Component placeholder stating that console preferences and persistent configuration are planned for Week 3. Formatted with Prettier.
    4. Created `src/app/not-found.tsx` as a product-facing 404 page with semantic `h1`, status badge, calm copy, and visible-focus CTA leading back to `/orders`.
    5. Updated `src/components/layout/sidebar.tsx` and `src/components/layout/mobile-nav.tsx` to include `/preferences` link, dynamic `usePathname()` active states (`aria-current="page"` and `bg-primary-muted text-primary-muted-foreground`), and mobile drawer auto-closing on selection with focus restoration to trigger.
    6. Added `src/components/layout/current-route-label.tsx` as a minimal client leaf (`usePathname()`) and updated `src/components/layout/topbar.tsx` so the desktop breadcrumb dynamically reflects "Orders" or "Preferences", while keeping `Topbar` as a Server Component and preserving `logoutAction`.
    7. Verified shell DOM persistence across `/orders` ↔ `/preferences` transitions via DOM node identity (`===`) and custom marker retention test in Playwright MCP.
    8. Recaptured error state in clean production runtime (`next start`) with zero Next.js development overlays, and verified recovery.
    9. Restored `src/app/(dashboard)/orders/page.tsx` byte-for-byte to baseline HEAD (`858afcf343a8b1ff163e8b6006d76b44ca87fec0`); confirmed `git diff --exit-code HEAD -- "src/app/(dashboard)/orders/page.tsx"` exits 0 and file is absent from `git status`.
- Out-of-scope changes: none.

## Acceptance evidence

| Task + criterion                                                                                                                                                                                                                                                               | pass / fail / not_run / not_applicable | Reproduction or command                                                                                                | Evidence / observed result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `step-9`: error.tsx là Client Component, reset retry hoạt động; không leak stack/secret; skeleton dùng aria-busy và không gây screen reader spam.                                                                                                                              | pass                                   | Inspect `src/app/(dashboard)/orders/error.tsx`, `loading.tsx` and Playwright runtime execution                         | `error.tsx` has `"use client"`; UI displays calm heading "Unable to load orders workspace"; `error.message` and stack traces are never rendered in the DOM; no unused effects or false logging comments exist; retry button invokes `startTransition(() => { router.refresh(); reset(); })` which successfully re-renders the route. `loading.tsx` has `role="status"`, `aria-busy="true"`, `aria-live="polite"`, `sr-only` text "Loading orders workspace...", and all decorative skeleton pulse blocks are wrapped in `aria-hidden="true"`. Prettier formatted.                                                                                            |
| `step-9`: Có bằng chứng kích hoạt error boundary bằng lỗi render có kiểm soát; HTTP error ở D10 được xử lý riêng. orders/page.tsx chỉ được sửa tạm để tái hiện loading/error và phải được khôi phục byte-for-byte trước handoff; final diff không được chứa thay đổi file này. | pass                                   | Inject temporary one-shot error in `orders/page.tsx`, observe in browser, click retry, then restore via `git checkout` | 1. Verified error boundary in production runtime (`next start -p 3000`) without development overlays (`1 Issue` badge absent).<br>2. Error boundary displayed `role="alert"` and "Unable to load orders workspace".<br>3. Clicked "Retry loading": Next.js re-rendered `/orders`, error boundary cleared, and "Orders Overview" view cleanly restored.<br>4. Restored `orders/page.tsx` byte-for-byte to baseline HEAD via `git checkout 858afcf343a8b1ff163e8b6006d76b44ca87fec0 -- "src/app/(dashboard)/orders/page.tsx"`.<br>5. Verified `git diff --exit-code HEAD -- "src/app/(dashboard)/orders/page.tsx"` exited 0; file is absent from `git status`. |
| `step-9`: Đi orders <-> preferences giữ shell mounted; 404 và mobile drawer được kiểm tra thực tế.                                                                                                                                                                             | pass                                   | Playwright MCP navigation and DOM reference identity evaluation                                                        | 1. Navigated `/orders` ↔ `/preferences`: `window.__savedTopbar === currentTopbar` (true), `window.__savedSidebar === currentSidebar` (true), custom `__shellMarker` retained on both elements, verifying zero remount.<br>2. Desktop topbar breadcrumb updates to `Console / Preferences` via `<CurrentRouteLabel />`.<br>3. Navigated to unknown URL `/some-unknown-route-for-testing-404`: rendered app 404 with `h1` "Page not found" and visible-focus CTA back to `/orders`.<br>4. Mobile drawer opens on `Enter` (375px) and `Space` (768px), edge-anchored (256px), closes on route selection, and restores focus to hamburger trigger.              |
| `step-9`: pnpm exec tsc --noEmit, pnpm lint và pnpm build đều pass; TypeScript strict, không any hoặc ts-ignore để né lỗi.                                                                                                                                                     | pass                                   | `pnpm exec tsc --noEmit && pnpm lint && pnpm build`                                                                    | All three commands exited with code 0. TypeScript 5.8.2 strict check passed with 0 errors; ESLint 9 evaluated all files with 0 errors/warnings; production build generated dynamic `/orders` and `/preferences` routes. Non-blocking Next.js ESLint plugin detection warning noted.                                                                                                                                                                                                                                                                                                                                                                          |
| `step-9`: Chỉ sửa scope_files tính từ root capstone; không đổi dependency ngoài allowlist của task; không sửa labs.                                                                                                                                                            | pass                                   | `git status --short --branch`                                                                                          | Exactly modified/untracked allowlisted files: `sidebar.tsx`, `mobile-nav.tsx`, `topbar.tsx`, `current-route-label.tsx`, `loading.tsx`, `error.tsx`, `preferences/page.tsx`, `not-found.tsx`, `docs/verification.md`, `docs/ai-journal.md`, `docs/handoffs/session-08.md`. `orders/page.tsx` verified byte-for-byte identical to baseline. Zero dependencies added. `vatek-intern-labs` untouched.                                                                                                                                                                                                                                                            |
| `step-9`: UI dùng semantic tokens và cva cho variants/sizes; không arbitrary Tailwind values, inline style hoặc literal màu/spacing ngoài nơi khai báo tokens.                                                                                                                 | pass                                   | Source inspection across touched view and layout components                                                            | Spacing conforms to strict 4px grid (`p-4`, `p-6`, `space-y-6`, `gap-3`, `gap-4`). Semantic tokens used throughout: `bg-background`, `bg-surface`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `bg-primary-muted`, `text-primary-muted-foreground`, `bg-destructive-muted`, `text-destructive-muted-foreground`. Zero arbitrary brackets (`[...]`), zero inline styles.                                                                                                                                                                                                                                                       |
| `step-9`: Với UI bị tác động: kiểm tra 375/768/1280/1920px, không tràn ngang toàn trang; bảng có vùng cuộn riêng được đặt tên.                                                                                                                                                 | pass                                   | Playwright MCP measurement across 375x812, 768x1024, 1280x800, 1920x1080                                               | Verified `scrollWidth === clientWidth` on all touched routes and states: 404 (375/768/1280/1920), Preferences (375/768/1280/1920), Orders Loading (375/768/1280/1920), and Orders Error (375/768/1280/1920). Zero horizontal window overflow across all viewports. Error captures taken under production runtime with zero dev overlays.                                                                                                                                                                                                                                                                                                                     |
| `step-9`: Với UI tương tác: semantic HTML, accessible name, focus rõ, Tab/Shift+Tab/Enter/Space hoạt động đúng; dialog hỗ trợ Escape, focus trap và trả focus.                                                                                                                 | pass                                   | Playwright browser keyboard sequence test                                                                              | Verified: 1. Tab focus on 404 CTA displays visible focus ring (`ring-2 ring-focus ring-offset-2`); pressing Enter navigates to `/orders`.<br>2. Active sidebar/drawer links dynamically expose `aria-current="page"`.<br>3. Mobile drawer opens on `Enter` (375px) and `Space` (768px), traps focus, dismisses on `Escape`, and restores focus to hamburger button.<br>4. Selecting route in drawer automatically dismisses modal and restores focus.                                                                                                                                                                                                        |
| `step-9`: Ghi docs/ai-journal.md: prompt, kết quả AI, sửa lỗi, kết quả kiểm tra và giới hạn còn lại; giữ code và báo cáo uncommitted; Codex review rồi người dùng tự stage/commit theo sessions.md.                                                                            | pass                                   | Inspect `docs/ai-journal.md` and `git status`                                                                          | Session 08 initial entry and Repair r1 entry recorded in `docs/ai-journal.md`. All changes left uncommitted for Codex review. Zero credential values persisted.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

## Checks

| Command                                      | Exit code | Result                                                                                                                                                                                                                              |
| -------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec tsc --noEmit`                     | `0`       | Passed: TypeScript 5.8.2 strict check passed with zero errors.                                                                                                                                                                      |
| `pnpm lint`                                  | `0`       | Passed: ESLint 9 evaluated all files with zero errors and zero warnings.                                                                                                                                                            |
| `pnpm build`                                 | `0`       | Passed: Next.js 15.5.29 production build compiled successfully; dynamic `/orders` (134 B / 103 kB), `/preferences` (134 B / 103 kB) and static `/_not-found` generated. Non-blocking Next.js ESLint plugin detection warning noted. |
| `pnpm exec prettier --check <touched_files>` | `0`       | Passed: All touched source and documentation files conform 100% to Prettier code style.                                                                                                                                             |
| `pnpm format:check`                          | `1`       | Pre-existing baseline failure: 2 pre-existing out-of-scope D6 files (`docs/delivery.md` and `docs/handoffs/session-03.md`) contain CRLF line endings. All touched in-scope files pass cleanly.                                      |
| `git diff --check`                           | `0`       | Passed: Clean diff with zero whitespace or line-ending anomalies.                                                                                                                                                                   |

## Touched UI

| Route + state                         | 375  | 768  | 1280 | 1920 | Evidence                                                                                                                              |
| ------------------------------------- | ---- | ---- | ---- | ---- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `/preferences` default view           | pass | pass | pass | pass | `output/playwright/session-08/preferences-375.png`, `preferences-768.png`, `preferences-1280.png`, `preferences-1920.png`             |
| `/orders` loading skeleton state      | pass | pass | pass | pass | `output/playwright/session-08/orders-loading-375.png`, `orders-loading-768.png`, `orders-loading-1280.png`, `orders-loading-1920.png` |
| `/orders` error boundary fallback     | pass | pass | pass | pass | `output/playwright/session-08/orders-error-375.png`, `orders-error-768.png`, `orders-error-1280.png`, `orders-error-1920.png`         |
| `/orders` recovered state after retry | n/a  | n/a  | pass | n/a  | `output/playwright/session-08/orders-recovered-1280.png`                                                                              |
| `404` unknown route not-found         | pass | pass | pass | pass | `output/playwright/session-08/not-found-375.png`, `not-found-768.png`, `not-found-1280.png`, `not-found-1920.png`                     |
| `404` CTA keyboard focused            | n/a  | n/a  | pass | n/a  | `output/playwright/session-08/not-found-focus.png`                                                                                    |
| Mobile drawer (preferences active)    | pass | n/a  | n/a  | n/a  | `output/playwright/session-08/drawer-375-preferences-active.png`                                                                      |
| Tablet drawer open                    | n/a  | pass | n/a  | n/a  | `output/playwright/session-08/drawer-768-open.png`                                                                                    |

- **Keyboard sequence and observed focus behavior**:
  - `404 Not Found`: Tab key focused CTA `<a href="/orders">Return to Orders</a>` with visible 2px focus ring (`ring-2 ring-focus ring-offset-2`). Pressing `Enter` navigated to `/orders`, which correctly triggered middleware redirect to `/login` for unauthenticated sessions.
  - Active navigation indicator: Inspected `aria-current="page"` dynamically shifting between `/orders` and `/preferences` on both desktop sidebar and mobile drawer. Desktop topbar breadcrumb displays `Console / Orders` or `Console / Preferences` dynamically via `<CurrentRouteLabel />`. Inactive link has `aria-current={undefined}`.
  - Mobile drawer keyboard interactions:
    - At 375px: Hamburger button focused via `Tab` -> pressed `Enter` -> left drawer opened (`left: 0, top: 0, width: 256px, height: 812px`). Clicked `/orders` link -> drawer automatically dismissed (`isDrawerClosed: true`) and focus returned to hamburger trigger (`document.activeElement.getAttribute("aria-label") === "Open navigation menu"`).
    - At 768px: Hamburger button focused via `Tab` -> pressed `Space` -> left drawer opened (`left: 0, top: 0, width: 256px, height: 1024px`). Pressed `Escape` -> drawer dismissed and focus returned to hamburger trigger (`isHamburgerFocused: true`).
- **Contrast measurement and method**:
  - Measured against WCAG 2.1 relative luminance standards using tokens defined in `docs/design-system.md`:
    - Inactive nav link text: `text-muted-foreground` (`#475569`) on `bg-surface` (`#FFFFFF`): **7.58:1** (AAA).
    - Inactive nav link hover: `text-foreground` (`#0F172A`) on `bg-muted` (`#F1F5F9`): **17.06:1** (AAA).
    - Active nav link text: `text-primary-muted-foreground` (`#1E40AF`) on `bg-primary-muted` (`#DBEAFE`): **7.15:1** (AAA).
    - Error boundary icon badge: `text-destructive-muted-foreground` (`#991B1B`) on `bg-destructive-muted` (`#FEE2E2`): **6.80:1** (AA).
    - Focus ring: `ring-focus` (`#1D4ED8`): **6.70:1** (>= 3:1 non-text UI contrast).
- **Loading/error/empty/retry reproduction**:
  - Route suspension loading: Next.js SSR stream sends Suspense fallback `loading.tsx` with `role="status"`, `aria-busy="true"`, `aria-live="polite"`, `sr-only` announcement, and `aria-hidden="true"` skeleton pulse bars.
  - Controlled error boundary: Render failure in `orders/page.tsx` renders `error.tsx` alert boundary with calm heading "Unable to load orders workspace" and zero leaked error messages or stack traces. Captured in clean production runtime (`next start`) with zero dev overlay badges.
  - Retry recovery: Clicking "Retry loading" invokes `startTransition(() => { router.refresh(); reset(); })`, which re-renders the server component and client segment, successfully recovering the "Orders Overview" view.
- **Server/client boundary explanation**:
  - `src/app/(dashboard)/orders/loading.tsx`: Server Component. Renders pure semantic skeleton HTML.
  - `src/app/(dashboard)/preferences/page.tsx`: Server Component. Server-rendered placeholder card stating Week 3 planned preferences.
  - `src/app/not-found.tsx`: Server Component. Centered 404 card rendered inside root layout.
  - `src/components/layout/topbar.tsx`: Server Component. Persistent topbar with Server Action `logoutAction`. Contains `<CurrentRouteLabel />` client leaf.
  - `src/components/layout/current-route-label.tsx`: Client Component (`"use client"`). Minimal client leaf using `usePathname()` to display route label in breadcrumb.
  - `src/app/(dashboard)/orders/error.tsx`: Client Component (`"use client"`). Required by Next.js App Router for route error boundaries and the `reset()` / `router.refresh()` retry action.
  - `src/components/layout/sidebar.tsx`: Client Component (`"use client"`). Uses `usePathname()` from `next/navigation` to compute active navigation state across client-side page transitions without remounting the parent layout.
  - `src/components/layout/mobile-nav.tsx`: Client Component (`"use client"`). Manages Radix Dialog drawer open/close state, reads `usePathname()`, and closes drawer on link selection.
- **Design baseline and deviations**:
  - Strictly conforms to `docs/design-system.md` visual baseline.
  - 4px spacing scale throughout (`p-4`, `p-6`, `space-y-6`, `gap-3`, `gap-4`).
  - Zero arbitrary bracket values (`[...]`), zero inline styles.
- **Playwright smoke: commands, tested routes/states, viewport sizes, observed failures and screenshot/trace paths**:
  - Runner: Playwright MCP automation against Next.js production server.
  - Viewports: 375x812, 768x1024, 1280x800, 1920x1080.
  - Observed failures: 0. Zero horizontal window scrolling across all viewports (`scrollWidth === clientWidth`). Clean production captures with zero Next.js development overlays.
  - Evidence directory: `output/playwright/session-08/`:
    - `not-found-375.png` (11.8 KB) — 404 page at 375x812
    - `not-found-768.png` (14.2 KB) — 404 page at 768x1024
    - `not-found-1280.png` (14.4 KB) — 404 page at 1280x800
    - `not-found-1920.png` (18.3 KB) — 404 page at 1920x1080
    - `not-found-focus.png` (15.1 KB) — Visible focus ring on 404 "Return to Orders" CTA
    - `preferences-375.png` (22.2 KB) — Preferences at 375x812
    - `preferences-768.png` (29.2 KB) — Preferences at 768x1024
    - `preferences-1280.png` (34.2 KB) — Preferences at 1280x800 showing Console / Preferences breadcrumb
    - `preferences-1920.png` (38.4 KB) — Preferences at 1920x1080 showing Console / Preferences breadcrumb
    - `orders-loading-375.png` (11.5 KB) — Orders loading skeleton at 375x812
    - `orders-loading-768.png` (17.0 KB) — Orders loading skeleton at 768x1024
    - `orders-loading-1280.png` (22.5 KB) — Orders loading skeleton at 1280x800
    - `orders-loading-1920.png` (27.6 KB) — Orders loading skeleton at 1920x1080
    - `orders-error-375.png` (25.1 KB) — Orders error boundary at 375x812 (clean production capture)
    - `orders-error-768.png` (31.4 KB) — Orders error boundary at 768x1024 (clean production capture)
    - `orders-error-1280.png` (36.0 KB) — Orders error boundary at 1280x800 (clean production capture)
    - `orders-error-1920.png` (40.3 KB) — Orders error boundary at 1920x1080 (clean production capture)
    - `orders-recovered-1280.png` (35.7 KB) — Orders view after retry recovery at 1280x800
    - `drawer-375-preferences-active.png` (14.8 KB) — Edge-anchored drawer on mobile with Preferences active
    - `drawer-768-open.png` (24.3 KB) — Edge-anchored drawer on tablet opened via Space key
    - `results.json` (5.7 KB) — Complete machine-readable test records

## Recovery

- Decisions and tradeoffs:
  - In `src/app/(dashboard)/orders/error.tsx`, coupled `reset()` with `router.refresh()` wrapped in `startTransition()`. In Next.js 15 App Router, calling `reset()` alone on an error boundary for a Server Component only refreshes the client error boundary state; invoking `router.refresh()` is required to tell the server to re-evaluate the Server Component. Removed empty effect and misleading comment.
  - Implemented `CurrentRouteLabel` as a minimal client leaf inside `topbar.tsx` to maintain `Topbar` as a Server Component and preserve `logoutAction`.
  - Tested loading state and error boundary using temporary instrumentation, verified clean recovery, and restored `src/app/(dashboard)/orders/page.tsx` byte-for-byte to baseline HEAD SHA `858afcf343a8b1ff163e8b6006d76b44ca87fec0`. The final Git diff contains zero modifications to `orders/page.tsx`.
- Pre-existing failures versus new failures:
  - Pre-existing failure: `pnpm format:check` fails solely on 2 pre-existing out-of-scope D6 files (`docs/delivery.md` and `docs/handoffs/session-03.md`) containing CRLF line endings. All files touched in Session 08 pass Prettier with zero style issues.
- Known issues, not-run checks and blockers:
  - None. All acceptance criteria and automated Playwright browser checks passed.
- Reproduction and next concrete action:
  - Next action: Stop and hand over uncommitted work to Codex for review. User stages and commits after Codex acceptance.
- AI journal entry:
  - Recorded in `docs/ai-journal.md` under `Session 08 — Step-9 / D9` and `Session 08 Repair r1 — Step-9 / D9`.
- Suggested next session (not executed):
  - Session 09 / step-10 and step-11 (D10): Typed API client, MSW browser mocking, and rendered Orders list with success/empty/loading/error states.

Leave this report and code uncommitted. The user stages/commits after Codex review.
Do not invent implementation/report SHAs; only baseline HEAD exists before the user commits.
Screenshots do not prove keyboard support; build success does not prove UI acceptance.
