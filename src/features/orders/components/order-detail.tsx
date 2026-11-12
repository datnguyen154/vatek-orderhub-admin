/**
 * OrderHub Admin Console — Order Detail Component
 *
 * Implements full order detail view:
 * - Fetches order detail data using TanStack Query via useOrderDetail.
 * - Handles loading, not_found, and error states with localized messages.
 * - Localized "← Back to orders" navigation link.
 * - Displays order summary, status control, invoice upload, and audit timeline.
 * - Responsive layout: single column on mobile, two columns at lg.
 */

"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import type { Role } from "@/features/auth/types";
import type { OrderStatus } from "../types";
import { useOrderDetail } from "../hooks/use-order-detail";
import { formatCurrency, formatDate } from "./orders-table";
import { OrderStatusControl } from "./order-status-control";
import { InvoiceUpload } from "./invoice-upload";
import { OrderTimeline } from "./order-timeline";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export interface OrderDetailProps {
  orderId: string;
  role: Role;
}

function getStatusBadgeVariant(
  status: OrderStatus
): "success" | "warning" | "neutral" | "destructive" {
  switch (status) {
    case "delivered":
      return "success";
    case "pending":
      return "warning";
    case "processing":
    case "shipped":
      return "neutral";
    case "cancelled":
      return "destructive";
  }
}

export function OrderDetail({ orderId, role }: OrderDetailProps) {
  const t = useTranslations("orders.detail");
  const tStatus = useTranslations("orders.status");
  const locale = useLocale();

  const { order, isLoading, isError, isNotFound, refetch } =
    useOrderDetail(orderId);

  return (
    <div className="space-y-6">
      {/* Top back navigation link */}
      <div>
        <Link
          href="/orders"
          className={`${buttonVariants({ variant: "ghost", size: "sm" })} gap-1.5 -ml-3 mb-2 text-muted-foreground hover:text-foreground inline-flex items-center`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          {t("backToOrders")}
        </Link>
      </div>

      {/* Loading state */}
      {isLoading && (
        <Card variant="default">
          <CardContent className="py-12 text-center">
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              {t("loading")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Not Found state */}
      {isNotFound && (
        <Card variant="default">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              {t("notFoundTitle")}
            </CardTitle>
            <CardDescription>{t("notFoundDescription")}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link
              href="/orders"
              className={buttonVariants({ variant: "secondary", size: "md" })}
            >
              {t("backToOrders")}
            </Link>
          </CardFooter>
        </Card>
      )}

      {/* General Error state */}
      {isError && !isNotFound && (
        <Card variant="default">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-destructive">
              {t("errorTitle")}
            </CardTitle>
            <CardDescription>{t("errorDescription")}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => refetch()}
            >
              {t("retry")}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Success Loaded view */}
      {order && (
        <div className="space-y-6">
          {/* Main header block */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
                  {order.orderCode}
                </h1>
                <Badge variant={getStatusBadgeVariant(order.status)} size="md">
                  {tStatus(order.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {order.customerName}
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider block">
                  {t("summary.total")}
                </span>
                <span className="text-lg font-bold text-foreground">
                  {formatCurrency(order.total, order.currency, locale)}
                </span>
              </div>
            </div>
          </div>

          {/* 2-column layout at lg */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left column: Summary Card + Status Control + Invoice Upload */}
            <div className="space-y-6">
              <Card variant="default">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    {t("summary.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("summary.orderCode")}
                      </dt>
                      <dd className="font-mono font-medium text-foreground mt-0.5">
                        {order.orderCode}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("summary.customer")}
                      </dt>
                      <dd className="text-foreground mt-0.5">
                        {order.customerName}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("summary.createdAt")}
                      </dt>
                      <dd className="text-foreground mt-0.5">
                        {formatDate(order.createdAt, locale)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("summary.itemCount")}
                      </dt>
                      <dd className="text-foreground mt-0.5">
                        {order.itemCount}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("summary.poNumber")}
                      </dt>
                      <dd className="text-foreground mt-0.5">
                        {order.poNumber || t("summary.noPo")}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t("summary.total")}
                      </dt>
                      <dd className="font-semibold text-foreground mt-0.5">
                        {formatCurrency(order.total, order.currency, locale)}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <OrderStatusControl order={order} role={role} />

              <InvoiceUpload order={order} role={role} />
            </div>

            {/* Right column: Timeline Card */}
            <div>
              <OrderTimeline timeline={order.timeline} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
