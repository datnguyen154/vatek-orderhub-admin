# Source and OrderHub adaptation

- Installed: 2026-11-05.
- Source: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Pinned commit: b7d5353e0130feb8c5574ef1251f8a1db1873ccb.
- Installed subtree: .claude/skills/ui-ux-pro-max.
- License: MIT; upstream notice preserved in ../LICENSE.
- Data, Python search scripts and upstream reference files are retained as vendor resources.
- Local change: SKILL.md is rewritten for OrderHub, Next.js 15, React 19 and Tailwind 3.4.

## Selection

UI/UX Pro Max supplies searchable product, UX, color, typography and framework guidance.
Only relevant matches are loaded. The database is advisory; recommendations and examples
are not approval to add a library or use a newer framework API.

Also inspected Leonxlnx/taste-skill at commit 9b4bf937a1f69348126959c15d2f99a73e65699b:
https://github.com/Leonxlnx/taste-skill
Its current skill focuses on marketing websites, screen-height sections, imagery, visual
effects, static starter assets and its own checkers. This workflow conflicts with the
existing Next dashboard scaffold and Playwright harness, so it is not installed.

## Local decisions

- docs/design-system.md remains the only approved visual baseline; no parallel MASTER.md.
- Removed Claude-specific paths and mandatory full design-system generation for every page.
- No GSAP motion dials, automatic font imports or dependency installation.
- Gate 2 uses 375/768/1280/1920 widths, tokens, semantic HTML and keyboard evidence.
- Existing parent-workspace Nemo/Vue skills remain untouched but are not active for OrderHub.
- User owns staging/committing after Codex review.

## Installation validation

- Product and keyboard-focus searches returned actual rows; unrelated marketing/glass styles are not accepted automatically.
- A Next-specific search exposed incompatible Next 16 advice, rejected in orderhub-next15.md.
- Prettier check passed after local integration. No application dependency or UI source changed.
- The standard skill validator requires PyYAML, unavailable in this Python environment;
  frontmatter, local references and search behavior are checked independently instead.

Upstream updates must be reviewed as a diff; reinstalling blindly would overwrite SKILL.md.
