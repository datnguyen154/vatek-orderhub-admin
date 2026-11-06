# OrderHub Admin Console — Delivery & Deployment Pipeline

This document defines the delivery protocol, Pull Request (PR) workflow, and Vercel preview deployment guidelines for the OrderHub Admin Console capstone project, fulfilling the Day 6 (D6 / Step 3) delivery baseline requirements.

---

## 1. Repository & Branching Strategy

| Property                        | Value                                                      | Description                                                                           |
| ------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Remote Repository**           | `https://github.com/datnguyen154/vatek-orderhub-admin.git` | Official capstone GitHub repository                                                   |
| **Default / Production Branch** | `main`                                                     | Production-ready codebase; baseline commit `a5ae78a7c2b57163ebec0412defccf877a805e43` |
| **Delivery Feature Branch**     | `feat/first-pr-delivery`                                   | Dedicated branch created from `main` for D6 delivery preparation                      |
| **Target Merge Base**           | `main`                                                     | All feature branches target `main` via reviewed Pull Requests                         |

### Branching Rules

1. **No Direct Commits to Main**: All features, primitives, and documentation must flow through dedicated feature branches (`feat/*`, `docs/*`, `fix/*`).
2. **Atomic Delivery**: Each branch addresses bounded session task scopes defined in `.agents/sessions.md` and `.agents/tasks.json`.
3. **No Unreviewed Merges**: Merging into `main` requires passing automated verification checks, preview smoke verification, and user authorization.

---

## 2. First PR (Pull Request) Status

| Parameter            | Status / Value           | Details / Verification Evidence                                                                                                   |
| -------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **Source Branch**    | `feat/first-pr-delivery` | Created locally from `main` at `a5ae78a`                                                                                          |
| **Target Base**      | `main`                   | Remote tracking branch `origin/main`                                                                                              |
| **PR Status**        | `pending` / `blocked`    | Feature branch prepared locally; remote push and PR creation pending user commit, push, and PR creation                           |
| **PR Number / URL**  | `pending`                | To be assigned upon GitHub PR submission by user                                                                                  |
| **Head Commit SHA**  | `pending`                | Local working tree left uncommitted for Codex review and user commit; baseline HEAD is `a5ae78a7c2b57163ebec0412defccf877a805e43` |
| **Remote PR Count**  | `0`                      | Verified via GitHub REST API (`https://api.github.com/repos/datnguyen154/vatek-orderhub-admin/pulls?state=all` -> Count: 0)       |
| **PR Review Status** | `pending`                | Awaits user review post-submission                                                                                                |
| **Merge Status**     | `pending`                | Never merge without preview verification                                                                                          |

---

## 3. Vercel Preview Deployment Status

| Parameter               | Status / Value        | Details / Verification Evidence                                                                                                            |
| ----------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Deployment Platform** | Vercel                | Next.js 15 App Router optimized hosting                                                                                                    |
| **Deployment Status**   | `pending` / `not_run` | Vercel project connection and automated preview trigger pending user account configuration                                                 |
| **Remote Deployments**  | `0 records`           | Verified via GitHub REST API (`https://api.github.com/repos/datnguyen154/vatek-orderhub-admin/deployments` -> 0 GitHub deployment records) |
| **Deployment SHA**      | `pending`             | Will reflect the committed head SHA of the feature branch                                                                                  |
| **Preview URL**         | `pending`             | Unverified candidate-domain probe to `https://vatek-orderhub-admin.vercel.app` returned HTTP 404; actual preview URL pending Vercel deploy |
| **HTTP Verification**   | `not_run`             | Requires live preview URL from active Vercel deployment                                                                                    |
| **Browser Smoke Check** | `not_run`             | Requires live preview URL; will execute via Playwright MCP across 375, 768, 1280, 1920px viewports                                         |

---

## 4. Local Quality & Build Verification

Before any PR submission or deployment, the following verification suite must pass with exit code `0` from the repository root:

| Command                  | Purpose                                              | Result / Observed Exit Code                                 |
| ------------------------ | ---------------------------------------------------- | ----------------------------------------------------------- |
| `pnpm exec tsc --noEmit` | Strict TypeScript compilation check                  | `Exit code 0` (0 errors, strict mode enabled)               |
| `pnpm lint`              | ESLint 9 flat configuration rule validation          | `Exit code 0` (0 errors, 0 warnings)                        |
| `pnpm build`             | Production Next.js compilation & static optimization | `Exit code 0` (Static pages `/` and `/_not-found` compiled) |
| `pnpm format:check`      | Prettier code style conformance verification         | `Exit code 0` (All matched files use Prettier style)        |

---

## 5. Security & Secrets Management Policy

- **Zero Secrets in Source Control**: Secrets, API keys, tokens, or credential files must never be staged or committed.
- **Gitignore Protection**: `.env.local`, `.env.*.local`, `.codegraph/`, `node_modules/`, `.next/`, and `output/` are explicitly ignored.
- **Example Environment**: `.env.example` contains only documented non-sensitive placeholder variables.
- **Server Boundary Isolation**: Any future server secrets (such as the D9 demo session cookie secret) are restricted to Server Components and server-side utilities (`src/lib/auth/`), never imported into Client Components (`"use client"`).

---

## 6. Session Delivery Boundaries & Prerequisites

As specified in project rules (`.agents/rules.md` Rules 15 & 21) and the Session 03 prompt:

1. **Session Scope & Execution Boundary**: Under the project coordination protocol, changes require Codex review before the user stages and commits. Furthermore, the Session 03 prompt specifically instructed the agent not to run `git add`, `git commit`, `git push`, `git merge`, or deployment commands in this session, leaving all work uncommitted for review.
2. **Environment Tooling & Credentials**: In this execution session, neither `gh` (GitHub CLI) nor `vercel` CLI was found in the environment PATH, and no write-capable credentials for pushing to the remote repository or deploying to Vercel were configured or available to the agent.
3. **Prerequisites for D6 Gate Completion**:
   - The user reviews the prepared local diff and commits the changes on `feat/first-pr-delivery`.
   - The user pushes `feat/first-pr-delivery` to GitHub.
   - The user creates the First PR targeting `main`.
   - Vercel builds the preview deployment and produces an active preview URL.
   - HTTP response verification and Playwright smoke testing are executed against the actual preview URL.
   - The user reviews and merges the PR into `main`.

---

## 7. Operator Runbook (Step-by-Step for User)

Follow these steps to complete the remote delivery lifecycle:

### Step 1: Review Local Working Tree

Review the diff prepared by Antigravity:

```bash
git status
git diff
```

### Step 2: Stage and Commit the Delivery Preparation

Commit the delivery documentation and handoff on the feature branch:

```bash
git add README.md docs/delivery.md docs/ai-journal.md docs/handoffs/session-03.md
git commit -m "docs(delivery): prepare first PR and Vercel preview deployment pipeline"
```

### Step 3: Push Feature Branch to GitHub

```bash
git push -u origin feat/first-pr-delivery
```

### Step 4: Open Pull Request on GitHub

Open a Pull Request from `feat/first-pr-delivery` into `main` at:
`https://github.com/datnguyen154/vatek-orderhub-admin/compare`

- Title: `docs(delivery): prepare first PR and Vercel preview deployment pipeline`
- Description: Link to verification results and acceptance criteria.

### Step 5: Configure Vercel Project & Deploy Preview

1. Log in to [Vercel Dashboard](https://vercel.com).
2. Import project `datnguyen154/vatek-orderhub-admin`.
3. Set Framework Preset: **Next.js**.
4. Deploy the preview environment for branch `feat/first-pr-delivery`.

### Step 6: Verify Preview & Record Evidence

1. Once deployed, verify HTTP response:
   ```bash
   curl -I https://<preview-domain>.vercel.app
   ```
2. Run Playwright smoke check against the preview URL across 375, 768, 1280, 1920px viewports.
3. Update `docs/delivery.md` with actual PR URL, deployment URL, and commit SHA.

### Step 7: Merge PR into Main

Once all checks and preview smoke tests are confirmed, merge the PR into `main`.
