/**
 * OrderHub Admin Console — Create Order Wizard: Step 2 Items
 *
 * Line items configuration with:
 * - Searchable product picker filtering by name or SKU case-insensitively
 * - aria-live result count announcement (no ARIA combobox)
 * - Automatic quantity focus when adding duplicate product
 * - Dynamic line array with quantity, discount %, and computed line total
 * - Accessible validation with aria-invalid, aria-describedby, and role="alert"
 * - Responsive vertical stacking below sm breakpoint
 */

"use client";

import React, { useState, useMemo, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { useTranslations, useLocale } from "next-intl";
import type { CreateOrderFormValues } from "../schemas/create-order";
import type { Product } from "../types";
import { useProducts } from "../hooks/use-order-catalog";
import { formatCurrency } from "./orders-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface CreateOrderItemsStepProps {
  form: UseFormReturn<CreateOrderFormValues>;
  stepHeadingRef: React.RefObject<HTMLHeadingElement | null>;
  quantityInputRefs: React.MutableRefObject<
    Record<number, HTMLInputElement | null>
  >;
}

export function CreateOrderItemsStep({
  form,
  stepHeadingRef,
  quantityInputRefs,
}: CreateOrderItemsStepProps) {
  const t = useTranslations("orders.create.itemsStep");
  const tValidation = useTranslations();
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    register,
    control,
    watch,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items") || [];

  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError: isProductsError,
    refetch: refetchProducts,
  } = useProducts();

  const products = useMemo(
    () => productsData?.data ?? [],
    [productsData?.data]
  );

  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products) {
      map.set(p.id, p);
    }
    return map;
  }, [products]);

  // Filter products by name or SKU case-insensitively
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return products;
    }
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const handleAddProduct = (product: Product) => {
    const existingIndex = fields.findIndex((f) => f.productId === product.id);
    if (existingIndex !== -1) {
      // Focus existing line's quantity field instead of creating a duplicate line
      const inputEl = quantityInputRefs.current[existingIndex];
      if (inputEl) {
        const prefersReducedMotion =
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        inputEl.scrollIntoView({
          block: "center",
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
        inputEl.focus();
        inputEl.select();
      }
      return;
    }

    append({
      productId: product.id,
      quantity: 1,
      discountPercent: 0,
    });
  };

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

      {/* Product Search & Picker Card */}
      <Card variant="default">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            {t("searchLabel")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              id="product-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchLabel")}
            />
            {/* Screen reader live region for search results count */}
            <div aria-live="polite" className="sr-only">
              {t("resultsFound", { count: filteredProducts.length })}
            </div>
            <p className="text-caption text-muted-foreground">
              {t("resultsFound", { count: filteredProducts.length })}
            </p>
          </div>

          {isProductsLoading && (
            <p className="text-body text-muted-foreground">
              {t("loadingProducts")}
            </p>
          )}

          {isProductsError && (
            <div className="flex items-center gap-3 p-3 rounded-md border border-destructive/30 bg-destructive-muted text-destructive-muted-foreground text-sm">
              <span>{t("loadError")}</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => refetchProducts()}
              >
                {tValidation("orders.create.customerStep.retry")}
              </Button>
            </div>
          )}

          {!isProductsLoading && !isProductsError && (
            <div className="divide-y divide-border border border-border rounded-lg bg-surface max-h-56 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="p-4 text-center text-caption text-muted-foreground">
                  {t("emptySearch")}
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 gap-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-body font-medium text-foreground truncate">
                        {product.name}
                      </p>
                      <p className="text-caption text-muted-foreground font-mono">
                        {product.sku} ·{" "}
                        {formatCurrency(product.unitPrice, "USD", locale)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddProduct(product)}
                      aria-label={t("addProductAria", { name: product.name })}
                    >
                      {t("addProduct")}
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Lines List */}
      <div className="space-y-4">
        <h3 className="text-body font-semibold text-foreground">
          {t("selectedItemsHeading")} ({fields.length})
        </h3>

        {fields.length === 0 ? (
          <div className="p-8 text-center rounded-lg border border-dashed border-border bg-surface">
            <p className="text-body text-muted-foreground">{t("emptyItems")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => {
              const product = productMap.get(field.productId);
              const unitPrice = product ? product.unitPrice : 0;
              const unitPriceCents = Math.round(unitPrice * 100);
              const currentItem = watchedItems[index] || {};
              const quantity =
                typeof currentItem.quantity === "number" &&
                !Number.isNaN(currentItem.quantity)
                  ? currentItem.quantity
                  : 0;
              const discount =
                typeof currentItem.discountPercent === "number" &&
                !Number.isNaN(currentItem.discountPercent)
                  ? currentItem.discountPercent
                  : 0;

              const lineTotalCents = Math.round(
                (unitPriceCents * quantity * (100 - discount)) / 100
              );
              const lineTotal = lineTotalCents / 100;

              const itemError = Array.isArray(errors.items)
                ? errors.items[index]
                : undefined;

              const { ref: formQtyRef, ...qtyProps } = register(
                `items.${index}.quantity`,
                { valueAsNumber: true }
              );

              return (
                <div
                  key={field.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border bg-surface"
                >
                  {/* Product Info */}
                  <div className="sm:w-1/3 min-w-0">
                    <p className="text-body font-medium text-foreground truncate">
                      {product?.name ?? field.productId}
                    </p>
                    <p className="text-caption text-muted-foreground font-mono">
                      {product?.sku} ·{" "}
                      {formatCurrency(unitPrice, "USD", locale)}
                    </p>
                    {itemError?.productId?.message && (
                      <p className="text-caption text-destructive font-medium mt-1">
                        {tValidation(
                          itemError.productId.message as Parameters<
                            typeof tValidation
                          >[0]
                        )}
                      </p>
                    )}
                  </div>

                  {/* Quantity & Discount Inputs (Stacks vertically below sm) */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:w-1/3">
                    <div className="flex-1 space-y-1">
                      <label
                        htmlFor={`items-${index}-quantity`}
                        className="block text-caption font-medium text-muted-foreground"
                      >
                        {t("table.quantity")}
                      </label>
                      <Input
                        id={`items-${index}-quantity`}
                        type="number"
                        step="1"
                        min={1}
                        max={999}
                        size="sm"
                        aria-invalid={Boolean(itemError?.quantity)}
                        aria-describedby={
                          itemError?.quantity
                            ? `items-${index}-qty-error`
                            : undefined
                        }
                        ref={(e) => {
                          formQtyRef(e);
                          quantityInputRefs.current[index] = e;
                        }}
                        {...qtyProps}
                      />
                      {itemError?.quantity?.message && (
                        <p
                          id={`items-${index}-qty-error`}
                          className="text-caption text-destructive font-medium"
                        >
                          {tValidation(
                            itemError.quantity.message as Parameters<
                              typeof tValidation
                            >[0]
                          )}
                        </p>
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <label
                        htmlFor={`items-${index}-discount`}
                        className="block text-caption font-medium text-muted-foreground"
                      >
                        {t("table.discount")}
                      </label>
                      <Input
                        id={`items-${index}-discount`}
                        type="number"
                        step="1"
                        min={0}
                        max={50}
                        size="sm"
                        aria-invalid={Boolean(itemError?.discountPercent)}
                        aria-describedby={
                          itemError?.discountPercent
                            ? `items-${index}-disc-error`
                            : undefined
                        }
                        {...register(`items.${index}.discountPercent`, {
                          valueAsNumber: true,
                        })}
                      />
                      {itemError?.discountPercent?.message && (
                        <p
                          id={`items-${index}-disc-error`}
                          className="text-caption text-destructive font-medium"
                        >
                          {tValidation(
                            itemError.discountPercent.message as Parameters<
                              typeof tValidation
                            >[0]
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Line Total & Remove Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:w-1/3">
                    <div className="text-right">
                      <p className="text-caption text-muted-foreground">
                        {t("table.lineTotal")}
                      </p>
                      <p className="font-mono text-body font-semibold text-foreground">
                        {formatCurrency(lineTotal, "USD", locale)}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      aria-label={t("removeAria", {
                        name: product?.name ?? field.productId,
                      })}
                      className="text-destructive hover:bg-destructive-muted/30"
                    >
                      {t("remove")}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
