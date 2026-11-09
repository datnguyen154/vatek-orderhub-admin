import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  ModalExamples,
  InteractiveButtonSandbox,
  InteractiveFormSandbox,
} from "@/features/catalogue/components/component-examples";

export const metadata: Metadata = {
  title: "UI Component Catalogue — OrderHub Admin Console",
  description:
    "Design system primitives, variants, sizes, and accessible states verification catalogue.",
};

export default function ComponentCataloguePage() {
  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-12">
      <div className="w-full max-w-container-max mx-auto space-y-12">
        {/* Navigation & Header */}
        <header className="space-y-4 border-b border-border pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2">
              <Badge variant="neutral" size="md">
                <span
                  className="inline-block h-2 w-2 rounded-full bg-primary"
                  aria-hidden="true"
                />
                <span>Session 06 / D8.3 Baseline</span>
              </Badge>
              <span className="text-caption text-muted-foreground font-mono">
                OrderHub Design System v1.0.0
              </span>
            </div>

            <nav
              aria-label="Breadcrumb navigation"
              className="flex items-center gap-4 text-caption"
            >
              <Link
                href="/login"
                className="text-primary hover:text-primary-hover font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm"
              >
                &larr; Back to Login Screen
              </Link>
            </nav>
          </div>

          <div>
            <h1 className="text-page-title font-semibold tracking-tight text-foreground">
              UI Component Catalogue
            </h1>
            <p className="mt-2 text-body text-muted-foreground max-w-3xl">
              Comprehensive reference and verification matrix for OrderHub B2B
              Admin Console base primitives. Demonstrates all six typed CVA
              components, variants, sizing scales, interactive states, and
              accessible keyboard behaviors defined in{" "}
              <code className="text-caption font-mono bg-muted px-2 py-1 rounded text-foreground">
                docs/design-system.md
              </code>
              .
            </p>
          </div>
        </header>

        {/* Section 1: Button */}
        <section
          aria-labelledby="section-buttons-heading"
          className="space-y-6 scroll-mt-6"
        >
          <div className="border-b border-border pb-3">
            <h2
              id="section-buttons-heading"
              className="text-section-title font-semibold text-foreground flex items-center gap-3"
            >
              <span>1. Button Primitive</span>
              <code className="text-caption font-mono text-muted-foreground font-normal">
                src/components/ui/button.tsx
              </code>
            </h2>
            <p className="mt-1 text-body text-muted-foreground">
              Accessible action triggers with four semantic variants, three
              standard control heights, pending loading states with animated
              spinners, and disabled states.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Variants */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>Semantic Variants</CardTitle>
                <CardDescription>
                  Primary, secondary, ghost, and destructive actions.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </CardContent>
            </Card>

            {/* Sizes */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>Control Sizing Scale</CardTitle>
                <CardDescription>
                  Tokens: sm (h-control-sm: 32px), md (h-control-md: 40px), lg
                  (h-control-lg: 44px).
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" size="sm">
                    Small (32px)
                  </Button>
                  <Button variant="primary" size="md">
                    Medium (40px)
                  </Button>
                  <Button variant="primary" size="lg">
                    Large (44px)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* States: Disabled and Loading */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>Disabled &amp; Static Loading States</CardTitle>
                <CardDescription>
                  Pointer events blocked, opacity-50 applied, aria-busy exposed.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" disabled>
                    Disabled Primary
                  </Button>
                  <Button variant="secondary" disabled>
                    Disabled Secondary
                  </Button>
                  <Button variant="primary" loading>
                    Loading...
                  </Button>
                  <Button variant="secondary" loading>
                    Loading...
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Sandbox */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>Interactive State Sandbox</CardTitle>
                <CardDescription>
                  Client island exercising dynamic loading toggle and click
                  handling.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <InteractiveButtonSandbox />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 2: Input */}
        <section
          aria-labelledby="section-inputs-heading"
          className="space-y-6 scroll-mt-6"
        >
          <div className="border-b border-border pb-3">
            <h2
              id="section-inputs-heading"
              className="text-section-title font-semibold text-foreground flex items-center gap-3"
            >
              <span>2. Input Primitive</span>
              <code className="text-caption font-mono text-muted-foreground font-normal">
                src/components/ui/input.tsx
              </code>
            </h2>
            <p className="mt-1 text-body text-muted-foreground">
              Form text inputs with control-border contrast (&ge; 3.0:1),
              persistent accessible labels, aria-invalid error resolution, and
              typed sizing scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sizes */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>Input Sizes (sm / md / lg)</CardTitle>
                <CardDescription>
                  Standard control heights across density levels.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div>
                  <label
                    htmlFor="input-sm"
                    className="block text-caption font-medium mb-1"
                  >
                    Small Input (h-control-sm)
                  </label>
                  <Input
                    id="input-sm"
                    size="sm"
                    placeholder="Search orders..."
                  />
                </div>
                <div>
                  <label
                    htmlFor="input-md"
                    className="block text-caption font-medium mb-1"
                  >
                    Medium Input (h-control-md)
                  </label>
                  <Input
                    id="input-md"
                    size="md"
                    placeholder="Default height..."
                  />
                </div>
                <div>
                  <label
                    htmlFor="input-lg"
                    className="block text-caption font-medium mb-1"
                  >
                    Large Input (h-control-lg)
                  </label>
                  <Input
                    id="input-lg"
                    size="lg"
                    placeholder="Large prominent field..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Error States */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>Error &amp; Validation States</CardTitle>
                <CardDescription>
                  Resolved via variant=&quot;error&quot; or
                  aria-invalid=&quot;true&quot;.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div>
                  <label
                    htmlFor="input-err-variant"
                    className="block text-caption font-medium mb-1"
                  >
                    Direct Error Variant
                  </label>
                  <Input
                    id="input-err-variant"
                    variant="error"
                    defaultValue="invalid-format-sku"
                    aria-describedby="input-err-variant-msg"
                  />
                  <p
                    id="input-err-variant-msg"
                    role="alert"
                    className="mt-1 text-caption text-destructive"
                  >
                    SKU must follow the pattern VATEK-XXXX-YYYY.
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="input-err-aria"
                    className="block text-caption font-medium mb-1"
                  >
                    Inferred via aria-invalid=&quot;true&quot;
                  </label>
                  <Input
                    id="input-err-aria"
                    aria-invalid="true"
                    defaultValue="invalid@email"
                    aria-describedby="input-err-aria-msg"
                  />
                  <p
                    id="input-err-aria-msg"
                    role="alert"
                    className="mt-1 text-caption text-destructive"
                  >
                    Please provide a complete email domain.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Disabled & Value States */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>Disabled &amp; Read-Only States</CardTitle>
                <CardDescription>
                  Opacity reduction and cursor-not-allowed.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div>
                  <label
                    htmlFor="input-disabled"
                    className="block text-caption font-medium mb-1"
                  >
                    Disabled Empty Input
                  </label>
                  <Input
                    id="input-disabled"
                    disabled
                    placeholder="Read only / disabled"
                  />
                </div>
                <div>
                  <label
                    htmlFor="input-disabled-val"
                    className="block text-caption font-medium mb-1"
                  >
                    Disabled With Locked Value
                  </label>
                  <Input
                    id="input-disabled-val"
                    disabled
                    defaultValue="SYSTEM-LOCKED-TRANSACTION-KEY"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 3: Select */}
        <section
          aria-labelledby="section-selects-heading"
          className="space-y-6 scroll-mt-6"
        >
          <div className="border-b border-border pb-3">
            <h2
              id="section-selects-heading"
              className="text-section-title font-semibold text-foreground flex items-center gap-3"
            >
              <span>3. Select Primitive</span>
              <code className="text-caption font-mono text-muted-foreground font-normal">
                src/components/ui/select.tsx
              </code>
            </h2>
            <p className="mt-1 text-body text-muted-foreground">
              Accessible native dropdown select preserving operating system
              keyboard navigation (Arrow keys, Space/Enter to activate, Escape
              to close) with typed CVA styling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sizes */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>Dropdown Sizes</CardTitle>
                <CardDescription>
                  sm, md, and lg heights matching input scale.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                <div>
                  <label
                    htmlFor="select-sm"
                    className="block text-caption font-medium mb-1"
                  >
                    Small Select (h-control-sm)
                  </label>
                  <Select id="select-sm" size="sm" defaultValue="10">
                    <option value="10">Show 10 per page</option>
                    <option value="25">Show 25 per page</option>
                    <option value="50">Show 50 per page</option>
                  </Select>
                </div>
                <div>
                  <label
                    htmlFor="select-md"
                    className="block text-caption font-medium mb-1"
                  >
                    Medium Select (h-control-md)
                  </label>
                  <Select id="select-md" size="md" defaultValue="all">
                    <option value="all">All Order Statuses</option>
                    <option value="pending">Pending Approval</option>
                    <option value="fulfilled">Fulfilled</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                </div>
                <div>
                  <label
                    htmlFor="select-lg"
                    className="block text-caption font-medium mb-1"
                  >
                    Large Select (h-control-lg)
                  </label>
                  <Select id="select-lg" size="lg" defaultValue="us-east">
                    <option value="us-east">US East Fulfillment Region</option>
                    <option value="eu-west">EU West Fulfillment Region</option>
                    <option value="apac-sg">APAC Singapore Hub</option>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Error State */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>Error &amp; Invalid State</CardTitle>
                <CardDescription>
                  aria-invalid=&quot;true&quot; activates border-destructive.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div>
                  <label
                    htmlFor="select-error"
                    className="block text-caption font-medium mb-1"
                  >
                    Fulfillment Facility Assignment
                  </label>
                  <Select
                    id="select-error"
                    aria-invalid="true"
                    aria-describedby="select-error-msg"
                    defaultValue="unassigned"
                  >
                    <option value="unassigned">
                      -- Select Target Facility --
                    </option>
                    <option value="wh-a">Warehouse Facility Alpha</option>
                    <option value="wh-b">Warehouse Facility Bravo</option>
                  </Select>
                  <p
                    id="select-error-msg"
                    role="alert"
                    className="mt-1 text-caption text-destructive"
                  >
                    Please designate an operational warehouse for fulfillment.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Disabled State */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>Disabled Dropdown</CardTitle>
                <CardDescription>
                  Native select disabled with muted styling.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div>
                  <label
                    htmlFor="select-disabled"
                    className="block text-caption font-medium mb-1"
                  >
                    Locked Currency Region
                  </label>
                  <Select id="select-disabled" disabled defaultValue="usd">
                    <option value="usd">
                      USD ($) &bull; United States Dollar
                    </option>
                    <option value="eur">EUR (&euro;) &bull; Euro</option>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Form Sandbox */}
          <div>
            <h3 className="text-section-title font-semibold text-foreground mb-3">
              Interactive Input &amp; Select Live Form Sandbox
            </h3>
            <InteractiveFormSandbox />
          </div>
        </section>

        {/* Section 4: Badge */}
        <section
          aria-labelledby="section-badges-heading"
          className="space-y-6 scroll-mt-6"
        >
          <div className="border-b border-border pb-3">
            <h2
              id="section-badges-heading"
              className="text-section-title font-semibold text-foreground flex items-center gap-3"
            >
              <span>4. Badge Primitive</span>
              <code className="text-caption font-mono text-muted-foreground font-normal">
                src/components/ui/badge.tsx
              </code>
            </h2>
            <p className="mt-1 text-body text-muted-foreground">
              Compact status chips communicating state via paired semantic color
              contrast (&ge; 6.3:1 WCAG AA) and textual labels. Never relies on
              color alone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Semantic Variants */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>Status Variants</CardTitle>
                <CardDescription>
                  Neutral, success, warning, and destructive status treatments.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="neutral">
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-muted-foreground"
                      aria-hidden="true"
                    />
                    <span>Neutral (Draft)</span>
                  </Badge>
                  <Badge variant="success">
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-success"
                      aria-hidden="true"
                    />
                    <span>Success (Delivered)</span>
                  </Badge>
                  <Badge variant="warning">
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-warning"
                      aria-hidden="true"
                    />
                    <span>Warning (Pending)</span>
                  </Badge>
                  <Badge variant="destructive">
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-destructive"
                      aria-hidden="true"
                    />
                    <span>Destructive (Cancelled)</span>
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Sizing Scale */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>Badge Sizes (sm / md / lg)</CardTitle>
                <CardDescription>
                  Strict 4px grid paddings: px-2 py-1 (sm), px-3 py-1 (md), px-4
                  py-2 (lg).
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="neutral" size="sm">
                    Small (sm)
                  </Badge>
                  <Badge variant="neutral" size="md">
                    Medium (md)
                  </Badge>
                  <Badge variant="neutral" size="lg">
                    Large (lg)
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 5: Card */}
        <section
          aria-labelledby="section-cards-heading"
          className="space-y-6 scroll-mt-6"
        >
          <div className="border-b border-border pb-3">
            <h2
              id="section-cards-heading"
              className="text-section-title font-semibold text-foreground flex items-center gap-3"
            >
              <span>5. Card Primitive</span>
              <code className="text-caption font-mono text-muted-foreground font-normal">
                src/components/ui/card.tsx
              </code>
            </h2>
            <p className="mt-1 text-body text-muted-foreground">
              Structural content containers supporting compound slots:
              CardHeader, CardTitle, CardDescription, CardContent, and
              CardFooter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card Variant: Default */}
            <Card variant="default" size="md">
              <CardHeader>
                <CardTitle>Default Surface Card</CardTitle>
                <CardDescription>
                  variant=&quot;default&quot; (size=&quot;md&quot;)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-caption text-muted-foreground">
                  Elevated white surface (`bg-surface`) bounded by subtle border
                  (`border-border`) and standard shadow (`shadow-sm`).
                </p>
              </CardContent>
              <CardFooter className="justify-between">
                <Badge variant="success" size="sm">
                  Active
                </Badge>
                <Button variant="ghost" size="sm">
                  Action
                </Button>
              </CardFooter>
            </Card>

            {/* Card Variant: Muted */}
            <Card variant="muted" size="md">
              <CardHeader>
                <CardTitle>Muted Surface Card</CardTitle>
                <CardDescription>
                  variant=&quot;muted&quot; (size=&quot;md&quot;)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-caption text-muted-foreground">
                  Subdued neutral slate surface (`bg-muted`) designed for side
                  panels, informational callouts, and grouped summary blocks.
                </p>
              </CardContent>
              <CardFooter className="justify-between">
                <Badge variant="neutral" size="sm">
                  Secondary
                </Badge>
                <Button variant="secondary" size="sm">
                  Review
                </Button>
              </CardFooter>
            </Card>

            {/* Card Variant: Outline */}
            <Card variant="outline" size="md">
              <CardHeader>
                <CardTitle>Outline Card</CardTitle>
                <CardDescription>
                  variant=&quot;outline&quot; (size=&quot;md&quot;)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-caption text-muted-foreground">
                  Transparent canvas (`bg-transparent`) bounded solely by subtle
                  border (`border-border`) without drop shadow.
                </p>
              </CardContent>
              <CardFooter className="justify-between">
                <Badge variant="warning" size="sm">
                  Caution
                </Badge>
                <Button variant="ghost" size="sm">
                  Configure
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Sizing Scale Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="default" size="sm">
              <p className="text-caption font-semibold">Card Size sm (p-4)</p>
              <p className="text-caption text-muted-foreground mt-1">
                Compact 16px internal padding.
              </p>
            </Card>
            <Card variant="default" size="md">
              <p className="text-caption font-semibold">Card Size md (p-6)</p>
              <p className="text-caption text-muted-foreground mt-1">
                Standard 24px internal padding.
              </p>
            </Card>
            <Card variant="default" size="lg">
              <p className="text-caption font-semibold">Card Size lg (p-8)</p>
              <p className="text-caption text-muted-foreground mt-1">
                Spacious 32px internal padding.
              </p>
            </Card>
          </div>
        </section>

        {/* Section 6: Modal */}
        <section
          aria-labelledby="section-modals-heading"
          className="space-y-6 scroll-mt-6"
        >
          <div className="border-b border-border pb-3">
            <h2
              id="section-modals-heading"
              className="text-section-title font-semibold text-foreground flex items-center gap-3"
            >
              <span>6. Modal Primitive</span>
              <code className="text-caption font-mono text-muted-foreground font-normal">
                src/components/ui/modal.tsx
              </code>
            </h2>
            <p className="mt-1 text-body text-muted-foreground">
              Accessible dialog powered by Radix Dialog. Enforces compile-time
              accessible title and description props, traps keyboard focus
              within the dialog, dismisses on Escape key or backdrop click, and
              restores focus to the invoking trigger button upon close.
            </p>
          </div>

          <Card variant="default" size="md" className="space-y-6">
            <CardHeader className="p-0">
              <CardTitle>Interactive Modal Verification Sandbox</CardTitle>
              <CardDescription>
                Demonstrates four dialog configurations exercising variants
                (`default`, `destructive`, `muted`) and sizes (`sm`, `md`, `lg`,
                `xl`).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ModalExamples />
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-6 text-center text-caption text-muted-foreground">
          <p>
            OrderHub Admin Console &bull; Session 06 / Step-7 Delivery &bull;
            Capstone Frontend Intern
          </p>
        </footer>
      </div>
    </main>
  );
}
