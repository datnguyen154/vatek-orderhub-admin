# OrderHub Admin Console — Visual Design System & Foundation

> **Baseline Version**: 1.0.0 (Session 02 / Step-2 / D6)  
> **Status**: Sole Visual Baseline for OrderHub Admin Console  
> **Target Platform**: Desktop & Mobile B2B SaaS Operations (Next.js 15 App Router, React 19, Tailwind CSS 3.4)

---

## 1. Visual Direction & Operating Principles

OrderHub Admin Console is an internal/partner-facing B2B operations platform designed for order fulfillment, inventory monitoring, and operational lifecycle tracking. It prioritizes **functional clarity**, **information density**, **predictable navigation**, and **strict accessibility (WCAG 2.1 AA/AAA)**.

### Core Principles

1. **Clean B2B SaaS Aesthetic**:

   - Neutral light canvas (`#F8FAFC` slate-50) paired with elevated crisp white surfaces (`#FFFFFF`).
   - High-contrast typography (`#0F172A` slate-900) for effortless legibility across long operational shifts.
   - Restrained corporate blue primary (`#1D4ED8` blue-700) reserved strictly for interactive affordances, active navigation, and primary calls to action.
   - Distinct, unambiguous status indicators (Success green, Warning amber, Destructive red) designed with dual-contrast semantics (accessible text and background).

2. **Information Hierarchy & Visual Density**:

   - High information density without visual clutter: tight padding in data tables and compact form controls, paired with generous layout-level gutters.
   - Clean tabular numbers (`font-mono` / tabular figures) for monetary values, order IDs, and SKU counts to maintain vertical alignment.
   - Elimination of non-essential decorative gradients, glassmorphism, heavy drop shadows, or marketing-style hero banners.

3. **Predictable Layout & Structure**:

   - Fixed/collapsible left sidebar navigation (`256px` expanded, `64px` collapsed) + fixed topbar (`56px`).
   - Content area constrained to standard desktop width (`1280px` max-w-7xl) on large screens, with smooth single-column responsive reflow for tablet (`768px`) and mobile (`375px`).

4. **Accessibility-First Foundation**:
   - Minimum 4.5:1 contrast for all standard text against its immediate background.
   - Minimum 3.0:1 contrast for large headings, form control borders, and active focus indicators.
   - System font stack to guarantee zero render-blocking webfont downloads and predictable native font metrics.
   - Visible 2px focus rings (`:focus-visible`) with 2px offset on all interactive primitives.
   - Full support for `prefers-reduced-motion` across all transitions and animations.

---

## 2. UI/UX Pro Max Search Synthesis (Accepted vs. Rejected Guidance)

During Session 02, local UX/UI research queries were executed via the project's embedded `ui-ux-pro-max` search tooling. The findings were evaluated against the B2B operational scope:

| Query & Domain                                       | Upstream Proposal                                                                                                                           | Decision               | Business & Operational Rationale                                                                                                                                                                   |
| :--------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `B2B operations dashboard` (`product`)               | Accessible & Ethical + Minimalism & Swiss Style, Sales Intelligence Dashboard, Professional blue + neutral grey                             | **ACCEPTED**           | Swiss typography clarity and minimalist grid align directly with dense B2B operational monitoring. Neutral gray canvas + professional blue provides high readability and reduces eye fatigue.      |
| `B2B operations dashboard` (`product`)               | SaaS General: Glassmorphism + Flat Design, Landing Hero + Features + CTA                                                                    | **REJECTED**           | Glassmorphism introduces contrast instability, performance overhead, and visual noise. Marketing landing hero patterns contradict internal operational consoles.                                   |
| `accessibility` (`color`)                            | Government Portal: `#1E40AF` (Primary), `#FFFFFF` (On Primary), `#EFF6FF` (Bg), `#1E3A8A` (Fg), `#BFDBFE` (Border), `#DC2626` (Destructive) | **ACCEPTED (ADAPTED)** | High-contrast accessible color pairings adopted into Tailwind CSS variables (`#1D4ED8` primary with 6.7:1 white text contrast, `#DC2626` destructive with 4.8:1 white text contrast).              |
| `B2B order management dashboard` (`--design-system`) | Education Teal (`#0D9488`), Card `#FAFAFA`, Accent Amber (`#D97706`), Feature-rich Showcase CTA sections                                    | **REJECTED**           | Teal/amber education palette conflicts with project specification (restrained corporate blue + slate neutral). Marketing showcase CTA structure rejected in favor of transactional console layout. |
| `B2B order management dashboard` (`--design-system`) | Cormorant Garamond (Heading) + Crimson Pro (Body) with Google Fonts `@import`                                                               | **REJECTED**           | Serif academic typography degrades dense data grid readability and violates the zero-external-font-dependency rule. System sans-serif stack retained.                                              |
| `B2B order management dashboard` (`--design-system`) | GSAP animation (`--motion`)                                                                                                                 | **REJECTED**           | Outside approved Week 2 dependency allowlist. Subtle CSS native transitions (150ms-200ms) with `prefers-reduced-motion` override used instead.                                                     |

---

## 3. Design Tokens Reference & Implementation Mapping

All design tokens are implemented as CSS custom properties in `src/app/globals.css` and mapped to Tailwind CSS utilities in `tailwind.config.ts`. Authors **must never use raw hex values, arbitrary Tailwind brackets (`w-[...]`, `bg-[#...]`), or inline visual styles**.

### 3.1. Semantic Color Tokens & Contrast Verification

| Token Name             | Hex Value | RGB Channels (CSS Var) | Purpose & Usage                                                | Contrast vs Background    | Contrast vs Surface       | WCAG Level                              |
| :--------------------- | :-------- | :--------------------- | :------------------------------------------------------------- | :------------------------ | :------------------------ | :-------------------------------------- |
| `background`           | `#F8FAFC` | `248 250 252`          | Canvas/body background                                         | —                         | —                         | Baseline                                |
| `foreground`           | `#0F172A` | `15 23 42`             | Primary high-emphasis body text and headings                   | 17.06:1                   | 17.85:1                   | AAA                                     |
| `surface`              | `#FFFFFF` | `255 255 255`          | Card panels, data tables, modals, dropdowns                    | 1.05:1 (border delimited) | —                         | Baseline                                |
| `surface-foreground`   | `#0F172A` | `15 23 42`             | Text inside cards, tables, and dialogs                         | 17.06:1                   | 17.85:1                   | AAA                                     |
| `muted`                | `#F1F5F9` | `241 245 249`          | Subdued backgrounds, table headers, tag pills                  | 1.05:1                    | 1.10:1                    | Base                                    |
| `muted-foreground`     | `#475569` | `71 85 105`            | Secondary text, table column labels, helper text               | 6.92:1 (on muted)         | 7.58:1 (on surface)       | AAA (> 7:1)                             |
| `border`               | `#E2E8F0` | `226 232 240`          | Decorative card dividers, table borders, structural separators | 1.18:1                    | 1.23:1                    | Decorative / structural (non-essential) |
| `border-hover`         | `#CBD5E1` | `203 213 225`          | Subtle hover on decorative card boundaries or table rows       | 1.42:1                    | 1.48:1                    | Decorative / structural                 |
| `control-border`       | `#64748B` | `100 116 139`          | Functional input strokes, select borders, button outlines      | 4.55:1                    | 4.76:1                    | Non-text UI (>= 3:1)                    |
| `control-border-hover` | `#334155` | `51 65 85`             | Hover state for interactive form controls and inputs           | 9.90:1                    | 10.35:1                   | Non-text UI (>= 3:1)                    |
| `primary`              | `#1D4ED8` | `29 78 216`            | Primary action buttons, active navigation indicator            | 6.41:1                    | 6.70:1                    | UI Component (>= 3:1)                   |
| `primary-hover`        | `#1E40AF` | `30 64 175`            | Primary action button hover state                              | 8.34:1                    | 8.72:1                    | UI Component                            |
| `primary-foreground`   | `#FFFFFF` | `255 255 255`          | Text/icons inside primary buttons/badges                       | —                         | 6.70:1 (on primary)       | AA (> 4.5:1)                            |
| `primary-muted`        | `#DBEAFE` | `219 234 254`          | Subdued primary pill/badge background                          | 1.17:1                    | 1.22:1                    | Badge background                        |
| `primary-muted-fg`     | `#1E40AF` | `30 64 175`            | Text on subdued primary badge (`primary-muted`)                | —                         | 7.15:1 (on primary-muted) | AAA (> 7:1)                             |
| `destructive`          | `#DC2626` | `220 38 38`            | Danger actions (Cancel, Delete), error banners                 | 4.62:1                    | 4.83:1                    | UI Component                            |
| `destructive-hover`    | `#B91C1C` | `185 28 28`            | Hover state for destructive buttons                            | 6.18:1                    | 6.47:1                    | UI Component                            |
| `destructive-fg`       | `#FFFFFF` | `255 255 255`          | Text/icons on solid destructive buttons                        | —                         | 4.83:1 (on destructive)   | AA (> 4.5:1)                            |
| `destructive-muted`    | `#FEE2E2` | `254 226 226`          | Light background for error banners / alert badges              | 1.17:1                    | 1.22:1                    | Badge background                        |
| `destructive-muted-fg` | `#991B1B` | `153 27 27`            | Text on error banners / alert badges                           | —                         | 6.80:1 (on dest-muted)    | AA (> 4.5:1)                            |
| `success`              | `#15803D` | `21 128 61`            | Completed status, success toast/badge                          | 4.79:1                    | 5.02:1                    | UI Component                            |
| `success-hover`        | `#166534` | `22 101 52`            | Hover state for success actions                                | 6.81:1                    | 7.13:1                    | UI Component                            |
| `success-foreground`   | `#FFFFFF` | `255 255 255`          | Text on solid success buttons                                  | —                         | 5.02:1 (on success)       | AA (> 4.5:1)                            |
| `success-muted`        | `#DCFCE7` | `220 252 231`          | Delivered/Fulfilled status badge background                    | 1.05:1                    | 1.10:1                    | Badge background                        |
| `success-muted-fg`     | `#166534` | `22 101 52`            | Text on Delivered/Fulfilled status badge                       | —                         | 6.49:1 (on succ-muted)    | AA (> 4.5:1)                            |
| `warning`              | `#B45309` | `180 83 9`             | Warning action, attention badges                               | 4.80:1                    | 5.02:1                    | UI Component                            |
| `warning-hover`        | `#92400E` | `146 64 14`            | Hover state for warning actions                                | 6.78:1                    | 7.09:1                    | UI Component                            |
| `warning-foreground`   | `#FFFFFF` | `255 255 255`          | Text on solid warning buttons                                  | —                         | 5.02:1 (on warning)       | AA (> 4.5:1)                            |
| `warning-muted`        | `#FEF3C7` | `254 243 199`          | Pending/Processing status badge background                     | 1.06:1                    | 1.11:1                    | Badge background                        |
| `warning-muted-fg`     | `#92400E` | `146 64 14`            | Text on Pending/Processing status badge                        | —                         | 6.37:1 (on warn-muted)    | AA (> 4.5:1)                            |
| `focus`                | `#1D4ED8` | `29 78 216`            | `:focus-visible` ring outline (2px solid, 2px offset)          | 6.41:1                    | 6.70:1                    | Non-text UI (>= 3:1)                    |
| `chart-bar`            | `#1D4ED8` | `29 78 216`            | Bar series fill in analytics charts (`#60A5FA` in dark)        | —                         | 6.70:1 / 5.75:1           | Non-text UI (>= 3:1)                    |

_Note: All contrast ratios calculated using the standard WCAG relative luminance formula: $L = 0.2126R + 0.7152G + 0.0722B$ and $(L_1 + 0.05) / (L_2 + 0.05)$._

---

### 3.2. Spacing Scale (4px Base Grid)

All padding, margins, gutters, and dimensional gaps follow a strict 4px grid. All authored spacing values MUST strictly be integer multiples of 4px (`p-1` = 4px, `p-2` = 8px, `p-3` = 12px, `p-4` = 16px, `p-5` = 20px, `p-6` = 24px, `p-8` = 32px, `p-10` = 40px, `p-12` = 48px, `p-16` = 64px). Fractional spacing utilities such as `p-0.5` (2px), `p-1.5` (6px), `p-2.5` (10px), or `p-3.5` (14px) are strictly forbidden across all authored components and layouts. Standard Tailwind spacing classes are mapped directly:

| Step | Pixel Value | Rem Value | Tailwind Class           | Primary Usage                                                     |
| :--- | :---------- | :-------- | :----------------------- | :---------------------------------------------------------------- |
| `0`  | 0px         | `0rem`    | `p-0`, `m-0`, `gap-0`    | Reset / inline alignment                                          |
| `1`  | 4px         | `0.25rem` | `p-1`, `m-1`, `gap-1`    | Tight icon spacing, compact badge vertical padding (`py-1 px-2`)  |
| `2`  | 8px         | `0.5rem`  | `p-2`, `m-2`, `gap-2`    | Form control inner vertical padding, compact table cell padding   |
| `3`  | 12px        | `0.75rem` | `p-3`, `m-3`, `gap-3`    | Standard button/input horizontal padding (`px-3`), card sub-gap   |
| `4`  | 16px        | `1.0rem`  | `p-4`, `m-4`, `gap-4`    | Standard table cell horizontal padding, mobile page gutter        |
| `5`  | 20px        | `1.25rem` | `p-5`, `m-5`, `gap-5`    | Modal header/footer padding, medium container padding             |
| `6`  | 24px        | `1.5rem`  | `p-6`, `m-6`, `gap-6`    | Desktop page gutter, card internal padding, topbar horizontal pad |
| `8`  | 32px        | `2.0rem`  | `p-8`, `m-8`, `gap-8`    | Section separation, large card padding                            |
| `10` | 40px        | `2.5rem`  | `p-10`, `m-10`, `gap-10` | Empty state container vertical padding                            |
| `12` | 48px        | `3.0rem`  | `p-12`, `m-12`, `gap-12` | Major operational dashboard division                              |
| `16` | 64px        | `4.0rem`  | `p-16`, `m-16`, `gap-16` | Login page vertical centering clearance                           |

---

### 3.3. Typography Scale & Semantic Roles

The application uses the native system font stack: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. Tabular figures and code tokens use `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`.

| Role            | Font Size         | Line Height      | Weight         | Letter Spacing | Tailwind Utility         | Intended Usage                                                 |
| :-------------- | :---------------- | :--------------- | :------------- | :------------- | :----------------------- | :------------------------------------------------------------- |
| `page-title`    | `1.5rem` (24px)   | `2.0rem` (32px)  | 600 (Semibold) | `-0.025em`     | `text-page-title`        | Top-level view heading (e.g. "Orders", "Catalogue", "Sign in") |
| `section-title` | `1.125rem` (18px) | `1.75rem` (28px) | 600 (Semibold) | `-0.015em`     | `text-section-title`     | Card header, modal title, table section title                  |
| `body`          | `0.875rem` (14px) | `1.25rem` (20px) | 400 (Regular)  | `normal`       | `text-body`              | Standard operational data cells, form labels, paragraph copy   |
| `body-medium`   | `0.875rem` (14px) | `1.25rem` (20px) | 500 (Medium)   | `normal`       | `text-body-medium`       | Active navigation links, table header text, summary totals     |
| `caption`       | `0.75rem` (12px)  | `1.0rem` (16px)  | 500 (Medium)   | `normal`       | `text-caption`           | Status badges, helper text, timestamps, input error labels     |
| `mono`          | `0.75rem` (12px)  | `1.0rem` (16px)  | 400 (Regular)  | `normal`       | `font-mono text-caption` | Order IDs (`ORD-2026-001`), SKU codes, monetary figures        |

---

### 3.4. Border Radii & Elevation Tokens

| Token         | Value                               | Tailwind Class | Primary Usage                                     |
| :------------ | :---------------------------------- | :------------- | :------------------------------------------------ |
| `radius-sm`   | `0.25rem` (4px)                     | `rounded-sm`   | Status badges, mini buttons, code chips           |
| `radius-md`   | `0.375rem` (6px)                    | `rounded-md`   | Form inputs, select triggers, default buttons     |
| `radius-lg`   | `0.5rem` (8px)                      | `rounded-lg`   | Content cards, data table wrappers, modal dialogs |
| `radius-full` | `9999px`                            | `rounded-full` | User avatar, pill tags                            |
| `shadow-sm`   | `0 1px 2px 0 rgb(0 0 0 / 0.05)`     | `shadow-sm`    | Content cards, subtle elevated panels             |
| `shadow-md`   | `0 4px 6px -1px rgb(0 0 0 / 0.1)`   | `shadow-md`    | Dropdown menus, popover tooltips                  |
| `shadow-lg`   | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | `shadow-lg`    | Modal dialogs, slide-over navigation drawers      |

---

### 3.5. Component Dimensions & Breakpoints

| Dimension Token     | Value            | Tailwind Class / Config | Usage                                              |
| :------------------ | :--------------- | :---------------------- | :------------------------------------------------- |
| `sidebar-width`     | `16rem` (256px)  | `w-sidebar`             | Fixed desktop left sidebar                         |
| `sidebar-collapsed` | `4rem` (64px)    | `w-sidebar-collapsed`   | Collapsed icon-only sidebar                        |
| `topbar-height`     | `3.5rem` (56px)  | `h-topbar`              | Fixed persistent top navigation bar                |
| `control-h-sm`      | `2.0rem` (32px)  | `h-control-sm`          | Compact table action button, filter dropdown       |
| `control-h-md`      | `2.5rem` (40px)  | `h-control-md`          | Standard input, select, and button height          |
| `control-h-lg`      | `2.75rem` (44px) | `h-control-lg`          | Large touch-friendly control / Login submit button |
| `container-max`     | `80rem` (1280px) | `max-w-container-max`   | Max content container width                        |

#### Responsive Breakpoints & Target Viewports

- **Verification Viewports**:
  1. `375px` (Mobile portrait — iPhone / small smartphone)
  2. `768px` (Tablet portrait — iPad / small tablet)
  3. `1280px` (Desktop — standard laptop display)
  4. `1920px` (Full HD — large workstation display)
- **Tailwind Breakpoint Mapping**:
  - `sm`: `640px` — Horizontal card stacking to grid
  - `md`: `768px` — Sidebar switches from mobile drawer to fixed bar or collapsible bar
  - `lg`: `1024px` — Full navigation layout with complete metrics grid
  - `xl`: `1280px` — Maximum container boundary (`max-w-container-max`)
  - `2xl`: `1536px` — Ultra-wide layout centering

---

## 4. Descriptive Wireframes for Core Screens

_(Note: These wireframes define the structural and visual contract for upcoming sessions. No screens are coded prematurely in Step 2)._

### 4.1. Screen 1: Login (`/login`) — Session 04 Scope

```
+-------------------------------------------------------------+
|                          (375px - 1920px)                   |
|                                                             |
|                   [ Brand Logo / OrderHub ]                 |
|                                                             |
|       +---------------------------------------------+       |
|       | CARD (max-w-md, rounded-lg, border, shadow) |       |
|       |                                             |       |
|       |  [text-page-title] Sign in to OrderHub      |       |
|       |  [text-body text-muted-fg] B2B Admin Access |       |
|       |                                             |       |
|       |  LABEL: Email Address                       |       |
|       |  [ INPUT (h-control-md, rounded-md, border border-control-border) ] |
|       |  (Helper/Error: text-caption text-dest)     |       |
|       |                                             |       |
|       |  LABEL: Password                            |       |
|       |  [ INPUT (type=password, h-control-md, border border-control-border) ] |       |
|       |                                             |       |
|       |  [ BUTTON: primary, w-full, h-control-lg ]  |       |
|       |    "Sign in to Console"                     |       |
|       |                                             |       |
|       |  [text-caption text-muted-fg, text-center]  |       |
|       |  Demo Credentials: admin@orderhub.local     |       |
|       +---------------------------------------------+       |
|                                                             |
+-------------------------------------------------------------+
```

- **Layout**: Centered vertically and horizontally on neutral canvas (`bg-background`).
- **Form Card**: `w-full max-w-md bg-surface border-border rounded-lg shadow-sm p-8`.
- **Keyboard Flow**: Tab order: `Email` -> `Password` -> `Submit Button`. Visible focus rings on all inputs (`ring-2 ring-focus ring-offset-2`).
- **Validation Feedback**: `aria-invalid="true"` with `aria-describedby` pointing to error message in `text-caption text-destructive`.

---

### 4.2. Screen 2: Persistent App Shell (Sidebar & Topbar) — Session 07 Scope

```
+------------------------------------------------------------------------------------+
| TOPBAR (h-topbar, fixed top-0, border-b border-border, bg-surface, px-6)           |
| [Hamburger / Menu] [OrderHub Logo]                [Breadcrumb]   [User Profile]    |
+-------------------+----------------------------------------------------------------+
| SIDEBAR           | MAIN CONTENT AREA (p-6, max-w-container-max, mx-auto)          |
| (w-sidebar,       |                                                                |
|  border-r,        |  PAGE HEADER                                                   |
|  bg-surface,      |  [text-page-title] Orders Management      [Primary Action]     |
|  py-4, px-3)      |  [text-body text-muted-fg] Manage and fulfill customer orders |
|                   |                                                                |
|  * Dashboard      |  METRICS / SUMMARY CARDS                                       |
|  * Orders (active)|  +--------------+ +--------------+ +--------------+            |
|  * Catalogue      |  | Total Orders | | Pending      | | Fulfilled    |            |
|  * Preferences    |  | 1,280        | | 42           | | 1,238        |            |
|                   |  +--------------+ +--------------+ +--------------+            |
|                   |                                                                |
|  ---------------- |  DATA TABLE / CONTENT CONTAINER                                |
|  [User avatar]    |  (rounded-lg, border border-border, bg-surface, overflow-x-auto)|
|  Admin Officer    |                                                                |
+-------------------+----------------------------------------------------------------+
```

- **Desktop (`1280px`+)**: Persistent left sidebar (`w-sidebar: 256px`), persistent topbar (`h-topbar: 56px`).
- **Tablet (`768px`)**: Collapsible sidebar (`w-sidebar-collapsed: 64px`) with icon tooltips, or toggleable drawer.
- **Mobile (`375px`)**: Sidebar hidden off-canvas, toggled via hamburger button in topbar into an accessible Radix Dialog modal drawer with backdrop.
- **Accessibility**: Skip-to-main-content link (`sr-only focus:not-sr-only`) at page top.

---

### 4.3. Screen 3: Component Catalogue (`/components`) — Session 06 Scope

```
+------------------------------------------------------------------------------------+
| APP SHELL (Top & Side)                                                             |
| Page: UI Component Catalogue (Visual Token & Primitives Verification)             |
|                                                                                    |
| [SECTION: BUTTONS]                                                                 |
| Variants: [Primary] [Secondary/Outline] [Destructive] [Ghost]                      |
| Sizes:    [Small (h-8)] [Medium (h-10)] [Large (h-11)]                             |
| States:   [Default] [Hover] [Focus-Visible] [Disabled] [Loading/Spinner]           |
|                                                                                    |
| [SECTION: INPUTS & SELECTS]                                                        |
| [ Default Input ] [ Focused Input ] [ Invalid/Error Input ] [ Disabled Input ]     |
| [ Native Select Dropdown with persistent label and aria-describedby ]              |
|                                                                                    |
| [SECTION: BADGES]                                                                  |
| [Success: Delivered] [Warning: Pending] [Destructive: Cancelled] [Primary: New]    |
|                                                                                    |
| [SECTION: CARDS & MODAL]                                                           |
| +-------------------------+   [ Trigger Modal Button ]                             |
| | Card Header             |   --> Opens Radix Dialog with title, description,      |
| | Card Content            |       focus trap, Escape key dismiss, and focus return |
| +-------------------------+                                                        |
+------------------------------------------------------------------------------------+
```

- **Organization**: Strict grid displaying all six base CVA primitives: Button, Input, Select, Badge, Card, Modal.
- **Verification Matrix**: Every variant, size, and interactive state displayed side-by-side with token labels.

---

### 4.4. Screen 4: Orders Management (`/orders`) — Session 09 Scope

```
+------------------------------------------------------------------------------------+
| APP SHELL                                                                          |
| Header: "Orders" | Subtitle: "Fulfillment and lifecycle operations"                |
|                                                                                    |
| TOOLBAR (flex flex-wrap items-center justify-between gap-4 mb-4)                  |
| [ Search input: Order ID or Customer ]  [ Filter: Status ]  [ Export / Refresh ]   |
|                                                                                    |
| DATA TABLE CONTAINER (bg-surface border border-border rounded-lg overflow-x-auto)  |
| +-----------+-------------------+-------------+------------+-----------+---------+|
| | Order ID  | Customer Name     | Date        | Status     | Total     | Actions ||
| +-----------+-------------------+-------------+------------+-----------+---------+|
| | #ORD-001  | Acme Logistics    | Nov 06 2026 | [Delivered]| $1,420.00 | [View]  ||
| | #ORD-002  | Nexus Retailers   | Nov 06 2026 | [Pending]  | $540.50   | [View]  ||
| | #ORD-003  | Global Freight    | Nov 05 2026 | [Cancelled]| $210.00   | [View]  ||
| +-----------+-------------------+-------------+------------+-----------+---------+|
|                                                                                    |
| PAGINATION / FOOTER (flex items-center justify-between p-4 border-t border-border) |
| Showing 1 to 10 of 42 orders                     [ Previous ]  Page 1 of 5 [ Next ]|
+------------------------------------------------------------------------------------+
```

- **Density**: Compact table rows (`py-3 px-4`), headers in `text-caption font-medium text-muted-foreground uppercase tracking-wider`.
- **Horizontal Scrolling**: Wrapped in an explicitly named scroll container (`role="region" aria-label="Orders Data Table" tabIndex={0}`) preventing document-level overflow on narrow viewports (`375px`, `768px`).
- **Data States**:
  - _Loading_: Skeleton shimmer cards and skeleton table rows.
  - _Empty_: Centered empty state graphic, explanatory text, and reset filter action button.
  - _Error_: Destructive-muted alert card with retry button.

---

## 5. UI States & Feedback Patterns

| State               | Visual Treatment                                                                                                                    | Accessibility Requirement                                |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------- |
| **Default**         | Base token styling (`bg-surface`, `text-foreground`, `border-border` for card frames, `border-control-border` for inputs/controls)  | Base contrast >= 4.5:1 (text), >= 3:1 (controls)         |
| **Hover**           | 1-step shade darkening (e.g. `primary` -> `primary-hover`, `border-control-border` -> `border-control-border-hover`, `bg-muted/50`) | Subtle cursor affordance (`cursor-pointer`)              |
| **Focus-Visible**   | 2px solid ring (`ring-2 ring-focus ring-offset-2`)                                                                                  | Visible contrast >= 3.0:1 against white/canvas           |
| **Disabled**        | `opacity-50 cursor-not-allowed pointer-events-none`                                                                                 | `aria-disabled="true"` or `disabled` attribute           |
| **Loading**         | Animated skeleton pulse (`bg-muted animate-pulse rounded-md`)                                                                       | `aria-busy="true"` on parent container                   |
| **Empty**           | `bg-surface border-border rounded-lg p-12 text-center`                                                                              | Informative heading + clear next action                  |
| **Error / Invalid** | `border-destructive text-destructive bg-destructive-muted`                                                                          | `aria-invalid="true"`, error tied via `aria-describedby` |

---

## 6. Visual Review Rubric

When reviewing any OrderHub view or component, evaluate against these 5 pillars:

1. **Readability**:
   - Are tabular data, IDs, and financial figures crisp, legible, and using monospace/tabular numbers?
   - Does all body text satisfy WCAG AA (>= 4.5:1) and headings satisfy WCAG (>= 3.0:1)?
2. **Hierarchy**:
   - Is there an immediate visual hierarchy from Page Title (`24px/600`) -> Section Header (`18px/600`) -> Data Body (`14px/400`) -> Metadata/Badge (`12px/500`)?
   - Does the primary action clearly dominate secondary/ghost actions?
3. **Consistency**:
   - Are spacing values strictly integer multiples of 4px?
   - Are border radii uniform (`rounded-md` for controls, `rounded-lg` for cards/tables)?
   - Are status badges using the standardized semantic tokens?
   - Do interactive form inputs, selects, and control boundaries use `control-border` achieving >= 3:1 non-text contrast against their surrounding canvas and surfaces?
4. **Responsiveness**:
   - At `375px`, `768px`, `1280px`, and `1920px`, does any element produce unexpected horizontal window scrolling?
   - Do tables provide an internal, accessible horizontal scroll region?
   - Do buttons and inputs maintain minimum 40px/44px touch targets on mobile?
5. **Accessibility**:
   - Can the view be navigated entirely using `Tab`, `Shift+Tab`, `Enter`, and `Space`?
   - Is the focus indicator clearly visible at all times?
   - Does modal interaction trap focus and dismiss cleanly on `Escape`?
