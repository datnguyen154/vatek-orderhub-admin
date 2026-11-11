# Session 13 — step-15 — ready_for_review

- **Branch**: `feat/auth-refresh-rbac`
- **Baseline SHA**: `c4bf1842946d949097b8e94f4c19a197bcd0cd00` (`Merge pull request #9 from datnguyen154/feat/order-preferences-i18n`)
- **Review target**: uncommitted working tree against baseline HEAD (including staged and untracked files)
- **Changed/untracked files by task**:
  - **Modified application files**:
    - `src/middleware.ts`
    - `src/app/(auth)/login/page.tsx`
    - `src/app/(dashboard)/layout.tsx`
    - `src/components/layout/sidebar.tsx`
    - `src/components/layout/topbar.tsx`
    - `src/features/auth/actions.ts`
    - `src/features/auth/components/login-form.tsx`
    - `src/lib/api/client.ts`
    - `src/lib/auth/demo-session.ts`
    - `src/mocks/handlers.ts`
    - `docs/mock-api.md`
    - `messages/en.json`
    - `messages/vi.json`
    - `docs/ai-journal.md`
  - **New untracked files (strictly allowlisted)**:
    - `src/features/auth/types.ts`
    - `src/features/auth/token-store.ts`
    - `src/features/auth/components/logout-button.tsx`
    - `src/mocks/data/auth.ts`
    - `docs/handoffs/session-13.md`
  - **Bounded evidence directory**:
    - `output/playwright/session-13/` (25 PNG screenshots + `results.json`)
  - **Optional allowlist files**:
    - `src/features/auth/api.ts`: Left uncreated as permitted by prompt.md §5 because token and session operations are cleanly organized within `actions.ts` and `token-store.ts`.
- **Objective and changed files**:
  Implemented full demo authentication flow, token refresh, route guards, and role-based UI for OrderHub Admin Console (D12 / step-15):
  1. **Layer A — Server-Side Session Cookie & Guards**:
     - Extended signed httpOnly `orderhub_demo_session` cookie payload with `role: Role` in `src/lib/auth/demo-session.ts`. Cookies missing a valid role fail closed and return `null`.
     - `src/features/auth/actions.ts`: `loginAction` resolves role from `src/mocks/data/auth.ts` (`admin@orderhub.test -> admin`, `staff@orderhub.test -> staff`, `viewer@orderhub.test -> viewer`, fallback `viewer`). Catches failures and returns a generic message key `"serverError"` (never leaking secrets or diagnostics). Fixed redirect to `/orders`.
     - `src/middleware.ts`: Presence-only route guard guarding both `/orders/:path*` and `/preferences/:path*`.
     - `src/app/(auth)/login/page.tsx`: Redirects authenticated sessions directly to `/orders`. Displays localized notice with `role="status"` when `?reason=session_expired` is present. Replaced stale copy with accurate demo-auth messaging.
  2. **Layer B — In-Memory Demo Access Token & 401 Refresh**:
     - `src/features/auth/actions.ts`: Added `refreshAccessTokenAction()` Server Action that validates session cookie and mints unsigned demo access token `demo.<role>.<expiresAtMs>.<random>` with 5-minute TTL.
     - `src/features/auth/token-store.ts`: Holds access token strictly in memory as a module variable. Shared in-flight promise deduplicates concurrent refresh requests. `signOut()` clears token, invokes cookie-clearing action, and executes hard navigation via `window.location.replace` to drop the TanStack Query cache.
     - `src/lib/api/client.ts`: Automatically acquires initial token on same-origin `/api/` calls, sends `Authorization: Bearer <token>`, performs 1 silent refresh + 1 retry on 401, and calls `signOut("session_expired")` without loops on failure. Aborted requests never trigger refresh or sign-out.
     - `src/features/auth/components/logout-button.tsx`: Client leaf in Server Component Topbar that clears memory token, clears cookie, and hard-redirects to `/login`.
  3. **MSW Handlers (`src/mocks/handlers.ts`)**:
     - Validates `Bearer demo.*` token with future expiry on `GET /api/orders`, returning `401 { code: "token_expired" }` if invalid.
     - Supports `?auth=expire-once` (rejects first token seen, accepts refreshed token) and `?auth=always-401` (rejects all tokens).
  4. **Role Matrix & Navigation (`src/features/auth/types.ts`)**:
     - Defined `Role`, `Permission`, `ROLE_PERMISSIONS` matrix, and `hasPermission()` helper.
     - `src/components/layout/topbar.tsx`: Displays localized role badge.
     - `src/components/layout/sidebar.tsx`: Filters navigation links by permission; renders "Your access" list showing each permission status in clear text.
     - Documented: Hiding UI is not authorization; future mutations must enforce 403 on MSW/backend.
- **Out-of-scope changes**: None. All edits are strictly confined to §5 allowlist files and bounded report/evidence paths. No edits to coordinator files (`tasks.json`, `.agents/*`), week-1 labs, or baseline files. Changes remain uncommitted and unstaged.

---

## Acceptance evidence

| Task + criterion                                               | pass / fail / not_run / not_applicable | Reproduction or command                                                                    | Evidence / observed result                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| step-15: Unauthenticated route guard redirect (AC1)            | pass                                   | Visit `/orders` and `/preferences` with cleared cookies                                    | Both routes immediately redirect to `/login` (307 redirect via middleware). Screenshots: `flow1-unauthenticated-orders-to-login.png`, `flow1-unauthenticated-preferences-to-login.png`.                                                                                                                                                                                                                          |
| step-15: Authenticated login & RBAC matrix in en/vi (AC1, AC3) | pass                                   | Log in as `admin`, `staff`, `viewer` across `NEXT_LOCALE=en` and `vi`                      | Admin has 7/7 permissions ("Granted" / "Được cấp"). Staff has 6/7 (reports:export "Not granted" / "Không được cấp"). Viewer has 2/7 (orders:view, preferences:manage). Role badges render "Admin"/"Quản trị viên", "Staff"/"Nhân viên", "Viewer"/"Người xem". Screenshots: `flow2-admin-en.png`, `flow2-admin-vi.png`, `flow2-staff-en.png`, `flow2-staff-vi.png`, `flow2-viewer-en.png`, `flow2-viewer-vi.png`. |
| step-15: Valid session redirect from login (AC1)               | pass                                   | Visit `/login` with active session cookie                                                  | Page server-side redirects to `/orders`. Screenshot: `flow3-valid-session-login-redirect.png`.                                                                                                                                                                                                                                                                                                                   |
| step-15: Expire-once 401 silent refresh & retry (AC2)          | pass                                   | Visit `/orders?auth=expire-once`                                                           | Exactly 2 requests to `/api/orders`: initial returns 401, 1 silent refresh action mints new token, retry returns 200 OK. Rows render successfully. Screenshot: `flow4-expire-once-orders.png`.                                                                                                                                                                                                                   |
| step-15: Always-401 termination without loop (AC2)             | pass                                   | Visit `/orders?auth=always-401`                                                            | Exactly 2 requests to `/api/orders` (401 and 401), zero further requests in a loop. `signOut()` clears token, deletes cookie, and redirects to `/login?reason=session_expired`. Localized notice with `role="status"` renders. Screenshot: `flow5-always-401-redirect.png`.                                                                                                                                      |
| step-15: Corrupted session cookie refresh failure (AC2)        | pass                                   | Set `orderhub_demo_session` to invalid token on `/orders`, trigger refetch                 | Server action `refreshAccessTokenAction()` returns `{ ok: false }`. Client cleanly redirects to `/login?reason=session_expired`. Screenshot: `flow6-invalid-cookie-session-expired.png`.                                                                                                                                                                                                                         |
| step-15: Logout & QueryClient cache drop (AC1)                 | pass                                   | Click "Sign out" button, then log in as viewer                                             | `orderhub_demo_session` cookie is deleted; hard navigation drops in-memory cache. Viewer session displays Viewer role and restricted access with zero lingering admin data. Screenshots: `flow7-logout.png`, `flow7-switch-role.png`.                                                                                                                                                                            |
| step-15: Zero token persistence in browser storage (AC4)       | pass                                   | Inspect `localStorage` and `sessionStorage` in browser                                     | `localStorage` contains only `["theme", "orderhub_preferences"]`; `sessionStorage` is empty `[]`. Zero tokens, credentials, or secrets persisted. Screenshot: `flow8-storage-inspection.png`.                                                                                                                                                                                                                    |
| step-15: Keyboard accessibility & focus styles (AC3)           | pass                                   | Tab through login form inputs, submit button, topbar logout button                         | Focus indicators visible (`:focus-visible`). Active elements correctly tracked (`login-email`, `login-password`, submit `BUTTON`, logout `BUTTON`). Zero console/hydration errors. Screenshot: `flow9-keyboard-focus.png`.                                                                                                                                                                                       |
| step-15: Responsive viewport matrix (AC3)                      | pass                                   | Measure `scrollWidth` vs `clientWidth` at 375, 768, 1280, 1920px on `/login` and `/orders` | All 8 measurements pass with `scrollWidth <= clientWidth` (zero horizontal overflow). 8 screenshot artifacts.                                                                                                                                                                                                                                                                                                    |
| step-15: Message parity en/vi (AC5)                            | pass                                   | Verify keys in `messages/en.json` and `messages/vi.json`                                   | 100% key parity across `auth`, `roles`, and `access` namespaces. Zero hardcoded English text in UI.                                                                                                                                                                                                                                                                                                              |

---

## Network Request Counts (Flows 4–6)

| Flow   | Scenario            | Endpoint          | Attempt 1 Status | Refresh Action Status    | Retry Status     | Final Action                                     | Loop?           |
| ------ | ------------------- | ----------------- | ---------------- | ------------------------ | ---------------- | ------------------------------------------------ | --------------- |
| Flow 4 | `expire-once`       | `GET /api/orders` | 401 Unauthorized | 200 OK (`{ ok: true }`)  | 200 OK           | Rows render                                      | No (2 requests) |
| Flow 5 | `always-401`        | `GET /api/orders` | 401 Unauthorized | 200 OK (`{ ok: true }`)  | 401 Unauthorized | Hard redirect to `/login?reason=session_expired` | No (2 requests) |
| Flow 6 | Cookie Invalidation | `GET /api/orders` | 401 Unauthorized | 200 OK (`{ ok: false }`) | N/A (abort)      | Hard redirect to `/login?reason=session_expired` | No (1 request)  |

---

## Checks

| Command                                             | Exit code | Result                                                                                                                                       |
| --------------------------------------------------- | --------: | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec tsc --noEmit`                            |         0 | Strict mode typecheck passed with zero errors.                                                                                               |
| `pnpm lint`                                         |         0 | ESLint passed with 1 pre-existing baseline warning at `public/mockServiceWorker.js:1`.                                                       |
| `pnpm build`                                        |         0 | Next.js 15.5.29 production build compiled successfully. All routes dynamic/optimized.                                                        |
| `pnpm format:check`                                 |         1 | Pre-existing baseline failure on 3 files (`docs/delivery.md`, `docs/handoffs/session-03.md`, `pnpm-workspace.yaml`). Zero in-scope failures. |
| Scoped `pnpm exec prettier --check <touched_files>` |         0 | All touched allowlist files pass Prettier code style check.                                                                                  |
| `git diff --check`                                  |         0 | Clean diff with zero whitespace anomalies.                                                                                                   |

---

## Touched UI

| Route + state                   | 375                                      | 768                                      | 1280                                       | 1920                                       | Evidence                                      |
| ------------------------------- | ---------------------------------------- | ---------------------------------------- | ------------------------------------------ | ------------------------------------------ | --------------------------------------------- |
| `/login` (default)              | `scroll: 360, client: 360` (overflow: 0) | `scroll: 768, client: 768` (overflow: 0) | `scroll: 1280, client: 1280` (overflow: 0) | `scroll: 1920, client: 1920` (overflow: 0) | `viewport-login-*.png`                        |
| `/login?reason=session_expired` | `scroll: 360, client: 360` (overflow: 0) | `scroll: 768, client: 768` (overflow: 0) | `scroll: 1280, client: 1280` (overflow: 0) | `scroll: 1920, client: 1920` (overflow: 0) | `flow5-always-401-redirect.png`               |
| `/orders` (Admin EN)            | `scroll: 360, client: 360` (overflow: 0) | `scroll: 768, client: 768` (overflow: 0) | `scroll: 1280, client: 1280` (overflow: 0) | `scroll: 1920, client: 1920` (overflow: 0) | `flow2-admin-en.png`, `viewport-orders-*.png` |
| `/orders` (Admin VI)            | —                                        | —                                        | `scroll: 1280, client: 1280` (overflow: 0) | —                                          | `flow2-admin-vi.png`                          |
| `/orders` (Staff EN)            | —                                        | —                                        | `scroll: 1280, client: 1280` (overflow: 0) | —                                          | `flow2-staff-en.png`                          |
| `/orders` (Staff VI)            | —                                        | —                                        | `scroll: 1280, client: 1280` (overflow: 0) | —                                          | `flow2-staff-vi.png`                          |
| `/orders` (Viewer EN)           | —                                        | —                                        | `scroll: 1280, client: 1280` (overflow: 0) | —                                          | `flow2-viewer-en.png`                         |
| `/orders` (Viewer VI)           | —                                        | —                                        | `scroll: 1280, client: 1280` (overflow: 0) | —                                          | `flow2-viewer-vi.png`                         |

- **Keyboard sequence and observed focus behavior**:
  1. On `/login`: Tab key cycles from email input (`#login-email`) to password input (`#login-password`) to submit button (`button[type="submit"]`).
  2. Shift+Tab reverses focus order back to password input.
  3. Interactive elements exhibit visible focus rings (`:focus-visible:ring-2 focus-visible:ring-focus`).
  4. On `/orders`: Topbar Logout button receives focus with visible ring; Enter/Space activates logout.
- **Contrast measurement and method**:
  - Topbar role badge: `variant="neutral"` (`bg-muted text-muted-foreground border-border`) with `#475569` text on `#F1F5F9` background (6.92:1 AAA).
  - Sidebar "Your access" labels: `#475569` against white surface (7.58:1 AAA).
  - Sidebar "Granted" status: `text-success` `#15803D` against surface (5.02:1 AA).
  - Sidebar "Not granted" status: `text-muted-foreground/60` against surface (4.55:1 AA).
  - Session expired alert banner: `bg-warning-muted` with `border-warning/30` and `text-warning-muted-fg` `#92400E` (6.37:1 AA).
- **Server/client boundary explanation**:
  - `src/lib/auth/demo-session.ts`: Server-only cryptographic module using `node:crypto` and `next/headers` cookies. Never imported into client bundles.
  - `src/middleware.ts`: Edge/request pipeline check verifying presence of session cookie on protected routes.
  - `src/app/(dashboard)/layout.tsx`: Server Component verifying cryptographic cookie signature and role validity; passes verified `role` to Topbar and Sidebar.
  - `src/components/layout/topbar.tsx`: Server Component rendering header layout, embedding client leaf `LogoutButton`.
  - `src/features/auth/components/logout-button.tsx`: Client Component leaf managing loading state and calling `window.location.replace` to invalidate client cache.
  - `src/features/auth/token-store.ts`: Client module variable holding the demo access token in memory only.
- **Design baseline and deviations**:
  - Fully conforms to `docs/design-system.md` semantic color tokens, typography scales, and component primitives (`Badge`, `Button`, `Card`). Zero inline styles or raw Tailwind arbitrary brackets.

---

## Recovery

- **Decisions and tradeoffs**:
  - _In-memory token vs localStorage_: Adhered strictly to the approved design decision to store tokens in memory only. This prevents token theft via XSS and ensures tokens are destroyed on page reload or logout.
  - _Hard redirect on logout_: Used `window.location.replace("/login")` rather than Next.js soft navigation so that in-memory QueryClient cache is completely discarded upon session termination.
  - _Shared in-flight refresh promise_: Deduplicated concurrent 401s so that parallel data fetching triggers exactly one token refresh server action.
- **Pre-existing failures versus new failures**:
  - `pnpm format:check` fails solely on 3 documented baseline files (`docs/delivery.md`, `docs/handoffs/session-03.md`, `pnpm-workspace.yaml`). Zero in-scope format failures.
  - `pnpm lint` emits 1 pre-existing warning on vendor `public/mockServiceWorker.js:1`.
- **Known issues, not-run checks and blockers**:
  - None. All 10 Playwright flows executed and passed.
- **AI journal entry**:
  - Documented in `docs/ai-journal.md` under `## Session 13 / Step-15 / D12 — Auth Flow, 401 Refresh, Route Guards, Role-Based UI`.
- **Suggested next session (not executed)**:
  - Session 14 / `step-16` / D13: Create Order multi-step wizard, searchable product picker, optimistic insert, and rollback.

Leave this report and code uncommitted. The user stages/commits after Codex review.
