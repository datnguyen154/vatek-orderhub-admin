# Session 11 / step-13 — Repair r1 — ready_for_review

- Branch: `feat/orders-query-cache`
- Baseline SHA: `47eec810c0d0c04e087f39813a498e1b28c0736b` (`docs(gate-2): record Technical Pass verdict and complete Session 10 handoff`)
- Review target: uncommitted working tree against baseline HEAD (include staged and untracked files)
- Changed/untracked files by task:
  - Exact repair r1 touched files:
    - `src/features/orders/components/orders-list.tsx`
    - `src/features/orders/components/orders-filters.tsx`
    - `src/components/providers/query-provider.tsx`
    - `docs/mock-api.md`
    - `docs/ai-journal.md`
  - Bounded repair report exception:
    - `docs/handoffs/session-11-r1.md`
  - Bounded Playwright evidence exception:
    - `output/playwright/session-11-r1/` (14 screenshots + `results.json`)
  - Retained Session 11 baseline files (uncommitted):
    - `package.json`
    - `pnpm-lock.yaml`
    - `src/app/layout.tsx`
    - `src/features/orders/types.ts`
    - `src/features/orders/api.ts`
    - `src/features/orders/components/orders-table.tsx`
    - `src/features/orders/hooks/use-orders.ts`
    - `src/mocks/handlers.ts`
    - `docs/handoffs/session-11.md`
- Objective and changed files: Session 11 Repair r1 addressing all three review findings from `.agents/sessions/session-11-initial-review.md`:
  1. Preserved URL filter presence versus explicit empty override (`?status=`, `?search=`, `?startDate=`, `?endDate=`), ensured "Clear all" overrides all filters with empty parameters while preserving unrelated parameters (`pageSize`, `scenario`), ensured updating one filter preserves empty overrides on others, and documented the convention in `docs/mock-api.md`.
  2. Fixed in-scope Prettier formatting failures on `docs/ai-journal.md` and `src/components/providers/query-provider.tsx`.
  3. Replaced arbitrary utility `min-h-[1.5rem]` in `src/features/orders/components/orders-list.tsx` with design-system token `h-control-sm` (2rem / 32px).
- Out-of-scope changes: None. No files modified outside the allowlist. Zero edits to coordinator files (`tasks.json`, `.agents/*`), `docs/handoffs/session-11.md`, or package manifests. All changes remain unstaged and uncommitted.

## Acceptance evidence

| Task + criterion                                                            | pass / fail / not_run / not_applicable | Reproduction or command                                                                            | Evidence / observed result                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| step-13 (r1): URL absence vs. explicit empty override                       | pass                                   | Playwright browser visit to `/orders` vs. selecting "All Statuses"                                 | Untouched `/orders` has 0 filter query parameters (`searchParams.toString() === ""`, all 4 keys absent). Selecting "All Statuses" sets URL to `?status=`. `searchParams.has('status') === true` and `searchParams.get('status') === ""` (`orders-untouched-absent.png`, `orders-status-empty-override.png`). |
| step-13 (r1): Preserving empty overrides across filter updates              | pass                                   | Playwright typing search "001" while `status=` present                                             | URL updates to `?status=&search=001`. `status=` is retained as explicit override; 1 matching row displayed (`orders-search-preserves-empty-status.png`).                                                                                                                                                     |
| step-13 (r1): Clearing search writes empty override                         | pass                                   | Playwright clearing search input                                                                   | Debounced update sets URL to `?status=&search=`. Both overrides preserved (`orders-cleared-search-empty-override.png`).                                                                                                                                                                                      |
| step-13 (r1): Date clear writes empty override                              | pass                                   | Playwright setting date then clearing input                                                        | URL updates to `?status=delivered&search=&startDate=` (`orders-date-cleared-override.png`).                                                                                                                                                                                                                  |
| step-13 (r1): "Clear all" sets empty overrides & preserves unrelated params | pass                                   | Playwright clicking "Clear all" on `/orders?status=delivered&search=ORD&pageSize=5&scenario=delay` | URL becomes `?status=&search=&pageSize=5&scenario=delay&startDate=&endDate=`. All 4 filters set to empty overrides; `page` deleted; `pageSize=5` and `scenario=delay` preserved (`orders-clear-all-preserves-unrelated.png`).                                                                                |
| step-13 (r1): Reload restoration of URL state and UI controls               | pass                                   | Playwright `page.reload()` on URL with empty overrides                                             | Reload preserves exact URL query string; form controls restore to empty/All Statuses (`orders-reload-restored.png`).                                                                                                                                                                                         |
| step-13 (r1): Documentation of empty override convention                    | pass                                   | `docs/mock-api.md` Section 4                                                                       | Fully documented absence vs. present-empty convention, Session 12 `usePreferencesStore` evaluation formula, and "Clear all" unrelated parameter preservation.                                                                                                                                                |
| step-13 (r1): Prettier formatting of in-scope files                         | pass                                   | `pnpm exec prettier --check <touched_files>`                                                       | Exit code 0 across all 5 repair files and all 14 Session 11 files.                                                                                                                                                                                                                                           |
| step-13 (r1): Baseline Prettier report isolation                            | pass                                   | `pnpm format:check`                                                                                | Exit code 1; fails exclusively on the 3 recorded baseline files (`docs/delivery.md`, `docs/handoffs/session-03.md`, `pnpm-workspace.yaml`). Zero in-scope failures.                                                                                                                                          |
| step-13 (r1): Design token conformance                                      | pass                                   | Playwright computed style inspection on `.h-control-sm`                                            | Replaced `min-h-[1.5rem]` with canonical token `h-control-sm` from `tailwind.config.ts`. Computed height is `32px` (`2rem`), matching `<Button size="sm">`.                                                                                                                                                  |
| step-13 (r1): Four-viewport responsive verification (no page overflow)      | pass                                   | Playwright at 375x812, 768x1024, 1280x800, 1920x1080                                               | 0 document horizontal overflow (`scrollWidth <= clientWidth` across all 4). Table region has internal horizontal scroll at 375px (`scrollWidth: 618, clientWidth: 326`).                                                                                                                                     |
| step-13 (r1): Keyboard accessibility & visible focus ring                   | pass                                   | Playwright Tab focus on table scroll container                                                     | Visible 2px focus ring on `[role="region"][aria-label="Orders Data Table"]` (`orders-focus-table.png`).                                                                                                                                                                                                      |
| step-13 (r1): Mentor confirmation of visual-baseline substitution           | not_run                                | External mentor confirmation                                                                       | `docs/design-system.md` retained as visual baseline; external confirmation remains unrecorded.                                                                                                                                                                                                               |

## Checks

| Command                                      | Exit code | Result                                                                                                                    |
| -------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec tsc --noEmit`                     | 0         | Strict mode passed with zero errors.                                                                                      |
| `pnpm lint`                                  | 0         | Passed with 1 pre-existing warning at `public/mockServiceWorker.js:1` (unused eslint-disable).                            |
| `pnpm build`                                 | 0         | Next.js 15.5.29 compiled successfully (dynamic `/orders` at 10.4 kB / 125 kB).                                            |
| `pnpm format:check`                          | 1         | Fails solely on 3 pre-existing baseline files (`docs/delivery.md`, `docs/handoffs/session-03.md`, `pnpm-workspace.yaml`). |
| `pnpm exec prettier --check <touched_files>` | 0         | All touched and Session 11 files pass Prettier check.                                                                     |
| `git diff --check`                           | 0         | Clean diff with zero whitespace anomalies.                                                                                |

## Touched UI

| Route + state                                                       | 375                          | 768                    | 1280                     | 1920                     | Evidence                                                                   |
| ------------------------------------------------------------------- | ---------------------------- | ---------------------- | ------------------------ | ------------------------ | -------------------------------------------------------------------------- |
| `/orders` untouched (Absent params)                                 | `360/360` (table: `618/326`) | `768/768` (0 overflow) | `1280/1280` (0 overflow) | `1920/1920` (0 overflow) | `output/playwright/session-11-r1/orders-*.png`                             |
| `/orders?status=` (Empty override)                                  | —                            | —                      | `1280/1280`              | —                        | `output/playwright/session-11-r1/orders-status-empty-override.png`         |
| `/orders?status=&search=001` (Search + override)                    | —                            | —                      | `1280/1280`              | —                        | `output/playwright/session-11-r1/orders-search-preserves-empty-status.png` |
| `/orders?status=&search=` (Both empty overrides)                    | —                            | —                      | `1280/1280`              | —                        | `output/playwright/session-11-r1/orders-cleared-search-empty-override.png` |
| `/orders?status=delivered&search=` (Status + search override)       | —                            | —                      | `1280/1280`              | —                        | `output/playwright/session-11-r1/orders-status-delivered.png`              |
| `/orders?status=delivered&search=&startDate=` (Date clear override) | —                            | —                      | `1280/1280`              | —                        | `output/playwright/session-11-r1/orders-date-cleared-override.png`         |
| `/orders?...` (Clear all with unrelated params)                     | —                            | —                      | `1280/1280`              | —                        | `output/playwright/session-11-r1/orders-clear-all-preserves-unrelated.png` |
| `/orders?...` (Reload restoration)                                  | —                            | —                      | `1280/1280`              | —                        | `output/playwright/session-11-r1/orders-reload-restored.png`               |
| `/orders` keyboard focus on table region                            | —                            | —                      | `1280/1280`              | —                        | `output/playwright/session-11-r1/orders-focus-table.png`                   |

- **Keyboard sequence and observed focus behavior**:
  - Focus progression: Search input -> Status select -> From date -> To date -> Table scroll region (`tabIndex={0}`) -> Pagination controls.
  - Table scroll region has `role="region" aria-label="Orders Data Table"` and receives a distinct 2px focus ring (`focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2`).
- **Contrast measurement and method**:
  - All text and border colors adhere to WCAG 2.1 AA tokens (`text-foreground` on `bg-surface` 17.85:1, `text-muted-foreground` 7.58:1, `border-control-border` 4.76:1).
- **Loading/error/empty/retry reproduction**:
  - Validated in Session 11 initial suite; query resolution now passes `undefined` for empty strings to MSW handler so unfiltered records render properly without losing the browser URL's explicit empty overrides.
- **Server/client boundary explanation**:
  - `src/app/(dashboard)/orders/page.tsx` remains a pure Server Component.
  - Interactive controls reside within client island `OrdersList` wrapped in `<Suspense>` to prevent Next.js 15 build deopt.
- **Design baseline and deviations**:
  - Arbitrary utility `min-h-[1.5rem]` replaced with `h-control-sm` (2rem / 32px), exactly matching adjacent `<Button size="sm">`. Zero arbitrary Tailwind values remain.
- **Playwright smoke**:
  - Executed against production server (`pnpm start -p 3000`).
  - All 14 screenshot artifacts and machine-readable `results.json` saved in `output/playwright/session-11-r1/`.

## Recovery

- **Decisions and tradeoffs**:
  - Decoupled filter change triggers in `OrdersFilters` so updating one filter dimension (e.g. status) only dispatches its own key to `onFilterChange`. This prevents race conditions and ensures other filters' explicit empty overrides are never overwritten.
  - "Clear all" explicitly writes empty strings for all 4 filter keys (`status`, `search`, `startDate`, `endDate`), deletes `page` to reset pagination, and strictly preserves unrelated parameters like `pageSize=5` or `scenario=delay`.
  - Client normalizes empty strings to `undefined` before calling `useOrders` / `getOrders` so MSW handler queries all records while preserving URL overrides for D12.
- **Pre-existing failures versus new failures**:
  - `pnpm format:check` reports exit code 1 solely due to the 3 known out-of-scope baseline files (`docs/delivery.md`, `docs/handoffs/session-03.md`, `pnpm-workspace.yaml`).
  - Zero in-scope formatting failures. Scoped Prettier check over all touched files exits 0.
- **Known issues, not-run checks and blockers**:
  - Mentor confirmation for visual baseline substitution is marked `not_run` (external dependency).
  - All technical acceptance criteria pass.
- **Reproduction and next concrete action**:
  - Codex reviews git diff and evidence in `output/playwright/session-11-r1/`.
  - User stages and commits files after Codex approval.
  - Codex updates task status to accepted.
- **AI journal entry**: `docs/ai-journal.md`, "Session 11 Repair r1 — Step-13 / D11: URL Empty Overrides, Design Token & Formatting".
- **Suggested next session (not executed)**: Session 12 (step-14 / D12): Order Preferences, Zustand persist, theme, and localization foundation.

Leave this report and code uncommitted. The user stages/commits after Codex review.
Do not invent implementation/report SHAs; only baseline HEAD exists before the user commits.
Screenshots do not prove keyboard support; build success does not prove UI acceptance.
