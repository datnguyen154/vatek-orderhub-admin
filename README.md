# OrderHub Admin Console

B2B Admin Console for OrderHub, built with Next.js 15 App Router, React 19, TypeScript strict mode, and Tailwind CSS.

## Prerequisites

- **Node.js**: v22.x (LTS)
- **Package Manager**: pnpm v11.x (pinned in `packageManager`)

## Getting Started

### 1. Installation

Install project dependencies:

```bash
pnpm install --no-optional
```

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
- **Coordinator & Governance**: Multi-agent orchestration managed under `../.agents/`
