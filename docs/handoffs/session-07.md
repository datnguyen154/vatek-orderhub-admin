# Session 07 — step-8 — ready_for_review

- Branch: `feat/dashboard-shell`
- Baseline SHA (or unborn): `40450285a854d68d1847e096417f54cff8c067e7` (verified `main` tracking `origin/main` containing accepted Session 06 commit `abd54ff999eb80058e0020e384bbb6781099d03a`)
- Review target: uncommitted working tree against baseline HEAD (include staged, unstaged and untracked files)
- Changed/untracked files by task:
  - `step-8` (D9):
    - Modified: `.env.example`, `src/features/auth/components/login-form.tsx`
    - Untracked:
      - `src/app/(dashboard)/layout.tsx`
      - `src/app/(dashboard)/orders/page.tsx`
      - `src/components/layout/sidebar.tsx`
      - `src/components/layout/topbar.tsx`
      - `src/components/layout/mobile-nav.tsx`
      - `src/features/auth/actions.ts`
      - `src/lib/auth/demo-session.ts`
      - `src/middleware.ts`
  - Documentation / reporting:
    - Modified: `docs/ai-journal.md`
    - Untracked: `docs/handoffs/session-07.md`
  - Local / gitignored evidence:
    - `output/playwright/session-07/` (`orders-375.png`, `drawer-375-open.png`, `orders-768.png`, `drawer-768-open.png`, `orders-1280.png`, `skip-link-focused.png`, `orders-1920.png`, `results.json`)
- Objective and changed files:
  - Implemented Session 07 / step-8 (D9: "App shell và demo session guard") within the exact scope allowlist:
    1. **Demo session security module** (`src/lib/auth/demo-session.ts`): Server-only HMAC-SHA256 signing and verification using Node's built-in `crypto`. Fails closed if `DEMO_SESSION_SECRET` is missing or < 32 characters. Enforces constant-time signature comparison (`crypto.timingSafeEqual`) after verifying identical byte lengths. Cookie is `httpOnly`, `sameSite: "lax"`, `path: "/"`, `maxAge: 28800` (8 hours), and `secure` in production. Passwords are never stored, logged, or placed in browser cookies or localStorage.
    2. **Next.js 15 Middleware route guard** (`src/middleware.ts`): Coarse cookie-presence check protecting `/orders/:path*`. Redirects unauthenticated requests to `/login`. Contains zero server crypto or secret imports.
    3. **Server Actions for Auth** (`src/features/auth/actions.ts`): `loginAction` performs runtime `FormData` extraction and validation via `validateLoginForm`, issues signed demo cookie upon valid submission, and executes a fixed internal redirect to `/orders`. `logoutAction` clears the cookie and redirects to `/login`.
    4. **Client Login Form Integration** (`src/features/auth/components/login-form.tsx`): Integrated with `useActionState`, preserving instant client-side validation, accessible errors (`aria-invalid`, `aria-describedby`), first-invalid-field focus transfer, and pending button state.
    5. **Dashboard Route Group Shell** (`src/app/(dashboard)/layout.tsx`): Persistent Server Component shell verifying the cryptographic demo session. Renders keyboard skip link (`#main-content`), persistent `Topbar`, and fixed `Sidebar`.
    6. **Desktop Sidebar** (`src/components/layout/sidebar.tsx`): Fixed `w-sidebar` (256px) sidebar on `lg+`, containing accessible `<aside>` and `<nav>` with `aria-current="page"` link to `/orders`.
    7. **Persistent Topbar** (`src/components/layout/topbar.tsx`): Fixed `h-topbar` (56px) navigation bar with branding, section breadcrumbs, user session indicator, mobile drawer trigger (`MobileNav`), and logout Server Action form.
    8. **Mobile Navigation Drawer** (`src/components/layout/mobile-nav.tsx`): Utilizes Radix Dialog `Modal` primitive with `ModalTrigger asChild`. Manages focus trap, Escape dismissal, and return focus to the hamburger button.
    9. **Orders Page Destination** (`src/app/(dashboard)/orders/page.tsx`): Minimal server-rendered placeholder establishing the shell destination.
    10. **Environment Placeholder** (`.env.example`): Clearly marked placeholder specifying >= 32 character requirement for `DEMO_SESSION_SECRET`.
- Out-of-scope changes: none

## Acceptance evidence

| Task + criterion                                                                                                                                                                                      | pass / fail / not_run / not_applicable | Reproduction or command                                              | Evidence / observed result                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `step-8`: Session demo ký phía server bằng secret env, cookie httpOnly/sameSite/lifetime rõ; không lưu password, không dùng localStorage làm bằng chứng auth; tài liệu ghi chưa phải production auth. | pass                                   | Inspect `src/lib/auth/demo-session.ts` and runtime cookie evaluation | HMAC-SHA256 signature generated and verified using Node `crypto` and `DEMO_SESSION_SECRET` (>= 32 chars). Fails closed on missing/weak secret. Timing-safe comparison with length check. Cookie: `httpOnly: true`, `sameSite: "lax"`, `path: "/"`, `maxAge: 28800` (8h), `secure: process.env.NODE_ENV === "production"`. Passwords never logged, persisted, or stored. Disclosed in docs as demo-only route guard.                                                                                    |
| `step-8`: Middleware chỉ redirect sơ bộ; dashboard server layout kiểm tra session thực sự; login/logout server actions kiểm tra input và redirect an toàn.                                            | pass                                   | Playwright browser smoke test with Next.js production server         | 1. Direct unauthenticated request to `/orders` redirected by middleware to `/login`.<br>2. Form submission with valid credentials executed `loginAction`, signed cookie, and performed fixed redirect to `/orders`.<br>3. `DashboardLayout` verified session with `getDemoSessionFromCookies()`.<br>4. Clicking "Sign out" executed `logoutAction`, cleared cookie, and redirected to `/login`. Subsequent `/orders` request redirected back to `/login`.                                              |
| `step-8`: Layout dùng chung không remount khi đổi trang trong dashboard; chỉ hiện links tới route tồn tại; step-9 thêm preferences rồi kiểm tra persistence.                                          | not_applicable                         | Route inspection and architecture analysis                           | Only `/orders` exists inside the dashboard in Session 07. Sibling route remount verification is deferred to Session 08 (step-9) when `/preferences` is created, per prompt instructions. The dashboard shell is implemented as a persistent Server Component route group layout (`src/app/(dashboard)/layout.tsx`). Sidebar links exclusively to `/orders`.                                                                                                                                            |
| `step-8`: Drawer dùng Modal primitive có keyboard/focus restore; mở/đóng nav không đổi shell layout desktop.                                                                                          | pass                                   | Playwright browser keyboard sequence test at 375px and 768px         | Hamburger button wrapped in `ModalTrigger asChild`. Clicking trigger opens Radix `ModalContent` with `Navigation Menu` title. Tab key trapped within dialog. Pressing `Escape` closes modal. Evaluated `document.activeElement`: `tagName: "BUTTON"`, `ariaLabel: "Open navigation menu"`, `isHamburgerFocused: true`. Trigger hidden on `lg+` (`lg:hidden`), desktop layout remains fixed (`w-sidebar`).                                                                                              |
| `step-8`: pnpm exec tsc --noEmit, pnpm lint và pnpm build đều pass; TypeScript strict, không any hoặc ts-ignore để né lỗi.                                                                            | pass                                   | `pnpm exec tsc --noEmit && pnpm lint && pnpm build`                  | All three commands exited with code 0. TypeScript 5.8.2 strict mode passed with 0 errors; ESLint 9 passed with 0 errors/warnings; production build succeeded with dynamic server-rendered `/orders` (125 B / 103 kB) and Middleware (34.5 kB).                                                                                                                                                                                                                                                         |
| `step-8`: Chỉ sửa scope_files tính từ root capstone; không đổi dependency ngoài allowlist của task; không sửa labs.                                                                                   | pass                                   | `git status --short --branch`                                        | Exactly modified/created allowlisted files: `.env.example`, `src/app/(dashboard)/layout.tsx`, `src/app/(dashboard)/orders/page.tsx`, `src/components/layout/sidebar.tsx`, `src/components/layout/topbar.tsx`, `src/components/layout/mobile-nav.tsx`, `src/features/auth/actions.ts`, `src/lib/auth/demo-session.ts`, `src/features/auth/components/login-form.tsx`, `src/middleware.ts`, `docs/ai-journal.md`, `docs/handoffs/session-07.md`. Zero dependencies added. `vatek-intern-labs` untouched. |
| `step-8`: UI dùng semantic tokens và cva cho variants/sizes; không arbitrary Tailwind values, inline style hoặc literal màu/spacing ngoài nơi khai báo tokens.                                        | pass                                   | Source inspection across touched layout and view files               | Spacing conforms to strict 4px grid (`p-2`, `p-4`, `p-6`, `py-4`, `px-3`, `px-4`, `px-6`, `gap-2`, `gap-3`, `gap-4`, `space-y-1`, `space-y-6`). Component dimensions use tokens: `w-sidebar` (256px), `h-topbar` (56px), `max-w-container-max` (1280px). Semantic colors: `bg-background`, `bg-surface`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `bg-primary-muted`, `text-primary-muted-foreground`. Zero arbitrary brackets (`[...]`), zero inline styles.        |
| `step-8`: Với UI bị tác động: kiểm tra 375/768/1280/1920px, không tràn ngang toàn trang; bảng có vùng cuộn riêng được đặt tên.                                                                        | pass                                   | Playwright MCP evaluation at 375x812, 768x1024, 1280x800, 1920x1080  | Evaluated `document.documentElement.scrollWidth` and `clientWidth`: 375px (375/375), 768px (768/768), 1280px (1280/1280), 1920px (1920/1920). Zero horizontal window overflow across all viewports.                                                                                                                                                                                                                                                                                                    |
| `step-8`: Với UI tương tác: semantic HTML, accessible name, focus rõ, Tab/Shift+Tab/Enter/Space hoạt động đúng; dialog hỗ trợ Escape, focus trap và trả focus.                                        | pass                                   | Playwright browser keyboard sequence test                            | Verified: 1. Skip link targeting `#main-content` becomes visible at (16, 16) with 40px height upon focus.<br>2. Tab navigation traverses skip link -> Topbar sign out button -> Sidebar Orders link.<br>3. Active navigation link exposes `aria-current="page"`.<br>4. Mobile drawer traps focus, closes on `Escape`, and restores focus to hamburger trigger (`isHamburgerFocused: true`).<br>5. Visible focus rings on all interactive elements.                                                     |
| `step-8`: Ghi docs/ai-journal.md: prompt, kết quả AI, sửa lỗi, kết quả kiểm tra và giới hạn còn lại; giữ code và báo cáo uncommitted; Codex review rồi người dùng tự stage/commit theo sessions.md.   | pass                                   | Inspect `docs/ai-journal.md` and `git status`                        | Appended Session 07 record to `docs/ai-journal.md`. Working tree left uncommitted for Codex review.                                                                                                                                                                                                                                                                                                                                                                                                    |

## Checks

| Command                                      | Exit code | Result                                                                                                                                                                                       |
| -------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec tsc --noEmit`                     | `0`       | Passed: TypeScript 5.8.2 strict check passed with zero errors.                                                                                                                               |
| `pnpm lint`                                  | `0`       | Passed: ESLint 9 evaluated all files with zero errors and zero warnings.                                                                                                                     |
| `pnpm build`                                 | `0`       | Passed: Next.js 15.5.29 production build compiled successfully; `/orders` dynamic route (125 B / 103 kB) and Middleware (34.5 kB) generated.                                                 |
| `pnpm exec prettier --check <touched_files>` | `0`       | Passed: All touched files conform 100% to Prettier code style.                                                                                                                               |
| `pnpm format:check`                          | `1`       | Pre-existing baseline failure: 2 pre-existing out-of-scope D6 files (`docs/delivery.md` and `docs/handoffs/session-03.md`) contain CRLF line endings. All touched files conform to Prettier. |
| `git diff --check`                           | `0`       | Passed: Clean diff with zero whitespace or line-ending anomalies.                                                                                                                            |

## Touched UI

| Route + state                                  | 375  | 768  | 1280 | 1920 | Evidence                                                                                              |
| ---------------------------------------------- | ---- | ---- | ---- | ---- | ----------------------------------------------------------------------------------------------------- |
| `/orders` authenticated shell default          | pass | pass | pass | pass | `output/playwright/session-07/orders-375.png`, `orders-768.png`, `orders-1280.png`, `orders-1920.png` |
| `/orders` mobile/tablet navigation drawer open | pass | pass | n/a  | n/a  | `output/playwright/session-07/drawer-375-open.png`, `drawer-768-open.png`                             |
| `/orders` keyboard skip link focused           | n/a  | n/a  | pass | pass | `output/playwright/session-07/skip-link-focused.png`                                                  |

- **Keyboard sequence and observed focus behavior**:
  - Unauthenticated access: Directly navigating to `http://localhost:3000/orders` triggered instant redirect to `/login`.
  - Login form submission: Submitting invalid input shifted focus to `#login-email` with error alerts. Submitting valid-format synthetic demo credentials (`admin@orderhub.local` with valid-length password) executed `loginAction` and redirected to `/orders`.
  - Skip link: Focusing the skip link rendered it visible at top-left (`rect: { x: 16, y: 16, width: 178.6, height: 40 }`) with high-contrast primary styling (`bg-primary text-primary-foreground focus:ring-2 focus:ring-focus`).
  - Active navigation indicator: Inspected `document.activeElement` when navigating into the sidebar: `<a href="/orders">` exposed `aria-current="page"`.
  - Mobile drawer: At 375px and 768px, clicking the hamburger button opened the Radix `ModalContent`. Tab key was constrained within the drawer dialog. Pressing `Escape` dismissed the drawer, and focus immediately restored to the invoking hamburger button (`tagName: "BUTTON"`, `ariaLabel: "Open navigation menu"`).
  - Logout flow: Clicking "Sign out" triggered `logoutAction`, cleared the demo session cookie, and redirected to `/login`. Subsequent navigation to `/orders` redirected back to `/login`.
- **Contrast measurement and method**:
  - Measured against WCAG 2.1 relative luminance standards using tokens defined in `docs/design-system.md`:
    - Topbar background `bg-surface` (`#FFFFFF`) with border `border-border` (`#E2E8F0`).
    - Topbar brand OH icon (`#FFFFFF` on `#1D4ED8`): **6.70:1** (AA).
    - Topbar text (`#0F172A` on `#FFFFFF`): **17.85:1** (AAA).
    - Active nav link: `bg-primary-muted` (`#DBEAFE`) with text `text-primary-muted-foreground` (`#1E40af`): **7.15:1** (AAA).
    - Skip link: `bg-primary` (`#1D4ED8`) with text `text-primary-foreground` (`#FFFFFF`): **6.70:1** (AA).
    - Focus indicator: 2px ring in `ring-focus` (`#1D4ED8`): **6.70:1** (>= 3:1 non-text contrast).
- **Loading/error/empty/retry reproduction**:
  - Login form pending state: Button shows spinner and disables during Server Action execution.
  - Server Action error: In the event of missing or insufficient `DEMO_SESSION_SECRET`, `loginAction` fails closed and renders an accessible error alert banner without crashing.
- **Server/client boundary explanation**:
  - `src/app/(dashboard)/layout.tsx`: Server Component. Directly invokes `getDemoSessionFromCookies()`, reads the HTTP-only cookie, and verifies the HMAC token. Never leaks server secrets to client props.
  - `src/app/(dashboard)/orders/page.tsx`: Server Component. Renders static semantic page header and workspace destination card.
  - `src/components/layout/topbar.tsx`: Server Component. Passes `logoutAction` directly as a Server Action form action. Embeds client `MobileNav`.
  - `src/components/layout/sidebar.tsx`: Server Component. Renders desktop navigation markup.
  - `src/components/layout/mobile-nav.tsx`: Client Component (`"use client"`). Manages modal drawer open/closed state and handles Radix Dialog client interactions.
  - `src/features/auth/components/login-form.tsx`: Client Component (`"use client"`). Connects to `loginAction` Server Action via `useActionState`, manages client validation state and input focus refs.
- **Design baseline and deviations**:
  - Strictly conforms to `docs/design-system.md` visual baseline.
  - Desktop: Fixed sidebar with `w-sidebar` (`16rem` = 256px), persistent topbar with `h-topbar` (`3.5rem` = 56px).
  - Tablet/Mobile: Topbar with hamburger trigger; sidebar hidden; drawer powered by Radix `Modal`.
  - Centered content container: `max-w-container-max` (`80rem` = 1280px).
  - 4px spacing grid throughout (`p-2`, `p-4`, `p-6`, `py-4`, `px-3`, `px-4`, `gap-2`, `gap-3`, `gap-4`, `space-y-1`, `space-y-6`). Zero fractional spacing.
  - Zero arbitrary brackets (`[...]`), zero inline styles.
- **Playwright smoke: commands, tested routes/states, viewport sizes, observed failures and screenshot/trace paths**:
  - Runner: Playwright MCP real-browser automation against Next.js production server (`next start -p 3000`).
  - Viewports: 375x812, 768x1024, 1280x800, 1920x1080.
  - Observed failures: 0. Zero horizontal window scrolling across all tested viewports (`scrollWidth === clientWidth`).
  - Evidence directory: `output/playwright/session-07/`:
    - `orders-375.png` (23.3 KB)
    - `drawer-375-open.png` (26.0 KB)
    - `orders-768.png` (30.4 KB)
    - `drawer-768-open.png` (37.3 KB)
    - `orders-1280.png` (33.1 KB)
    - `skip-link-focused.png` (32.8 KB)
    - `orders-1920.png` (37.0 KB)
    - `results.json` (1.8 KB)

## Recovery

- Decisions and tradeoffs:
  - Used `ModalTrigger asChild` inside `src/components/layout/mobile-nav.tsx` to ensure Radix Dialog captures the exact trigger reference and cleanly restores focus upon Escape dismissal.
  - Middleware performs strictly a coarse cookie-presence check on `/orders/:path*` without importing Node `crypto` or server session modules, respecting Next.js 15 Edge/middleware runtime constraints.
  - Cryptographic verification is isolated to the Server Component layout (`src/app/(dashboard)/layout.tsx`) and Server Actions (`src/features/auth/actions.ts`), ensuring complete separation of concerns and fail-closed security.
  - Documented that only `/orders` currently exists; marked persistent shell sibling navigation as `not_applicable` deferred to Session 08 / step-9.
- Pre-existing failures versus new failures:
  - Pre-existing failure: `pnpm format:check` fails solely on pre-existing D6 files (`docs/delivery.md` and `docs/handoffs/session-03.md`) containing CRLF line endings. All files touched in Session 07 pass Prettier with zero style issues.
- Known issues, not-run checks and blockers:
  - None. All acceptance criteria and automated Playwright browser checks passed.
- Reproduction and next concrete action:
  - Next action: Codex reviews uncommitted changes, untracked files, and Playwright evidence on branch `feat/dashboard-shell`; user stages and commits after review approval.
- AI journal entry:
  - Appended Session 07 record to `docs/ai-journal.md`.
- Suggested next session (not executed):
  - Session 08 / step-9 (D9): Loading error not-found và điều hướng (`src/app/(dashboard)/orders/loading.tsx`, `orders/error.tsx`, `preferences/page.tsx`, `not-found.tsx`, verification of persistent layout between orders and preferences).

Leave this report and code uncommitted. The user stages/commits after Codex review.
Do not invent implementation/report SHAs; only baseline HEAD exists before the user commits.
Screenshots do not prove keyboard support; build success does not prove UI acceptance.
