# OrderHub Admin Console

B2B Admin Console for OrderHub, built with Next.js 15 App Router, React 19, TypeScript strict mode, and Tailwind CSS.

## Prerequisites

- **Node.js**: v22.x (LTS)
- **Package Manager**: pnpm v11.x (pinned in `packageManager`)

## Getting Started

### 1. Installation

Install project dependencies:

```bash
pnpm install
```

> **Note on pnpm build scripts**: This project uses pnpm's explicit build-script allowlist in `pnpm-workspace.yaml`, which currently permits only `msw@2.7.3`. If installation reports `ERR_PNPM_IGNORED_BUILDS`, confirm that the pinned pnpm version and workspace configuration are active. Do not approve every package or disable lifecycle scripts globally.

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

> **Note**: Never commit `.env.local` or any secrets to source control.

### 3. Development Server

Start the local development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Quality Checks & Verification

Run the verification suite from the project root:

```bash
# Typecheck with TypeScript strict mode
pnpm exec tsc --noEmit
# Or via script:
pnpm typecheck

# Lint with ESLint 9 flat config
pnpm lint

# Production build
pnpm build

# Format check with Prettier
pnpm format:check
```

## Architecture & Conventions

- **Framework**: Next.js 15 App Router (`src/app`)
- **React**: React 19 Server Components by default
- **TypeScript**: Strict mode enabled (`strict: true`), path alias `@/*` -> `src/*`
- **Styling**: Tailwind CSS 3.4 with PostCSS & Autoprefixer, system font stack initially
- **Visual Design Baseline**: Detailed in [`docs/design-system.md`](docs/design-system.md)
- **Coordinator & Governance**: Multi-agent orchestration managed under `../.agents/`

## Deployment & Delivery

- **Delivery Guide & Pipeline**: See [`docs/delivery.md`](docs/delivery.md) for branch strategy, PR checklist, and Vercel preview deployment guidelines.
- **Workflow**: Feature branches (`feat/*`) -> Pull Request targeting `main` -> Vercel Preview Deploy -> Verification Suite -> Review & Merge.
