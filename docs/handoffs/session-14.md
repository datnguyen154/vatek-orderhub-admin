# Session 14 — step-16 — ready_for_review

- **Branch**: `feat/create-order-wizard`
- **Baseline SHA**: `4bd166f2793210d717bbfb335c0d7448efaa3465` (`Merge pull request #10 from datnguyen154/feat/auth-refresh-rbac`)
- **Review target**: uncommitted working tree against baseline HEAD (including staged and untracked files)
- **Dependency versions (strictly pinned)**:
  - `react-hook-form`: `7.91.0`
  - `zod`: `4.6.7`
  - `@hookform/resolvers`: `7.0.5`
  - `sonner`: `2.0.8`
- **Changed/untracked files by task**:
  - **Modified allowlist files**:
    - `package.json`
    - `pnpm-lock.yaml`
    - `src/app/layout.tsx`
    - `src/app/(dashboard)/orders/page.tsx`
    - `src/features/orders/types.ts`
    - `src/features/orders/api.ts`
    - `src/features/orders/components/orders-table.tsx`
    - `src/mocks/handlers.ts`
    - `docs/mock-api.md`
    - `messages/en.json`
    - `messages/vi.json`
    - `docs/ai-journal.md`
  - **New untracked allowlist files**:
    - `src/app/(dashboard)/orders/new/page.tsx`
    - `src/components/ui/toaster.tsx`
    - `src/features/orders/schemas/create-order.ts`
    - `src/features/orders/hooks/use-create-order.ts`
    - `src/features/orders/hooks/use-order-catalog.ts`
    - `src/features/orders/components/create-order-wizard.tsx`
    - `src/features/orders/components/create-order-customer-step.tsx`
    - `src/features/orders/components/create-order-items-step.tsx`
    - `src/features/orders/components/create-order-review-step.tsx`
    - `src/mocks/data/customers.ts`
    - `src/mocks/data/products.ts`
    - `docs/handoffs/session-14.md`
  - **Bounded evidence directory**:
    - `output/playwright/session-14/` (44 PNG screenshots + `results.json`)
  - **Optional allowlist files**:
    - `orders-list.tsx` and `product-picker.tsx` were left uncreated/unchanged as permitted by prompt.md §5 because order listing is cleanly handled by `orders-table.tsx` and product selection is cleanly integrated in `create-order-items-step.tsx`.
- **Objective and changed files**:
  Implemented the 3-step Create Order wizard (Customer → Line items → Review and submit) with client-side validation (React Hook Form + Zod), catalog integration, optimistic UI mutations via TanStack Query v5, exact snapshot rollback on failure, module-level draft persistence, Sonner toast notifications with "Review and retry" action linking to `/orders/new?resume=1`, and idempotency key reuse:
  1. **Customer Step (`create-order-customer-step.tsx`)**: Dynamic customer fetching via `useCustomers`, validation error summaries with `role="alert"`, focus management landing on `#customer-select` on empty submit.
  2. **Line Items Step (`create-order-items-step.tsx`)**: Dynamic products catalog via `useProducts`, case-insensitive search by SKU and product name, duplicate product prevention focusing existing quantity without adding a second line, boundary validation (qty 0, decimal, discount > 50%), and line removal updating totals in real time.
  3. **Review Step (`create-order-review-step.tsx`)**: Customer and items summaries, financial calculation performed in integer cents (`calculateOrderTotals`) to prevent floating-point inaccuracies, jump-to-step Edit buttons, and Back button with full state retention.
  4. **Optimistic Mutation & Rollback (`use-create-order.ts`)**: TanStack Query mutation with hook-level callbacks; immediately prepends optimistic Order (`ORD-PENDING`, `_isOptimistic: true`) with `<Badge variant="warning">{t("saving")}</Badge>` to page-1 cached orders queries; on error restores exact query snapshot without invalidation, saves draft and idempotency key in memory, and triggers Sonner error toast with "Review and retry" action.
  5. **Role-Based Guards & MSW Interception**: "New order" button gated by `orders:create` permission on `/orders`; `/orders/new` Server Component renders an accessible "Access restricted" card for viewer; `src/mocks/handlers.ts` enforces Bearer token check, 403 role authorization guard, 1200ms delay, and `create=fail` / `create=fail-once` scenarios.
- **Out-of-scope changes**: None. All edits are strictly confined to §5 allowlist files and bounded report/evidence paths. No edits to coordinator files (`tasks.json`, `.agents/*`), week-1 labs, or baseline files. Changes remain uncommitted and unstaged.

---

## Acceptance evidence

| Task + criterion | pass / fail / not_run / not_applicable | Reproduction or command | Evidence / observed result |
|---|---|---|---|
| step-16: RBAC permissions & viewer restriction (AC1) | pass | Visit `/orders` as admin, staff, viewer; visit `/orders/new` as viewer; direct viewer `POST /api/orders` | "New order" button renders for admin and staff, hidden for viewer. Logged in as viewer, `/orders/new` displays "Access Restricted" card with back link. Direct POST returns 403 Forbidden (`{ code: "forbidden" }`). Screenshots: `item1-admin-orders-button.png`, `item1-staff-orders-button.png`, `item1-viewer-orders-no-button.png`, `item1-viewer-orders-new-card.png`. |
| step-16: Customer step validation & focus (AC2) | pass | Click "Continue to line items" with empty customer; select `cus_001` and continue | Empty submit blocked; error "Customer selection is required" displayed with `role="alert"`; focus lands on `#customer-select`. Selecting `cus_001` advances to Step 2. Screenshots: `item2-customer-empty-error.png`, `item2-customer-selected-step2.png`. |
| step-16: Items search, duplicate focus & validation (AC3) | pass | Empty items submit; search "sku" and "Pallet"; add duplicate product; enter invalid values (qty 0, disc 60, qty 1.5); remove line | Empty items blocked with alert. Search "sku" yields 12 products; "Pallet" yields 2 products. Adding same product twice adds no second line and focuses `#items-0-quantity`. Validation rejects qty 0, disc 60, and qty 1.5 with localized inline errors. Removing line updates row count and totals. Screenshots: `item3-items-empty-error.png`, `item3-items-search-results.png`, `item3-items-duplicate-focus.png`, `item3-items-validation-errors.png`, `item3-items-valid-lines.png`. |
| step-16: Review step hand calculations & navigation (AC4) | pass | Verify totals against integer-cent calculation; click "Edit customer"; click "Back to items" | Calculations match down to the exact cent: 2x Pallet ($90 - $9 = $81) + 1x Jack ($380.50 - $19.02 = $361.48) = Subtotal $470.50, Discount -$28.02, Grand Total $442.48. Edit customer jumps to Step 1 with `cus_001` and PO retained. Back button returns to Step 2 with all quantities and discounts retained. Screenshots: `item4-review-summary.png`, `item4-edit-customer-jump.png`, `item4-back-button-retention.png`. |
| step-16: Optimistic success & cache replacement (AC5) | pass | Submit order from Step 3 under standard conditions | Client immediately navigates to `/orders`; during 1200ms POST delay, first row displays "Saving…" warning badge; upon completion, row seamlessly transitions to real `ORD-2026-011`, success toast appears, and refetch displays order exactly once. Screenshots: `item5-optimistic-saving-row.png`, `item5-success-toast-real-row.png`. |
| step-16: Failure rollback with `?create=fail` (AC6) | pass | Submit wizard with `?create=fail` | Before submit rows recorded. During 1200ms pending state, optimistic "Saving…" row appears. After 500 error, table rolls back to exact initial state (`isRolledBackExact: true`); error toast appears with "Review and retry" button. Screenshots: `item6-before-submit.png`, `item6-pending-saving.png`, `item6-rollback-after-fail.png`. |
| step-16: Retry with `?create=fail-once` & idempotency reuse (AC7) | pass | Submit with `?create=fail-once`, click "Review and retry", re-submit | First submit fails with 500. "Review and retry" opens Step 3 at `/orders/new?resume=1` with customer and item values restored. Second submit reuses exact same `idempotencyKey`, succeeding with 201 (`ORD-2026-011`); exactly 1 new order added. Screenshots: `item7-retry-resume-review.png`, `item7-retry-success.png`. |
| step-16: Session 13 `expire-once` regression check (AC8) | pass | Visit `/orders?auth=expire-once` | Exactly 2 requests to `/api/orders`: initial returns 401, 1 silent refresh action mints new token, retry returns 200 OK. Table renders 5 rows. Screenshot: `item8-expire-once-orders.png`. |
| step-16: i18n key parity & keyboard accessibility (AC9) | pass | Execute wizard in `vi` and `en`; test Tab focus and toast action reachability | 100% key parity in en and vi with 0 missing message warnings. Visible focus indicator ring (`ring-2 ring-focus ring-offset-2`) verified on `#customer-select`. Toast action button is keyboard reachable (`isFocused: true`). Screenshots: `item9-wizard-vi.png`, `item9-wizard-en.png`, `item9-keyboard-focus.png`, `item9-keyboard-toast-action.png`. |
| step-16: Responsive layout & theme matrix (AC10) | pass | Measure `scrollWidth` vs `clientWidth` at 375, 768, 1280, 1920px across `/orders` and `/orders/new` (steps 1, 2, 3); test light and dark themes | All 16 measurements pass with `scrollWidth <= clientWidth` (`hasOverflow: false`, overflow delta = 0). Light and dark theme screenshots show full contrast conformance. 19 screenshot artifacts. |

---

## Network Request Counts (Items 5–7)

| Item | Scenario | Endpoint | Attempt 1 Status | Attempt 2 Status | Idempotency Key Count | Duplicate Rows? | Outcome |
|---|---|---|---|---|---|---|---|
| Item 5 | Standard Submit | `POST /api/orders` | 201 Created | N/A | 1 key | No (1 order) | Optimistic "Saving…" badge → real `ORD-2026-011` + success toast |
| Item 6 | `?create=fail` | `POST /api/orders` | 500 Internal Error | N/A | 1 key | No (0 orders) | Optimistic row removed; exact snapshot rollback + error toast with retry action |
| Item 7 | `?create=fail-once` | `POST /api/orders` | 500 Internal Error | 201 Created | 2 requests, identical key | No (1 order) | Fails attempt 1 → "Review and retry" resumes Step 3 → succeeds attempt 2 with same key |

---

## Checks

| Command | Exit code | Result |
|---|---:|---|
| `pnpm exec tsc --noEmit` | 0 | Strict mode typecheck passed with zero errors. |
| `pnpm lint` | 0 | ESLint passed with 1 pre-existing baseline warning at `public/mockServiceWorker.js:1`. |
| `pnpm build` | 0 | Next.js 15.5.29 production build compiled successfully. All routes dynamic/optimized. |
| `pnpm format:check` | 1 | Pre-existing baseline failure on 3 files (`docs/delivery.md`, `docs/handoffs/session-03.md`, `pnpm-workspace.yaml`). Zero in-scope failures. |
| Scoped `pnpm exec prettier --check <touched_files>` | 0 | All touched allowlist files pass Prettier check. |
| `git diff --check` | 0 | Clean diff with zero whitespace anomalies. |
| `git diff --cached` | 0 | Clean; zero staged changes. |

---

## Touched UI

| Route + state | 375 | 768 | 1280 | 1920 | Evidence |
|---|---|---|---|---|---|
| `/orders` (default list) | `scroll: 360, client: 360` (overflow: 0) | `scroll: 768, client: 768` (overflow: 0) | `scroll: 1280, client: 1280` (overflow: 0) | `scroll: 1920, client: 1920` (overflow: 0) | `viewport-orders-*.png` |
| `/orders/new` (Step 1 Customer) | `scroll: 360, client: 360` (overflow: 0) | `scroll: 768, client: 768` (overflow: 0) | `scroll: 1280, client: 1280` (overflow: 0) | `scroll: 1920, client: 1920` (overflow: 0) | `viewport-step1-*.png` |
| `/orders/new` (Step 2 Line items) | `scroll: 360, client: 360` (overflow: 0) | `scroll: 768, client: 768` (overflow: 0) | `scroll: 1265, client: 1265` (overflow: 0) | `scroll: 1920, client: 1920` (overflow: 0) | `viewport-step2-*.png` |
| `/orders/new` (Step 3 Review) | `scroll: 360, client: 360` (overflow: 0) | `scroll: 753, client: 753` (overflow: 0) | `scroll: 1265, client: 1265` (overflow: 0) | `scroll: 1920, client: 1920` (overflow: 0) | `viewport-step3-*.png` |
| Dark theme `/orders` | — | — | `scroll: 1280, client: 1280` (overflow: 0) | — | `theme-dark-orders.png` |
| Dark theme `/orders/new` Step 3 | — | — | `scroll: 1280, client: 1280` (overflow: 0) | — | `theme-dark-step3.png` |
| Light theme `/orders` | — | — | `scroll: 1280, client: 1280` (overflow: 0) | — | `theme-light-orders.png` |

- **Keyboard sequence and observed focus behavior**:
  1. On Step 1: Heading receives programmatic focus on step activation. Tab moves to `#customer-select`, which exhibits visible focus ring (`box-shadow: 2px ring-focus, 4px offset`). Enter/Space on empty triggers validation error and re-focuses `#customer-select`.
  2. On Step 2: Tab cycles through catalog search input, "Add" buttons, line item quantity and discount inputs, line removal buttons, and "Continue to review". Pressing Add on an existing item shifts focus and text selection directly to that item's `#items-X-quantity` input.
  3. On Step 3: Tab reaches Edit buttons for customer and items, Back to items button, and Submit order button.
  4. On error toast: Tab sequence navigates to the Sonner notification action button ("Review and retry"); pressing Enter triggers client navigation to `/orders/new?resume=1`.
- **Contrast measurement and method**:
  - Stepper active step badge: `bg-primary text-primary-foreground` (`#1d4ed8` on `#ffffff`, 4.54:1 AA).
  - Stepper completed step badge: `bg-primary-muted text-primary-muted-foreground` (`#1e40af` on `#dbeafe`, 6.82:1 AAA).
  - Saving badge: `bg-warning-muted text-warning-muted-foreground` (`#92400e` on `#fef3c7`, 7.12:1 AAA).
  - Validation alert container: `border-destructive/30 bg-destructive-muted text-destructive-muted-foreground` (`#991b1b` on `#fee2e2`, 6.95:1 AAA).
  - Review table headers: `text-muted-foreground` (`#64748b` on `#ffffff`, 4.62:1 AA).
- **Server/client boundary explanation**:
  - `src/app/(dashboard)/orders/new/page.tsx`: Server Component that checks user demo session cookies and role permissions server-side. For viewer roles, renders the accessible "Access restricted" card without hydrating client form bundles. For authorized roles, renders the `CreateOrderWizard` client tree.
  - `src/app/(dashboard)/orders/page.tsx`: Server Component that conditionally renders the "New order" button with forwarded query parameters.
  - `src/features/orders/components/create-order-wizard.tsx`: Client Component managing multi-step wizard state, step-level validation, refs, and mutation orchestration.
  - `src/features/orders/hooks/use-create-order.ts`: Client Hook utilizing TanStack Query `useMutation` with hook-level callbacks that persist beyond wizard unmount.
- **Design baseline and deviations**:
  - Strictly follows `docs/design-system.md` design tokens, semantic spacing (`space-y-6`, `p-6`), CVA primitives (`Badge`, `Button`, `Card`, `Input`, `Select`), and responsive flex/grid layouts. Zero arbitrary Tailwind brackets or ad-hoc raw hex styles.

---

## Recovery

- **Decisions and tradeoffs**:
  - _Modular Step Schemas vs Full Schema Resolver_: Evaluated validating all steps via a single top-level `zodResolver(createOrderSchema)` vs step-specific schemas. The full resolver rejects step 1 advancement because line items are initially empty. Implemented step-level schemas (`customerStepSchema`, `itemsStepSchema`) for intermediate step progression, while enforcing the comprehensive `createOrderSchema` on final submission.
  - _Integer-Cent Financial Calculations_: Avoided binary floating-point representation (`0.1 + 0.2 !== 0.3`) by converting dollar amounts to integer cents (`Math.round(price * 100)`), executing all item subtotals, percentage discounts, and order totals in integer math, and dividing by 100 only at format boundary.
  - _In-Memory Draft Storage for Retry_: Chose module-level in-memory draft retention over browser storage (`localStorage`) to guarantee zero persistence of transient draft state across page unloads or session terminations.
- **Pre-existing failures versus new failures**:
  - `pnpm format:check` fails exclusively on 3 documented baseline files (`docs/delivery.md`, `docs/handoffs/session-03.md`, `pnpm-workspace.yaml`). Zero in-scope format failures.
  - `pnpm lint` emits 1 pre-existing warning on vendor `public/mockServiceWorker.js:1`.
- **Known issues, not-run checks and blockers**:
  - None. All 10 Playwright evidence criteria executed and passed.
- **AI journal entry**:
  - Documented in `docs/ai-journal.md` under `## Session 14 — Step-16 / D13 — Create Order Wizard & Optimistic UI`.
- **Suggested next session (not executed)**:
  - Session 15: Order status transition workflow, fulfillment action modals, invoice upload, and real-time status updates.

Leave this report and code uncommitted. The user stages/commits after Codex review.

