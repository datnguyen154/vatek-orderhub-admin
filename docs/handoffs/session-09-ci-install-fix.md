# Session 09 — CI Dependency Install Fix — ready_for_review

- Branch: `feat/orders-list`
- Baseline SHA: `231724d13a66973cfafcf2982f7d987e7a5605d8` (`231724d`)
- Review target: uncommitted working tree against baseline HEAD (including staged and untracked files)
- Changed/untracked files:
  - Created (untracked):
    - `pnpm-workspace.yaml`
    - `docs/handoffs/session-09-ci-install-fix.md`
  - Modified:
    - `docs/ai-journal.md`
- Preserved historical handoffs (unmodified):
  - `docs/handoffs/session-09.md`
  - `docs/handoffs/session-09-r2.md`
  - `docs/handoffs/session-09-r3.md`
- Scope check: Only allowlisted files touched. `package.json`, `pnpm-lock.yaml`, `.env.local`, and coordinator files in `.agents/` remain pristine and unmodified.

---

## 1. Problem Description & Root Cause Analysis

### Vercel CI Error

During PR deployment on Vercel for Session 09 (`feat/orders-list` at `231724d`), `pnpm install` failed with the following error:

```text
ERR_PNPM_IGNORED_BUILDS: Ignored build scripts: msw@2.7.3
pnpm install exited with 1
```

### Root Cause

1. `package.json` pins `packageManager: "pnpm@11.25.0"`.
2. Local pnpm version is confirmed as `11.25.0` (`pnpm --version`).
3. In pnpm v11 (and v10+), strict build-script security is enabled by default. Dependencies with lifecycle scripts (such as `postinstall` in `msw@2.7.3`) are blocked from running build scripts unless explicitly authorized in `pnpm-workspace.yaml`. When unapproved build scripts are detected, pnpm halts installation with `ERR_PNPM_IGNORED_BUILDS`.
4. Prior to this fix, no `pnpm-workspace.yaml` existed in the repository, causing installation to fail under strict build-script validation.

---

## 2. Implementation & Security Configuration

Created `pnpm-workspace.yaml` at the capstone root (`d:/vatek-labs/orderhub-admin-console/pnpm-workspace.yaml`):

```yaml
packages:
  - "."
allowBuilds:
  "msw@2.7.3": true
```

### Security & Constraint Compliance

- **Strict build security preserved**: Only `msw@2.7.3` is authorized to execute its build script; all other packages continue to have strict build-script blocking enforced.
- **No deprecated or broad escapes**:
  - Did NOT use `pnpm.onlyBuiltDependencies` in `package.json`.
  - Did NOT add `.npmrc`.
  - Did NOT disable `strictDepBuilds` or `ignore-scripts`.
  - Did NOT enable `dangerouslyAllowAllBuilds`.
  - Did NOT allow blanket dependency scripts.

---

## 3. Lockfile Compatibility & Verification

Executed `pnpm install --frozen-lockfile` against local pnpm `11.25.0`:

```text
✓ Lockfile passes supply-chain policies (verified 17h ago)
Lockfile is up to date, resolution step is skipped
Already up to date

Done in 1.7s using pnpm v11.25.0
```

- **Lockfile verification**: `git status` confirms `pnpm-lock.yaml` is **100% unchanged** (`nothing added to commit but untracked files present`).
- **Compatibility confirmation**: `pnpm-workspace.yaml` with `allowBuilds` is the native, official configuration format for pnpm 11.25.0. It resolves `ERR_PNPM_IGNORED_BUILDS` cleanly while maintaining frozen lockfile integrity.

---

## 4. Verification Suite Results

| Command                                                                                                        | Exit code | Observed result                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                                                                               | `0`       | Passed: Lockfile validated, 0 changes to `pnpm-lock.yaml`.                                                                                                                                     |
| `pnpm exec tsc --noEmit`                                                                                       | `0`       | Passed: TypeScript 5.8.2 strict check passed with 0 errors.                                                                                                                                    |
| `pnpm lint`                                                                                                    | `0`       | Passed: ESLint 9 evaluated with 0 errors (1 harmless warning on vendor `public/mockServiceWorker.js`).                                                                                         |
| `pnpm build`                                                                                                   | `0`       | Passed: Next.js 15.5.29 production build compiled successfully in 5.0s; dynamic `/orders` (4.97 kB / 115 kB).                                                                                  |
| `pnpm exec prettier --check pnpm-workspace.yaml docs/ai-journal.md docs/handoffs/session-09-ci-install-fix.md` | `0`       | Passed: All touched in-scope files conform 100% to Prettier code style.                                                                                                                        |
| `pnpm format:check`                                                                                            | `1`       | Pre-existing baseline failure: 2 pre-existing out-of-scope D6 files (`docs/delivery.md` and `docs/handoffs/session-03.md`) contain CRLF line endings. All touched in-scope files pass cleanly. |
| `git diff --check`                                                                                             | `0`       | Passed: Clean diff with zero whitespace or line-ending anomalies.                                                                                                                              |

---

## 5. Deployment Status & Handover

- **Local pnpm status**: Local pnpm `11.25.0` is confirmed (`pnpm --version`); `pnpm install --frozen-lockfile` passed cleanly with lockfile unchanged.
- **Vercel pnpm status**: The actual pnpm version running on Vercel is unverified; we can only confirm the pinned version (`11.25.0`) is used if deployment logs verify that Corepack/`packageManager` was applied.
- **Deployment status**: Vercel has not been rerun after this change; build status remains pending. When the new build log is available, record the exact pnpm version and install outcome.
- **Git status**: All changes (`pnpm-workspace.yaml`, `docs/ai-journal.md`, `docs/handoffs/session-09-ci-install-fix.md`) remain strictly **uncommitted** and **unstaged** for Codex review.
