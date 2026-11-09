# Session 07 Repair r3 — step-8 — ready_for_review

- Branch: `feat/dashboard-shell`
- Baseline SHA (or unborn): `4045028bdd6d45950f9d595762571e449167a2a3` (verified `main` tracking `origin/main` containing accepted Session 06 commit `abd54ff999eb80058e0020e384bbb6781099d03a`)
- Review target: uncommitted working tree against baseline HEAD (include staged, unstaged and untracked files)
- Changed/untracked files by task:
  - `step-8` (D9):
    - Modified:
      - `.env.example`
      - `src/features/auth/components/login-form.tsx`
      - `src/components/layout/mobile-nav.tsx` (r3: replaced arbitrary `max-w-[calc(100vw-3rem)]` with standard utility `max-w-full`)
    - Untracked:
      - `src/app/(dashboard)/layout.tsx`
      - `src/app/(dashboard)/orders/page.tsx`
      - `src/components/layout/sidebar.tsx`
      - `src/components/layout/topbar.tsx`
      - `src/features/auth/actions.ts`
      - `src/lib/auth/demo-session.ts`
      - `src/middleware.ts`
  - Documentation / reporting:
    - Modified:
      - `docs/ai-journal.md` (untouched in r3 per scope restriction; preserved r2 state)
      - `docs/handoffs/session-07.md` (redacted test password value)
    - Untracked:
      - `docs/handoffs/session-07-r1.md`
      - `docs/handoffs/session-07-r2.md`
      - `docs/handoffs/session-07-r3.md` (this repair r3 report)
  - Local / gitignored evidence:
    - `output/playwright/session-07/` (`orders-375.png`, `drawer-375-open.png`, `orders-768.png`, `drawer-768-open.png`, `orders-1280.png`, `skip-link-focused.png`, `orders-1920.png`, `results.json`)
- Objective and changed files:
  - Executed Repair r3 approved by user, strictly scoped to two files (`src/components/layout/mobile-nav.tsx` and `docs/handoffs/session-07-r3.md`):
    1. **Elimination of Arbitrary Tailwind Utility**: In `src/components/layout/mobile-nav.tsx`, replaced `max-w-[calc(100vw-3rem)]` on `ModalContent` with standard non-arbitrary utility `max-w-full`. Maintained `w-sidebar` (256px / 16rem).
    2. **Runtime Verification**: Verified with Playwright MCP that drawer remains exactly 256px wide, left-anchored (`left: 0`), full viewport height (812px at 375px; 1024px at 768px), with zero horizontal overflow (`scrollWidth === clientWidth`). Re-verified keyboard activation via `Enter` at 375px and `Space` at 768px, focus trap inside dialog, `Escape` key dismissal, and automatic focus restoration to the hamburger button (`button[aria-label="Open navigation menu"]`).
- Out-of-scope changes: none (`docs/ai-journal.md`, `.agents/tasks.json`, and `Modal` primitive untouched per explicit instruction).

## Acceptance evidence

| Task + criterion                                                                                                                                                                                      | pass / fail / not_run / not_applicable | Reproduction or command                                              | Evidence / observed result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `step-8`: Session demo ký phía server bằng secret env, cookie httpOnly/sameSite/lifetime rõ; không lưu password, không dùng localStorage làm bằng chứng auth; tài liệu ghi chưa phải production auth. | pass                                   | Inspect `src/lib/auth/demo-session.ts` and runtime cookie evaluation | HMAC-SHA256 signature generated and verified using Node built-in `crypto` and `DEMO_SESSION_SECRET` (>= 32 chars). Fails closed on missing/weak secret. Timing-safe comparison with equal-length check. Cookie: `httpOnly: true`, `sameSite: "lax"`, `path: "/"`, `maxAge: 28800` (8h), `secure: process.env.NODE_ENV === "production"`. Passwords never logged, persisted, or stored. Disclosed in docs as demo-only route guard.                                                                                                                                                                                                                                                        |
| `step-8`: Middleware chỉ redirect sơ bộ; dashboard server layout kiểm tra session thực sự; login/logout server actions kiểm tra input và redirect an toàn.                                            | pass                                   | Playwright browser smoke test with Next.js production server         | 1. Direct unauthenticated request to `/orders` redirected by middleware to `/login`.<br>2. Tampered cookie request to `/orders` passed middleware presence check but was rejected by dashboard layout HMAC verification and redirected to `/login`.<br>3. Server started with weak secret (< 32 chars) failed closed: login rejected with accessible alert, 0 cookies set.<br>4. Form submission with valid credentials executed `loginAction`, signed cookie, and performed fixed redirect to `/orders`.<br>5. Clicking "Sign out" executed `logoutAction`, cleared cookie, and redirected to `/login`. Subsequent `/orders` request redirected back to `/login`.                        |
| `step-8`: Layout dùng chung không remount khi đổi trang trong dashboard; chỉ hiện links tới route tồn tại; step-9 thêm preferences rồi kiểm tra persistence.                                          | not_applicable                         | Route inspection and architecture analysis                           | Only `/orders` exists inside the dashboard in Session 07. Sibling route remount verification is deferred to Session 08 (step-9) when `/preferences` is created, per prompt instructions. The dashboard shell is implemented as a persistent Server Component route group layout (`src/app/(dashboard)/layout.tsx`). Sidebar links exclusively to `/orders`.                                                                                                                                                                                                                                                                                                                               |
| `step-8`: Drawer dùng Modal primitive có keyboard/focus restore; mở/đóng nav không đổi shell layout desktop.                                                                                          | pass                                   | Playwright browser keyboard sequence test at 375px and 768px         | Hamburger button wrapped in `ModalTrigger asChild`. Keyboard activation tested: `Enter` key at 375px and `Space` key at 768px cleanly opened Radix `ModalContent` styled as an edge-anchored drawer panel (`w-sidebar: 256px`, `left: 0`, full height, `max-w-full`). Focus trapped inside modal. Pressing `Escape` dismissed modal and restored focus to hamburger button (`isHamburgerFocused: true`). Desktop layout remains fixed (`w-sidebar: 256px`), trigger hidden on `lg+`.                                                                                                                                                                                                      |
| `step-8`: pnpm exec tsc --noEmit, pnpm lint và pnpm build đều pass; TypeScript strict, không any hoặc ts-ignore để né lỗi.                                                                            | pass                                   | `pnpm exec tsc --noEmit && pnpm lint && pnpm build`                  | All three commands exited with code 0. TypeScript 5.8.2 strict mode passed with 0 errors; ESLint 9 passed with 0 errors/warnings; production build succeeded with dynamic server-rendered `/orders` (125 B / 103 kB) and Middleware (34.5 kB). Non-blocking Next.js ESLint plugin detection warning recorded.                                                                                                                                                                                                                                                                                                                                                                             |
| `step-8`: Chỉ sửa scope_files tính từ root capstone; không đổi dependency ngoài allowlist của task; không sửa labs.                                                                                   | pass                                   | `git status --short --branch`                                        | Exactly modified/created allowlisted files: `.env.example`, `src/app/(dashboard)/layout.tsx`, `src/app/(dashboard)/orders/page.tsx`, `src/components/layout/sidebar.tsx`, `src/components/layout/topbar.tsx`, `src/components/layout/mobile-nav.tsx`, `src/features/auth/actions.ts`, `src/lib/auth/demo-session.ts`, `src/features/auth/components/login-form.tsx`, `src/middleware.ts`, `docs/ai-journal.md`, `docs/handoffs/session-07.md`, `docs/handoffs/session-07-r1.md`, `docs/handoffs/session-07-r2.md`, `docs/handoffs/session-07-r3.md`. In r3, strictly two files touched (`mobile-nav.tsx` and `session-07-r3.md`). Zero dependencies added. `vatek-intern-labs` untouched. |
| `step-8`: UI dùng semantic tokens và cva cho variants/sizes; không arbitrary Tailwind values, inline style hoặc literal màu/spacing ngoài nơi khai báo tokens.                                        | pass                                   | Source inspection across touched layout and view files               | Spacing conforms to strict 4px grid (`p-2`, `p-4`, `p-6`, `py-4`, `px-3`, `px-4`, `px-6`, `gap-2`, `gap-3`, `gap-4`, `space-y-1`, `space-y-6`). Component dimensions use tokens: `w-sidebar` (256px), `h-topbar` (56px), `max-w-container-max` (1280px). Standard non-arbitrary utility `max-w-full` used for mobile drawer container constraint. Semantic colors: `bg-background`, `bg-surface`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `bg-primary-muted`, `text-primary-muted-foreground`. Zero arbitrary brackets (`[...]`), zero inline styles.                                                                                                  |
| `step-8`: Với UI bị tác động: kiểm tra 375/768/1280/1920px, không tràn ngang toàn trang; bảng có vùng cuộn riêng được đặt tên.                                                                        | pass                                   | Playwright MCP evaluation at 375x812, 768x1024, 1280x800, 1920x1080  | Evaluated `document.documentElement.scrollWidth` and `clientWidth`: 375px (375/375), 768px (768/768), 1280px (1280/1280), 1920px (1920/1920). Zero horizontal window overflow across all viewports.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `step-8`: Với UI tương tác: semantic HTML, accessible name, focus rõ, Tab/Shift+Tab/Enter/Space hoạt động đúng; dialog hỗ trợ Escape, focus trap và trả focus.                                        | pass                                   | Playwright browser keyboard sequence test                            | Verified: 1. Skip link targeting `#main-content` becomes visible at (16, 16) with 40px height upon Tab focus.<br>2. Tab navigation traverses skip link -> Topbar sign out button -> Sidebar Orders link.<br>3. Active navigation link exposes `aria-current="page"`.<br>4. Mobile drawer opens on `Enter` (375px) and `Space` (768px), traps focus, closes on `Escape`, and restores focus to hamburger trigger (`isHamburgerFocused: true`).<br>5. Visible focus rings on all interactive elements.                                                                                                                                                                                      |
| `step-8`: Ghi docs/ai-journal.md: prompt, kết quả AI, sửa lỗi, kết quả kiểm tra và giới hạn còn lại; giữ code và báo cáo uncommitted; Codex review rồi người dùng tự stage/commit theo sessions.md.   | pass                                   | Inspect `docs/ai-journal.md` and `git status`                        | Session 07 Repair r2 journal entry preserved intact. User explicitly instructed not to modify `docs/ai-journal.md` in r3 to restrict changes strictly to the two targeted files. Working tree left uncommitted for Codex review. Zero credential values persisted.                                                                                                                                                                                                                                                                                                                                                                                                                        |

## Checks

| Command                                      | Exit code | Result                                                                                                                                                                                                |
| -------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec tsc --noEmit`                     | `0`       | Passed: TypeScript 5.8.2 strict check passed with zero errors.                                                                                                                                        |
| `pnpm lint`                                  | `0`       | Passed: ESLint 9 evaluated all files with zero errors and zero warnings.                                                                                                                              |
| `pnpm build`                                 | `0`       | Passed: Next.js 15.5.29 production build compiled successfully; dynamic `/orders` (125 B / 103 kB) and Middleware (34.5 kB) generated. Non-blocking Next.js ESLint plugin detection warning recorded. |
| `pnpm exec prettier --check <touched_files>` | `0`       | Passed: All touched source and documentation files conform 100% to Prettier code style.                                                                                                               |
| `pnpm format:check`                          | `1`       | Pre-existing baseline failure: 2 pre-existing out-of-scope D6 files (`docs/delivery.md` and `docs/handoffs/session-03.md`) contain CRLF line endings. All touched in-scope files pass cleanly.        |
| `git diff --check`                           | `0`       | Passed: Clean diff with zero whitespace or line-ending anomalies.                                                                                                                                     |

## Touched UI

| Route + state                                   | 375  | 768  | 1280 | 1920 | Evidence                                                                                              |
| ----------------------------------------------- | ---- | ---- | ---- | ---- | ----------------------------------------------------------------------------------------------------- |
| `/orders` default un-focused authenticated view | pass | pass | pass | pass | `output/playwright/session-07/orders-375.png`, `orders-768.png`, `orders-1280.png`, `orders-1920.png` |
| `/orders` mobile/tablet navigation drawer open  | pass | pass | n/a  | n/a  | `output/playwright/session-07/drawer-375-open.png`, `drawer-768-open.png`                             |
| `/orders` keyboard skip link focused            | n/a  | n/a  | pass | pass | `output/playwright/session-07/skip-link-focused.png`                                                  |

- **Keyboard sequence and observed focus behavior**:
  - Unauthenticated access: Directly navigating to `http://localhost:3000/orders` triggered instant redirect to `/login`.
  - Tampered cookie rejection: Setting cookie to invalid token allowed request past middleware, but dashboard layout rejected HMAC signature and redirected to `/login`.
  - Weak secret fail-closed: Server started with secret < 32 characters rejected login attempts, rendered accessible alert banner, and set zero cookies.
  - Login form submission: Submitting invalid input shifted focus to `#login-email` with error alerts. Submitting valid-format synthetic demo credentials (`admin@orderhub.local` with valid-length password) executed `loginAction` and redirected to `/orders`.
  - Skip link: Focusing the skip link rendered it visible at top-left (`rect: { x: 16, y: 16, width: 178.6, height: 40 }`) with high-contrast primary styling (`bg-primary text-primary-foreground focus:ring-2 focus:ring-focus`).
  - Active navigation indicator: Inspected `document.activeElement` when navigating into the sidebar: `<a href="/orders">` exposed `aria-current="page"`.
  - Mobile/tablet edge-anchored drawer keyboard activation:
    - At 375px: Focused hamburger trigger, pressed `Enter`. Left-edge anchored drawer panel opened (`rect: { left: 0, top: 0, right: 256, bottom: 812, width: 256, height: 812 }`). Focus trapped within dialog across Tab cycles. Pressed `Escape`: drawer dismissed, focus restored to hamburger button (`tagName: "BUTTON"`, `ariaLabel: "Open navigation menu"`).
    - At 768px: Focused hamburger trigger, pressed `Space`. Left-edge anchored drawer panel opened (`rect: { left: 0, top: 0, right: 256, bottom: 1024, width: 256, height: 1024 }`). Focus trapped within dialog. Pressed `Escape`: drawer dismissed, focus restored to hamburger button (`isHamburgerFocused: true`).
  - Logout flow: Clicking "Sign out" triggered `logoutAction`, cleared the demo session cookie, and redirected to `/login`. Subsequent navigation to `/orders` redirected back to `/login`.
- **Contrast measurement and method**:
  - Measured against WCAG 2.1 relative luminance standards using tokens defined in `docs/design-system.md`:
    - Topbar background `bg-surface` (`#FFFFFF`) with border `border-border` (`#E2E8F0`).
    - Topbar brand OH icon (`#FFFFFF` on `#1D4ED8`): **6.70:1** (AA).
    - Topbar text (`#0F172A` on `#FFFFFF`): **17.85:1** (AAA).
    - Active nav link: `bg-primary-muted` (`#DBEAFE`) with text `text-primary-muted-foreground` (`#1E40AF`): **7.15:1** (AAA).
    - Skip link: `bg-primary` (`#1D4ED8`) with text `text-primary-foreground` (`#FFFFFF`): **6.70:1** (AA).
    - Focus indicator: 2px ring in `ring-focus` (`#1D4ED8`): **6.70:1** (>= 3:1 non-text contrast).
- **Loading/error/empty/retry reproduction**:
  - Login form pending state: Button shows spinner and disables during Server Action execution.
  - Server Action error: In the event of missing or insufficient `DEMO_SESSION_SECRET`, `loginAction` fails closed and renders an accessible error alert banner without crashing.
- **Server/client boundary explanation**:
  - `src/app/(dashboard)/layout.tsx`: Server Component. Directly invokes `getDemoSessionFromCookies()`, reads the HTTP-only cookie, and verifies the HMAC token. Never leaks server secrets to client props.
  - `src/app/(dashboard)/orders/page.tsx`: Server Component. Renders static semantic page header and B2B orders placeholder card.
  - `src/components/layout/topbar.tsx`: Server Component. Passes `logoutAction` directly as a Server Action form action. Embeds client `MobileNav`.
  - `src/components/layout/sidebar.tsx`: Server Component. Renders desktop navigation markup.
  - `src/components/layout/mobile-nav.tsx`: Client Component (`"use client"`). Manages edge-anchored drawer open/closed state and handles Radix Dialog client interactions.
  - `src/features/auth/components/login-form.tsx`: Client Component (`"use client"`). Connects to `loginAction` Server Action via `useActionState`, manages client validation state and input focus refs.
- **Design baseline and deviations**:
  - Strictly conforms to `docs/design-system.md` visual baseline.
  - Desktop: Fixed sidebar with `w-sidebar` (`16rem` = 256px), persistent topbar with `h-topbar` (`3.5rem` = 56px).
  - Tablet/Mobile: Topbar with hamburger trigger; sidebar hidden; drawer powered by Radix `Modal` styled as an edge-anchored left panel (`w-sidebar: 256px`, `h-full`, `left-0`, `max-w-full`).
  - Centered content container: `max-w-container-max` (`80rem` = 1280px).
  - 4px spacing grid throughout (`p-2`, `p-4`, `p-6`, `py-4`, `px-3`, `px-4`, `gap-2`, `gap-3`, `gap-4`, `space-y-1`, `space-y-6`). Zero fractional spacing.
  - Zero arbitrary brackets (`[...]`), zero inline styles.
- **Playwright smoke: commands, tested routes/states, viewport sizes, observed failures and screenshot/trace paths**:
  - Runner: Playwright MCP real-browser automation against Next.js production server (`next start -p 3000`).
  - Viewports: 375x812, 768x1024, 1280x800, 1920x1080.
  - Observed failures: 0. Zero horizontal window scrolling across all tested viewports (`scrollWidth === clientWidth`).
  - Evidence directory: `output/playwright/session-07/`:
    - `orders-375.png` (21.3 KB) — Default un-focused view at 375x812
    - `drawer-375-open.png` (13.1 KB) — Edge-anchored mobile drawer open via `Enter` key (`x: 0, width: 256, height: 812`)
    - `orders-768.png` (28.0 KB) — Default un-focused view at 768x1024
    - `drawer-768-open.png` (22.6 KB) — Edge-anchored tablet drawer open via `Space` key (`x: 0, width: 256, height: 1024`)
    - `orders-1280.png` (31.5 KB) — Default un-focused view at 1280x800
    - `skip-link-focused.png` (31.2 KB) — Skip link visible on Tab focus
    - `orders-1920.png` (35.5 KB) — Default un-focused view at 1920x1080
    - `results.json` (4.2 KB) — Complete machine-readable test results including exact drawer geometry bounding boxes

## Recovery

- Decisions and tradeoffs:
  - In r3, replaced arbitrary Tailwind utility `max-w-[calc(100vw-3rem)]` with standard utility `max-w-full`. This eliminates all arbitrary bracket values from `mobile-nav.tsx` while preserving identical layout behavior: `w-sidebar` (256px) remains strictly smaller than viewport width on 375px and 768px viewports, rendering an edge-anchored left drawer panel of exactly 256px.
  - Respected user constraint strictly: only `src/components/layout/mobile-nav.tsx` and `docs/handoffs/session-07-r3.md` were touched in r3. `docs/ai-journal.md`, `.agents/tasks.json`, and `Modal` primitive remain untouched.
- Pre-existing failures versus new failures:
  - Pre-existing failure: `pnpm format:check` fails solely on pre-existing D6 files (`docs/delivery.md` and `docs/handoffs/session-03.md`) containing CRLF line endings. All files touched in Session 07 pass Prettier with zero style issues.
- Known issues, not-run checks and blockers:
  - None. All acceptance criteria and automated Playwright browser checks passed.
- Reproduction and next concrete action:
  - Next action: Codex reviews uncommitted changes, untracked files, and Playwright evidence on branch `feat/dashboard-shell`; user stages and commits after review approval.
  - Note: This is repair r3 approved by user. No r4 will be opened unless explicitly approved by the user.
- AI journal entry:
  - Preserved at r2 entry in `docs/ai-journal.md` (no edits made to journal in r3 per user instruction).
- Suggested next session (not executed):
  - Session 08 / step-9 (D9): Loading error not-found và điều hướng (`src/app/(dashboard)/orders/loading.tsx`, `orders/error.tsx`, `preferences/page.tsx`, `not-found.tsx`, verification of persistent layout between orders and preferences).

Leave this report and code uncommitted. The user stages/commits after Codex review.
Do not invent implementation/report SHAs; only baseline HEAD exists before the user commits.
Screenshots do not prove keyboard support; build success does not prove UI acceptance.
