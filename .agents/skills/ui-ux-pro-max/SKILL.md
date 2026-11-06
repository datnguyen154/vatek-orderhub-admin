---
name: ui-ux-pro-max
description: Research visual direction and UX patterns for OrderHub using a local search database. Use when creating the design baseline or resolving a specific layout, palette, typography or interaction decision.
---

# OrderHub UI design

This is a project adaptation of UI/UX Pro Max. See [provenance](references/orderhub-provenance.md)
for the pinned source and local changes. Search data and scripts are upstream reference material;
their examples do not override this project's Next.js 15 / React 19 / Tailwind 3.4 contract.

## Read and route

Read repository AGENTS.md and the assigned task before editing. Only load the guidance
needed for this task; do not read the entire CSV database into context.

- Step 2: establish tokens and a written visual baseline before building screens.
- Screen/component work: reuse that baseline; search only unresolved UX decisions.
- UI review: examine the rendered page and interactions; source inspection is supporting evidence.
- Nonvisual API/setup work does not need this skill.

## Local search

From the capstone root, use Python 3 (standard library only):

```powershell
python -B .agents/skills/ui-ux-pro-max/scripts/search.py "B2B operations dashboard" --domain product -n 3
python -B .agents/skills/ui-ux-pro-max/scripts/search.py "keyboard focus modal" --domain ux -n 3
python -B .agents/skills/ui-ux-pro-max/scripts/search.py "server component client boundary" --stack nextjs -n 3
```

Use one dominant concern per query. Check relevance before accepting a result. If output is
empty or off-topic, retry once with a narrower explicit domain; disclose fallback reasoning.
Current upstream stack suggestions may target newer framework versions; verify against the
installed versions and official documentation before using version-specific APIs.
Before applying Next-specific results, read [Next 15 compatibility](references/orderhub-next15.md).
The upstream database includes Next 16 migration advice and must not determine our version policy.

For the first baseline only, a non-persisting proposal is available:

```powershell
python -B .agents/skills/ui-ux-pro-max/scripts/search.py "B2B order management dashboard" --design-system -p "OrderHub Admin Console" -f markdown
```

This output mixes several domains, including marketing patterns. Select applicable dashboard
guidance; do not implement a landing-page hero, decorative scene or font import from a result.
Do not use --persist or generate a second MASTER.md. Synthesize accepted decisions and
rejected suggestions into docs/design-system.md under the assigned task scope.
Do not pass --motion: its generated GSAP examples are outside the Week 2 dependency allowlist.

## Design baseline without Figma

Use docs/design-system.md as the single visual baseline. Define:

- Login, catalogue, sidebar/topbar shell and Orders list wireframes in plain language.
- Information hierarchy, navigation, content density, mobile transformation and state behavior.
- Semantic color pairs, spacing scale, typography roles, control sizes, radius and elevation.
- Mapping from each decision to Tailwind/CSS tokens and a concise visual review rubric.

Aim for a clean operational dashboard: readable order data, predictable forms, restrained
primary color and useful whitespace. Avoid forcing asymmetry, oversized heroes or ornamental
motion. Align columns and gutters, use tabular figures for totals, and preserve reading order.
Mock order data is legitimate but must remain explicitly fixture data.

## Responsibility boundaries

This skill supplies visual direction and relevant UX research, not a second technical checklist.
Use the AGENTS.md dispatcher to decide which companion skills apply:

- b2b-design-tokens-cva owns token implementation, typed primitives and component keyboard behavior.
- nextjs-gate2-auditor owns App Router boundary review, data states and Gate 2 evidence.

Keep design choices within the approved stack, scopes and dependency allowlist. Do not install
fonts, icon/animation/chart libraries or introduce dark mode/i18n ahead of their tasks.
Reuse an accepted baseline instead of generating a new palette or layout for each session.

## Handoff

Follow coordinator scope, checks and handoff rules. Leave implementation and report
uncommitted for Codex review; the user stages/commits. Do not edit tasks.json or independently
award done. The skill grants no permission to change dependencies, scope or Git history.
