---
name: nextjs-gate2-auditor
description: Review OrderHub Next.js 15 App Router boundaries, persistent layouts, data states and Gate 2 browser evidence. Use during shell/data work and final audit; report actionable findings within task scope.
---

# Gate 2 architecture and UI audit

Read AGENTS.md, the assigned acceptance criteria and docs/design-system.md.
Audit only implemented behavior. Missing future-task features are not current-task bugs.
This skill validates implementation; it does not authorize broad fixes or new dependencies.

## Server/client boundaries

- Server Components are the default. For each use client entry point, identify the concrete
  need: event handlers, client hooks, context/provider or browser APIs.
- Place boundaries as low as practical, not necessarily at leaf nodes. Client providers,
  composite interactive widgets and error.tsx are legitimate non-leaf boundaries.
- Inspect the import graph: modules imported by a client entry join its client graph.
  A Server Component passed as children from a server parent is a different composition
  pattern; do not claim that any provider automatically converts all children to client code.
- Do not send secrets/server-only modules into the browser. Props crossing the boundary
  must satisfy React serialization rules; ordinary event callbacks cannot cross from server.
- Orders page may be a server composition with a client fetch/search island. Explain
  what each part does rather than treating a server page as proof of server-side fetching.
- Stay on Next.js 15. Keep middleware.ts where assigned; do not apply Next 16 proxy.ts
  migration advice from the UX database. Check version-specific APIs against installed Next.

## Layouts, routes and mock data

- Dashboard layout persists across sibling navigation; distinguish a rerender from a remount.
  Verify with a retained state/instance marker or observed mount instrumentation, not only a screenshot.
- Route guards/demo sessions follow the assigned task. Do not claim production auth or add
  Week 3 refresh/RBAC. A redirecting layout alone is not authorization for future APIs/actions.
- loading.tsx covers route suspension/navigation; client request loading needs its own state.
- error.tsx handles supported boundary errors; ordinary failed fetches need explicit error UI.
  not-found.tsx needs a reachable 404 scenario. Confirm retry/reset behavior separately.
- MSW browser worker must start before client requests. It cannot intercept server-side fetch.
- Exercise loading, empty, error and success on deterministic fixtures; retry must recover.
  Mock disabled must show the actual request failure, not silently substitute success data.
- Check request cancellation/stale-response behavior where implemented. Do not expand this
  into Week 3 caching/filter requirements.

## Browser evidence

- Use Playwright to check changed routes at 375, 768, 1280 and 1920px. Record viewport height
  too, route/state, screenshot path and actual document scrollWidth/clientWidth.
- Inspect screenshots for clipping, readable wrapping and overlapping controls. Tables may
  scroll in a named keyboard-usable region; global overflow hiding is not a fix.
- Exercise keyboard-only paths, visible focus, skip link, form errors and drawer/modal focus
  where implemented. Screenshots do not prove keyboard behavior.
- Verify relevant token use against the baseline; check computed contrast for affected pairs.
  For a concrete primitive defect, consult b2b-design-tokens-cva rather than redesigning the app.
- Report console/network failures with cause and impact. Distinguish expected mock errors,
  dev tooling messages, nonblocking assets and application failures.
- Run required typecheck/lint/build/format checks. A successful build is not UI evidence.
  Tool/environment failures are not_run with the actual error, never pass.

## Review result

Use the existing session handoff, not a second progress ledger. Record criterion -> evidence
-> pass/fail/not_run/not_applicable, with findings tied to file/line, user impact and reproduction.
Give the intern concise answers to: where does this spacing come from; why this boundary;
what stays mounted; what happens on loading/empty/error; how was keyboard/mobile verified?

During the final audit, fixes outside the docs-only task go back to Codex for a scoped repair.
Do not stage/commit, edit tasks.json, self-award done or claim mentor approval.
