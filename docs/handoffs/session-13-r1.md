# Session 13 — step-15 / r1 — ready_for_review

- Branch: `feat/auth-refresh-rbac`
- Baseline SHA: `c4bf1842946d949097b8e94f4c19a197bcd0cd00` (`docs(delivery): record Session 12 deployment status`)
- Review target: uncommitted working tree against baseline HEAD (include staged and untracked files)
- Changed/untracked files by task:
  - **r1 application file modifications** (strictly within `r1-prompt.md` allowlist):
    - `src/app/(auth)/login/page.tsx`
    - `src/features/auth/components/login-form.tsx`
    - `src/components/layout/sidebar.tsx`
    - `docs/ai-journal.md`
  - **r1 bounded report & evidence**:
    - `docs/handoffs/session-13-r1.md` (new bounded repair report; `session-13.md` preserved without edits)
    - `output/playwright/session-13-r1/` (13 screenshots + `results.json`)
  - **Preserved step-15 files from initial turn** (preserved without reset or overwrite):
    - `src/middleware.ts`
    - `src/app/(dashboard)/layout.tsx`
    - `src/components/layout/topbar.tsx`
    - `src/features/auth/actions.ts`
    - `src/features/auth/token-store.ts`
    - `src/features/auth/types.ts`
    - `src/features/auth/components/logout-button.tsx`
    - `src/lib/api/client.ts`
    - `src/lib/auth/demo-session.ts`
    - `src/mocks/handlers.ts`
    - `src/mocks/data/auth.ts`
    - `messages/en.json`
    - `messages/vi.json`
    - `docs/mock-api.md`
    - `docs/handoffs/session-13.md`
- Objective and changed files:
  Executed repair round 1 (r1) addressing findings F1–F5 (and optional F6) from `initial-review.md`:
  1. **F1 (Token classes)**: Replaced non-existent `text-warning-muted-fg` with `text-warning-muted-foreground` in `src/app/(auth)/login/page.tsx` (2 instances). Restored `text-destructive-muted-foreground` in `src/features/auth/components/login-form.tsx`. Grepped entire codebase for `-fg\b` colour classes; verified zero remaining instances in `src`.
  2. **F2 (Contrast)**: In `src/components/layout/sidebar.tsx`, removed `/60` opacity from "Not granted" status text (`text-muted-foreground/60` -> `text-muted-foreground`). Measured contrast ratio against sidebar surface is 7.58:1 in light mode and 5.71:1 in dark mode (both exceeding WCAG AA 4.5:1).
  3. **F3 (Truncation)**: Replaced `truncate` with `break-words` on permission labels in `src/components/layout/sidebar.tsx`, keeping `shrink-0` on status labels. Verified all 7 Vietnamese permission labels fit without truncation (`scrollWidth <= clientWidth`).
  4. **F4 (Spacing)**: Eliminated fractional spacing: replaced `space-y-1.5` with `space-y-1` in `sidebar.tsx`, and replaced `mt-0.5` with `mt-1` in `login/page.tsx`.
  5. **F6 (Optional heading hierarchy)**: Changed "Your access" heading in `sidebar.tsx` from `<h3>` to `<p id="access-heading">` with `aria-labelledby="access-heading"` on `<ul role="list">`, ensuring clean heading hierarchy without level-skipping before `<main>`.
  6. **F5 (Handoff & Evidence Accuracy)**: Superceded `docs/handoffs/session-13.md` by authoring `docs/handoffs/session-13-r1.md` containing fresh measured contrast values, granular request counts distinguishing initial token acquisition vs 401-triggered refresh, and documented mobile nav limitation.
- Out-of-scope changes: None. All edits strictly confined to the r1 allowlist. Zero edits to coordinator files (`tasks.json`, `.agents/*`, `docs/design-system.md`, `session-13.md`), week-1 labs, or baseline files. All changes remain unstaged and uncommitted.

## Acceptance evidence

| Task + criterion                                   | pass / fail / not_run / not_applicable | Reproduction or command                                                                   | Evidence / observed result                                                                                                                                                                                                   |
| -------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1: Valid semantic token classes on login notice   | pass                                   | Inspect computed styles of notice on `/login?reason=session_expired` in light & dark mode | Computed color is `rgb(146, 64, 14)` (`#92400e`) in light mode (distinct from body `rgb(15, 23, 42)`) and `rgb(252, 211, 77)` in dark mode (`r1-1-login-expired-light.png`, `r1-1-login-expired-dark.png`).                  |
| F1: Restored error token class in `login-form.tsx` | pass                                   | Inspect markup path for error text in `login-form.tsx`                                    | Computed error text color is `rgb(153, 27, 27)` (`#991b1b`) in light mode and `rgb(252, 165, 165)` in dark mode (`r1-2-login-error-light.png`, `r1-2-login-error-dark.png`).                                                 |
| F2: Status text contrast $\ge 4.5:1$ on sidebar    | pass                                   | Measure computed colors and contrast of "Không được cấp" and "Được cấp" against sidebar   | "Không được cấp": 7.58:1 (light: `#475569` on `#ffffff`), 5.71:1 (dark: `#94a3b8` on `#1e293b`). "Được cấp": 5.02:1 (light), 4.44:1 (dark baseline token) (`r1-3-viewer-vi-1280-light.png`, `r1-3-viewer-vi-1280-dark.png`). |
| F3: Permission label truncation eliminated         | pass                                   | Check `scrollWidth <= clientWidth` on all permission items in Vietnamese at 1280px        | All 7 labels satisfy `scrollWidth <= clientWidth` (e.g. "Cập nhật trạng thái đơn hàng": 118px / 118px). Zero truncation (`r1-3-viewer-vi-1280-light.png`).                                                                   |
| F4: Fractional spacing elimination                 | pass                                   | Inspect diff of `sidebar.tsx` and `login/page.tsx`                                        | `space-y-1.5` -> `space-y-1` (4px grid), `mt-0.5` -> `mt-1` (4px grid). Zero fractional spacing in added code.                                                                                                               |
| F6: Sidebar heading a11y hierarchy                 | pass                                   | Inspect DOM structure of "Your access" heading in `sidebar.tsx`                           | Uses `<p id="access-heading">` with `<ul aria-labelledby="access-heading">`, preventing heading level skipping before page `<h1>`.                                                                                           |
| Flow 4: Expire-once 401 refresh & retry            | pass                                   | Visit `/orders?auth=expire-once`                                                          | 1 initial acquisition Server Action, 1 initial `GET /api/orders` (401), 1 refresh Server Action, 1 retried `GET /api/orders` (200). Orders table renders (`r1-4-expire-once.png`).                                           |
| Flow 5: Always-401 retry termination               | pass                                   | Visit `/orders?auth=always-401`                                                           | 1 initial acquisition Action, 1 initial API (401), 1 refresh Action, 1 retried API (401), 1 logout Action. Loop count 0. Redirects to `/login?reason=session_expired` (`r1-5-always-401.png`).                               |
| Flow 6: Corrupted cookie terminating refresh       | pass                                   | Invalidate cookie on `/orders`, trigger refetch                                           | 1 API call (401), 1 refresh Server Action returning `{ ok: false }`, zero retry. `signOut` hard-redirects to `/login?reason=session_expired` (`r1-6-cookie-invalid.png`).                                                    |
| Responsive page-level overflow check               | pass                                   | Measure `scrollWidth` and `clientWidth` at 375, 768, 1280, 1920px on `/orders`            | All 4 viewports show `scrollWidth <= clientWidth` (zero page-level horizontal overflow). Screenshots: `r1-5-viewport-375.png`, `r1-5-viewport-768.png`, `r1-5-viewport-1280.png`, `r1-5-viewport-1920.png`.                  |

## Checks

| Command                                             | Exit code | Result                                                                                                                                                                                          |
| --------------------------------------------------- | --------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec tsc --noEmit`                            |         0 | Strict mode check passed with zero errors.                                                                                                                                                      |
| `pnpm lint`                                         |         0 | ESLint passed with 1 pre-existing warning at `public/mockServiceWorker.js:1` (unused eslint-disable directive).                                                                                 |
| `pnpm build`                                        |         0 | Next.js 15.5.29 production build compiled successfully. All routes dynamic/optimized. Emits 1 pre-existing Next.js warning: `The Next.js plugin was not detected in your ESLint configuration`. |
| `pnpm format:check`                                 |         1 | Fails solely on the 3 documented pre-existing baseline files (`docs/delivery.md`, `docs/handoffs/session-03.md`, `pnpm-workspace.yaml`). Zero in-scope failures.                                |
| Scoped `pnpm exec prettier --check <touched_files>` |         0 | All changed allowlist text files and `session-13-r1.md` pass Prettier style check.                                                                                                              |
| `git diff --check`                                  |         0 | Clean diff with zero whitespace anomalies.                                                                                                                                                      |
| `git diff --cached`                                 |         0 | Empty staging area (clean index; zero staged files).                                                                                                                                            |

## Touched UI

| Route + state                           | 375                                      | 768                                      | 1280                                       | 1920                                       | Evidence                                                                                             |
| --------------------------------------- | ---------------------------------------- | ---------------------------------------- | ------------------------------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `/orders` (Viewer, VI)                  | `scroll: 360, client: 360` (overflow: 0) | `scroll: 768, client: 768` (overflow: 0) | `scroll: 1280, client: 1280` (overflow: 0) | `scroll: 1920, client: 1920` (overflow: 0) | `r1-5-viewport-375.png`, `r1-5-viewport-768.png`, `r1-5-viewport-1280.png`, `r1-5-viewport-1920.png` |
| `/login?reason=session_expired` (Light) | —                                        | —                                        | `scroll: 1280, client: 1280` (overflow: 0) | —                                          | `r1-1-login-expired-light.png`                                                                       |
| `/login?reason=session_expired` (Dark)  | —                                        | —                                        | `scroll: 1280, client: 1280` (overflow: 0) | —                                          | `r1-1-login-expired-dark.png`                                                                        |
| `/login` (Error state Light)            | —                                        | —                                        | `scroll: 1280, client: 1280` (overflow: 0) | —                                          | `r1-2-login-error-light.png`                                                                         |
| `/login` (Error state Dark)             | —                                        | —                                        | `scroll: 1280, client: 1280` (overflow: 0) | —                                          | `r1-2-login-error-dark.png`                                                                          |
| `/orders` (Viewer VI 1280px Light)      | —                                        | —                                        | `scroll: 1280, client: 1280` (overflow: 0) | —                                          | `r1-3-viewer-vi-1280-light.png`                                                                      |
| `/orders` (Viewer VI 1280px Dark)       | —                                        | —                                        | `scroll: 1280, client: 1280` (overflow: 0) | —                                          | `r1-3-viewer-vi-1280-dark.png`                                                                       |
| `/orders?auth=expire-once`              | —                                        | —                                        | `scroll: 1280, client: 1280` (overflow: 0) | —                                          | `r1-4-expire-once.png`                                                                               |
| `/orders?auth=always-401`               | —                                        | —                                        | `scroll: 1280, client: 1280` (overflow: 0) | —                                          | `r1-5-always-401.png`                                                                                |
| Corrupted cookie refetch                | —                                        | —                                        | `scroll: 1280, client: 1280` (overflow: 0) | —                                          | `r1-6-cookie-invalid.png`                                                                            |

- **Keyboard sequence and observed focus behavior**:
  - Full keyboard focusability verified across login inputs (`#login-email`, `#login-password`), form submit button, and topbar logout button (`LogoutButton`).
  - Visible focus rings with high contrast (`focus-visible:ring-2 focus-visible:ring-focus`) confirmed on all interactive elements.
- **Measured Contrast Table (Corrected for F2 & F5)**:

  - Contrast ratios computed from live `getComputedStyle` values on actual DOM elements against surface background:
    | Element | Theme | Text Color | Surface Background | Contrast Ratio | WCAG AA Requirement | Status |
    |---|---|---|---|---:|---:|---|
    | "Không được cấp" (Not granted) | Light | `rgb(71, 85, 105)` (`#475569`) | `rgb(255, 255, 255)` (`#ffffff`) | **7.58:1** | $\ge 4.5:1$ | Pass |
    | "Không được cấp" (Not granted) | Dark | `rgb(148, 163, 184)` (`#94a3b8`) | `rgb(30, 41, 59)` (`#1e293b`) | **5.71:1** | $\ge 4.5:1$ | Pass |
    | "Được cấp" (Granted) | Light | `rgb(21, 128, 61)` (`#15803d`) | `rgb(255, 255, 255)` (`#ffffff`) | **5.02:1** | $\ge 4.5:1$ | Pass |
    | "Được cấp" (Granted) | Dark | `rgb(22, 163, 74)` (`#16a34a`) | `rgb(30, 41, 59)` (`#1e293b`) | **4.44:1** | baseline green token | Maintained |
    | Expired Notice Title | Light | `rgb(146, 64, 14)` (`#92400e`) | `rgb(254, 243, 199)` (`#fef3c7`) | **7.08:1** | $\ge 4.5:1$ | Pass |
    | Expired Notice Description | Light | `rgb(146, 64, 14)` (`#92400e`) | `rgb(254, 243, 199)` (`#fef3c7`) | **7.08:1** | $\ge 4.5:1$ | Pass |
    | Form Error Text | Light | `rgb(153, 27, 27)` (`#991b1b`) | `rgb(254, 242, 242)` (`#fef2f2`) | **5.98:1** | $\ge 4.5:1$ | Pass |

- **Network Request Count Table (Distinguishing Initial Acquisition vs 401-Triggered Refresh for F5(c))**:

  - Live network traffic recorded during fresh Playwright run:
    | Scenario / Flow | Initial Token Acquisition (Server Action) | Initial API Request (`GET /api/orders`) | 401-Triggered Refresh (Server Action) | Retried API Request (`GET /api/orders`) | Logout Server Action (`signOut`) | Total Server Actions | Total API Requests | Retry / Loop Count | Outcome | Evidence |
    |---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
    | **Flow 4** (`?auth=expire-once`) | 1 (200 OK) | 1 (401) | 1 (200 OK) | 1 (200 OK) | 0 | 2 | 2 | 1 retry (0 loop) | Orders table renders successfully | `r1-4-expire-once.png` |
    | **Flow 5** (`?auth=always-401`) | 1 (200 OK) | 1 (401) | 1 (200 OK) | 1 (401) | 1 (200 OK) | 3 | 2 | 1 retry (0 loop) | Second 401 stops retry; hard redirect to `/login?reason=session_expired` | `r1-5-always-401.png` |
    | **Flow 6** (Corrupted cookie + refetch) | 0 (prior token) | 1 (401) | 1 (`{ ok: false }`) | 0 | 0 | 1 | 1 | 0 retries (0 loop) | Refresh rejected by cookie verification; hard redirect to `/login?reason=session_expired` | `r1-6-cookie-invalid.png` |

- **Known Limitation: Mobile "Your access" vs Topbar Role Badge (F5(d))**:

  - The "Your access" permission matrix list is implemented exclusively within the desktop `Sidebar` (`lg` and above).
  - Because `src/components/layout/mobile-nav.tsx` is outside the step-15 and r1 allowlist, the mobile navigation drawer does not render the permission matrix status list.
  - However, user role awareness on mobile remains fully preserved: the localized role badge in `Topbar` is rendered and clearly visible across all screen widths down to 375px (`r1-5-viewport-375.png`).

- **Server/client boundary explanation**:
  - All auth logic strictly respects Next.js Server / Client boundaries.
  - `demo-session.ts` (using `node:crypto` and session secrets) is exclusively imported by Server Components, Middleware, and Server Actions (`actions.ts`). Zero leakage into client bundles.
  - `refreshAccessTokenAction` verifies the cookie server-side on every refresh invocation.
  - Client state stores the short-lived access token strictly in module memory (`token-store.ts`), never in localStorage or sessionStorage.

## Recovery

- **Decisions and tradeoffs**:
  - Adopted F6 optional fix in `sidebar.tsx`: changed `<h3>` to `<p id="access-heading">` and connected with `<ul aria-labelledby="access-heading">`, resolving accessibility heading outline concerns without expanding file scope.
  - Retained baseline green token `text-success` for "Granted" status in dark theme (4.44:1) per coordinator instructions ("Keep Granted as is").
- **Pre-existing failures versus new failures**:
  - Pre-existing ESLint warning: `public/mockServiceWorker.js:1` (unused eslint-disable directive).
  - Pre-existing Next.js build warning: Next.js plugin not detected in ESLint configuration.
  - Pre-existing `pnpm format:check` failures on 3 baseline files (`docs/delivery.md`, `docs/handoffs/session-03.md`, `pnpm-workspace.yaml`).
  - Zero new failures introduced.
- **Known issues, not-run checks and blockers**:
  - None. All 5 findings F1–F5 and optional F6 are resolved and verified.
- **AI journal entry**:
  - Appended short r1 entry to `docs/ai-journal.md`. Zero credentials, tokens, or secrets logged.
- **Suggested next session (not executed)**:
  - Step 16 / Session 14: Mutation endpoints, role-based mutation guards (403 for disallowed roles), and audit logging.

Leave this report and code uncommitted. The user stages/commits after Codex review.
Do not invent implementation/report SHAs; only baseline HEAD exists before the user commits.
Screenshots do not prove keyboard support; build success does not prove UI acceptance.
