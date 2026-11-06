---
name: b2b-design-tokens-cva
description: Implement OrderHub semantic Tailwind tokens and typed cva primitives with accessible keyboard behavior. Use for token setup, component styling, variants and sizes; follow the existing visual baseline.
---

# Tokens and primitives

Read AGENTS.md, the assigned task and docs/design-system.md when it exists.
This skill owns implementation constraints; ui-ux-pro-max owns visual exploration.
Task scope and dependency allowlists still apply. Do not build future components early.

## Token contract

- Step 2 defines the baseline. Later tasks reuse it; missing tokens need a documented,
  scoped addition, not a one-off component value. Request scope revision if token files
  are outside the assigned allowlist.
- Define semantic color pairs in approved CSS variables/Tailwind mapping: background,
  surface, foreground, muted, border, primary, destructive, success, warning and focus.
- Centralize spacing, typography, radius, elevation, control/container/sidebar dimensions,
  and any motion timing. Use the project's documented spacing scale and roles.
- No raw color/spacing literals, arbitrary Tailwind values or inline visual styles in
  authored components. Token definitions and documentation may contain their values.
  Layout utilities such as grid, flex and w-full are allowed. Data, viewport measurements
  and nonvisual numbers are not design magic numbers. Do not modify vendor code for this rule.
- Avoid dynamically constructing utility class names that Tailwind cannot discover.
- Document token -> value -> purpose -> class mapping. A named variable alone does not
  establish correct contrast: calculate the actual foreground/background combinations.
- Normal text >=4.5:1; large text and relevant UI/focus contrast >=3:1. Distinguish
  requirements for functional boundaries from purely decorative dividers.

## Typed primitives (D8 tasks only)

- Button, Input, Select, Badge, Card and Modal expose meaningful typed variants/sizes via cva.
- Infer variant props with VariantProps; compose using cn, and preserve appropriate native
  HTML/ARIA props. Resolve collisions with native size props rather than weakening types.
- Pin tailwind-merge compatible with Tailwind 3.4. Never install latest packages blindly.
- Button defaults to type=button, with explicit submit support. Pending/disabled behavior
  prevents duplicate actions and exposes an accessible state/name; keep focus behavior deliberate.
- Input/Select keep visible labels and support id, aria-invalid and aria-describedby.
  Native Select keyboard behavior is preferred; do not invent a custom listbox in its place.
- Badge communicates meaning in text as well as color. Card does not become interactive
  merely because it has hover styling. Do not add tab stops to static content.
- Modal/drawer uses the approved Radix Dialog primitive: accessible title/description,
  focus containment, Escape handling and return focus to the trigger when it still exists.
  Do not hand-build a second focus trap or intercept Tab on ordinary native controls.
- Keep static primitives server-compatible. Client boundaries are justified by interactive
  behavior or the underlying primitive; do not add use client to the entire UI directory.

## Verification and handoff

- Verify computed styles, not just class names; exercise relevant variants and sizes.
- Check Tab/Shift+Tab and applicable Enter/Space behavior; test modal Escape and focus return
  only when those controls exist. Record not_applicable for static elements.
- Honor reduced motion and visible focus. Avoid global overflow hiding as a responsive fix.
- Use the project's four-viewport Playwright smoke protocol and handoff template.
  cva and tokens are not themselves proof of accessibility or correct responsive behavior.
- Report offending file/line, expected token and observed behavior for failures.
- Leave code/report uncommitted. Codex reviews; the user stages and commits.
