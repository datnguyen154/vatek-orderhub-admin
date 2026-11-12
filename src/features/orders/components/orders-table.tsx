/**
 * OrderHub Admin Console — Orders Table Component
 *
 * Renders a semantic, accessible data table displaying customer orders.
 * - Semantic HTML: <table>, <caption>, <thead>, <tbody>, <th scope="col">
 * - Named horizontal scroll region with tabIndex={0} for keyboard accessibility at narrow widths
 * - Consistent formatting via Intl.NumberFormat and Intl.DateTimeFormat with locale awareness
 * - Accessible status badges with readable localized text (never color alone)
 * - Server pagination footer with Previous/Next controls and accessible announcements
 * - Strict adherence to B2B design tokens and 4px spacing scale
 */

"use client";

import { useTranslations, useLocale } from "next-intl";
import { type Order, type OrderStatus, isOptimisticOrder } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface OrdersTableProps {
  orders: Order[];
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isFetching?: boolean;
}

/**
 * Formats a numeric currency value into standardized representation for the active locale.
 */
export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US"
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

/**
 * Formats an ISO 8601 date string into a clean readable date representation for the active locale.
 */
export function formatDate(dateString: string, locale = "en-US"): string {
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return dateString;
    }
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Maps an OrderStatus to the semantic Badge variant.
 */
function getStatusBadgeVariant(
  status: OrderStatus
): "success" | "warning" | "neutral" | "destructive" {
  switch (status) {
    case "delivered":
      return "success";
    case "pending":
      return "warning";
    case "processing":
      return "neutral";
    case "shipped":
      return "neutral";
    case "cancelled":
      return "destructive";
  }
}

export function OrdersTable({
  orders,
  page = 1,
  pageSize = 5,
  total = orders.length,
  totalPages = total > 0 ? Math.ceil(total / pageSize) : 0,
  onPageChange,
  isFetching = false,
}: OrdersTableProps) {
  const t = useTranslations("orders.table");
  const tStatus = useTranslations("orders.status");
  const locale = useLocale();
  const intlLocale = locale === "vi" ? "vi-VN" : "en-US";

  const showingFrom = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const showingTo = total > 0 ? Math.min(page * pageSize, total) : 0;

  return (
    <div className="rounded-lg border border-border bg-surface shadow-sm overflow-hidden">
      {/* Named Horizontal Scroll Region for Mobile & Tablet */}
      <div
        role="region"
        aria-label={t("ariaLabel")}
        tabIndex={0}
        className="overflow-x-auto focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <table className="w-full min-w-full text-left text-body border-collapse">
          <caption className="sr-only">{t("caption")}</caption>
          <thead>
            <tr className="border-b border-border bg-muted/60 text-caption font-medium uppercase tracking-wider text-muted-foreground">
              <th scope="col" className="py-3 px-4 whitespace-nowrap">
                {t("colOrderCode")}
              </th>
              <th scope="col" className="py-3 px-4 whitespace-nowrap">
                {t("colCustomer")}
              </th>
              <th scope="col" className="py-3 px-4 whitespace-nowrap">
                {t("colDate")}
              </th>
              <th
                scope="col"
                className="py-3 px-4 text-right whitespace-nowrap"
              >
                {t("colTotal")}
              </th>
              <th
                scope="col"
                className="py-3 px-4 text-center whitespace-nowrap"
              >
                {t("colStatus")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => {
              const variant = getStatusBadgeVariant(order.status);
              return (
                <tr
                  key={order.id}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-caption font-medium text-foreground whitespace-nowrap">
                    {isOptimisticOrder(order) ? (
                      <Badge variant="warning" size="sm">
                        {t("saving")}
                      </Badge>
                    ) : (
                      order.orderCode
                    )}
                  </td>
                  <td className="py-3 px-4 text-body text-foreground whitespace-nowrap">
                    <div>{order.customerName}</div>
                    <div className="text-caption text-muted-foreground">
                      {order.itemCount}{" "}
                      {order.itemCount === 1
                        ? t("itemSingle")
                        : t("itemMultiple")}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-body text-muted-foreground whitespace-nowrap">
                    {formatDate(order.createdAt, intlLocale)}
                  </td>
                  <td className="py-3 px-4 font-mono text-body font-medium text-foreground text-right whitespace-nowrap">
                    {formatCurrency(order.total, order.currency, intlLocale)}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <Badge variant={variant} size="sm">
                      {tStatus(order.status)}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls Footer */}
      {onPageChange && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border bg-surface">
          <div className="text-body text-muted-foreground">
            {total > 0 ? (
              <>
                {t("showing")}{" "}
                <span className="font-medium text-foreground font-mono">
                  {showingFrom}
                </span>{" "}
                {t("to")}{" "}
                <span className="font-medium text-foreground font-mono">
                  {showingTo}
                </span>{" "}
                {t("of")}{" "}
                <span className="font-medium text-foreground font-mono">
                  {total}
                </span>{" "}
                {t("ordersCount")}
              </>
            ) : (
              t("noOrders")
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || isFetching}
              aria-label={t("prevAria")}
            >
              {t("prev")}
            </Button>

            <span className="text-body text-muted-foreground px-2">
              {t("page")}{" "}
              <span className="font-medium text-foreground font-mono">
                {page}
              </span>{" "}
              {t("pageOf")}{" "}
              <span className="font-medium text-foreground font-mono">
                {Math.max(1, totalPages)}
              </span>
            </span>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || isFetching}
              aria-label={t("nextAria")}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
