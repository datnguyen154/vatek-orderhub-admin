/**
 * OrderHub Admin Console — Create Order Wizard: Step 3 Review
 *
 * Displays full order summary before submission:
 * - Customer & PO number overview with jump-to-step Edit button
 * - Line items table with jump-to-step Edit button
 * - Precise financial breakdown (subtotal, discount, total in cents)
 * - Submit action disabled/loading while mutation is pending
 */

"use client";

import React, { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useTranslations, useLocale } from "next-intl";
import type { CreateOrderFormValues } from "../schemas/create-order";
import { calculateOrderTotals } from "../schemas/create-order";
import { useCustomers, useProducts } from "../hooks/use-order-catalog";
import { formatCurrency } from "./orders-table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface CreateOrderReviewStepProps {
  form: UseFormReturn<CreateOrderFormValues>;
  onEditStep: (step: number) => void;
  stepHeadingRef: React.RefObject<HTMLHeadingElement | null>;
}

export function CreateOrderReviewStep({
  form,
  onEditStep,
  stepHeadingRef,
}: CreateOrderReviewStepProps) {
  const t = useTranslations("orders.create.reviewStep");
  const locale = useLocale();

  const values = form.getValues();
  const { data: customersData } = useCustomers();
  const { data: productsData } = useProducts();

  const customers = useMemo(
    () => customersData?.data ?? [],
    [customersData?.data]
  );
  const products = useMemo(
    () => productsData?.data ?? [],
    [productsData?.data]
  );

  const customer = useMemo(
    () => customers.find((c) => c.id === values.customerId),
    [customers, values.customerId]
  );

  const totals = useMemo(
    () => calculateOrderTotals(values.items, products),
    [values.items, products]
  );

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

      {/* Customer & PO Details Card */}
      <Card variant="default">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">
            {t("customerSection")}
          </CardTitle>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onEditStep(1)}
            aria-label={t("editCustomer")}
          >
            {t("editCustomer")}
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-caption text-muted-foreground">
              {t("customerName")}
            </p>
            <p className="text-body font-medium text-foreground">
              {customer?.name ?? values.customerId}
            </p>
            <p className="text-caption text-muted-foreground">
              {customer?.email}
            </p>
          </div>

          <div>
            <p className="text-caption text-muted-foreground">
              {t("poNumber")}
            </p>
            <p className="text-body font-medium text-foreground">
              {values.poNumber?.trim() ? values.poNumber.trim() : t("none")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Items Summary Table Card */}
      <Card variant="default">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">
            {t("itemsSection")} ({totals.lines.length})
          </CardTitle>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onEditStep(2)}
            aria-label={t("editItems")}
          >
            {t("editItems")}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wider border-y border-border">
                <tr>
                  <th scope="col" className="py-3 px-4">
                    {t("table.product")}
                  </th>
                  <th scope="col" className="py-3 px-4 text-right">
                    {t("table.price")}
                  </th>
                  <th scope="col" className="py-3 px-4 text-center">
                    {t("table.quantity")}
                  </th>
                  <th scope="col" className="py-3 px-4 text-center">
                    {t("table.discount")}
                  </th>
                  <th scope="col" className="py-3 px-4 text-right">
                    {t("table.lineTotal")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {totals.lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground">
                        {line.productName}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {line.sku}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(line.unitPrice, "USD", locale)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {line.quantity}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {line.discountPercent}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-foreground">
                      {formatCurrency(line.lineTotal, "USD", locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Financial Breakdown Card */}
      <Card variant="muted">
        <CardContent className="p-6 space-y-3">
          <div className="flex justify-between text-body">
            <span className="text-muted-foreground">{t("subtotal")}</span>
            <span className="font-mono text-foreground">
              {formatCurrency(totals.subtotal, "USD", locale)}
            </span>
          </div>

          <div className="flex justify-between text-body">
            <span className="text-muted-foreground">{t("discount")}</span>
            <span className="font-mono text-success">
              -{formatCurrency(totals.discount, "USD", locale)}
            </span>
          </div>

          <div className="pt-3 border-t border-border flex justify-between items-baseline">
            <span className="text-base font-semibold text-foreground">
              {t("total")}
            </span>
            <span className="text-xl font-bold font-mono text-foreground">
              {formatCurrency(totals.total, "USD", locale)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
