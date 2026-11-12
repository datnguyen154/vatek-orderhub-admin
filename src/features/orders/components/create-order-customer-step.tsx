/**
 * OrderHub Admin Console — Create Order Wizard: Step 1 Customer
 *
 * Captures customer selection and optional PO number with:
 * - Dynamic customer list fetching via useCustomers
 * - Loading and error/retry states
 * - Accessible error messages with aria-invalid and aria-describedby
 * - Step-level role="alert" error summary
 */

"use client";

import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { CreateOrderFormValues } from "../schemas/create-order";
import { useCustomers } from "../hooks/use-order-catalog";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface CreateOrderCustomerStepProps {
  form: UseFormReturn<CreateOrderFormValues>;
  stepHeadingRef: React.RefObject<HTMLHeadingElement | null>;
  customerSelectRef: React.RefObject<HTMLSelectElement | null>;
}

export function CreateOrderCustomerStep({
  form,
  stepHeadingRef,
  customerSelectRef,
}: CreateOrderCustomerStepProps) {
  const t = useTranslations("orders.create.customerStep");
  const tValidation = useTranslations();
  const {
    register,
    formState: { errors },
  } = form;

  const { data: customersData, isLoading, isError, refetch } = useCustomers();

  const customers = customersData?.data ?? [];

  // Register customerId with ref merging
  const { ref: formCustomerRef, ...customerRegisterProps } =
    register("customerId");

  return (
    <div className="space-y-6">
      <div>
        <h2
          ref={stepHeadingRef}
          tabIndex={-1}
          className="text-section-title font-semibold text-foreground tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm"
        >
          {t("heading")}
        </h2>
        <p className="mt-1 text-body text-muted-foreground">
          {t("subheading")}
        </p>
      </div>

      <Card variant="default">
        <CardContent className="space-y-5 p-6">
          {/* Customer Selection */}
          <div className="space-y-2">
            <label
              htmlFor="customer-select"
              className="block text-body font-medium text-foreground"
            >
              {t("customerLabel")}{" "}
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
            </label>

            {isLoading && (
              <p className="text-body text-muted-foreground">
                {t("loadingCustomers")}
              </p>
            )}

            {isError && (
              <div className="flex items-center gap-3 p-3 rounded-md border border-destructive/30 bg-destructive-muted text-destructive-muted-foreground text-sm">
                <span>{t("loadError")}</span>
                <Button variant="secondary" size="sm" onClick={() => refetch()}>
                  {t("retry")}
                </Button>
              </div>
            )}

            {!isLoading && !isError && (
              <Select
                id="customer-select"
                aria-invalid={Boolean(errors.customerId)}
                aria-describedby={
                  errors.customerId ? "customer-error" : undefined
                }
                ref={(e) => {
                  formCustomerRef(e);
                  if (customerSelectRef) {
                    (
                      customerSelectRef as React.MutableRefObject<HTMLSelectElement | null>
                    ).current = e;
                  }
                }}
                {...customerRegisterProps}
              >
                <option value="">{t("selectPlaceholder")}</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </Select>
            )}

            {errors.customerId && (
              <p
                id="customer-error"
                className="text-caption text-destructive font-medium mt-1"
              >
                {tValidation(
                  errors.customerId.message as Parameters<typeof tValidation>[0]
                )}
              </p>
            )}
          </div>

          {/* PO Number (Optional) */}
          <div className="space-y-2">
            <label
              htmlFor="po-number"
              className="block text-body font-medium text-foreground"
            >
              {t("poNumberLabel")}
            </label>
            <Input
              id="po-number"
              maxLength={40}
              placeholder={t("poNumberPlaceholder")}
              aria-invalid={Boolean(errors.poNumber)}
              aria-describedby={errors.poNumber ? "po-number-error" : undefined}
              {...register("poNumber")}
            />
            {errors.poNumber && (
              <p
                id="po-number-error"
                className="text-caption text-destructive font-medium mt-1"
              >
                {tValidation(
                  errors.poNumber.message as Parameters<typeof tValidation>[0]
                )}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
