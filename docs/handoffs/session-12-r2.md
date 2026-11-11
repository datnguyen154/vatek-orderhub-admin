# Session 12 — step-14 — ready_for_review

- Branch: `feat/order-preferences-i18n`
- Baseline SHA: `dd7ad7b0b57ca04ad1314519d20fd2dc0894c719` (`docs(delivery): record Session 11 deployment status`)
- Review target: uncommitted working tree against baseline HEAD (include staged and untracked files)
- Changed/untracked files by task:
  - **r2 application file modifications** (strictly within Codex revised allowlist):
    - `src/features/catalogue/components/component-examples.tsx`
    - `src/components/ui/modal.tsx`
    - `src/components/layout/mobile-nav.tsx`
    - `messages/en.json`
    - `messages/vi.json`
    - `docs/ai-journal.md`
  - **r2 bounded report & evidence**:
    - `docs/handoffs/session-12-r2.md` (bounded repair report)
    - `output/playwright/session-12-r2/` (18 screenshots + `results.json`)
  - **Preserved step-14 files from initial and r1 turns** (preserved without reset or overwrite):
    - `package.json`, `pnpm-lock.yaml`, `next.config.ts`, `tailwind.config.ts`, `src/app/globals.css`
    - `src/components/providers/internationalization-provider.tsx`, `src/components/providers/theme-provider.tsx`
    - `src/app/layout.tsx`, `src/app/(dashboard)/layout.tsx`
    - `src/components/layout/sidebar.tsx`, `src/components/layout/topbar.tsx`, `src/components/layout/current-route-label.tsx`
    - `src/features/preferences/components/preferences-form.tsx`, `src/features/preferences/store.ts`, `src/app/(dashboard)/preferences/page.tsx`
    - `src/app/(dashboard)/orders/page.tsx`, `src/app/(dashboard)/orders/loading.tsx`, `src/app/(dashboard)/orders/error.tsx`
    - `src/features/orders/components/orders-list.tsx`, `src/features/orders/components/orders-filters.tsx`, `src/features/orders/components/orders-table.tsx`
    - `src/app/(auth)/login/page.tsx`, `src/features/auth/components/login-form.tsx`, `src/app/page.tsx`, `src/app/components/page.tsx`
    - `src/i18n/request.ts`
    - `docs/handoffs/session-12.md`, `docs/handoffs/session-12-r1.md`
  - **Preserved evidence**:
    - `output/playwright/session-12/` (20 screenshots + `results.json`)
    - `output/playwright/session-12-r1/` (34 screenshots + `results.json`)
- Objective and changed files:
  Executed repair round 2 of 2 (r2) addressing the remaining findings in `r1-review.md`:
  1. **F1 — Complete localization of imported catalogue demo components**: Localized all user-facing strings in `src/features/catalogue/components/component-examples.tsx` (`ModalExamples`, `InteractiveButtonSandbox`, `InteractiveFormSandbox`) using `useTranslations("catalogue")` lookups matching 100% key parity across `messages/en.json` and `messages/vi.json`. Applied `t.rich` formatting chunks for dynamic order references (`#ORD-7821`) and message interpolation for operation counters and status strings. Maintained technical tokens, SKU codes, and paths intact as demonstrated test data.
  2. **F2 — Static enforcement and complete localization of shared modal close name**: Replaced hardcoded English `aria-label="Close modal"` and `<span className="sr-only">Close</span>` in `src/components/ui/modal.tsx` with a required `closeLabel: string` prop on `ModalContentProps`. Updated all call sites in scope (`mobile-nav.tsx` passing `closeLabel={t("closeDrawer")}` and `component-examples.tsx` passing `closeLabel={t("closeModal")}` across 4 dialog instances), eliminating any chance of fallback English text in assistive technology announcements.
- Out-of-scope changes: None. All edits strictly confined to the revised r2 allowlist and bounded report/evidence exceptions. Zero edits to coordinator files (`tasks.json`, `.agents/*`), week-1 labs, or baseline files. All changes remain unstaged and uncommitted.

## Acceptance evidence

| Task + criterion                                                   | pass / fail / not_run / not_applicable | Reproduction or command                                                                                   | Evidence / observed result                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------ | -------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| step-14: Complete localization of imported catalogue examples (F1) | pass                                   | Visit `/components` under `NEXT_LOCALE=vi`; open all 4 modals, trigger button states, toggle form states  | Full-page scan over 129 text nodes reveals `leftoverEnglishUI: 0` and zero missing keys. All 4 modals render localized Vietnamese titles, descriptions, dynamic body copy, buttons, and action confirmation copy (`catalogue-vi-fullpage.png`, `modal-1-vi.png`, `modal-2-vi.png`, `modal-3-vi.png`, `modal-4-vi.png`).                                                              |
| step-14: Shared modal accessible close label localization (F2)     | pass                                   | Inspect DOM of all 4 modals in Vietnamese and 1 in English                                                | In Vietnamese, all 4 modal close buttons render `aria-label="Đóng hộp thoại"` and sr-only text "Đóng hộp thoại" (`modal-1-vi.png` through `modal-4-vi.png`). In English, Modal 1 close button renders `aria-label="Close modal"` and sr-only "Close modal" (`modal-default-en.png`). Zero fallback strings.                                                                          |
| step-14: Modal keyboard interaction & focus restoration            | pass                                   | Focus trigger button, press Enter, verify focus containment, press Escape, inspect document.activeElement | Pressing trigger opens dialog and moves focus to dialog content. Tab cycles through interactive elements within the modal. Pressing Escape closes dialog and restores focus to the invoking trigger button.                                                                                                                                                                          |
| step-14: Button sandbox idle, loading, completed states            | pass                                   | Click "Mô phỏng thao tác bất đồng bộ" on `/components` (VI)                                               | Idle button text: "Mô phỏng thao tác bất đồng bộ" (`button-sandbox-idle-vi.png`). During 1.2s delay: button shows spinner and "Đang xử lý yêu cầu..." (`button-sandbox-loading-vi.png`). Upon completion: counter increments to "Các thao tác tương tác đã hoàn thành: 1" (`button-sandbox-completed-vi.png`). Toggle button toggles between "Không hoạt động" and "Đang hoạt động". |
| step-14: Form sandbox valid, invalid, and disabled states          | pass                                   | Submit form with empty SKU and capacity 0, then enter valid values, then toggle disabled checkbox         | When invalid: inputs receive `aria-invalid="true"` and display localized error messages ("Mã SKU sản phẩm là bắt buộc", "Dung lượng khoang phải nằm trong khoảng từ 1 đến 500") (`form-sandbox-invalid-vi.png`). When valid: inputs clear errors (`form-sandbox-valid-vi.png`). When disabled: inputs receive `disabled: true` and opacity styling (`form-sandbox-disabled-vi.png`). |
| step-14: Catalogue responsive viewport matrix                      | pass                                   | Measure `scrollWidth` and `clientWidth` at 375, 768, 1280, 1920px on `/components` (VI)                   | 375px: `360/360` (`catalogue-vi-375px.png`); 768px: `753/753` (`catalogue-vi-768px.png`); 1280px: `1265/1265` (`catalogue-vi-1280px.png`); 1920px: `1905/1905` (`catalogue-vi-1920px.png`). Zero page-level horizontal overflow (`scrollWidth <= clientWidth`) across all viewports.                                                                                                 |
| step-14: Mobile navigation drawer at 375px (VI)                    | pass                                   | Emulate 375px viewport on `/components` (VI); click hamburger, inspect drawer, press Escape               | Drawer opens anchored to left edge (`mobile-nav-drawer-vi-375px.png`). Navigation items render localized labels ("Đơn hàng", "Tùy chọn"). Close button renders `aria-label="Đóng menu điều hướng"`. Pressing Escape closes drawer and restores focus to hamburger trigger (`button[aria-label="Mở menu điều hướng"]`). `scrollWidth: 375, clientWidth: 375` (zero overflow).         |
| step-14: Scoped Prettier compliance                                | pass                                   | `pnpm exec prettier --check <all_step14_touched_files>`                                                   | All 35 changed step-14 text files plus `session-12-r2.md` pass Prettier check with zero warnings or errors. Exit code 0.                                                                                                                                                                                                                                                             |

## Checks

| Command                                             | Exit code | Result                                                                                                                                                                                  |
| --------------------------------------------------- | --------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec tsc --noEmit`                            |         0 | Strict mode check passed with zero errors.                                                                                                                                              |
| `pnpm lint`                                         |         0 | ESLint passed with 1 pre-existing warning at `public/mockServiceWorker.js:1` (unused eslint-disable directive).                                                                         |
| `pnpm build`                                        |         0 | Next.js 15.5.29 production build compiled successfully. All routes dynamic/optimized. Emits 1 pre-existing warning: `The Next.js plugin was not detected in your ESLint configuration`. |
| `pnpm format:check`                                 |         1 | Fails solely on the 3 documented pre-existing baseline files (`docs/delivery.md`, `docs/handoffs/session-03.md`, `pnpm-workspace.yaml`). Zero in-scope failures.                        |
| Scoped `pnpm exec prettier --check <touched_files>` |         0 | All changed step-14 text files and `session-12-r2.md` pass Prettier style check.                                                                                                        |
| `git diff --check`                                  |         0 | Clean diff with zero whitespace anomalies.                                                                                                                                              |

## Touched UI

| Route + state                               | 375                                      | 768                                      | 1280                                       | 1920                                       | Evidence                          |
| ------------------------------------------- | ---------------------------------------- | ---------------------------------------- | ------------------------------------------ | ------------------------------------------ | --------------------------------- |
| `/components` (Catalogue EN Fullpage)       | —                                        | —                                        | `scroll: 1265, client: 1265` (overflow: 0) | —                                          | `catalogue-en-fullpage.png`       |
| `/components` (Modal Default EN)            | —                                        | —                                        | `scroll: 1265, client: 1265` (overflow: 0) | —                                          | `modal-default-en.png`            |
| `/components` (Catalogue VI Fullpage)       | —                                        | —                                        | `scroll: 1265, client: 1265` (overflow: 0) | —                                          | `catalogue-vi-fullpage.png`       |
| `/components` (Modal 1 VI Dispatch)         | —                                        | —                                        | `scroll: 1265, client: 1265` (overflow: 0) | —                                          | `modal-1-vi.png`                  |
| `/components` (Modal 2 VI Destructive)      | —                                        | —                                        | `scroll: 1265, client: 1265` (overflow: 0) | —                                          | `modal-2-vi.png`                  |
| `/components` (Modal 3 VI Manifest)         | —                                        | —                                        | `scroll: 1265, client: 1265` (overflow: 0) | —                                          | `modal-3-vi.png`                  |
| `/components` (Modal 4 VI Audit Log)        | —                                        | —                                        | `scroll: 1265, client: 1265` (overflow: 0) | —                                          | `modal-4-vi.png`                  |
| `/components` (Button Sandbox Idle VI)      | —                                        | —                                        | `scroll: 1265, client: 1265` (overflow: 0) | —                                          | `button-sandbox-idle-vi.png`      |
| `/components` (Button Sandbox Loading VI)   | —                                        | —                                        | `scroll: 1265, client: 1265` (overflow: 0) | —                                          | `button-sandbox-loading-vi.png`   |
| `/components` (Button Sandbox Completed VI) | —                                        | —                                        | `scroll: 1265, client: 1265` (overflow: 0) | —                                          | `button-sandbox-completed-vi.png` |
| `/components` (Form Sandbox Valid VI)       | —                                        | —                                        | `scroll: 1265, client: 1265` (overflow: 0) | —                                          | `form-sandbox-valid-vi.png`       |
| `/components` (Form Sandbox Invalid VI)     | —                                        | —                                        | `scroll: 1265, client: 1265` (overflow: 0) | —                                          | `form-sandbox-invalid-vi.png`     |
| `/components` (Form Sandbox Disabled VI)    | —                                        | —                                        | `scroll: 1265, client: 1265` (overflow: 0) | —                                          | `form-sandbox-disabled-vi.png`    |
| `/components` (Responsive VI 375px)         | `scroll: 360, client: 360` (overflow: 0) | —                                        | —                                          | —                                          | `catalogue-vi-375px.png`          |
| `/components` (Responsive VI 768px)         | —                                        | `scroll: 753, client: 753` (overflow: 0) | —                                          | —                                          | `catalogue-vi-768px.png`          |
| `/components` (Responsive VI 1280px)        | —                                        | —                                        | `scroll: 1265, client: 1265` (overflow: 0) | —                                          | `catalogue-vi-1280px.png`         |
| `/components` (Responsive VI 1920px)        | —                                        | —                                        | —                                          | `scroll: 1905, client: 1905` (overflow: 0) | `catalogue-vi-1920px.png`         |
| `/components` (Mobile Nav Drawer VI 375px)  | `scroll: 375, client: 375` (overflow: 0) | —                                        | —                                          | —                                          | `mobile-nav-drawer-vi-375px.png`  |

- **Keyboard sequence and observed focus behavior**:
  - Modal keyboard sequence:
    1. User tabs to modal trigger button (e.g. `button:has-text("Xác nhận điều phối")`) and presses Enter.
    2. Radix Dialog mounts overlay and content. Focus moves immediately into dialog content.
    3. Tab traverses dismiss button ("Hủy"), confirm button ("Xác nhận điều phối"), and close button (`aria-label="Đóng hộp thoại"`).
    4. Focus is strictly contained within dialog; pressing Tab on close button cycles back to first interactive control.
    5. Pressing Escape key unmounts dialog and immediately restores focus to the invoking trigger button (`document.activeElement === triggerButton`).
  - Mobile Nav Drawer keyboard sequence:
    1. At 375px viewport, user tabs to hamburger button (`aria-label="Mở menu điều hướng"`) and presses Enter.
    2. Drawer opens with focus contained. Tab traverses navigation links ("Đơn hàng", "Tùy chọn") and close button (`aria-label="Đóng menu điều hướng"`).
    3. Pressing Escape key closes drawer and returns focus to hamburger button (`aria-label="Mở menu điều hướng"`).
- **Contrast measurement and method**:
  - Modal overlay: `bg-black/50` backdrop with `bg-surface` content surface (`#ffffff` light, `#1e293b` dark).
  - Modal titles: `#0f172a` against white surface (17.85:1 AAA).
  - Modal body copy: `#64748b` against white surface (4.76:1 AA).
  - Destructive modal button: `#ffffff` text against `bg-destructive` `#dc2626` (4.65:1 AA).
  - Control borders & close icon: `#64748b` against surface (4.76:1 >= 3:1).
- **Loading/error/empty/retry reproduction**:
  - Button sandbox async simulation: triggers 1.2s loading timeout; button disables and displays spinning SVG + "Đang xử lý yêu cầu...".
  - Form sandbox client validation: empty SKU code and capacity 0 trigger validation errors with high-visibility error text and `aria-invalid="true"`.
- **Server/client boundary explanation**:
  - `src/app/components/page.tsx` is an async Server Component calling `getTranslations("catalogue")`.
  - `src/features/catalogue/components/component-examples.tsx` is marked `"use client"`, allowing `InteractiveButtonSandbox`, `InteractiveFormSandbox`, and `ModalExamples` to react dynamically to user actions while reading `useTranslations("catalogue.buttonSandbox")`, `useTranslations("catalogue.formSandbox")`, and `useTranslations("catalogue.modalExamples")`.
  - `src/components/layout/mobile-nav.tsx` is marked `"use client"` and reads `useTranslations("nav")` to provide localized mobile drawer labels and close button accessible name.
- **Design baseline and deviations**:
  - Conforms strictly to `docs/design-system.md` using semantic tokens and 4px grid spacing. Zero arbitrary utility brackets, zero inline styles.
- **Playwright smoke**:
  - Production server (`pnpm start -p 3000`) executed via Playwright MCP.
  - 18 screenshot artifacts and machine-readable `results.json` saved in `output/playwright/session-12-r2/`.

## Recovery

- **Decisions and tradeoffs**:
  - Made `closeLabel: string` a required prop on `ModalContentProps` in `src/components/ui/modal.tsx` rather than providing a default English fallback. This TypeScript static check forces all present and future callers to supply localized accessible text, ensuring screen readers receive appropriate announcements in every supported locale.
  - Used `t.rich` with named element builders (e.g. `orderId: (chunks) => <span className="...">{chunks}</span>`) to format dynamic identifiers safely without fragmenting translated phrases into concatenated sentence fragments.
  - Kept technical identifiers (SKU codes, bin IDs, timestamps, tokens) intact to reflect genuine domain entities while localizing all surrounding human interface copy.
- **Pre-existing failures versus new failures**:
  - `pnpm format:check` reports exit code 1 solely due to the 3 documented pre-existing baseline files (`docs/delivery.md`, `docs/handoffs/session-03.md`, `pnpm-workspace.yaml`). Zero in-scope failures.
  - `pnpm build` outputs the documented pre-existing warning: `The Next.js plugin was not detected in your ESLint configuration`.
  - `pnpm lint` outputs 1 documented pre-existing warning at `public/mockServiceWorker.js:1` (unused eslint-disable directive).
- **Known issues, not-run checks and blockers**:
  - None. All acceptance criteria passed.
- **Reproduction and next concrete action**:
  - Run verification suite: `pnpm exec tsc --noEmit && pnpm lint && pnpm build`.
  - Review Playwright artifacts in `output/playwright/session-12-r2/`.
- **AI journal entry**:
  - Detailed in `docs/ai-journal.md` under section `Session 12 Repair r2 — Step-14 / D12: Child Catalogue Component Localization & Modal Accessible Close Name`.
- **Suggested next session (not executed)**:
  - Session 13 (step-15 / D12): Auth flow, token refresh, route guards, and role UI.

Leave this report and code uncommitted. The user stages/commits after Codex review.
Do not invent implementation/report SHAs; only baseline HEAD exists before the user commits.
Screenshots do not prove keyboard support; build success does not prove UI acceptance.
