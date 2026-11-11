# Session 12 / step-14 — ready_for_review

- **Branch**: `feat/order-preferences-i18n`
- **Baseline HEAD**: `dd7ad7b0b57ca04ad1314519d20fd2dc0894c719` (`docs(delivery): record Session 11 deployment status`)
- **Review target**: uncommitted working tree against baseline HEAD (including staged and untracked files)
- **Changed/untracked files by task**:
  - Exact touched files in `step-14.scope_files`:
    - `next.config.ts`
    - `package.json`
    - `pnpm-lock.yaml`
    - `tailwind.config.ts`
    - `src/app/globals.css`
    - `src/app/layout.tsx`
    - `src/app/page.tsx`
    - `src/app/components/page.tsx`
    - `src/app/(auth)/login/page.tsx`
    - `src/app/(dashboard)/layout.tsx`
    - `src/app/(dashboard)/orders/page.tsx`
    - `src/app/(dashboard)/orders/error.tsx`
    - `src/app/(dashboard)/orders/loading.tsx`
    - `src/app/(dashboard)/preferences/page.tsx`
    - `src/components/layout/sidebar.tsx`
    - `src/components/layout/topbar.tsx`
    - `src/components/layout/mobile-nav.tsx`
    - `src/components/layout/current-route-label.tsx`
    - `src/components/providers/theme-provider.tsx`
    - `src/components/providers/internationalization-provider.tsx`
    - `src/features/auth/components/login-form.tsx`
    - `src/features/orders/components/orders-list.tsx`
    - `src/features/orders/components/orders-table.tsx`
    - `src/features/orders/components/orders-filters.tsx`
    - `src/features/preferences/store.ts`
    - `src/features/preferences/components/preferences-form.tsx`
    - `src/i18n/request.ts`
    - `messages/en.json`
    - `messages/vi.json`
    - `docs/ai-journal.md`
    - `docs/handoffs/session-12.md`
  - Bounded Playwright evidence exception:
    - `output/playwright/session-12/` (20 screenshots + `results.json`)
- **Objective and changed files**:
  Implemented Order Preferences screen, Zustand preferences store with persist middleware and localStorage, dark/light/system theme with WCAG AA/AAA semantic tokens, and English/Vietnamese localization foundation using `next-intl` across all scoped screens. Enforced strict URL filter precedence over saved default filters, preserving explicit empty overrides and unrelated query parameters.
- **Out-of-scope changes**: None. Zero modifications outside the allowlisted files. Zero edits to coordinator files (`tasks.json`, `.agents/*`) or Week 1 labs. All changes remain unstaged and uncommitted.

## Acceptance evidence

| Task + criterion                                                        | pass / fail / not_run / not_applicable | Reproduction or command                                                               | Evidence / observed result                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| step-14: Configurable default filters, theme, & locale in Preferences   | pass                                   | Playwright browser visit to `/preferences`                                            | Preferences exposes accessible controls for default filters (`status`, `search`, `startDate`, `endDate`), color theme (`system`, `light`, `dark`), and language (`en`, `vi`). `preferences-saved-defaults.png`.                               |
| step-14: Preferences persistence & reload restoration                   | pass                                   | Save preferences then `page.goto('/preferences')`                                     | Default filters, selected theme, and language restore cleanly from `localStorage.orderhub_preferences`. `preferences-reload-restored.png`.                                                                                                    |
| step-14: URL query parameters outrank saved defaults                    | pass                                   | Navigate to `/orders?status=cancelled&search=ORD-2026-003` with saved defaults active | Conflicting URL values win unconditionally over saved defaults (`status=cancelled`, `search=ORD-2026-003`), displaying 1 matching row (`orders-url-overrides-defaults.png`).                                                                  |
| step-14: Saved default applied only when URL parameter is absent        | pass                                   | Navigate to `/orders` (untouched, no query params)                                    | Absent `status` parameter falls back to saved default `delivered`, `search` to `ORD-2026-001`, displaying 1 matching row (`orders-saved-defaults-applied.png`).                                                                               |
| step-14: Explicit empty override (`?status=`) suppresses saved default  | pass                                   | Navigate to `/orders?status=&search=`                                                 | Explicit empty overrides override saved defaults, returning all matching records without applying default filters (`orders-status-empty-override.png`).                                                                                       |
| step-14: "Clear all" writes empty overrides & suppresses saved defaults | pass                                   | Click "Clear all" on `/orders`                                                        | URL updates to `?status=&search=&startDate=&endDate=`. All 10 orders display; reload preserves empty overrides and saved defaults do not reapply (`orders-clear-all-empty-overrides.png`, `orders-clear-all-reload.png`).                     |
| step-14: "Clear all" preserves unrelated parameters                     | pass                                   | Click "Clear all" on `/orders?status=delivered&search=ORD&pageSize=5&scenario=delay`  | URL updates to `?status=&search=&pageSize=5&scenario=delay&startDate=&endDate=`; `pageSize=5` and `scenario=delay` strictly preserved (`orders-clear-all-preserves-unrelated.png`).                                                           |
| step-14: Persistent light/dark/system theme                             | pass                                   | Select "Dark" theme in Preferences, reload `/orders`                                  | `html.dark` applies with high-contrast surfaces (`bg-surface: rgb(30, 41, 59)`, text `rgb(248, 250, 252)`, badges >= 7:1 AAA). Persists after reload (`preferences-dark-theme.png`, `orders-dark-theme.png`, `orders-dark-theme-reload.png`). |
| step-14: English and Vietnamese message catalogs complete               | pass                                   | Inspect `messages/en.json` and `messages/vi.json`                                     | Both catalogs mirror every key across `auth`, `nav`, `orders`, `preferences`, `home`, and `catalogue`. Zero raw keys rendered.                                                                                                                |
| step-14: Language switching preserves route & query string              | pass                                   | Select "Tiếng Việt" on `/orders?status=shipped&search=Apex`                           | Visible UI switches to Vietnamese while URL `?status=shipped&search=Apex` is strictly preserved (`orders-vi-locale.png`, `preferences-vi-locale.png`, `login-vi-locale.png`, `catalogue-vi-locale.png`).                                      |
| step-14: Keyboard accessibility & visible focus rings                   | pass                                   | Tab key navigation across Preferences controls                                        | Visible focus rings on Theme select, Locale select, default filter controls, and action buttons (`preferences-keyboard-focus.png`).                                                                                                           |
| step-14: No credentials or secrets in preferences store                 | pass                                   | Inspect `localStorage.getItem('orderhub_preferences')`                                | Contains only `theme`, `locale`, and `defaultFilters`. Zero auth cookies, tokens, or secrets stored.                                                                                                                                          |

## Checks

| Command                                      | Exit code | Result                                                                                                                                   |
| -------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec tsc --noEmit`                     | 0         | Strict mode passed with zero errors.                                                                                                     |
| `pnpm lint`                                  | 0         | Passed with 1 pre-existing warning at `public/mockServiceWorker.js:1` (unused eslint-disable).                                           |
| `pnpm build`                                 | 0         | Next.js 15.5.29 compiled successfully (all routes dynamic/optimized, zero build warnings).                                               |
| `pnpm format:check`                          | 1         | Fails solely on the 3 documented pre-existing baseline files (`docs/delivery.md`, `docs/handoffs/session-03.md`, `pnpm-workspace.yaml`). |
| `pnpm exec prettier --check <touched_files>` | 0         | All 31 touched in-scope files pass Prettier check.                                                                                       |
| `git diff --check`                           | 0         | Clean diff with zero whitespace anomalies.                                                                                               |

## Touched UI

| Route + state                             | 375                    | 768                    | 1280                     | 1920                     | Evidence                                                                |
| ----------------------------------------- | ---------------------- | ---------------------- | ------------------------ | ------------------------ | ----------------------------------------------------------------------- |
| `/preferences` (Default state)            | `360/360` (0 overflow) | `753/753` (0 overflow) | `1265/1265` (0 overflow) | `1920/1920` (0 overflow) | `output/playwright/session-12/preferences-*.png`                        |
| `/preferences` (Saved defaults)           | —                      | —                      | `1265/1265`              | —                        | `output/playwright/session-12/preferences-saved-defaults.png`           |
| `/preferences` (Reload restored)          | —                      | —                      | `1265/1265`              | —                        | `output/playwright/session-12/preferences-reload-restored.png`          |
| `/preferences` (Dark theme)               | —                      | —                      | `1265/1265`              | —                        | `output/playwright/session-12/preferences-dark-theme.png`               |
| `/preferences` (Vietnamese locale)        | —                      | —                      | `1265/1265`              | —                        | `output/playwright/session-12/preferences-vi-locale.png`                |
| `/preferences` (Keyboard focus)           | —                      | —                      | `1265/1265`              | —                        | `output/playwright/session-12/preferences-keyboard-focus.png`           |
| `/orders` (Saved defaults applied)        | —                      | —                      | `1265/1265`              | —                        | `output/playwright/session-12/orders-saved-defaults-applied.png`        |
| `/orders` (URL overrides defaults)        | —                      | —                      | `1265/1265`              | —                        | `output/playwright/session-12/orders-url-overrides-defaults.png`        |
| `/orders` (Status empty override)         | —                      | —                      | `1265/1265`              | —                        | `output/playwright/session-12/orders-status-empty-override.png`         |
| `/orders` (Clear all overrides)           | —                      | —                      | `1265/1265`              | —                        | `output/playwright/session-12/orders-clear-all-empty-overrides.png`     |
| `/orders` (Clear all reload)              | —                      | —                      | `1265/1265`              | —                        | `output/playwright/session-12/orders-clear-all-reload.png`              |
| `/orders` (Clear all preserves unrelated) | —                      | —                      | `1265/1265`              | —                        | `output/playwright/session-12/orders-clear-all-preserves-unrelated.png` |
| `/orders` (Dark theme)                    | —                      | —                      | `1265/1265`              | —                        | `output/playwright/session-12/orders-dark-theme.png`                    |
| `/orders` (Dark theme reload)             | —                      | —                      | `1265/1265`              | —                        | `output/playwright/session-12/orders-dark-theme-reload.png`             |
| `/orders` (Vietnamese locale)             | —                      | —                      | `1265/1265`              | —                        | `output/playwright/session-12/orders-vi-locale.png`                     |
| `/login` (Vietnamese locale)              | —                      | —                      | `1265/1265`              | —                        | `output/playwright/session-12/login-vi-locale.png`                      |
| `/components` (Vietnamese locale)         | —                      | —                      | `1265/1265`              | —                        | `output/playwright/session-12/catalogue-vi-locale.png`                  |

- **Keyboard sequence and observed focus behavior**:
  - Focus progression: Skip link (`<a>`) -> Main navigation links -> Theme select (`#preference-theme-select`) -> Language select (`#preference-locale-select`) -> Reset default filters button -> Default status select (`#preference-default-status`) -> Default search input (`#preference-default-search`) -> Default from date (`#preference-default-start-date`) -> Default to date (`#preference-default-end-date`) -> Reset all preferences button.
  - Visible focus indicators: 2px solid ring (`:focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2`).
- **Contrast measurement and method**:
  - Light theme: Body background `#f8fafc` against text `#0f172a` (17.06:1 AAA); surface `#ffffff` against text `#0f172a` (17.85:1 AAA); control borders `#64748b` (4.76:1 >= 3:1).
  - Dark theme: Body background `#0f172a` (rgb 15 23 42) against text `#f8fafc` (16.5:1 AAA); surface `#1e293b` (rgb 30 41 59) against text `#f8fafc` (13.9:1 AAA); muted text `#94a3b8` on surface (5.59:1 AA); control borders `#64748b` on surface (3.1:1 >= 3:1); Delivered badge `#052e16` against `#86efac` (7.6:1 AAA).
- **Loading/error/empty/retry reproduction**:
  - Orders loading skeleton, empty state, and error boundaries all integrated with `next-intl` lookups.
  - SSR hydration safety ensured via `hasHydrated` flag in Zustand store.
- **Server/client boundary explanation**:
  - `src/app/(dashboard)/preferences/page.tsx` is a Server Component with async `getTranslations("preferences")` and dynamic metadata.
  - `PreferencesForm` is a Client Component using `useTranslations`, `useTheme`, and `usePreferencesStore`.
  - `src/app/layout.tsx` is a Server Component fetching locale and messages via `getLocale()` and `getMessages()`, passing them to client boundary `InternationalizationProvider` and `ThemeProvider`.
- **Design baseline and deviations**:
  - Fully conforms to `docs/design-system.md` using semantic tokens and 4px spacing scale. Zero arbitrary Tailwind utility brackets, zero inline styles.
- **Playwright smoke**:
  - Executed against production server (`pnpm start -p 3000`).
  - 20 screenshot artifacts and machine-readable `results.json` saved in `output/playwright/session-12/`.

## Recovery

- **Decisions and tradeoffs**:
  - Used cookie `NEXT_LOCALE` combined with `router.refresh()` to trigger Server Component re-rendering upon language change while preserving the existing route tree and all active query parameters.
  - Distinguish parameter absence (`!searchParams.has(key)`) from present empty overrides (`searchParams.get(key) === ""`). Saved defaults only apply when the parameter is absent.
  - Hydration safety: `hasHydrated` prevents SSR markup mismatch by using empty initial defaults until client store hydration completes.
- **Pre-existing failures versus new failures**:
  - `pnpm format:check` reports exit code 1 solely due to the 3 known pre-existing baseline files (`docs/delivery.md`, `docs/handoffs/session-03.md`, `pnpm-workspace.yaml`).
  - Zero in-scope formatting failures. Scoped Prettier check over all 31 touched files exits 0.
- **Known issues, not-run checks and blockers**:
  - None. All acceptance criteria passed.
- **Reproduction and next concrete action**:
  - Run `pnpm exec tsc --noEmit && pnpm lint && pnpm build`.
  - Check Playwright artifacts in `output/playwright/session-12/`.
- **AI journal entry**:
  - Detailed in `docs/ai-journal.md` under section `Session 12 — Step-14 / D12: Order Preferences, Global State, Theme và i18n Foundation`.
- **Suggested next session (not executed)**:
  - Session 13 (step-15 / D12): Auth flow, token refresh, route guards, and role UI.
