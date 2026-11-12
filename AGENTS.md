# OrderHub Admin Console — Agent Orchestration

This repository is governed by the multi-agent coordinator system located in the parent workspace:

- **Project Context**: `../.agents/project_context.md`
- **Execution Rules**: `../.agents/rules.md`
- **Session Roadmap**: `../.agents/sessions.md`
- **Tasks & Status Ledger**: `../.agents/tasks.json`
- **Handoff Template**: `../.agents/handoff-template.md`

All agents working on this project must strictly adhere to the scope boundaries, allowlisted dependencies, and verification protocols defined in the coordinator files.

## Skill dispatcher

Load only the project-local skills needed for the assigned session:

| Session            | Default skills                                      | Conditional                                                                 |
| ------------------ | --------------------------------------------------- | --------------------------------------------------------------------------- |
| 01, 03             | None                                                | Follow task checks and delivery evidence                                    |
| 02                 | ui-ux-pro-max + b2b-design-tokens-cva               | Establish the visual baseline                                               |
| 04                 | b2b-design-tokens-cva                               | ui-ux-pro-max for unresolved Login design                                   |
| 05                 | b2b-design-tokens-cva                               | No visual exploration unless baseline has a gap                             |
| 06                 | b2b-design-tokens-cva                               | ui-ux-pro-max for catalogue composition/polish                              |
| 07                 | b2b-design-tokens-cva + nextjs-gate2-auditor        | ui-ux-pro-max only for a specific missing design decision                   |
| 08                 | nextjs-gate2-auditor                                | b2b-design-tokens-cva when changing styled primitives                       |
| 09                 | b2b-design-tokens-cva + nextjs-gate2-auditor        | Reuse Orders baseline                                                       |
| 10                 | nextjs-gate2-auditor                                | Consult token skill for concrete findings                                   |
| 11–13 (done)       | b2b-design-tokens-cva                               | Historical; no action                                                       |
| 14–19 (UI feature) | b2b-design-tokens-cva + ui-ux-pro-max (review mode) | nextjs-gate2-auditor when routes, layouts, boundaries or data states change |
| 20 (final audit)   | nextjs-gate2-auditor                                | ui-ux-pro-max for a specific UX finding                                     |

For every new interaction pattern in a UI session (form/wizard, toast, modal, upload, status change, table action):

1. Before building, run `search.py "<pattern>" --domain ux -n 3` (one concern per query).
2. Record in the handoff a short **UX research** table: query → guideline No. → applied / rejected (with the reason).
3. After building, check the rendered page against the applied guidelines at 375 px and 1280 px, and against the prompt's "UX acceptance" block.

Skill entry points are `.agents/skills/<name>/SKILL.md`. This file is the dispatcher;
there is no separate dispatcher skill. Playwright is a tooling skill used for UI checks,
not another design authority. Unused Nemo/Vue copies were removed; do not restore them.
Use `docs/design-system.md` as the visual baseline once step-2 creates it.
Leave changes uncommitted for Codex review; the user stages and commits.
