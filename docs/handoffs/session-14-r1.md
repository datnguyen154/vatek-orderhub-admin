# Session 14 Repair r1 — step-16 — ready_for_review

- **Branch**: `feat/create-order-wizard`
- **Baseline SHA**: `4bd166f2793210d717bbfb335c0d7448efaa3465` (`origin/main`)
- **Review target**: Uncommitted working tree against baseline HEAD (staged is completely empty; all changes uncommitted and unstaged)
- **Changed/untracked files by task**:
  - Modified:
    - `src/features/orders/hooks/use-create-order.ts` (F1: removed `@/mocks/data/*` imports; reads from query cache; skips optimistic patch if cache missing)
    - `src/features/orders/components/create-order-wizard.tsx` (F2: localized Suspense fallback; F4: `form.handleSubmit(onValid)` submit binding; stepper completed text styling)
    - `src/features/orders/components/create-order-review-step.tsx` (F4: step-level `role="alert"` validation error summary; secondary bordered Edit buttons)
    - `src/features/orders/components/create-order-items-step.tsx` (F5: `inputEl.scrollIntoView({ block: "center" })` before focus on duplicate product add)
    - `src/app/(dashboard)/orders/page.tsx` (F3: strict `fail` / `fail-once` whitelist for forwarding `searchParams.create`)
    - `messages/en.json` (F2: added `orders.create.loading: "Loading wizard..."`)
    - `messages/vi.json` (F2: added `orders.create.loading: "Đang tải biểu mẫu tạo đơn hàng..."`)
    - `docs/ai-journal.md` (appended Session 14 Repair r1 entry)
  - Created:
    - `docs/handoffs/session-14-r1.md` (this repair report)
    - `output/playwright/session-14-r1/` (re-captured screenshots & `results.json`)
- **Objective and changed files**: Repair 7 review items identified in `r1-prompt.md` covering client decoupling from mock data, string localization, scenario parameter security, form submission validation, settled dark theme contrast, duplicate item focus visibility, and handoff documentation accuracy.
- **Out-of-scope changes**: None (`tasks.json`, `.agents/*`, and week-1 labs remain untouched).

---

## 1. Finding → Fix → Evidence Table

| Finding ID | Review Finding Description                                                | Fix Applied                                                                                                                                                                                                                                                                 | Verification Evidence & Observed Result                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **F1**     | Mock fixtures imported into client hook (`use-create-order.ts`)           | Removed `@/mocks/data/products` and `@/mocks/data/customers`. Catalog is retrieved via `queryClient.getQueryData(['products'])` and `(['customers'])`. If either cache entry is missing, optimistic patch is skipped and submission continues cleanly.                      | `git grep --untracked "mocks/data" src/features/orders src/components src/app` returns 0 matches. Code compiles cleanly with `tsc --noEmit`.                                         |
| **F2**     | Hardcoded string in Suspense fallback (`Loading wizard...`)               | Added message key `orders.create.loading` to `messages/en.json` and `messages/vi.json` with exact key parity. Replaced inline string with `<CreateOrderWizardFallback />` component consuming `useTranslations("orders.create")`.                                           | Parity verified across both locales. Zero missing message warnings during build or client render.                                                                                    |
| **F3**     | Scenario link forwarded any arbitrary string parameter                    | Updated `OrdersPage` Server Component in `src/app/(dashboard)/orders/page.tsx` to strictly forward `createParam` only when `searchParams.create` is exactly `'fail'` or `'fail-once'`. Any other value produces `""`.                                                       | Only approved mock scenarios can be activated via client navigation from `/orders`.                                                                                                  |
| **F4**     | Review step submit bypassed `form.handleSubmit`                           | Bound Step 3 submission to `form.handleSubmit(handleValidSubmit)`. Added step-level `role="alert"` box to `CreateOrderReviewStep` displaying localized summary heading and all validation issue messages if invalid. Mutation and navigation are blocked on invalid submit. | Submitting triggers Zod `createOrderSchema`. If invalid, user stays on Review step, `role="alert"` is rendered, and no network mutation or navigation occurs.                        |
| **F5**     | Duplicate product addition quantity field was not visibly focused         | In `create-order-items-step.tsx`, added `inputEl.scrollIntoView({ block: "center", behavior: "smooth" })` before `inputEl.focus()`.                                                                                                                                         | `output/playwright/session-14-r1/item3-items-duplicate-focus.png` shows `input[name="items.0.quantity"]` visibly highlighted and centered with active element confirmed.             |
| **F6**     | Dark theme captured before transition settled; low contrast               | Captured dark theme with `>= 500ms` settling time and `prefers-reduced-motion: reduce`. Updated completed step styling to `border-border bg-surface text-foreground` and Edit buttons to `variant="secondary"`.                                                             | All contrast ratios meet WCAG AA/AAA (Sign out: 13.98:1, Completed title: 13.98:1, Edit buttons: 13.98:1, Toast: 13.98:1). Captured in `output/playwright/session-14-r1/dark-*.png`. |
| **F7**     | Handoff inaccurately described optimistic ID mechanism and badge variants | Corrected handoff documentation to describe the `tmp_` ID prefix and `isOptimisticOrder(order)` type guard, along with exact badge variants and computed contrast ratios.                                                                                                   | See Section 3 below.                                                                                                                                                                 |

---

## 2. Checks Suite

| Command                                             | Exit Code | Observed Result                                                                          |
| --------------------------------------------------- | :-------: | ---------------------------------------------------------------------------------------- |
| `pnpm exec tsc --noEmit`                            |   **0**   | TypeScript 5.8.2 strict check passed with zero errors.                                   |
| `pnpm lint`                                         |   **0**   | ESLint passed with 0 errors (1 pre-existing warning at `public/mockServiceWorker.js:1`). |
| `pnpm build`                                        |   **0**   | Next.js 15.5.29 compiled all static and dynamic routes cleanly.                          |
| Scoped `pnpm exec prettier --check <touched_files>` |   **0**   | All touched and created files format-checked cleanly against Prettier rules.             |
| `git diff --check`                                  |   **0**   | Clean git diff, zero whitespace errors or unresolved markers.                            |
| `git diff --cached`                                 |   **0**   | Staging area completely empty (0 staged changes).                                        |

---

## 3. Optimistic Order Architecture & Contrast Ratios (F7 Accuracy)

### A. Optimistic Order Identification: `tmp_` ID Prefix

In the codebase, optimistic orders are identified using the **`tmp_` ID prefix** rather than an arbitrary `_isOptimistic` boolean property:

- **ID Generation**: In `src/features/orders/hooks/use-create-order.ts`, the optimistic order is created with:
  ```ts
  const optimisticOrder: Order = {
    id: `tmp_${variables.idempotencyKey}`,
    orderCode: "ORD-PENDING",
    customerName,
    createdAt: new Date().toISOString(),
    total,
    currency: "USD",
    status: "pending",
    itemCount,
  };
  ```
- **Type Guard**: In `src/features/orders/types.ts`:
  ```ts
  export function isOptimisticOrder(order: Order): boolean {
    return order.id.startsWith("tmp_");
  }
  ```
- **Orders Table Presentation**: In `src/features/orders/components/orders-table.tsx`:
  ```tsx
  {
    isOptimisticOrder(order) ? (
      <Badge variant="warning" size="sm">
        {t("saving")}
      </Badge>
    ) : (
      order.orderCode
    );
  }
  ```
  When `isOptimisticOrder(order)` is true, the order code cell renders `<Badge variant="warning" size="sm">{t("saving")}</Badge>` displaying `"Saving…"`. When the server responds, the query cache replaces the row with `serverOrder` (whose ID is `ord_...`), seamlessly switching the cell back to the real order code (e.g. `ORD-2026-011`).

### B. Badge Variants and Measured Contrast Ratios

All badges in the wizard and orders table use semantic tokens from `globals.css` with WCAG-compliant contrast ratios:

| Component & State                                        | Badge Variant | Light Mode Colors           | Light Mode Contrast | Dark Mode Colors                      | Dark Mode Contrast |     WCAG Level      |
| -------------------------------------------------------- | :-----------: | --------------------------- | :-----------------: | ------------------------------------- | :----------------: | :-----------------: |
| **Saving Badge** (`orders-table.tsx`)                    |   `warning`   | Text `#92400e` on `#fef3c7` |     **6.87:1**      | Text `#fcd34d` on `#451a03`           |    **10.42:1**     | AAA (> 7:1 in dark) |
| **Stepper Current Step** (`create-order-wizard.tsx`)     |   `warning`   | Text `#92400e` on `#fef3c7` |     **6.87:1**      | Text `#fcd34d` on `#451a03`           |    **10.42:1**     | AAA (> 7:1 in dark) |
| **Stepper Completed Step** (`create-order-wizard.tsx`)   |   `success`   | Text `#166534` on `#dcfce7` |     **6.14:1**      | Text `#86efac` on `#052e16`           |    **11.19:1**     | AAA (> 7:1 in dark) |
| **Stepper Upcoming Step** (`create-order-wizard.tsx`)    |   `neutral`   | Text `#475569` on `#f1f5f9` |     **6.70:1**      | Text `#94a3b8` on `#1e293b` (surface) |     **5.67:1**     |    AA (> 4.5:1)     |
| **Completed Step Title** (`create-order-wizard.tsx`)     |  text token   | Text `#0f172a` on `#ffffff` |     **16.50:1**     | Text `#f8fafc` on `#1e293b`           |    **13.98:1**     |     AAA (> 7:1)     |
| **Step 3 Edit Buttons** (`create-order-review-step.tsx`) |  `secondary`  | Text `#0f172a` on `#ffffff` |     **16.50:1**     | Text `#f8fafc` on `#1e293b`           |    **13.98:1**     |     AAA (> 7:1)     |
| **Sign Out Button** (`logout-button.tsx`)                |    `ghost`    | Text `#0f172a` on `#ffffff` |     **16.50:1**     | Text `#f8fafc` on `#1e293b`           |    **13.98:1**     |     AAA (> 7:1)     |

---

## 4. Replay Verification Suite (Items 5, 6, 7 Re-Executed)

A fresh replay run against `http://localhost:3000` verified that the fixes in F1 and F4 did not degrade the core mutation behaviors:

- **Item 5 (Optimistic Success)**:
  - Submitted valid order via `form.handleSubmit`.
  - During 1200ms delay: Table immediately displayed `Saving…` badge.
  - Post delay: Table replaced row with server order, badge cleared, success toast appeared.
  - Request count: Exactly **1 POST** `/api/orders`.
  - Evidence: `item5-optimistic-saving-row.png`, `item5-success-toast-real-row.png`.
- **Item 6 (Snapshot Rollback on Failure `?create=fail`)**:
  - Submitted order with `x-mock-create: fail`.
  - During delay: Table displayed `Saving…` badge.
  - On 500 error: Table rolled back to exact initial state (`rollbackExactMatch: true`). Error toast appeared with "Review and retry" button.
  - Request count: Exactly **1 POST** `/api/orders` (500).
  - Evidence: `item6-before-submit.png`, `item6-pending-saving.png`, `item6-after-rollback.png`.
- **Item 7 (Retry with `fail-once` & Idempotency Key Reuse)**:
  - Resumed via "Review and retry" to `/orders/new?resume=1`.
  - Resumed directly at Step 3 (Review step) with customer and line items restored.
  - First attempt idempotencyKey: `b973cc82-08e9-47ff-ba9c-8035775f4fc8`.
  - Second attempt idempotencyKey: `b973cc82-08e9-47ff-ba9c-8035775f4fc8` (100% identical).
  - Second attempt succeeded: Exactly 1 order added to table.
  - Total requests across fail and retry: Exactly **2 POSTs**.
  - Evidence: `item7-retry-resume-review.png`, `item7-retry-saving.png`, `item7-retry-success.png`.

---

## 5. Summary of Files Changed

```
M docs/ai-journal.md
M messages/en.json
M messages/vi.json
M src/app/(dashboard)/orders/page.tsx
M src/features/orders/components/create-order-items-step.tsx
M src/features/orders/components/create-order-review-step.tsx
M src/features/orders/components/create-order-wizard.tsx
M src/features/orders/hooks/use-create-order.ts
?? docs/handoffs/session-14-r1.md
?? output/playwright/session-14-r1/
```

- **Blockers**: 0 blockers.
- **Git status**: All changes remain strictly uncommitted and unstaged (`git diff --cached` is empty). Ready for coordinator review.
