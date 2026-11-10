/**
 * OrderHub Admin Console — Orders Table Component
 *
 * Renders a semantic, accessible data table displaying customer orders.
 * - Semantic HTML: <table>, <caption>, <thead>, <tbody>, <th scope="col">
 * - Named horizontal scroll region with tabIndex={0} for keyboard accessibility at narrow widths
 * - Consistent formatting via Intl.NumberFormat and Intl.DateTimeFormat
 * - Accessible status badges with readable text (never color alone)
 * - Server pagination footer with Previous/Next controls and accessible announcements
 * - Strict adherence to B2B design tokens and 4px spacing scale
 */

import type { Order, OrderStatus } from "../types";
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

export function OrdersTable({
  orders,
  page = 1,
  pageSize = 5,
  total = orders.length,
  totalPages = total > 0 ? Math.ceil(total / pageSize) : 0,
  onPageChange,
  isFetching = false,
}: OrdersTableProps) {
  const showingFrom = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const showingTo = total > 0 ? Math.min(page * pageSize, total) : 0;

  return (
    <div className="rounded-lg border border-border bg-surface shadow-sm overflow-hidden">
      {/* Named Horizontal Scroll Region for Mobile & Tablet */}
      <div
        role="region"
        aria-label="Orders Data Table"
        tabIndex={0}
        className="overflow-x-auto focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:outline-none"
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
              <th
                scope="col"
                className="py-3 px-4 text-right whitespace-nowrap"
              >
                Total
              </th>
              <th
                scope="col"
                className="py-3 px-4 text-center whitespace-nowrap"
              >
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
                      {order.itemCount}{" "}
                      {order.itemCount === 1 ? "item" : "items"}
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

      {/* Pagination Controls Footer */}
      {onPageChange && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border bg-surface">
          <div className="text-body text-muted-foreground">
            {total > 0 ? (
              <>
                Showing{" "}
                <span className="font-medium text-foreground font-mono">
                  {showingFrom}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground font-mono">
                  {showingTo}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground font-mono">
                  {total}
                </span>{" "}
                orders
              </>
            ) : (
              "No orders to display"
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || isFetching}
              aria-label="Go to previous page"
            >
              Previous
            </Button>

            <span className="text-body text-muted-foreground px-2">
              Page{" "}
              <span className="font-medium text-foreground font-mono">
                {page}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground font-mono">
                {Math.max(1, totalPages)}
              </span>
            </span>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || isFetching}
              aria-label="Go to next page"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
