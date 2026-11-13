# OrderHub Admin Console — Delivery & Deployment

This document records the actual GitHub and Vercel delivery state for the capstone. Last reviewed **2026-11-13**.

## 1. Repository and Branching

| Property                                          | Current value                                                                             |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| GitHub repository                                 | [datnguyen154/vatek-orderhub-admin](https://github.com/datnguyen154/vatek-orderhub-admin) |
| Production branch                                 | `main`                                                                                    |
| Local `main` / cached `origin/main` at last check | `4917062bc39eae39a83e2a092bfeb20e4449152d` — PR #13 merge                                 |
| Production URL                                    | [https://vatek-orderhub-admin.vercel.app/](https://vatek-orderhub-admin.vercel.app/)      |
| Hosting                                           | Vercel                                                                                    |

Changes are delivered through focused feature or documentation branches and reviewed Pull Requests targeting `main`. The user reviews the diff and performs commits, pushes, and merges. Do not commit deployment secrets.

## 2. Merged Pull Requests

All merged pull requests are tracked on GitHub: [Merged Pull Requests](https://github.com/datnguyen154/vatek-orderhub-admin/pulls?q=is%3Apr+is%3Amerged).

## 3. Deployment Record

| Milestone               | `main` SHA                                          | Production URL                                                                       | Checked                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Not checked                                                                                                                            |
| ----------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Week 2 / Gate 2         | `5e65fb2c6084e7fb54c4f3b7c8ed5f6811ee5240` (PR #7)  | [https://vatek-orderhub-admin.vercel.app/](https://vatek-orderhub-admin.vercel.app/) | Live deployment loaded `/mockServiceWorker.js` (HTTP 200, 8,213 bytes); active worker controlled the page and demo login rendered 10 fixtures on `/orders`. Unauthenticated `/orders` redirected to `/login` (HTTP 307). Local checks passed: typecheck, lint, build, 4 viewports, keyboard focus, mobile table internal scroll, token baseline, and contrast (6.7:1). User confirmed Vercel env scopes (`NEXT_PUBLIC_API_MOCKING=enabled`, `DEMO_SESSION_SECRET`). | Mentor confirmation of replacing Figma with `docs/design-system.md`; Vercel build logs not independently viewed; production auth/RBAC. |
| Week 3 (Sessions 11–16) | `4917062bc39eae39a83e2a092bfeb20e4449152d` (PR #13) | [https://vatek-orderhub-admin.vercel.app/](https://vatek-orderhub-admin.vercel.app/) | Each session's preview root loaded without Vercel SSO; the coordinator verified commits and ran local checks.                                                                                                                                                                                                                                                                                                                                                       | Authenticated feature flows on the previews, and the production deployment of `4917062`.                                               |

The D7 login preview URL was historically redirected to Vercel SSO and could not be reviewed on that deployment.

## 4. Local Verification Record

Run from the capstone root before a new PR:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
pnpm format:check
```

For a browser review, use the project's Playwright MCP when available and capture evidence for the deployed URL and required viewport widths. A successful Vercel build alone does not establish responsive or accessibility acceptance.

Per-session check results live in `docs/handoffs/` and, from Session 17, in GitHub Actions.

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
4. Confirm Vercel has produced a preview for the PR and record the preview URL and source SHA in the PR description. This document is updated only at milestones (see §3).
5. Open the actual preview URL. If it redirects to Vercel authentication, arrange authorized access before the UI review; do not treat the redirect as a successful app smoke check.
6. Review affected routes at 375px, 768px, 1280px, and 1920px, including keyboard navigation and visible focus. Record what was actually checked and any remaining blocker.
7. After review and user approval, merge the PR. Confirm the resulting `main` merge SHA and update the production deployment record after Vercel deploys it.
