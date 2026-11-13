/**
 * OrderHub Admin Console — Create Order Wizard Component
 *
 * Multi-step wizard orchestrator:
 * - 3-step sequence: Customer (1) -> Line items (2) -> Review (3)
 * - Validated by React Hook Form + Zod with zodResolver
 * - Accessible stepper with <ol>, aria-current="step", and text indicators
 * - Step change moves focus to step heading (tabIndex={-1})
 * - Next triggers validation for current step fields only and focuses first invalid control
 * - Preserves state on Back navigation
 * - Preserves/restores idempotencyKey and draft on failed submission (?resume=1)
 * - Immediate router.push("/orders") on submit with hook-level optimistic mutation
 */

"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  createOrderSchema,
  customerStepSchema,
  itemsStepSchema,
  type CreateOrderFormValues,
} from "../schemas/create-order";
import { useCreateOrder, getSavedDraft } from "../hooks/use-create-order";
import { CreateOrderCustomerStep } from "./create-order-customer-step";
import { CreateOrderItemsStep } from "./create-order-items-step";
import { CreateOrderReviewStep } from "./create-order-review-step";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function CreateOrderWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("orders.create");

  // Error count state for sticky action bar alert
  const [errorCount, setErrorCount] = useState<number>(0);

  const isResume = searchParams.get("resume") === "1";
  const savedDraft = getSavedDraft();

  // Initialize idempotencyKey: reuse from draft if resuming, or create new random UUID
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => {
    if (isResume && savedDraft) {
      return savedDraft.idempotencyKey;
    }
    return typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `key_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  });

  // Step state (1: Customer, 2: Items, 3: Review)
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (isResume && savedDraft) {
      return 3;
    }
    return 1;
  });

  // Form initialization
  const form = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues:
      isResume && savedDraft
        ? savedDraft.values
        : {
            customerId: "",
            poNumber: "",
            items: [],
          },
    mode: "onTouched",
  });

  // Mutation hook
  const createOrderMutation = useCreateOrder();

  // Refs for accessible focus management
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const customerSelectRef = useRef<HTMLSelectElement>(null);
  const quantityInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // Focus step heading on step change
  useEffect(() => {
    stepHeadingRef.current?.focus();
    setErrorCount(0);
  }, [currentStep]);

  // Clear errorCount automatically when invalid fields are fixed
  useEffect(() => {
    if (errorCount === 0) return;
    const subscription = form.watch((values) => {
      if (currentStep === 1) {
        if (
          customerStepSchema.safeParse({
            customerId: values.customerId,
            poNumber: values.poNumber,
          }).success
        ) {
          setErrorCount(0);
        }
      } else if (currentStep === 2) {
        if (itemsStepSchema.safeParse({ items: values.items || [] }).success) {
          setErrorCount(0);
        }
      } else if (currentStep === 3) {
        if (createOrderSchema.safeParse(values).success) {
          setErrorCount(0);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [errorCount, currentStep, form]);

  // Handle Step 1 Next
  const handleCustomerNext = () => {
    const values = form.getValues();
    const result = customerStepSchema.safeParse({
      customerId: values.customerId,
      poNumber: values.poNumber,
    });

    if (!result.success) {
      setErrorCount(result.error.issues.length);
      for (const issue of result.error.issues) {
        const field = issue.path[0] as "customerId" | "poNumber";
        form.setError(field, { message: issue.message });
      }
      if (!values.customerId) {
        customerSelectRef.current?.focus();
      } else {
        form.setFocus("poNumber");
      }
      return;
    }

    form.clearErrors(["customerId", "poNumber"]);
    setErrorCount(0);
    setCurrentStep(2);
  };

  // Handle Step 2 Next
  const handleItemsNext = () => {
    const values = form.getValues();
    const result = itemsStepSchema.safeParse({
      items: values.items || [],
    });

    if (!result.success) {
      setErrorCount(result.error.issues.length);
      for (const issue of result.error.issues) {
        if (issue.path[0] === "items") {
          if (issue.path.length === 1) {
            form.setError("items", { message: issue.message });
          } else {
            const index = issue.path[1] as number;
            const subField = issue.path[2] as
              | "productId"
              | "quantity"
              | "discountPercent";
            form.setError(`items.${index}.${subField}`, {
              message: issue.message,
            });
          }
        }
      }
      const items = values.items || [];
      if (items.length === 0) {
        return;
      }
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (
          !item.quantity ||
          item.quantity < 1 ||
          !Number.isInteger(item.quantity)
        ) {
          quantityInputRefs.current[i]?.focus();
          return;
        }
        if (
          typeof item.discountPercent === "number" &&
          (item.discountPercent < 0 ||
            item.discountPercent > 50 ||
            !Number.isInteger(item.discountPercent))
        ) {
          form.setFocus(`items.${i}.discountPercent`);
          return;
        }
      }
      return;
    }

    form.clearErrors("items");
    setErrorCount(0);
    setCurrentStep(3);
  };

  // Handle Step 3 Submit with form.handleSubmit(onValid)
  const handleValidSubmit = (values: CreateOrderFormValues) => {
    const createScenario = searchParams.get("create") || undefined;

    createOrderMutation.mutate({
      idempotencyKey,
      customerId: values.customerId,
      poNumber: values.poNumber?.trim() || undefined,
      items: values.items,
      createScenario,
    });

    // Immediately navigate back to /orders per requirement 4.5
    router.push("/orders");
  };

  const handleReviewSubmit = () => {
    form.handleSubmit(handleValidSubmit, (fieldErrors) => {
      let count = 0;
      if (fieldErrors.customerId) count++;
      if (fieldErrors.poNumber) count++;
      if (fieldErrors.items) {
        if (Array.isArray(fieldErrors.items)) {
          fieldErrors.items.forEach((item) => {
            if (item?.productId) count++;
            if (item?.quantity) count++;
            if (item?.discountPercent) count++;
          });
        } else {
          count++;
        }
      }
      setErrorCount(Math.max(count, 1));
    })();
  };

  // Stepper labels and descriptions
  const steps = [
    {
      number: 1,
      label: t("stepper.step1Label"),
      title: t("stepper.step1Title"),
    },
    {
      number: 2,
      label: t("stepper.step2Label"),
      title: t("stepper.step2Title"),
    },
    {
      number: 3,
      label: t("stepper.step3Label"),
      title: t("stepper.step3Title"),
    },
  ];

  const activeStep = steps.find((s) => s.number === currentStep) ?? steps[0];

  return (
    <div className="flex flex-col space-y-6">
      {/* Mobile Stepper: single horizontal row below sm */}
      <nav aria-label={t("stepper.navAria")} className="sm:hidden space-y-1.5">
        <p className="text-xs font-semibold text-foreground">
          {activeStep.label}: {activeStep.title}
        </p>
        <ol className="flex items-center justify-between gap-1 p-2 rounded-lg border border-border bg-surface text-xs">
          {steps.map((step) => {
            const isCurrent = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <li
                key={step.number}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex min-w-0 items-center gap-1.5 py-1 px-1.5 rounded-md transition-colors",
                  isCurrent
                    ? "bg-primary-muted/20 text-foreground font-semibold"
                    : isCompleted
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    isCurrent
                      ? "bg-warning-muted text-warning-muted-foreground"
                      : isCompleted
                        ? "bg-success-muted text-success-muted-foreground"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? "✓" : step.number}
                </span>
                <span className="truncate">{step.title}</span>
                {isCurrent && (
                  <span className="sr-only">
                    ({t("stepper.statusCurrent")})
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Desktop Stepper: sm and wider */}
      <nav aria-label={t("stepper.navAria")} className="hidden sm:block">
        <ol className="grid sm:grid-cols-3 gap-3">
          {steps.map((step) => {
            const isCurrent = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <li
                key={step.number}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex flex-col gap-1 p-3 rounded-lg border text-sm transition-colors",
                  isCurrent
                    ? "border-primary bg-primary-muted/20 text-foreground font-medium"
                    : isCompleted
                      ? "border-border bg-surface text-foreground"
                      : "border-border/60 bg-muted/40 text-muted-foreground"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    {step.label}
                  </span>
                  <Badge
                    variant={
                      isCurrent
                        ? "warning"
                        : isCompleted
                          ? "success"
                          : "neutral"
                    }
                    size="sm"
                  >
                    {isCurrent
                      ? t("stepper.statusCurrent")
                      : isCompleted
                        ? t("stepper.statusCompleted")
                        : t("stepper.statusUpcoming")}
                  </Badge>
                </div>
                <span
                  className={cn(
                    "text-body font-semibold",
                    isCompleted || isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="flex-1 pb-24">
        {currentStep === 1 && (
          <CreateOrderCustomerStep
            form={form}
            stepHeadingRef={stepHeadingRef}
            customerSelectRef={customerSelectRef}
          />
        )}

        {currentStep === 2 && (
          <CreateOrderItemsStep
            form={form}
            stepHeadingRef={stepHeadingRef}
            quantityInputRefs={quantityInputRefs}
          />
        )}

        {currentStep === 3 && (
          <CreateOrderReviewStep
            form={form}
            onEditStep={(step) => setCurrentStep(step)}
            stepHeadingRef={stepHeadingRef}
          />
        )}
      </div>

      {/* Shared Sticky Action Bar */}
      <div className="sticky bottom-0 z-10 border-t border-border bg-surface py-4 px-4 sm:px-6 rounded-b-lg shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {errorCount > 0 && (
            <div
              role="alert"
              className="sm:hidden flex items-center gap-1.5 text-xs font-semibold text-destructive w-full"
            >
              <svg
                className="h-4 w-4 shrink-0 text-destructive"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{t("fieldsAttention", { count: errorCount })}</span>
            </div>
          )}

          <div className="flex items-center justify-between w-full gap-3 sm:gap-4">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="shrink-0"
                  onClick={() => setCurrentStep((s) => s - 1)}
                  disabled={createOrderMutation.isPending}
                >
                  {currentStep === 2
                    ? t("itemsStep.back")
                    : t("reviewStep.back")}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3 sm:gap-4 shrink-0 ml-auto">
              {errorCount > 0 && (
                <div
                  role="alert"
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-destructive"
                >
                  <svg
                    className="h-4 w-4 shrink-0 text-destructive"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{t("fieldsAttention", { count: errorCount })}</span>
                </div>
              )}

              {currentStep === 1 && (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  className="shrink-0"
                  onClick={handleCustomerNext}
                >
                  {t("customerStep.next")}
                </Button>
              )}

              {currentStep === 2 && (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  className="shrink-0"
                  onClick={handleItemsNext}
                >
                  {t("itemsStep.next")}
                </Button>
              )}

              {currentStep === 3 && (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  className="shrink-0"
                  onClick={handleReviewSubmit}
                  disabled={createOrderMutation.isPending}
                  loading={createOrderMutation.isPending}
                >
                  {t("reviewStep.submit")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateOrderWizardFallback() {
  const t = useTranslations("orders.create");
  return (
    <div className="p-8 text-center text-body text-muted-foreground">
      {t("loading")}
    </div>
  );
}

export function CreateOrderWizard() {
  return (
    <Suspense fallback={<CreateOrderWizardFallback />}>
      <CreateOrderWizardContent />
    </Suspense>
  );
}
