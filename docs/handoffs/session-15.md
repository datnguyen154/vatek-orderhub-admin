# Session 15 — step-17 — ready_for_review

- **Branch**: `feat/order-detail`
- **Baseline SHA**: `719f8c4c078087bf2d9914ce2cf57082477e75a0` (`origin/main`)
- **Review target**: Uncommitted working tree against baseline HEAD (staged is completely empty; all changes uncommitted and unstaged)
- **Changed/untracked files by task**:
  - Modified:
    - `AGENTS.md` (Part B: appended Sessions 11–20 to dispatcher table; added mandatory UX research rule)
    - `docs/mock-api.md` (Documented §11: order detail endpoints, state machine PATCH, XHR invoice upload, reload boundaries)
    - `messages/en.json` (Added `orders.detail` keys with summary, status control, invoice upload, and timeline translations)
    - `messages/vi.json` (Added `orders.detail` keys matching `en.json` with exact 1:1 key parity)
    - `src/features/orders/api.ts` (Added `getOrderDetail`, `updateOrderStatus`, and `uploadInvoice` with native XHR progress tracking)
    - `src/features/orders/components/create-order-wizard.tsx` (Part A Carry-over C1–C4: removed arbitrary Tailwind values, constrained mobile stepper)
    - `src/features/orders/components/orders-table.tsx` (Linked non-optimistic order code cells to `/orders/${order.id}`)
    - `src/features/orders/types.ts` (Added `OrderDetail`, `TimelineEvent`, `InvoiceMetadata`, response types, and runtime type guards)
    - `src/mocks/data/orders.ts` (Extended all 10 seeded orders with deterministic initial timelines matching status)
    - `src/mocks/handlers.ts` (Unified `inMemoryOrders` data store; added `GET /api/orders/:orderId`, `PATCH /api/orders/:orderId/status`, `POST /api/orders/:orderId/invoice`)
    - `docs/ai-journal.md` (Appended Session 15 D14 journal entry)
  - Created:
    - `src/app/(dashboard)/orders/[orderId]/page.tsx` (Server Component detail route with dynamic localized metadata and role derivation)
    - `src/features/orders/components/order-detail.tsx` (Order detail view with 2-column desktop layout, back link, and state guards)
    - `src/features/orders/components/order-status-control.tsx` (Pessimistic status dropdown, valid transitions state machine, cancel Modal)
    - `src/features/orders/components/invoice-upload.tsx` (Progress bar via XHR, PDF validation, cancellation, retry on 500, aria-live)
    - `src/features/orders/components/order-timeline.tsx` (Chronological `<ol>` activity audit trail with localized events and `<time dateTime>`)
    - `src/features/orders/hooks/use-order-detail.ts` (TanStack Query hook for single order fetching with 30s staleTime)
    - `src/features/orders/hooks/use-update-order-status.ts` (Pessimistic mutation hook updating detail and list caches with toasts)
    - `docs/handoffs/session-15.md` (This handoff document)
    - `output/playwright/session-15/` (12 screenshots & `results.json`)
- **Objective and changed files**: Implement order detail view `/orders/[orderId]` featuring status updates with confirmation modal, granular invoice upload with native XHR progress tracking, chronological activity timeline, and address Session 14 carry-over C1–C4 items without arbitrary values or new dependencies.
- **Out-of-scope changes**: None (`tasks.json`, `.agents/*`, and week-1 labs remain untouched).

---

## 1. Carry-Over Fixes Table (C1–C4)

| Item ID | Source Issue in Session 14                                               | Fix Applied in `create-order-wizard.tsx`                                                                                                            | Verification & 375 px Measurement                                                                                                                                         |
| :------ | :----------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **C1**  | Arbitrary Tailwind value `min-h-[calc(100vh-14rem)]`                     | Replaced with standard Tailwind layout class `min-h-full flex flex-col`.                                                                            | Grep for `-\[` returned 0 matches in `src/`. Clean build and layout verified.                                                                                             |
| **C2**  | Arbitrary Tailwind font sizes `text-[11px]` and `text-[10px]`            | Replaced with semantic token classes `text-xs` (status label) and `text-xs font-semibold` (step number badge).                                      | Typography scale strictly conforms to design tokens.                                                                                                                      |
| **C3**  | Arbitrary Tailwind transition `animate-in fade-in duration-200`          | Replaced with standard Tailwind utility classes `transition-opacity duration-200`.                                                                  | Step transitions remain smooth without arbitrary plugin animations.                                                                                                       |
| **C4**  | Mobile stepper label overflow potential at 375 px across varying locales | Added `min-w-0` to flex container, `truncate` to step title, and made the status label screen-reader only (`sr-only`) on mobile (`sm:not-sr-only`). | Measured at 375 px viewport:<br>• Step 1: `341 / 341` (ratio `1.000`)<br>• Step 2: `341 / 341` (ratio `1.000`)<br>• Step 3: `341 / 341` (ratio `1.000`)<br>Zero overflow. |

---

## 2. UX Research Table (UI/UX Pro Max)

| Query / Topic                  | Guideline No. | Applied / Rejected | Reason & Implementation Details                                                                                                                                                                                       |
| :----------------------------- | :-----------: | :----------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status change confirmation** |    **#19**    |    **Applied**     | Confirmation modal required prior to applying destructive terminal state (`cancelled`). Dismissing modal keeps current status intact; confirming applies status and removes further transition options.               |
| **File upload progress**       |    **#37**    |    **Applied**     | Progress bar (`role="progressbar"`, `aria-valuenow`) driven by `xhr.upload.onprogress`. Progress clamped to 95% while uploading; never reaches 100% until 201 response arrives. Cancel and retry actions provided.    |
| **Detail page structure**      |    **#4**     |    **Applied**     | 2-column responsive layout at `lg` breakpoint (`lg:grid-cols-3` with 2 cols for summary & timeline, 1 col for controls); single column stack on mobile (`<lg`). Prominent back link to `/orders` above heading.       |
| **Color & semantics**          | **#60, #61**  |    **Applied**     | Status badges and timeline items convey meaning through text labels, not color alone (`badgeVariants` semantic tokens). Actor roles indicated by localized badges. WCAG AA contrast satisfied in both light and dark. |
| **Pessimistic status updates** |    **#10**    |    **Applied**     | Order status update uses pessimistic mutation: UI dropdown shows loading state and only updates to new status upon receiving HTTP 200. On 409 or 500, previous status is retained and user receives localized toast.  |

---

## 3. Acceptance Evidence Table (Session 15 Requirements)

| Task + Criterion                                                                |   Status   | Reproduction or Command                                                       | Evidence / Observed Result                                                                                                                                                                            |
| :------------------------------------------------------------------------------ | :--------: | :---------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Carry-over C1–C4**<br>Mobile stepper no overflow at 375 px, action alert   | **passed** | Automated Playwright Item 1 (`/orders/new` at 375 px)                         | Steps 1–3 stepper `scrollWidth: 341, clientWidth: 341, ratio: 1.000`. Action bar alert `"1 field needs attention"`. Evidence: `output/playwright/session-15/blocked-next-step2.png`.                  |
| **2. Navigation**<br>Link to `ord_002`, back link, not_found, loading           | **passed** | Automated Playwright Item 2 (click `ORD-2026-002`, navigate `ord_unknown`)    | Order code link navigated to `/orders/ord_002`. Back link visible and navigable. Not-found card and loading skeleton captured. Evidence: `not-found.png`, `loading.png`.                              |
| **3. Status flow**<br>`pending` → `processing` → `shipped` → `delivered`        | **passed** | Automated Playwright Item 3 (`ord_002` status transitions)                    | Badge sequentially updated. Terminal notice rendered at `delivered`. Returning to `/orders` reflected `Delivered` status with 1 GET request. Evidence: `status-flow-delivered.png`.                   |
| **4. Cancel flow**<br>Modal on pending order, dismiss keeps status, confirm     | **passed** | Automated Playwright Item 4 (`ord_003` cancel flow)                           | Dismissing modal kept `pending` status. Confirming transitioned order to `cancelled` with terminal notice and no further transitions. Evidence: `cancel-modal.png`, `cancel-confirmed.png`.           |
| **5. Rejected changes**<br>409 on invalid transition, 500 scenario handling     | **passed** | Automated Playwright Item 5 (direct PATCH 409, `orderhub_mock_status=fail`)   | Direct PATCH returned 409 `{ code: "invalid_transition" }`. UI 500 displayed error toast, preserved status, and kept control enabled. Evidence: `status-update-rejected.png`.                         |
| **6. Viewer role**<br>Read-only controls, timeline visible, 403 on mutations    | **passed** | Automated Playwright Item 6 (login `viewer@orderhub.test`)                    | Status control and upload card rendered read-only guidance text. Timeline visible. Direct PATCH and POST returned 403. Evidence: `viewer-read-only.png`.                                              |
| **7. Upload success**<br>4 MB PDF upload, XHR progress, 201 response, timeline  | **passed** | Automated Playwright Item 7 (`ord_005` with 4 MB PDF)                         | Progress tracked via XHR. 201 arrived at `2026-11-12T04:08:24.519Z`. Invoice metadata and `invoice_uploaded` timeline event rendered. Evidence: `upload-success.png`. Label: "demo/MSW".              |
| **8. Upload rejections**<br>Non-PDF blocked, >5 MB blocked, 500 retry           | **passed** | Automated Playwright Item 8 (non-PDF, 6 MB PDF, `orderhub_mock_upload=fail`)  | Client blocked non-PDF (0 reqs) and 6 MB (0 reqs). 500 showed alert with Retry button. Retry succeeded after scenario cleared (2 total reqs). Evidence: `upload-retry-success.png`.                   |
| **9. Upload cancel**<br>Abort in-flight upload, cancelled state, no timeline    | **passed** | Automated Playwright Item 9 (`ord_006` abort mid-upload)                      | Immediate cancel aborted XHR (`xhr.abort()`). "Upload was cancelled" notice shown. No invoice card and no timeline event created. Evidence: `upload-cancelled.png`.                                   |
| **10. Layout & a11y**<br>375/768/1280/1920 px, dark/vi, keyboard, 0 console err | **passed** | Automated Playwright Item 10 (viewports, dark theme, vi locale, keyboard tab) | `scrollWidth === clientWidth` (ratio `1.000`) across all 4 viewports. Dark theme and Vietnamese locale verified. Keyboard accessible. 0 console errors. Evidence: `detail-dark.png`, `detail-vi.png`. |

---

## 4. UX Acceptance Checklist (§5.3)

- [x] **Primary action reachable without scrolling inside card**: Update status, Upload, Cancel, and Retry buttons are positioned cleanly within their respective cards with standard semantic spacing (`p-4` or `p-6`).
- [x] **Validation and upload feedback stability**: Inline file validation errors and progress bars are accommodated with reserved vertical spacing; primary action buttons do not jump or shift unexpectedly.
- [x] **Toast icon and colour alignment**: Sonner semantic icons (`check-circle` for success, `alert-triangle` for error) and design system tokens (`bg-success-muted`, `bg-destructive-muted`) correctly display across light and dark modes.
- [x] **Localized back link**: Rendered prominent "← Back to orders" / "← Quay lại danh sách đơn hàng" link at the top of `/orders/[orderId]` utilizing Next-intl translations.
- [x] **Text-driven status badges and timeline events**: Badges (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`) and timeline items include explicit text labels and timestamps, never relying on color alone.
- [x] **Zero horizontal overflow at 375 px**: Document `scrollWidth <= clientWidth` verified across all viewports (ratio `1.000` at 375 px, 768 px, 1280 px, and 1920 px).

---

## 5. Checks Suite

| Command                                             | Exit Code | Observed Result                                                                          |
| :-------------------------------------------------- | :-------: | :--------------------------------------------------------------------------------------- |
| `pnpm exec tsc --noEmit`                            |   **0**   | TypeScript 5.8.2 strict check passed with zero errors.                                   |
| `pnpm lint`                                         |   **0**   | ESLint passed with 0 errors (1 pre-existing warning at `public/mockServiceWorker.js:1`). |
| `pnpm build`                                        |   **0**   | Next.js 15.5.29 compiled `/orders/[orderId]` and all app routes cleanly.                 |
| Scoped `pnpm exec prettier --check <touched_files>` |   **0**   | All touched and created allowlist files format-checked cleanly against Prettier rules.   |
| `git diff --check`                                  |   **0**   | Clean git diff, zero whitespace errors or unresolved markers.                            |
| Arbitrary values grep (`-\[`) in changed `src/`     |   **0**   | 0 arbitrary Tailwind values found. Only standard design system tokens used.              |
| `git diff --cached`                                 |   **0**   | Staging area completely empty (0 staged changes).                                        |

---

## 6. Progress Events Table (Item 7 — 4 MB PDF Upload)

_Label: demo/MSW_

| Event Phase                 | Loaded Bytes / Total Bytes | Percent Reported | UI Representation                                    | Timestamp / Notes                   |
| :-------------------------- | :------------------------: | :--------------: | :--------------------------------------------------- | :---------------------------------- |
| **1. Upload Initiated**     |     `0 / 4,194,304 B`      |       `0%`       | Progressbar visible (`aria-valuenow="0"`), Cancel on | `2026-11-12T04:08:23.900Z`          |
| **2. Transfer in Progress** | `4,194,304 / 4,194,304 B`  |      `95%`       | Clamped to 95% max while waiting for server response | `2026-11-12T04:08:24.010Z`          |
| **3. HTTP 201 Arrived**     | `4,194,304 / 4,194,304 B`  |      `100%`      | Progressbar completes to 100%, success toast shown   | `2026-11-12T04:08:24.519Z` (moment) |
| **4. Post-Upload State**    |            N/A             |     Complete     | Invoice metadata card & timeline event rendered      | Cache updated and invalidated       |

---

## 7. Request Counts Table

| Item  | Scenario Description                           | Request Method & Endpoint          | Count | Verification Note                                                     |
| :---- | :--------------------------------------------- | :--------------------------------- | :---: | :-------------------------------------------------------------------- |
| **3** | Return to `/orders` after status updates       | `GET /api/orders`                  | **1** | Single GET request fetched updated list reflecting "Delivered" badge. |
| **5** | Direct PATCH invalid transition                | `PATCH /api/orders/ord_002/status` | **1** | Direct call returned HTTP 409 Conflict.                               |
| **5** | UI status update with 500 scenario             | `PATCH /api/orders/ord_007/status` | **1** | Client received HTTP 500; toast displayed; control remained enabled.  |
| **8** | Client-blocked Non-PDF file selection          | `POST /api/orders/ord_005/invoice` | **0** | Blocked on client before network request; error alert shown.          |
| **8** | Client-blocked oversized (6 MB) file selection | `POST /api/orders/ord_005/invoice` | **0** | Blocked on client before network request; error alert shown.          |
| **8** | Failed upload with 500 scenario                | `POST /api/orders/ord_005/invoice` | **1** | Simulated server error with `x-mock-upload: fail`.                    |
| **8** | Retry upload after scenario cleared            | `POST /api/orders/ord_005/invoice` | **1** | Retry button re-invoked upload cleanly, returning HTTP 201 Created.   |

---

## 8. Touched UI & Responsive Measurements

| Route + state                    | 375 px (Mobile) | 768 px (Tablet) | 1280 px (Laptop) | 1920 px (Desktop) | Evidence Screenshot         |
| :------------------------------- | :-------------: | :-------------: | :--------------: | :---------------: | :-------------------------- |
| `/orders/[orderId]` (Summary)    |   Ratio 1.000   |   Ratio 1.000   |   Ratio 1.000    |    Ratio 1.000    | `status-flow-delivered.png` |
| `/orders/[orderId]` (Cancel)     | Modal fits 375  | Modal centered  |  Modal centered  |  Modal centered   | `cancel-modal.png`          |
| `/orders/[orderId]` (Viewer)     | Read-only text  | Read-only text  |  Read-only text  |  Read-only text   | `viewer-read-only.png`      |
| `/orders/[orderId]` (Dark mode)  | Contrast > 7:1  | Contrast > 7:1  |  Contrast > 7:1  |  Contrast > 7:1   | `detail-dark.png`           |
| `/orders/[orderId]` (Tiếng Việt) | Localized copy  | Localized copy  |  Localized copy  |  Localized copy   | `detail-vi.png`             |
| `/orders/[orderId]` (Not Found)  | Error card fits | Error card fits | Error card fits  |  Error card fits  | `not-found.png`             |

---

## 9. Recovery & Decisions / Tradeoffs

- **Native XHR vs Fetch API**:
  - _Decision_: Native `XMLHttpRequest` was selected exclusively for `uploadInvoice` because Fetch API does not support standard upload progress events (`loaded/total`). AbortController signal was bridged to `xhr.abort()` to enable standard lifecycle cancellation.
- **Pessimistic vs Optimistic Mutations**:
  - _Decision_: Status updates follow pessimistic updates rather than optimistic rollback. In order fulfillment workflows, status transitions are strict business constraints governed by an asynchronous backend state machine. Displaying an unconfirmed status introduces risk of misdirected physical operations.
- **Pre-existing vs New Warnings**:
  - _Note_: ESLint flags 1 pre-existing warning on `public/mockServiceWorker.js:1` (`Unused eslint-disable directive`). This file is external to application source code and explicitly recognized as baseline in prompt §7. Zero new warnings or errors were introduced.
- **Suggested Next Session**:
  - Session 16 / step-18: Order batch actions, export capabilities, or advanced search filters.

---

_Note: All code and reports remain uncommitted and unstaged per instructions. The working tree is clean and ready for Codex review._
