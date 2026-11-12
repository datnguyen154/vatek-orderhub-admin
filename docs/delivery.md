# OrderHub Admin Console — Delivery & Deployment

This document records the actual GitHub and Vercel delivery state for the capstone. Last reviewed **2026-11-12**.

## 1. Repository and Branching

| Property                                   | Current value                                                                             |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| GitHub repository                          | [datnguyen154/vatek-orderhub-admin](https://github.com/datnguyen154/vatek-orderhub-admin) |
| Production branch                          | `main`                                                                                    |
| Local `main` / cached `origin/main` at last check | `719f8c4c078087bf2d9914ce2cf57082477e75a0` — PR #11 merge                             |
| Production URL                             | [https://vatek-orderhub-admin.vercel.app/](https://vatek-orderhub-admin.vercel.app/)      |
| Hosting                                    | Vercel                                                                                    |

Changes are delivered through focused feature or documentation branches and reviewed Pull Requests targeting `main`. The user reviews the diff and performs commits, pushes, and merges. Do not commit deployment secrets.

## 2. Merged Pull Requests

| PR                                                                | Change                     | Status | Merge commit                               |
| ----------------------------------------------------------------- | -------------------------- | ------ | ------------------------------------------ |
| [#1](https://github.com/datnguyen154/vatek-orderhub-admin/pull/1) | D6 delivery setup          | Merged | `55d627914b778d75b2c7d0992f7e6d6eefb49c91` |
| [#2](https://github.com/datnguyen154/vatek-orderhub-admin/pull/2) | D7 responsive login screen | Merged | `6ba3307f02d5d999a39fda7c0e666052aaefa3e7` |
| [#3](https://github.com/datnguyen154/vatek-orderhub-admin/pull/3) | D8 base UI primitives and modal | Merged | `cc7ad42b5b01d1883f35de832adee0f2b210e83a` |
| [#4](https://github.com/datnguyen154/vatek-orderhub-admin/pull/4) | D8.3 component catalogue and Login integration | Merged | `4045028bdd6d45950f9d595762571e449167a2a3` |
| [#5](https://github.com/datnguyen154/vatek-orderhub-admin/pull/5) | D9 app shell and demo session guard | Merged | `858afcf343a8b1ff163e8b6006d76b44ca87fec0` |
| [#6](https://github.com/datnguyen154/vatek-orderhub-admin/pull/6) | D9 route states and preferences placeholder | Merged | `94ebf324f48ba78087f87ebb1e979fbeee0ceadb` |
| [#7](https://github.com/datnguyen154/vatek-orderhub-admin/pull/7) | D10 typed API client, MSW Orders list and Gate 2 audit | Merged | `5e65fb2c6084e7fb54c4f3b7c8ed5f6811ee5240` |
| [#8](https://github.com/datnguyen154/vatek-orderhub-admin/pull/8) | D11 cached pagination and URL filters | Merged | `40abae100fc9294b6abd2804a570b704270a0514` |
| [#9](https://github.com/datnguyen154/vatek-orderhub-admin/pull/9) | D12 preferences, theme and vi/en i18n | Merged | `c4bf1842946d949097b8e94f4c19a197bcd0cd00` |
| [#10](https://github.com/datnguyen154/vatek-orderhub-admin/pull/10) | D12 demo auth, 401 token refresh, route guards and role-based UI | Merged | `4bd166f2793210d717bbfb335c0d7448efaa3465` |
| [#11](https://github.com/datnguyen154/vatek-orderhub-admin/pull/11) | D13 Create Order wizard with optimistic insert and rollback | Merged | `719f8c4c078087bf2d9914ce2cf57082477e75a0` |

Merge commits for #4–#9 were verified in local git history on 2026-11-11; #10 and #11 on 2026-11-12.

The D7 feature commit is `2b7f8d9f569454b19f4b5af82997d0a6f4369a69`; it is an ancestor of the PR #2 merge commit.

## 3. Deployment Record

| Environment | URL                                                                                                  | Source commit / branch                                                                                            | Status and evidence                                                                                                                                                                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Production  | [vatek-orderhub-admin.vercel.app](https://vatek-orderhub-admin.vercel.app/)                          | `55d627914b778d75b2c7d0992f7e6d6eefb49c91` (`main` at the time, SHA reported by the user)                         | Live page opened in a browser on 2026-11-06. It renders the OrderHub Admin Console and the D6 design-token baseline. The source SHA is user-reported; Vercel deployment metadata was not independently available.                            |
| D7 preview  | [Login preview](https://vatek-orderhub-admin-git-feat-login-screen-dat-s-projects9.vercel.app/login) | `2b7f8d9f569454b19f4b5af82997d0a6f4369a69` on `feat/login-screen` (SHA and successful build reported by the user) | The preview URL was opened on 2026-11-06, but Vercel redirected the unauthenticated browser to its sign-in/SSO page. The deployed login page could not be visually or interactively reviewed, so preview smoke verification remains pending. |
| D8 / Session 05 preview | [Login preview](https://vatek-orderhub-admin-git-feat-base-components-dat-s-projects9.vercel.app/login) | `12a70e2f9909f5205a9a31026c4aac8048d56aae` on `feat/base-components` (local HEAD and cached upstream tracking ref match; deployment SHA/Ready reported by user) | Opened on 2026-11-09; Login rendered. No horizontal overflow at 375/768/1280/1920px. Keyboard order email → password → submit and reverse Shift+Tab worked; password showed a visible 2px focus outline/ring. At 375px the browser client/scroll widths were both 360px (viewport 375px, scrollbar accounts for the difference); at the other widths client and scroll widths matched. This is a Login regression smoke only: the route does not yet consume the new primitives, so their runtime behavior remains for Session 06. Vercel deployment metadata was not independently available. |
| D9 / Session 06 preview | [Component catalogue](https://vatek-orderhub-admin-git-feat-component-eae200-dat-s-projects9.vercel.app/components) | `abd54ff999eb80058e0020e384bbb6781099d03a` on `feat/component-catalogue` (local HEAD and cached upstream tracking ref match; deployment SHA/Ready reported by user) | Opened on 2026-11-09; `/components` rendered the catalogue and `/login` rendered the form. Both routes had no horizontal overflow at 375/768/1280/1920px. Login Tab/Shift+Tab, Button Space activation, native Select ArrowDown, and Modal Enter/focus containment/Escape/focus restoration passed; no console errors. Fresh GitHub/Vercel metadata was unavailable because `git fetch origin` failed (`getaddrinfo() thread failed to start`); preview Ready/SHA are user-reported. |
| D9 / Session 07 preview | [Orders preview](https://vatek-orderhub-admin-git-feat-dashboard-shell-dat-s-projects9.vercel.app/orders) | `da56268b09d843b501335b7d12b661295a34cdcc` on `feat/dashboard-shell` (local HEAD and cached upstream tracking ref match; deployment SHA/Ready reported by user) | Opened on 2026-11-09; deployed root loaded and unauthenticated `/orders` redirected to `/login`. User reports verifying the auth guard and mobile drawer at 375px/768px. Codex did not independently rerun the drawer interaction or 1280px/1920px preview checks. GitHub/Vercel metadata could not be refreshed because network lookup failed (`getaddrinfo() thread failed to start`). |
| D9 / Session 08 preview | [Preferences preview](https://vatek-orderhub-admin-git-feat-route-states-dat-s-projects9.vercel.app/preferences) | `884a65364bf3e8ee0a1469a0812ae6963168796f` on `feat/route-states` (local HEAD and cached upstream tracking ref match; Vercel Ready/SHA reported by user) | Opened on 2026-11-09; preview root loaded. Direct `/preferences` access redirected unauthenticated user to `/login`, so the authenticated dashboard UI was not independently reviewed on this deployment. Vercel Ready is user-reported. |
| D11 / Session 11 preview | [Orders preview](https://vatek-orderhub-admin-git-feat-orders-que-bad04f-dat-s-projects9.vercel.app/) | `a032a167a466d01343a624f36e1e1a6e83478f92` on `feat/orders-query-cache` (verified as local HEAD on 2026-11-10) | User reports the commit was pushed to a PR and the Vercel build is Ready. The preview URL and deployment status are user-reported; deployed SHA and live `/orders` behavior were not independently rechecked for this delivery update. Session 11 local Playwright report and screenshots under `output/playwright/session-11-r1/` were reviewed during code review; they are not live-preview evidence. |
| D12 / Session 12 preview | Not recorded | `df37f10104379d8b2dc16b1e0dfd7e1ec86576a6` on `feat/order-preferences-i18n` (verified in local git history on 2026-11-11) | PR #9 merged into `main` as `c4bf1842946d949097b8e94f4c19a197bcd0cd00` (verified in local git history). Vercel Ready was user-reported at the time; the preview URL and deployed behavior were not recorded or independently checked. Local Playwright evidence under `output/playwright/session-12*/` was reviewed during code review; it is not live-preview evidence. |
| D12 / Session 13 preview | [Preview root](https://vatek-orderhub-admin-git-feat-auth-refresh-rbac-dat-s-projects9.vercel.app/) | `eeac68f9568a430b4035727d6f5b366144929775` on `feat/auth-refresh-rbac` (verified 2026-11-11: local HEAD equals `origin/feat/auth-refresh-rbac`, parent `c4bf184`, 20 files) | Commit pushed; merged into `main` via PR #10 as `4bd166f2793210d717bbfb335c0d7448efaa3465` (verified in local git history on 2026-11-12). Vercel Ready is user-reported. The preview root was fetched on 2026-11-11 with no Vercel SSO redirect and renders the OrderHub Admin Console placeholder page. The authenticated flow (role-aware Login copy, 401 refresh, role UI) was **not** exercised on the deployment, and the deployed SHA was not independently verified. Local Playwright evidence under `output/playwright/session-13/` and `session-13-r1/` was reviewed during code review; it is not live-preview evidence. |
| D13 / Session 14 preview | [Preview root](https://vatek-orderhub-admin-git-feat-create-ord-badff0-dat-s-projects9.vercel.app/) | `8cec78edc8fac158a503084017db7569cb363053` on `feat/create-order-wizard` (verified 2026-11-12: local HEAD equals `origin/feat/create-order-wizard`, parent `4bd166f`, 26 files, clean tree) | Commit pushed; merged into `main` via PR #11 as `719f8c4c078087bf2d9914ce2cf57082477e75a0` (verified in local git history on 2026-11-12). Vercel Ready is user-reported. The preview root was fetched on 2026-11-12 with no Vercel SSO redirect and renders the OrderHub Admin Console placeholder page. The Create Order wizard, optimistic insert, rollback and retry flows were **not** exercised on the deployment, and the deployed SHA was not independently verified. Local Playwright evidence under `output/playwright/session-14/`, `session-14-r1/` and `session-14-r2/` was reviewed during code review; it is not live-preview evidence. |
| D14 / Session 15 preview | [Preview root](https://vatek-orderhub-admin-git-feat-order-detail-dat-s-projects9.vercel.app/) | `bedfdc184335d341d4e640af58621a4519f63194` on `feat/order-detail` (verified 2026-11-12: local HEAD equals `origin/feat/order-detail` via `git ls-remote`, parent `719f8c4`, 20 files, clean tree) | Pushed with [PR #12](https://github.com/datnguyen154/vatek-orderhub-admin/pull/12), open and not merged at the 2026-11-12 check (GitHub public API). The preview root and `/mockServiceWorker.js` returned HTTP 200 on 2026-11-12 with no Vercel SSO redirect. The order detail flows (status change, cancel confirmation, invoice upload progress/failure, timeline) were **not** exercised on the deployment, and the deployed SHA was not independently verified. Local Playwright evidence under `output/playwright/session-15/` and `session-15-r1/` was reviewed during code review; it is not live-preview evidence. |

The live production page currently corresponds to the D6 baseline, while cached `origin/main` is at the D8 PR #3 merge. The D7 preview remains historically blocked by Vercel SSO. Session 05 and Session 06 previews have the route-specific smoke recorded above. Session 07 preview access and the unauthenticated `/orders` redirect were independently checked; drawer viewport verification is user-reported. Session 08 preview root was reachable, but direct `/preferences` access redirected to `/login`, so the authenticated dashboard UI was not reviewed on the deployment. Its Vercel Ready state is user-reported; the local feature branch and cached upstream ref match the reported commit SHA. For Session 11, the user reports Vercel Ready and the PR push; the source commit matches the local feature branch HEAD, but deployment metadata and live preview behavior were not independently verified.

**Update 2026-11-11:** local and cached `origin/main` are at the PR #9 merge `c4bf1842946d949097b8e94f4c19a197bcd0cd00` (Session 12). Production deployment of that SHA was not independently checked, so the statements above about production and cached `origin/main` describe the state on their original dates. Session 13 (`feat/auth-refresh-rbac`, `eeac68f9568a430b4035727d6f5b366144929775`) is pushed with a PR opened (user-reported); its merge status was not independently verified.

**Update 2026-11-12:** local and cached `origin/main` are at the PR #10 merge `4bd166f2793210d717bbfb335c0d7448efaa3465` (Session 13). Session 14 (`feat/create-order-wizard`, `8cec78edc8fac158a503084017db7569cb363053`) is pushed; its PR number and merge status were not independently verified.

**Update 2026-11-12 (Session 15):** local and cached `origin/main` are at the PR #11 merge `719f8c4c078087bf2d9914ce2cf57082477e75a0` (Session 14). Session 15 (`feat/order-detail`, `bedfdc184335d341d4e640af58621a4519f63194`) is pushed with PR #12 open; production deployment of `719f8c4` was not independently checked.

### Preview review protocol

For each materially new preview, record its URL, branch, full source SHA, review date, and outcome. Open the deployed route and record responsive results at **375px, 768px, 1280px, and 1920px**, plus keyboard/focus checks for affected controls. If Vercel protection blocks access, record the redirect and leave the UI smoke check pending. A browser smoke result applies only to the route and components actually rendered; it does not validate unrendered primitives or prove complete accessibility.

## 4. Local Verification Record

The D6 delivery session reported successful runs of `pnpm exec tsc --noEmit`, `pnpm lint`, and `pnpm build`. These are historical results for that session, not a verification of the current working tree or the deployed D7 UI.

The D7 and Session 06 reviews found that the repository-wide `pnpm format:check` fails on CRLF line endings in `docs/delivery.md` and `docs/handoffs/session-03.md`; all Session 06 and Session 07 touched source/handoff files passed scoped Prettier. Session 07 typecheck and lint passed on 2026-11-09. Its clean-output build first hit `EPERM` creating `.next/server/app/components`; after that generated output directory was pre-created, `pnpm build` passed with the non-blocking Next.js ESLint-plugin detection warning. `git diff --check` passed. A documentation refresh does not imply that all repository checks have been rerun. Record command, date, and exit status in the relevant session handoff when checks are run.

Session 11 local review on 2026-11-10 at commit `a032a167a466d01343a624f36e1e1a6e83478f92`: `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`, scoped Prettier on changed files, and `git diff --check` passed. Lint emitted the existing warning at `public/mockServiceWorker.js:1`. Repository-wide `pnpm format:check` remains blocked by the recorded baseline files `docs/delivery.md`, `docs/handoffs/session-03.md`, and `pnpm-workspace.yaml`. Session 11 Playwright artifacts are local review evidence; the Vercel preview was not independently checked.

Session 13 review on 2026-11-11 at commit `eeac68f9568a430b4035727d6f5b366144929775`: on the uncommitted tree the coordinator ran scoped Prettier on all changed files and `git diff --check` (both exit 0). `pnpm exec tsc --noEmit`, `pnpm lint`, and `pnpm build` (exit 0) are **Anti-reported**: the review environment could not execute them, and the user did not report local results. `pnpm format:check` is Anti-reported to fail only on the three known baseline files. Anti ran Playwright against the local dev server (login by role, one 401 refresh and retry, second 401 sign-out, tampered-cookie sign-out, logout, storage inspection, 4 viewports) and the coordinator reviewed `results.json` and screenshots; no independent replay was run.

Session 14 review on 2026-11-12 at commit `8cec78edc8fac158a503084017db7569cb363053` (initial review plus repairs r1 and r2): the coordinator ran `git diff --check` (exit 0) and checked en/vi key parity (389/389). `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build` (exit 0) and scoped Prettier are **Anti-reported**: the review environment could not execute them, and the user did not report local results. Anti ran Playwright against the local dev server (role gating and viewer 403, per-step validation, product search, optimistic insert, `create=fail` rollback, `create=fail-once` retry with one order, Session 13 `expire-once` regression, 4 viewports, light and dark themes) and the coordinator reviewed `results.json` and screenshots. Known carry-over defects to Session 15: arbitrary Tailwind values in `create-order-wizard.tsx` and a probable horizontal overflow of the compact stepper at 375 px.

Session 15 review on 2026-11-12 at commit `bedfdc184335d341d4e640af58621a4519f63194` (initial review plus repair r1; carry-over C1–C4 included): the coordinator ran `git diff --check`, checked en/vi key parity (451/451) and scanned changed modules for duplicate exports (none in the commit). The user reports running scoped Prettier, `pnpm exec tsc --noEmit`, `pnpm lint` and `pnpm build` locally on the final tree, all passing; the review environment did not run them. `git diff --check 719f8c4 bedfdc1` flags only a trailing blank line at the end of `docs/handoffs/session-15-r1.md` (documentation, non-blocking). Anti ran Playwright against the local dev server (initial run 10/10 flows: carry-over fixes, navigation, status flow to delivered, cancel confirmation, rejected changes, viewer read-only, invoice upload success, type/size rejections and cancel, layout and accessibility; r1 rechecked the wizard mobile action bar at 375/768 px, the mock replay, cancel, dark mode and viewer) and the coordinator reviewed `results.json` and screenshots; no independent replay was run.

Run from the capstone root before a new PR:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
pnpm format:check
```

For a browser review, use the project's Playwright MCP when available and capture evidence for the deployed URL and required viewport widths. A successful Vercel build alone does not establish responsive or accessibility acceptance.

## 5. Security and Environment

- Keep secrets, API keys, access tokens, and credential files out of source control.
- `.env.local`, `.env.*.local`, `node_modules/`, `.next/`, `.codegraph/`, and local `output/` evidence are ignored by Git.
- `.env.example` may contain documented non-sensitive placeholders only.
- Keep server secrets in server-only modules. Do not import them into Client Components.

## 6. Operator Runbook

1. Review the branch and diff:

   ```bash
   git status --short --branch
   git diff --check
   git diff
   ```

2. Run the verification commands listed above and record their actual results.
3. The user stages and commits the reviewed changes, pushes the feature branch, and opens a PR targeting `main`.
4. Confirm Vercel has produced a preview for the PR. Record the preview URL, source SHA, and build result in this document.
5. Open the actual preview URL. If it redirects to Vercel authentication, arrange authorized access before the UI review; do not treat the redirect as a successful app smoke check.
6. Review affected routes at 375px, 768px, 1280px, and 1920px, including keyboard navigation and visible focus. Record what was actually checked and any remaining blocker.
7. After review and user approval, merge the PR. Confirm the resulting `main` merge SHA and update the production deployment record after Vercel deploys it.
