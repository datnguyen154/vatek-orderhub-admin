# OrderHub Admin Console — Delivery & Deployment

This document records the actual GitHub and Vercel delivery state for the capstone, plus the checks still needed before a preview can be accepted. Deployment facts below are dated **2026-11-06**; update this record when a newer preview is reviewed.

## 1. Repository and Branching

| Property                                   | Current value                                                                             |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| GitHub repository                          | [datnguyen154/vatek-orderhub-admin](https://github.com/datnguyen154/vatek-orderhub-admin) |
| Production branch                          | `main`                                                                                    |
| Local `main` / `origin/main` at last check | `6ba3307f02d5d999a39fda7c0e666052aaefa3e7` — PR #2 merge                                  |
| Production URL                             | [https://vatek-orderhub-admin.vercel.app/](https://vatek-orderhub-admin.vercel.app/)      |
| Hosting                                    | Vercel                                                                                    |

Changes are delivered through focused feature or documentation branches and reviewed Pull Requests targeting `main`. The user reviews the diff and performs commits, pushes, and merges. Do not commit deployment secrets.

## 2. Merged Pull Requests

| PR                                                                | Change                     | Status | Merge commit                               |
| ----------------------------------------------------------------- | -------------------------- | ------ | ------------------------------------------ |
| [#1](https://github.com/datnguyen154/vatek-orderhub-admin/pull/1) | D6 delivery setup          | Merged | `55d627914b778d75b2c7d0992f7e6d6eefb49c91` |
| [#2](https://github.com/datnguyen154/vatek-orderhub-admin/pull/2) | D7 responsive login screen | Merged | `6ba3307f02d5d999a39fda7c0e666052aaefa3e7` |

The D7 feature commit is `2b7f8d9f569454b19f4b5af82997d0a6f4369a69`; it is an ancestor of the PR #2 merge commit.

## 3. Deployment Record

| Environment | URL                                                                                                  | Source commit / branch                                                                                            | Status and evidence                                                                                                                                                                                                                          |
| ----------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Production  | [vatek-orderhub-admin.vercel.app](https://vatek-orderhub-admin.vercel.app/)                          | `55d627914b778d75b2c7d0992f7e6d6eefb49c91` (`main` at the time, SHA reported by the user)                         | Live page opened in a browser on 2026-11-06. It renders the OrderHub Admin Console and the D6 design-token baseline. The source SHA is user-reported; Vercel deployment metadata was not independently available.                            |
| D7 preview  | [Login preview](https://vatek-orderhub-admin-git-feat-login-screen-dat-s-projects9.vercel.app/login) | `2b7f8d9f569454b19f4b5af82997d0a6f4369a69` on `feat/login-screen` (SHA and successful build reported by the user) | The preview URL was opened on 2026-11-06, but Vercel redirected the unauthenticated browser to its sign-in/SSO page. The deployed login page could not be visually or interactively reviewed, so preview smoke verification remains pending. |

The live production page currently corresponds to the D6 baseline, while `main` has advanced through D7. The D7 preview build was reported successful, but its app route remains protected from the available review session. Do not describe the D7 preview as smoke-tested until the page itself is accessible and reviewed.

### Required update after the next real preview review

When an actual Vercel preview is accessible, update this section with its exact URL, branch, full deployment SHA, review date, and outcome. Open the deployed app route and record responsive results at **375px, 768px, 1280px, and 1920px**, plus keyboard/focus checks for affected controls. If Vercel protection blocks access, record the redirect and leave the UI smoke check pending. Repeat this update for each materially new preview rather than reusing an earlier deployment's evidence.

## 4. Local Verification Record

The D6 delivery session reported successful runs of `pnpm exec tsc --noEmit`, `pnpm lint`, and `pnpm build`. These are historical results for that session, not a verification of the current working tree or the deployed D7 UI.

The D7 review later found that the repository-wide `pnpm format:check` was affected by CRLF line endings in `docs/delivery.md` and `docs/handoffs/session-03.md`. A documentation refresh does not imply that all repository checks have been rerun. Record command, date, and exit status in the relevant session handoff when checks are run.

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
