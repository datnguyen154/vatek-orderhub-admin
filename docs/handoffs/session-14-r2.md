# Session 14 Repair r2 — step-16 — ready_for_review

- **Branch**: `feat/create-order-wizard`
- **Baseline SHA**: `4bd166f2793210d717bbfb335c0d7448efaa3465` (`origin/main`)
- **Review target**: Uncommitted working tree against baseline HEAD (staged is completely empty; all changes uncommitted and unstaged)
- **Changed/untracked files by task**:
  - Modified:
    - `messages/en.json` (Issue 3 & 5: added `orders.create.backToOrders` and ICU plural `orders.create.fieldsAttention`)
    - `messages/vi.json` (Issue 3 & 5: added `orders.create.backToOrders` and ICU plural `orders.create.fieldsAttention`)
    - `src/app/(dashboard)/orders/new/page.tsx` (Issue 5: "← Back to orders" ghost/sm link with inline SVG arrow)
    - `src/app/(dashboard)/orders/page.tsx` (Issue 6: inline "+" SVG inside "New order" button)
    - `src/components/ui/toaster.tsx` (Issue 4: Sonner `icons` prop with semantic SVGs, scoped `data-[type=default]` styles)
    - `src/features/orders/components/create-order-customer-step.tsx` (Issue 1 & 3: removed top error box and bottom button; preserved inline errors and focus)
    - `src/features/orders/components/create-order-items-step.tsx` (Issue 1 & 3: removed top error box and bottom buttons; preserved inline errors)
    - `src/features/orders/components/create-order-review-step.tsx` (Issue 1 & 3: removed top error box and bottom buttons; preserved secondary Edit buttons)
    - `src/features/orders/components/create-order-wizard.tsx` (Issue 1, 2, 3: shared sticky action bar at `sticky bottom-0`, compact 375px mobile stepper, action bar `role="alert"` ICU plural, scroll-stable validation)
    - `docs/ai-journal.md` (appended Session 14 Repair r2 entry)
  - Created:
    - `docs/handoffs/session-14-r2.md` (this repair report)
    - `output/playwright/session-14-r2/` (12 screenshots & `results.json`)
- **Objective and changed files**: Polish wizard UX based on user testing feedback across 6 specific issues (sticky action bar, responsive mobile stepper, scroll-stable validation alert, semantic toast theming, back navigation, and button icon) without modifying core mutation or schema logic.
- **Out-of-scope changes**: None (`tasks.json`, `.agents/*`, and week-1 labs remain untouched).

---

## 1. Issue → Fix → Evidence Table

| Issue ID       | Description from User Testing                                                                  | Fix Applied                                                                                                                                                                                                                                                                                                                                                                                                              | Verification Evidence & Observed Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| :------------- | :--------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Issue 1**    | Navigation buttons out of view; user must scroll down to continue and up to see current step   | Extracted navigation buttons from each step component into one shared sticky action bar inside `create-order-wizard.tsx` (`sticky bottom-0 z-10 border-t border-border bg-surface py-4 px-4 sm:px-6 shadow-sm`). Wrapped content in `min-h-[calc(100vh-14rem)] flex flex-col` and gave step area `pb-24` bottom padding so no content is obscured.                                                                       | `getBoundingClientRect().bottom <= innerHeight` verified at 375px, 768px, 1280px, and 1920px across all 3 steps. `noContentCovered: true` verified at bottom scroll.                                                                                                                                                                                                                                                                                                                                                                |
| **Issue 2**    | Content length differs per step causing button movement; stepper too tall on small screens     | Shared sticky action bar fixes button movement across varying content lengths. Below `sm` (375px), stepper renders as a single compact horizontal row (`sm:hidden`) showing step number, short title, and text status with `aria-current="step"`. Full 3-card layout preserved at `sm` and wider (`hidden sm:block`).                                                                                                    | `output/playwright/session-14-r2/mobile-stepper-375px.png` shows compact single-line row.                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Issue 3**    | Top error box pushes form down unexpectedly on validation failure                              | Removed large top `role="alert"` box from steps 1, 2, and 3. Retained inline error messages under invalid controls (`aria-invalid="true"`, `aria-describedby`) and control focus. Added short `role="alert"` ICU plural message inside sticky action bar (e.g. `1 field needs attention` / `1 trường cần chú ý`) that auto-clears on edit.                                                                               | Step 1 blocked Next: `scrollDelta = 0`, focused on `SELECT#customer-select`, alert text `"1 field needs attention"`. Step 2 blocked Next: `scrollDelta = 0`, focused on `INPUT[name='items.0.quantity']`. Evidence: `blocked-next-step1.png`, `blocked-next-step2.png`.                                                                                                                                                                                                                                                             |
| **Issue 4**    | Success toast icon is not green; base `bg-surface` conflicts with toast type background colors | Passed Sonner `icons` prop with semantic inline SVGs (`text-success`, `text-destructive`, `text-warning`, `text-primary`). Scoped base classes with `data-[type=default]:bg-surface data-[type=default]:text-foreground` and set `title: "text-inherit"`. Variant tokens (`bg-success-muted text-success-muted-foreground`, `bg-destructive-muted text-destructive-muted-foreground`) now render cleanly in both themes. | Measured computed colors in DOM:<br>• Light Success: icon `rgb(21, 128, 61)`, bg `rgb(220, 252, 231)`, text `rgb(22, 101, 52)`<br>• Light Error: icon `rgb(220, 38, 38)`, bg `rgb(254, 226, 226)`, text `rgb(153, 27, 27)`<br>• Dark Success: icon `rgb(22, 163, 74)`, bg `rgb(5, 46, 22)`, text `rgb(134, 239, 172)`<br>• Dark Error: icon `rgb(220, 38, 38)`, bg `rgb(69, 10, 10)`, text `rgb(252, 165, 165)`.<br>Evidence: `toast-success-light.png`, `toast-error-light.png`, `toast-success-dark.png`, `toast-error-dark.png`. |
| **Issue 5**    | No way back from wizard page (`/orders/new`) to orders list                                    | Added "← Back to orders" link above wizard header in `src/app/(dashboard)/orders/new/page.tsx` using `buttonVariants({ variant: "ghost", size: "sm" })`, inline SVG arrow (`aria-hidden`), and localized text (`t("backToOrders")`). Top-level nav routes do not have back links.                                                                                                                                        | Accessible name and navigation verified. Evidence: `output/playwright/session-14-r2/nav-back-to-orders.png`.                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Issue 6**    | "New order" button on `/orders` has no add icon                                                | Added inline "+" SVG (`h-4 w-4`, `aria-hidden`) before text in `src/app/(dashboard)/orders/page.tsx` inside the "New order" button with `gap-2`. Accessible name remains `"New order"`.                                                                                                                                                                                                                                  | Accessible name preserved as `"New order"`. Evidence: `output/playwright/session-14-r2/nav-new-order-button.png`.                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Regression** | Replay mutation flow and verify keyboard tab order                                             | Replayed items 5, 6, 7. Verified that Tab navigates through step inputs sequentially and then reaches sticky action bar buttons.                                                                                                                                                                                                                                                                                         | Keyboard tab: `customer-select` → `poNumber` → `Continue button`. Request counts: Item 5 = 1 POST; Item 6 = 1 POST (rollback exact match); Item 7 = 2 POSTs total (`idempotencyKey` `78726bbc-6206-4230-bad6-6d3c91f233d6` identical across attempts). Evidence: `item5-replay-success.png`, `item6-replay-rollback.png`, `item7-replay-success.png`.                                                                                                                                                                               |

---

## 2. Checks Suite

| Command                                             | Exit Code | Observed Result                                                                          |
| :-------------------------------------------------- | :-------: | :--------------------------------------------------------------------------------------- |
| `pnpm exec tsc --noEmit`                            |   **0**   | TypeScript 5.8.2 strict check passed with zero errors.                                   |
| `pnpm lint`                                         |   **0**   | ESLint passed with 0 errors (1 pre-existing warning at `public/mockServiceWorker.js:1`). |
| `pnpm build`                                        |   **0**   | Next.js 15.5.29 compiled all static and dynamic routes cleanly.                          |
| Scoped `pnpm exec prettier --check <touched_files>` |   **0**   | All touched and created files format-checked cleanly against Prettier rules.             |
| `git diff --check`                                  |   **0**   | Clean git diff, zero whitespace errors or unresolved markers.                            |
| `git diff --cached`                                 |   **0**   | Staging area completely empty (0 staged changes).                                        |

---

## 3. Touched UI & Responsive Measurements

| Route + state                   |    375 px (Mobile)    |     768 px (Tablet)     |   1280 px (Laptop)    |    1920 px (Desktop)    | Evidence Screenshot                                                                                  |
| :------------------------------ | :-------------------: | :---------------------: | :-------------------: | :---------------------: | :--------------------------------------------------------------------------------------------------- |
| `/orders/new` (Step 1 Customer) | Bar bottom: 652 ≤ 667 | Bar bottom: 1000 ≤ 1024 | Bar bottom: 800 ≤ 800 | Bar bottom: 1064 ≤ 1080 | `output/playwright/session-14-r2/mobile-stepper-375px.png`                                           |
| `/orders/new` (Step 2 Items)    | Bar bottom: 652 ≤ 667 | Bar bottom: 1024 ≤ 1024 | Bar bottom: 800 ≤ 800 | Bar bottom: 1080 ≤ 1080 | `output/playwright/session-14-r2/blocked-next-step2.png`                                             |
| `/orders/new` (Step 3 Review)   | Bar bottom: 652 ≤ 667 | Bar bottom: 1024 ≤ 1024 | Bar bottom: 800 ≤ 800 | Bar bottom: 1080 ≤ 1080 | `output/playwright/session-14-r2/item7-replay-success.png`                                           |
| `/orders/new` (Back link)       |  Visible, accessible  |   Visible, accessible   |  Visible, accessible  |   Visible, accessible   | `output/playwright/session-14-r2/nav-back-to-orders.png`                                             |
| `/orders` (+ New order button)  |  Visible, accessible  |   Visible, accessible   |  Visible, accessible  |   Visible, accessible   | `output/playwright/session-14-r2/nav-new-order-button.png`                                           |
| Sonner Toasts (Light & Dark)    |    Toast readable     |     Toast readable      |    Toast readable     |     Toast readable      | `toast-success-light.png`, `toast-error-light.png`, `toast-success-dark.png`, `toast-error-dark.png` |

### Detailed Viewport Measurements (Sticky Bar `bottom <= innerHeight`)

Across all breakpoints and steps, the action bar is inside the viewport without requiring initial scroll:

- **375px Viewport** (`innerHeight = 667`):
  - Step 1: `bottom = 652` (`<= 667` is true, content covered: false)
  - Step 2: `bottom = 652` (`<= 667` is true, content covered: false)
  - Step 3: `bottom = 652` (`<= 667` is true, content covered: false)
- **768px Viewport** (`innerHeight = 1024`):
  - Step 1: `bottom = 1000` (`<= 1024` is true, content covered: false)
  - Step 2: `bottom = 1024` (`<= 1024` is true, content covered: false)
  - Step 3: `bottom = 1024` (`<= 1024` is true, content covered: false)
- **1280px Viewport** (`innerHeight = 800`):
  - Step 1: `bottom = 800` (`<= 800` is true, content covered: false)
  - Step 2: `bottom = 800` (`<= 800` is true, content covered: false)
  - Step 3: `bottom = 800` (`<= 800` is true, content covered: false)
- **1920px Viewport** (`innerHeight = 1080`):
  - Step 1: `bottom = 1064` (`<= 1080` is true, content covered: false)
  - Step 2: `bottom = 1080` (`<= 1080` is true, content covered: false)
  - Step 3: `bottom = 1080` (`<= 1080` is true, content covered: false)

### Validation & Scroll Stability

- **Step 1 Blocked Next**:
  - `scrollY` before click: `0`
  - `scrollY` after click: `0` (`scrollDelta: 0`)
  - Focused element: `SELECT#customer-select[name='customerId']`
  - Sticky action bar alert: `"1 field needs attention"` (`role="alert"`)
- **Step 2 Blocked Next**:
  - `scrollY` before click: `375.2`
  - `scrollY` after click: `375.2` (`scrollDelta: 0`)
  - Focused element: `INPUT[name='items.0.quantity']`
  - Sticky action bar alert: `"1 field needs attention"` (`role="alert"`)

### Keyboard Tab Sequence

On Step 1, pressing Tab navigates:

1. `SELECT#customer-select[name='customerId']`
2. `INPUT#po-number[name='poNumber']`
3. `BUTTON[name='Continue to line items']` (inside the sticky action bar)

---

## 4. Toast Color Specificity Measurements

| Toast State       | Icon Color                              | Toast Background                              | Toast Text Color                                           | Verification Image        |
| :---------------- | :-------------------------------------- | :-------------------------------------------- | :--------------------------------------------------------- | :------------------------ |
| **Light Success** | `rgb(21, 128, 61)` (`text-success`)     | `rgb(220, 252, 231)` (`bg-success-muted`)     | `rgb(22, 101, 52)` (`text-success-muted-foreground`)       | `toast-success-light.png` |
| **Light Error**   | `rgb(220, 38, 38)` (`text-destructive`) | `rgb(254, 226, 226)` (`bg-destructive-muted`) | `rgb(153, 27, 27)` (`text-destructive-muted-foreground`)   | `toast-error-light.png`   |
| **Dark Success**  | `rgb(22, 163, 74)` (`text-success`)     | `rgb(5, 46, 22)` (`bg-success-muted`)         | `rgb(134, 239, 172)` (`text-success-muted-foreground`)     | `toast-success-dark.png`  |
| **Dark Error**    | `rgb(220, 38, 38)` (`text-destructive`) | `rgb(69, 10, 10)` (`bg-destructive-muted`)    | `rgb(252, 165, 165)` (`text-destructive-muted-foreground`) | `toast-error-dark.png`    |

---

## 5. Replay Verification Suite (Items 5, 6, 7 Re-Executed)

- **Item 5 (Optimistic Success)**:
  - 1 POST request `/api/orders`.
  - Optimistic `Saving…` badge rendered immediately during mock delay.
  - Replaced with server order row upon resolution.
- **Item 6 (Snapshot Rollback on Failure `?create=fail`)**:
  - 1 POST request `/api/orders` (500).
  - Snapshot rollback matched initial table state 100% (`rollbackExact: true`).
- **Item 7 (Retry with `fail-once` & Idempotency Key Reuse)**:
  - Resumed via "Review and retry" to `/orders/new?resume=1`.
  - Attempt 1 idempotencyKey: `78726bbc-6206-4230-bad6-6d3c91f233d6`.
  - Attempt 2 idempotencyKey: `78726bbc-6206-4230-bad6-6d3c91f233d6` (100% identical).
  - Total requests across fail and retry: Exactly 2 POSTs.
  - Final table has exactly 1 new order.

---

## 6. Recovery & Handoff Summary

- **Decisions and tradeoffs**:
  - Maintained `isOptimisticOrder(order) => order.id.startsWith("tmp_")` type guard and query cache retrieval without mock fixtures.
  - Used Tailwind responsive classes (`sm:hidden` and `hidden sm:block`) to cleanly swap mobile single-row stepper with desktop cards without hydration mismatches.
  - Used `data-[type=default]:...` in `toaster.tsx` to eliminate CSS precedence conflicts between Sonner defaults and custom semantic toast variants.
- **Pre-existing failures vs new failures**:
  - None. Only 1 pre-existing ESLint warning in `public/mockServiceWorker.js:1` (MSW generated file).
- **Known issues, not-run checks and blockers**:
  - **0 blockers**. All requested checks and evidence criteria passed completely.
- **AI journal entry**:
  - Documented under section `Session 14 Repair r2 (Final) — Step-16 / D13: Wizard UX Polish` in `docs/ai-journal.md`.
- **Suggested next session (not executed)**:
  - Session 15 / Step-17: Order detail page (`/orders/[id]`).

---

Leave this report and code uncommitted. The user stages/commits after Codex review.
Do not invent implementation/report SHAs; only baseline HEAD exists before the user commits.
Screenshots do not prove keyboard support; build success does not prove UI acceptance.
