/**
 * OrderHub Admin Console — Orders Table Component
 *
 * Renders a semantic, accessible data table displaying customer orders.
 * - Semantic HTML: <table>, <caption>, <thead>, <tbody>, <th scope="col">, <td scope="row">
 * - Named horizontal scroll region with tabIndex={0} for keyboard accessibility at narrow widths
 * - Consistent formatting via Intl.NumberFormat and Intl.DateTimeFormat
 * - Accessible status badges with readable text (never color alone)
 * - Strict adherence to B2B design tokens and 4px spacing scale
 */

import type { Order, OrderStatus } from "../types";
import { Badge } from "@/components/ui/badge";

export interface OrdersTableProps {
  orders: Order[];
}

/**
 * Formats a numeric currency value into standardized USD representation.
 */
export function formatCurrency(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

/**
 * Formats an ISO 8601 date string into a clean readable date representation.
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return dateString;
    }
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Maps an OrderStatus to the semantic Badge variant and human-readable label.
 */
function getStatusBadgeConfig(status: OrderStatus): {
  variant: "success" | "warning" | "neutral" | "destructive";
  label: string;
} {
  switch (status) {
    case "delivered":
      return { variant: "success", label: "Delivered" };
    case "pending":
      return { variant: "warning", label: "Pending" };
    case "processing":
      return { variant: "neutral", label: "Processing" };
    case "shipped":
      return { variant: "neutral", label: "Shipped" };
    case "cancelled":
      return { variant: "destructive", label: "Cancelled" };
  }
}

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <div
      role="region"
      aria-label="Orders Data Table"
      tabIndex={0}
      className="overflow-x-auto rounded-lg border border-border bg-surface focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <table className="w-full min-w-full text-left text-body border-collapse">
        <caption className="sr-only">
          Customer Orders Management Table showing order code, customer, date,
          total, and fulfillment status.
        </caption>
        <thead>
          <tr className="border-b border-border bg-muted/60 text-caption font-medium uppercase tracking-wider text-muted-foreground">
            <th scope="col" className="py-3 px-4 whitespace-nowrap">
              Order Code
            </th>
            <th scope="col" className="py-3 px-4 whitespace-nowrap">
              Customer
            </th>
            <th scope="col" className="py-3 px-4 whitespace-nowrap">
              Date
            </th>
            <th scope="col" className="py-3 px-4 text-right whitespace-nowrap">
              Total
            </th>
            <th scope="col" className="py-3 px-4 text-center whitespace-nowrap">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((order) => {
            const badge = getStatusBadgeConfig(order.status);
            return (
              <tr
                key={order.id}
                className="hover:bg-muted/40 transition-colors"
              >
                <td className="py-3 px-4 font-mono text-caption font-medium text-foreground whitespace-nowrap">
                  {order.orderCode}
                </td>
                <td className="py-3 px-4 text-body text-foreground whitespace-nowrap">
                  <div>{order.customerName}</div>
                  <div className="text-caption text-muted-foreground">
                    {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                  </div>
                </td>
                <td className="py-3 px-4 text-body text-muted-foreground whitespace-nowrap">
                  {formatDate(order.createdAt)}
                </td>
                <td className="py-3 px-4 font-mono text-body font-medium text-foreground text-right whitespace-nowrap">
                  {formatCurrency(order.total, order.currency)}
                </td>
                <td className="py-3 px-4 text-center whitespace-nowrap">
                  <Badge variant={badge.variant} size="sm">
                    {badge.label}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
