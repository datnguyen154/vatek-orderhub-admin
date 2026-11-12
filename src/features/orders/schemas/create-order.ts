/**
 * OrderHub Admin Console — Create Order Schema & Totals Calculation
 *
 * Implements Zod validation rules with localized message keys and
 * deterministic financial calculation in integer cents.
 */

import { z } from "zod";
import type { Product } from "../types";

export const orderItemSchema = z.object({
  productId: z
    .string()
    .min(1, { message: "orders.create.validation.productRequired" }),
  quantity: z
    .number({ message: "orders.create.validation.quantityInteger" })
    .int({ message: "orders.create.validation.quantityInteger" })
    .min(1, { message: "orders.create.validation.quantityMin" })
    .max(999, { message: "orders.create.validation.quantityMax" }),
  discountPercent: z
    .number({ message: "orders.create.validation.discountInteger" })
    .int({ message: "orders.create.validation.discountInteger" })
    .min(0, { message: "orders.create.validation.discountMin" })
    .max(50, { message: "orders.create.validation.discountMax" }),
});

export const customerStepSchema = z.object({
  customerId: z
    .string()
    .min(1, { message: "orders.create.validation.customerRequired" }),
  poNumber: z
    .string()
    .trim()
    .max(40, { message: "orders.create.validation.poNumberMax" })
    .optional()
    .or(z.literal("")),
});

export const itemsStepSchema = z
  .object({
    items: z
      .array(orderItemSchema)
      .min(1, { message: "orders.create.validation.itemsMin" })
      .max(20, { message: "orders.create.validation.itemsMax" }),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();
    data.items.forEach((item, index) => {
      if (!item.productId) return;
      if (seen.has(item.productId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "orders.create.validation.duplicateProduct",
          path: ["items", index, "productId"],
        });
      }
      seen.add(item.productId);
    });
  });

export const createOrderSchema = z
  .object({
    customerId: z
      .string()
      .min(1, { message: "orders.create.validation.customerRequired" }),
    poNumber: z
      .string()
      .trim()
      .max(40, { message: "orders.create.validation.poNumberMax" })
      .optional()
      .or(z.literal("")),
    items: z
      .array(orderItemSchema)
      .min(1, { message: "orders.create.validation.itemsMin" })
      .max(20, { message: "orders.create.validation.itemsMax" }),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();
    data.items.forEach((item, index) => {
      if (!item.productId) return;
      if (seen.has(item.productId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "orders.create.validation.duplicateProduct",
          path: ["items", index, "productId"],
        });
      } else {
        seen.add(item.productId);
      }
    });
  });

export type CreateOrderFormValues = z.infer<typeof createOrderSchema>;
export type OrderItemFormValues = z.infer<typeof orderItemSchema>;

export interface CalculatedLine {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  discountPercent: number;
  lineTotal: number;
}

export interface CalculatedOrderTotals {
  lines: CalculatedLine[];
  subtotal: number;
  discount: number;
  total: number;
}

/**
 * Calculates order totals in integer cents to prevent floating point inaccuracies.
 * Line total = round(unitPriceCents * quantity * (100 - discountPercent) / 100) / 100.
 */
export function calculateOrderTotals(
  items: Array<{
    productId: string;
    quantity: number;
    discountPercent: number;
  }>,
  products: readonly Product[] | Product[]
): CalculatedOrderTotals {
  let subtotalCents = 0;
  let totalCents = 0;

  const productMap = new Map<string, Product>();
  for (const product of products) {
    productMap.set(product.id, product);
  }

  const lines: CalculatedLine[] = items.map((item) => {
    const product = productMap.get(item.productId);
    const unitPrice = product ? product.unitPrice : 0;
    const productName = product ? product.name : item.productId;
    const sku = product ? product.sku : "";

    const unitPriceCents = Math.round(unitPrice * 100);
    const lineGrossCents = unitPriceCents * item.quantity;
    const lineTotalCents = Math.round(
      (unitPriceCents * item.quantity * (100 - item.discountPercent)) / 100
    );

    subtotalCents += lineGrossCents;
    totalCents += lineTotalCents;

    return {
      productId: item.productId,
      productName,
      sku,
      unitPrice,
      quantity: item.quantity,
      discountPercent: item.discountPercent,
      lineTotal: lineTotalCents / 100,
    };
  });

  const discountCents = subtotalCents - totalCents;

  return {
    lines,
    subtotal: subtotalCents / 100,
    discount: discountCents / 100,
    total: totalCents / 100,
  };
}
