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

import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("catalogue");
  return {
    title: `${t("title")} — OrderHub Admin Console`,
    description: t("description"),
  };
}

export default async function ComponentCataloguePage() {
  const t = await getTranslations("catalogue");

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
                <span>{t("baselineBadge")}</span>
              </Badge>
              <span className="text-caption text-muted-foreground font-mono">
                {t("version")}
              </span>
            </div>

            <nav
              aria-label={t("breadcrumbAria")}
              className="flex items-center gap-4 text-caption"
            >
              <Link
                href="/login"
                className="text-primary hover:text-primary-hover font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm"
              >
                {t("backToLogin")}
              </Link>
            </nav>
          </div>

          <div>
            <h1 className="text-page-title font-semibold tracking-tight text-foreground">
              {t("title")}
            </h1>
            <p className="mt-2 text-body text-muted-foreground max-w-3xl">
              {t("description")}{" "}
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
              <span>{t("buttons.sectionTitle")}</span>
              <code className="text-caption font-mono text-muted-foreground font-normal">
                src/components/ui/button.tsx
              </code>
            </h2>
            <p className="mt-1 text-body text-muted-foreground">
              {t("buttons.sectionDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Variants */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>{t("buttons.variantsTitle")}</CardTitle>
                <CardDescription>{t("buttons.variantsDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">
                    {t("buttons.variantPrimary")}
                  </Button>
                  <Button variant="secondary">
                    {t("buttons.variantSecondary")}
                  </Button>
                  <Button variant="ghost">{t("buttons.variantGhost")}</Button>
                  <Button variant="destructive">
                    {t("buttons.variantDestructive")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sizes */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>{t("buttons.sizesTitle")}</CardTitle>
                <CardDescription>{t("buttons.sizesDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" size="sm">
                    {t("buttons.sizeSmall")}
                  </Button>
                  <Button variant="primary" size="md">
                    {t("buttons.sizeMedium")}
                  </Button>
                  <Button variant="primary" size="lg">
                    {t("buttons.sizeLarge")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* States: Disabled and Loading */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>{t("buttons.statesTitle")}</CardTitle>
                <CardDescription>{t("buttons.statesDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" disabled>
                    {t("buttons.disabledPrimary")}
                  </Button>
                  <Button variant="secondary" disabled>
                    {t("buttons.disabledSecondary")}
                  </Button>
                  <Button variant="primary" loading>
                    {t("buttons.loading")}
                  </Button>
                  <Button variant="secondary" loading>
                    {t("buttons.loading")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Sandbox */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>{t("buttons.sandboxTitle")}</CardTitle>
                <CardDescription>{t("buttons.sandboxDesc")}</CardDescription>
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
              <span>{t("inputs.sectionTitle")}</span>
              <code className="text-caption font-mono text-muted-foreground font-normal">
                src/components/ui/input.tsx
              </code>
            </h2>
            <p className="mt-1 text-body text-muted-foreground">
              {t("inputs.sectionDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sizes */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>{t("inputs.sizesTitle")}</CardTitle>
                <CardDescription>{t("inputs.sizesDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div>
                  <label
                    htmlFor="input-sm"
                    className="block text-caption font-medium mb-1"
                  >
                    {t("inputs.sizeSmLabel")}
                  </label>
                  <Input
                    id="input-sm"
                    size="sm"
                    placeholder={t("inputs.sizeSmPlaceholder")}
                  />
                </div>
                <div>
                  <label
                    htmlFor="input-md"
                    className="block text-caption font-medium mb-1"
                  >
                    {t("inputs.sizeMdLabel")}
                  </label>
                  <Input
                    id="input-md"
                    size="md"
                    placeholder={t("inputs.sizeMdPlaceholder")}
                  />
                </div>
                <div>
                  <label
                    htmlFor="input-lg"
                    className="block text-caption font-medium mb-1"
                  >
                    {t("inputs.sizeLgLabel")}
                  </label>
                  <Input
                    id="input-lg"
                    size="lg"
                    placeholder={t("inputs.sizeLgPlaceholder")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Error States */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>{t("inputs.errorsTitle")}</CardTitle>
                <CardDescription>{t("inputs.errorsDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div>
                  <label
                    htmlFor="input-err-variant"
                    className="block text-caption font-medium mb-1"
                  >
                    {t("inputs.errVariantLabel")}
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
                    {t("inputs.errVariantMsg")}
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="input-err-aria"
                    className="block text-caption font-medium mb-1"
                  >
                    {t("inputs.errAriaLabel")}
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
                    {t("inputs.errAriaMsg")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Disabled & Value States */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>{t("inputs.disabledTitle")}</CardTitle>
                <CardDescription>{t("inputs.disabledDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div>
                  <label
                    htmlFor="input-disabled"
                    className="block text-caption font-medium mb-1"
                  >
                    {t("inputs.disabledEmptyLabel")}
                  </label>
                  <Input
                    id="input-disabled"
                    disabled
                    placeholder={t("inputs.disabledEmptyPlaceholder")}
                  />
                </div>
                <div>
                  <label
                    htmlFor="input-disabled-val"
                    className="block text-caption font-medium mb-1"
                  >
                    {t("inputs.disabledLockedLabel")}
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
              <span>{t("selects.sectionTitle")}</span>
              <code className="text-caption font-mono text-muted-foreground font-normal">
                src/components/ui/select.tsx
              </code>
            </h2>
            <p className="mt-1 text-body text-muted-foreground">
              {t("selects.sectionDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sizes */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>{t("selects.sizesTitle")}</CardTitle>
                <CardDescription>{t("selects.sizesDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                <div>
                  <label
                    htmlFor="select-sm"
                    className="block text-caption font-medium mb-1"
                  >
                    {t("selects.sizeSmLabel")}
                  </label>
                  <Select id="select-sm" size="sm" defaultValue="10">
                    <option value="10">{t("selects.option10")}</option>
                    <option value="25">{t("selects.option25")}</option>
                    <option value="50">{t("selects.option50")}</option>
                  </Select>
                </div>
                <div>
                  <label
                    htmlFor="select-md"
                    className="block text-caption font-medium mb-1"
                  >
                    {t("selects.sizeMdLabel")}
                  </label>
                  <Select id="select-md" size="md" defaultValue="all">
                    <option value="all">{t("selects.optionAll")}</option>
                    <option value="pending">
                      {t("selects.optionPending")}
                    </option>
                    <option value="fulfilled">
                      {t("selects.optionFulfilled")}
                    </option>
                    <option value="cancelled">
                      {t("selects.optionCancelled")}
                    </option>
                  </Select>
                </div>
                <div>
                  <label
                    htmlFor="select-lg"
                    className="block text-caption font-medium mb-1"
                  >
                    {t("selects.sizeLgLabel")}
                  </label>
                  <Select id="select-lg" size="lg" defaultValue="us-east">
                    <option value="us-east">{t("selects.optionUsEast")}</option>
                    <option value="eu-west">{t("selects.optionEuWest")}</option>
                    <option value="apac-sg">{t("selects.optionApacSg")}</option>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Error State */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>{t("selects.errorTitle")}</CardTitle>
                <CardDescription>{t("selects.errorDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div>
                  <label
                    htmlFor="select-error"
                    className="block text-caption font-medium mb-1"
                  >
                    {t("selects.errorLabel")}
                  </label>
                  <Select
                    id="select-error"
                    aria-invalid="true"
                    aria-describedby="select-error-msg"
                    defaultValue="unassigned"
                  >
                    <option value="unassigned">
                      {t("selects.optionPlaceholder")}
                    </option>
                    <option value="wh-a">{t("selects.optionWhA")}</option>
                    <option value="wh-b">{t("selects.optionWhB")}</option>
                  </Select>
                  <p
                    id="select-error-msg"
                    role="alert"
                    className="mt-1 text-caption text-destructive"
                  >
                    {t("selects.errorMsg")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Disabled State */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>{t("selects.disabledTitle")}</CardTitle>
                <CardDescription>{t("selects.disabledDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div>
                  <label
                    htmlFor="select-disabled"
                    className="block text-caption font-medium mb-1"
                  >
                    {t("selects.disabledLabel")}
                  </label>
                  <Select id="select-disabled" disabled defaultValue="usd">
                    <option value="usd">{t("selects.optionUsd")}</option>
                    <option value="eur">{t("selects.optionEur")}</option>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Form Sandbox */}
          <div>
            <h3 className="text-section-title font-semibold text-foreground mb-3">
              {t("selects.sandboxHeading")}
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
              <span>{t("badges.sectionTitle")}</span>
              <code className="text-caption font-mono text-muted-foreground font-normal">
                src/components/ui/badge.tsx
              </code>
            </h2>
            <p className="mt-1 text-body text-muted-foreground">
              {t("badges.sectionDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Semantic Variants */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>{t("badges.variantsTitle")}</CardTitle>
                <CardDescription>{t("badges.variantsDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="neutral">
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-muted-foreground"
                      aria-hidden="true"
                    />
                    <span>{t("badges.neutralDraft")}</span>
                  </Badge>
                  <Badge variant="success">
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-success"
                      aria-hidden="true"
                    />
                    <span>{t("badges.successDelivered")}</span>
                  </Badge>
                  <Badge variant="warning">
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-warning"
                      aria-hidden="true"
                    />
                    <span>{t("badges.warningPending")}</span>
                  </Badge>
                  <Badge variant="destructive">
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-destructive"
                      aria-hidden="true"
                    />
                    <span>{t("badges.destructiveCancelled")}</span>
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Sizing Scale */}
            <Card variant="default" size="md" className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>{t("badges.sizesTitle")}</CardTitle>
                <CardDescription>{t("badges.sizesDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="neutral" size="sm">
                    {t("badges.sizeSm")}
                  </Badge>
                  <Badge variant="neutral" size="md">
                    {t("badges.sizeMd")}
                  </Badge>
                  <Badge variant="neutral" size="lg">
                    {t("badges.sizeLg")}
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
              <span>{t("cards.sectionTitle")}</span>
              <code className="text-caption font-mono text-muted-foreground font-normal">
                src/components/ui/card.tsx
              </code>
            </h2>
            <p className="mt-1 text-body text-muted-foreground">
              {t("cards.sectionDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card Variant: Default */}
            <Card variant="default" size="md">
              <CardHeader>
                <CardTitle>{t("cards.defaultTitle")}</CardTitle>
                <CardDescription>{t("cards.defaultDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-caption text-muted-foreground">
                  {t("cards.defaultContent")}
                </p>
              </CardContent>
              <CardFooter className="justify-between">
                <Badge variant="success" size="sm">
                  {t("cards.activeBadge")}
                </Badge>
                <Button variant="ghost" size="sm">
                  {t("cards.actionBtn")}
                </Button>
              </CardFooter>
            </Card>

            {/* Card Variant: Muted */}
            <Card variant="muted" size="md">
              <CardHeader>
                <CardTitle>{t("cards.mutedTitle")}</CardTitle>
                <CardDescription>{t("cards.mutedDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-caption text-muted-foreground">
                  {t("cards.mutedContent")}
                </p>
              </CardContent>
              <CardFooter className="justify-between">
                <Badge variant="neutral" size="sm">
                  {t("cards.secondaryBadge")}
                </Badge>
                <Button variant="secondary" size="sm">
                  {t("cards.reviewBtn")}
                </Button>
              </CardFooter>
            </Card>

            {/* Card Variant: Outline */}
            <Card variant="outline" size="md">
              <CardHeader>
                <CardTitle>{t("cards.outlineTitle")}</CardTitle>
                <CardDescription>{t("cards.outlineDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-caption text-muted-foreground">
                  {t("cards.outlineContent")}
                </p>
              </CardContent>
              <CardFooter className="justify-between">
                <Badge variant="warning" size="sm">
                  {t("cards.cautionBadge")}
                </Badge>
                <Button variant="ghost" size="sm">
                  {t("cards.configureBtn")}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Sizing Scale Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="default" size="sm">
              <p className="text-caption font-semibold">
                {t("cards.scaleSmTitle")}
              </p>
              <p className="text-caption text-muted-foreground mt-1">
                {t("cards.scaleSmDesc")}
              </p>
            </Card>
            <Card variant="default" size="md">
              <p className="text-caption font-semibold">
                {t("cards.scaleMdTitle")}
              </p>
              <p className="text-caption text-muted-foreground mt-1">
                {t("cards.scaleMdDesc")}
              </p>
            </Card>
            <Card variant="default" size="lg">
              <p className="text-caption font-semibold">
                {t("cards.scaleLgTitle")}
              </p>
              <p className="text-caption text-muted-foreground mt-1">
                {t("cards.scaleLgDesc")}
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
              <span>{t("modals.sectionTitle")}</span>
              <code className="text-caption font-mono text-muted-foreground font-normal">
                src/components/ui/modal.tsx
              </code>
            </h2>
            <p className="mt-1 text-body text-muted-foreground">
              {t("modals.sectionDesc")}
            </p>
          </div>

          <Card variant="default" size="md" className="space-y-6">
            <CardHeader className="p-0">
              <CardTitle>{t("modals.sandboxTitle")}</CardTitle>
              <CardDescription>{t("modals.sandboxDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ModalExamples />
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-6 text-center text-caption text-muted-foreground">
          <p>{t("footer.text")}</p>
        </footer>
      </div>
    </main>
  );
}
