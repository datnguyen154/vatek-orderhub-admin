# Session 17 — step-19 / D15 — ready_for_review

- **Branch**: `test/ci-gate`
- **Baseline SHA**: `a9da5466640ec3177dd8c60d5e089d2e9e49a3ed` (`Merge pull request #14 from datnguyen154/chore/ui-polish`)
- **Review target**: uncommitted working tree against baseline HEAD (including staged and untracked files)
- **Dependency versions (strictly pinned devDependencies)**:
  - `vitest`: `3.0.8`
  - `@vitejs/plugin-react`: `4.3.4`
  - `jsdom`: `26.0.0`
  - `@testing-library/react`: `16.2.0`
  - `@testing-library/user-event`: `14.6.1`
  - `@testing-library/jest-dom`: `6.6.3`
  - `@playwright/test`: `1.51.0`
- **Changed allowlist files**:
  - `next.config.ts` (added `distDir: process.env.NEXT_DIST_DIR || ".next"`)
  - `package.json` (pinned devDependencies & scripts `"test": "vitest"`, `"test:e2e": "playwright test"`)
  - `pnpm-lock.yaml` (updated with exact frozen lockfile)
  - `pnpm-workspace.yaml` (appended single final newline)
  - `tsconfig.json` (automatic distDir line from Next.js build)
  - `.gitignore` (added `/.next-*/`, `/test-results/`, `/playwright-report/`, `/blob-report/`)
  - `.prettierignore` (added `.next-*`, `test-results`, `playwright-report`, `blob-report`, pre-existing handoffs)
  - `eslint.config.mjs` (added `".next-*/**"`, `"test-results/**"`, `"playwright-report/**"`, `"blob-report/**"`)
  - `vitest.config.ts` (Vitest configuration with jsdom, react plugin, path aliases)
  - `vitest.setup.ts` (MSW server setup, browser stubs, navigation and auth mocks, TestProviders)
  - `src/features/auth/components/login-form.test.tsx` (2 component tests)
  - `src/features/orders/components/orders-filters.test.tsx` (2 component tests)
  - `src/features/orders/components/orders-list.test.tsx` (3 component tests)
  - `src/features/orders/components/create-order-wizard.test.tsx` (2 component tests)
  - `src/features/orders/components/order-detail.test.tsx` (2 component tests)
  - `src/features/orders/components/order-status-control.test.tsx` (3 component tests)
  - `src/features/orders/components/invoice-upload.test.tsx` (2 component tests)
  - `src/features/reports/components/daily-sales-report.test.tsx` (3 component tests)
  - `playwright.config.ts` (Playwright configuration on port 3100, `.next-e2e` distDir, 180s timeout)
  - `e2e/week-3-orders-flow.spec.ts` (full Week 3 orders user journey spec)
  - `.github/workflows/ci.yml` (GitHub Actions CI gate workflow)
  - `docs/ai-journal.md` (appended D15 entry)
  - `docs/handoffs/session-17.md` (this handoff file)
- **Evidence generated**:
  - `output/playwright/session-17/01-login-page.png`
  - `output/playwright/session-17/02-filtered-orders.png`
  - `output/playwright/session-17/03-order-detail-before.png`
  - `output/playwright/session-17/04-order-detail-after.png`
  - `output/playwright/session-17/05-orders-list-updated.png`
  - `output/playwright/session-17/index.html` (Playwright HTML test report)
- **Out-of-scope changes**: None. Application source code in `src/` outside tests was not modified.

---

## 1. Acceptance Evidence & Test Inventory

| File                                                           | Tests | What each test asserts                                                                                                                                                                                                                                     |
| -------------------------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/auth/components/login-form.test.tsx`             | 2     | 1. Inline errors for invalid email & 7-char password, blocks submit.<br>2. Submits valid credentials and calls `loginAction`.                                                                                                                              |
| `src/features/orders/components/orders-filters.test.tsx`       | 2     | 1. Selecting status and typing search updates URL via `mockRouter.replace`.<br>2. Clicking "Clear all" resets query parameters.                                                                                                                            |
| `src/features/orders/components/orders-list.test.tsx`          | 3     | 1. Renders fixture table rows with code, customer, status (`within(table)`).<br>2. Renders empty state with `scenario=empty`.<br>3. Renders error state with `scenario=error`, retry refetches.                                                            |
| `src/features/orders/components/create-order-wizard.test.tsx`  | 2     | 1. Blocks Step 1 Next when customer is omitted, shows "Customer selection is required" alert.<br>2. Adding product and advancing to Step 3 Review shows "$45.00" and "Total Amount".                                                                       |
| `src/features/orders/components/order-detail.test.tsx`         | 2     | 1. Summary fields and activity timeline events for `ord_001`.<br>2. Displays "Order Not Found" for unknown order id.                                                                                                                                       |
| `src/features/orders/components/order-status-control.test.tsx` | 3     | 1. Initial placeholder with Update disabled; selecting "processing" enables it; successful update shows success toast.<br>2. Selecting "cancelled" opens confirmation dialog.<br>3. Viewer role renders read-only notice without status controls.          |
| `src/features/orders/components/invoice-upload.test.tsx`       | 2     | 1. File over 5 MB or non-PDF shows inline error, sends no request.<br>2. Simulates 500 upload error -> renders error alert, retry button is enabled.                                                                                                       |
| `src/features/reports/components/daily-sales-report.test.tsx`  | 3     | 1. With range `from=2026-10-01&to=2026-10-31`, KPI tiles display `$26,804.58`, `437`, `$65.22`, and `5.9%`.<br>2. `from > to` displays inline error and prevents request.<br>3. Export CSV button is visible for `admin` role and absent for `staff` role. |
| `e2e/week-3-orders-flow.spec.ts`                               | 1     | Full user journey: Login staff -> filter Status=Pending -> view ORD-2026-002 -> update status to Processing -> toast verified -> back to `/orders` -> table reflects Processing.                                                                           |

Total Vitest suites: 8 files, 19 tests. All passed.  
Total Playwright suites: 1 file, 1 test. Passed.

---

## 2. "Proved it fails" Records

Each of the 8 component test suites was proven to fail by temporarily introducing a broken assertion/selector, running vitest, recording the exact failure, and reverting to the passing expectation:

1. **`login-form.test.tsx`**:
   - Mutation: `expect(screen.getByText("BROKEN EXPECTATION")).toBeInTheDocument()`
   - Failure: `TestingLibraryElementError: Unable to find an element with the text: BROKEN EXPECTATION.`
2. **`orders-filters.test.tsx`**:
   - Mutation: `screen.getByRole("button", { name: "BROKEN Clear all" })`
   - Failure: `TestingLibraryElementError: Unable to find an accessible element with the role "button" and name "BROKEN Clear all"`
3. **`orders-list.test.tsx`**:
   - Mutation: `screen.getByText("BROKEN No orders found.")`
   - Failure: `TestingLibraryElementError: Unable to find an element with the text: BROKEN No orders found.`
4. **`create-order-wizard.test.tsx`**:
   - Mutation: `screen.getByText("BROKEN Customer selection is required.")`
   - Failure: `TestingLibraryElementError: Unable to find an element with the text: BROKEN Customer selection is required.`
5. **`order-detail.test.tsx`**:
   - Mutation: `screen.getByText("BROKEN Order Summary.")`
   - Failure: `TestingLibraryElementError: Unable to find an element with the text: BROKEN Order Summary.`
6. **`order-status-control.test.tsx`**:
   - Mutation: `screen.getByText("BROKEN Read-only access.")`
   - Failure: `TestingLibraryElementError: Unable to find an element with the text: BROKEN Read-only access.`
7. **`invoice-upload.test.tsx`**:
   - Mutation: `expect(errorAlert).toHaveTextContent("BROKEN Invoice upload failed.")`
   - Failure: `Error: expect(element).toHaveTextContent() - Expected element to have text content: BROKEN Invoice upload failed. Received: Invoice upload failed. Please try again.Retry upload`
8. **`daily-sales-report.test.tsx`**:
   - Mutation: `screen.findByText("BROKEN $26,804.58")`
   - Failure: `TestingLibraryElementError: Unable to find an element with the text: BROKEN $26,804.58.`

---

## 3. Local CI Step Table

| Step                      | Command                                                   | Exit Code | Result / Note                                                         |
| ------------------------- | --------------------------------------------------------- | --------- | --------------------------------------------------------------------- |
| 1. Typecheck              | `pnpm exec tsc --noEmit`                                  | `0`       | Clean compilation across all `.ts` and `.tsx` files.                  |
| 2. Lint                   | `pnpm lint`                                               | `0`       | Zero errors; 1 pre-existing warning on `public/mockServiceWorker.js`. |
| 3. Format check           | `pnpm format:check`                                       | `0`       | All matched files use Prettier code style repository-wide.            |
| 4. Unit / Component tests | `pnpm test -- --run`                                      | `0`       | 8 files passed, 19 tests passed in ~16s.                              |
| 5. Playwright E2E         | `pnpm exec playwright test`                               | `0`       | 1 test passed; webServer started on 3100 using `.next-e2e`.           |
| 6. Production build check | `$env:NEXT_DIST_DIR=".next-check"; pnpm build`            | `0`       | Clean build in `.next-check` verifying Rule 30 safety.                |
| 7. Git whitespace check   | `git diff --check`                                        | `0`       | Clean diff with zero whitespace anomalies.                            |
| 8. Duplicate export scan  | powershell AST scan                                       | `0`       | Zero duplicate export declarations across touched files.              |
| 9. Workflow validation    | `pnpm dlx @action-validator/cli .github/workflows/ci.yml` | `0`       | Workflow YAML syntax and GitHub Actions schema validated.             |

---

## 4. Gate 3 Run Sheet

A repeatable ~45-minute verification journey for the user:

### Part 1: Authenticated path on Slow 3G (DevTools → Network → Slow 3G)

1. **Login (`/login`)**:
   - Navigate to `http://localhost:3000/login` with Slow 3G enabled in Chrome DevTools.
   - Enter `staff@orderhub.test` and any 8+ character password.
   - Click "Sign in". Observe the button entering pending state with disabled pointer events.
   - Upon redirect, observe `/orders` rendering `orders/loading.tsx` skeleton placeholders (table header, shimmer row skeletons) before fixture data populates.
2. **Orders List (`/orders`)**:
   - In filter toolbar, select Status = "Pending".
   - Observe subtle refreshing indicator while query is fetching without clearing the current view.
   - Observe filtered rows settling with warning badges on "Pending".
3. **Order Detail (`/orders/ord_002`)**:
   - Click order code `ORD-2026-002`.
   - Observe the detail route displaying loading skeletons, then resolving summary fields and activity timeline events.
4. **Status Change**:
   - On the fulfillment status control card, note "Current: Pending".
   - Open "Next Status" dropdown and select "Processing". Observe "Update status" button transition from disabled to enabled.
   - Click "Update status". Observe the button enter pending state ("Updating...").
   - Upon completion, observe Sonner success toast ("Order status updated to processing") and current status badge updating to neutral "Processing".
5. **Daily Sales Report (`/reports/daily-sales`)**:
   - Click "Daily Sales" in navigation.
   - Observe 4 KPI skeleton shimmers and chart skeleton while data fetches over Slow 3G.
   - Once resolved, verify 4 KPI tiles populated ($26,804.58, 437, $65.22, 5.9%) and Recharts bar chart visible.

### Part 2: Deliberate Mock Failure Matrix

| Target / LocalStorage key or Query                          | Setting                   | Expected Visible Handling                                                                                                                                                 | Recovery                                                                                                                                  |
| ----------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `?scenario=error` on `/orders`                              | Set in URL query          | Full-screen error alert banner: "Simulated upstream database connection failure" with destructive Retry button.                                                           | Remove query parameter or click Retry after clearing.                                                                                     |
| `localStorage.setItem("orderhub_mock_create", "fail")`      | `/orders/new` wizard      | On Step 3 submission: 1200ms delay, rollback of optimistic "Saving…" row, error toast "Failed to create order. Please try again." with "Review and retry" button.         | Click "Review and retry" to resume wizard with input data preserved; run `localStorage.removeItem("orderhub_mock_create")` and re-submit. |
| `localStorage.setItem("orderhub_mock_status", "fail")`      | `/orders/ord_002`         | On clicking Update status: 800ms delay, red destructive error toast "Failed to update order status. Please try again.", status select remains on chosen option for retry. | Run `localStorage.removeItem("orderhub_mock_status")` and click Update status again.                                                      |
| `localStorage.setItem("orderhub_mock_upload", "fail")`      | `/orders/ord_002` invoice | Select valid PDF and click Upload: 600ms delay, inline alert banner `role="alert"`: "Invoice upload failed. Please try again.", "Retry upload" button enabled.            | Run `localStorage.removeItem("orderhub_mock_upload")` and click "Retry upload".                                                           |
| `localStorage.setItem("orderhub_mock_report", "fail")`      | `/reports/daily-sales`    | 400ms delay, error card: "Unable to load sales report" with "Retry" button. All 4 KPI cards display em-dash "—".                                                          | Run `localStorage.removeItem("orderhub_mock_report")` and click "Retry".                                                                  |
| `localStorage.setItem("orderhub_mock_auth", "expire-once")` | Any authenticated route   | First API request returns 401; silent refresh action automatically mints new demo token and transparently retries with 200 OK without user disruption.                    | Automatic recovery via single retry.                                                                                                      |

### Part 3: Cache and Invalidation Matrix (D11)

| Query Key                                                                      | `staleTime` / `gcTime`                                                                      | Invalidated By                                                                             | File & Line Citation                                                                                                                                                             | Rationale for `refetchOnWindowFocus: false`                                                                                                                                                                        |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `["orders", { page, pageSize, status, search, startDate, endDate, scenario }]` | `60s` / `5min`                                                                              | Order creation (`createOrder` mutation); status transition (`updateOrderStatus` mutation). | `src/features/orders/hooks/use-orders.ts#L101-L102`<br>`src/features/orders/components/order-status-control.tsx#L80`                                                             | Local administrative workflow involves frequent tab switching between documentation, invoices, and console; disabling window focus refetch prevents unexpected layout jumps and unnecessary mock re-interceptions. |
| `["order", orderId]`                                                           | `60s` / default                                                                             | Status transition (`updateOrderStatus`); invoice upload (`uploadInvoice`).                 | `src/features/orders/hooks/use-order-detail.ts#L28`<br>`src/features/orders/components/order-status-control.tsx#L79`<br>`src/features/orders/components/invoice-upload.tsx#L128` | Avoids thrashing single-order detail query while operators examine external PDF documents or reference tabs.                                                                                                       |
| `["reports", "daily", from, to, scenario]`                                     | `60s` / `5min`                                                                              | Date range input change (`handleApply`).                                                   | `src/features/reports/hooks/use-daily-sales-report.ts#L56-L57`                                                                                                                   | Analytical report aggregates are heavy; retaining cached calculations during tab changes preserves smooth charting responsiveness.                                                                                 |
| Global QueryClient Defaults                                                    | `staleTime: 60s`<br>`gcTime: 5min`<br>`refetchOnWindowFocus: false`<br>`retry: 2 (non-4xx)` | Explicit invalidations across feature hooks.                                               | `src/components/providers/query-provider.tsx#L24-L42`                                                                                                                            | Application-wide policy for B2B console stability.                                                                                                                                                                 |

---

## 5. Verification Command Outputs (§9)

### 9.1. `pnpm exec tsc --noEmit`

```
Exit code: 0
(Clean output, 0 errors)
```

### 9.2. `pnpm lint`

```
$ eslint .

D:\vatek-labs\orderhub-admin-console\public\mockServiceWorker.js
  1:1  warning  Unused eslint-disable directive (no problems were reported)

✖ 1 problem (0 errors, 1 warning)
  0 errors and 1 warning potentially fixable with the `--fix` option.

Exit code: 0
```

### 9.3. `pnpm format:check`

```
$ prettier --check .
Checking formatting...
All matched files use Prettier code style!

Exit code: 0
```

### 9.4. `pnpm test -- --run`

```
$ vitest "--run"

 RUN  v3.0.8 D:/vatek-labs/orderhub-admin-console

 ✓ src/features/orders/components/invoice-upload.test.tsx (2 tests) 470ms
 ✓ src/features/orders/components/order-detail.test.tsx (2 tests) 478ms
 ✓ src/features/orders/components/orders-filters.test.tsx (2 tests) 1006ms
 ✓ src/features/orders/components/orders-list.test.tsx (3 tests) 725ms
 ✓ src/features/auth/components/login-form.test.tsx (2 tests) 1140ms
 ✓ src/features/orders/components/create-order-wizard.test.tsx (2 tests) 1227ms
 ✓ src/features/orders/components/order-status-control.test.tsx (3 tests) 1514ms
 ✓ src/features/reports/components/daily-sales-report.test.tsx (3 tests) 1826ms

 Test Files  8 passed (8)
      Tests  19 passed (19)
   Start at  15:28:10
   Duration  16.43s (transform 1.46s, setup 15.95s, collect 19.39s, tests 8.38s, environment 19.25s, prepare 3.99s)

Exit code: 0
```

### 9.5. `pnpm exec playwright test`

```
Running 1 test using 1 worker

[1/1] [chromium] › e2e\week-3-orders-flow.spec.ts:15:7 › Week 3 Orders Flow E2E › full orders flow: login, filter, view detail, update status, and verify in list
  1 passed (40.8s)

Exit code: 0
```

### 9.6. `$env:NEXT_DIST_DIR=".next-check"; pnpm build`

```
$ next build
   ▲ Next.js 15.5.29
   - Environments: .env.local

   Creating an optimized production build ...
 ✓ Compiled successfully in 6.0s
   Linting and checking validity of types ...
   Collecting page data ...
 ✓ Generating static pages (10/10)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                 Size  First Load JS
┌ ƒ /                                      131 B         103 kB
├ ƒ /_not-found                            131 B         103 kB
├ ƒ /components                          3.68 kB         146 kB
├ ƒ /login                               2.66 kB         129 kB
├ ƒ /orders                               6.6 kB         149 kB
├ ƒ /orders/[orderId]                    7.47 kB         174 kB
├ ƒ /orders/new                          48.3 kB         202 kB
├ ƒ /preferences                         6.36 kB         133 kB
└ ƒ /reports/daily-sales                  127 kB         270 kB
+ First Load JS shared by all             103 kB
  ├ chunks/2b04f95a-cbd8267522279402.js  54.2 kB
  ├ chunks/793-9c99d11431944c5c.js       46.6 kB
  └ other shared chunks (total)          2.13 kB

ƒ Middleware                             34.3 kB
ƒ  (Dynamic)  server-rendered on demand

Exit code: 0
```

### 9.7. `git diff --check`

```
Exit code: 0
(Clean output, zero whitespace or line-ending warnings)
```

### 9.8. Duplicate Export Scan

```
powershell -Command "
$files = Get-ChildItem -Recurse -Include *.ts,*.tsx src,e2e,vitest.*,playwright.*
foreach ($f in $files) {
  $content = Get-Content $f.FullName
  $exports = $content | Select-String -Pattern '^\s*export\s+(?:async\s+)?(?:default\s+)?(?:function|const|let|var|class|interface|type)\s+([a-zA-Z0-9_]+)' | ForEach-Object { $_.Matches.Groups[1].Value }
  $dups = $exports | Group-Object | Where-Object { $_.Count -gt 1 }
  if ($dups) { Write-Host \"Duplicate in $($f.Name): $($dups.Name)\" }
}
"
Exit code: 0
(Clean output, zero duplicate exports found)
```

---

Leave this report and code uncommitted. The user stages/commits after Codex review.
Do not invent implementation/report SHAs; only baseline HEAD exists before the user commits.
Screenshots do not prove keyboard support; build success does not prove UI acceptance.
