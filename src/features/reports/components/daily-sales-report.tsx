/**
 * OrderHub Admin Console — Daily Sales Report Client Island
 *
 * Implements the interactive daily sales reporting experience:
 * - URL-backed date range filter (?from=YYYY-MM-DD&to=YYYY-MM-DD)
 * - Gated TanStack Query hook with background refreshing indicator
 * - 4 responsive KPI tiles (stacked at 375px, 2 col at sm, 4 col at lg)
 * - Single Recharts bar series (daily revenue)
 * - Horizontal scrolling data table as accessible text alternative
 * - Browser-based CSV export gated by reports:export permission
 * - Loading, error with retry, and empty state representations
 */

"use client";

import { useState, useEffect, useTransition, useId } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { hasPermission, type Role } from "@/features/auth/types";
import { formatCurrency } from "@/features/orders/components/orders-table";
import { useDailySalesReport } from "../hooks/use-daily-sales-report";
import { SalesChart } from "./sales-chart";
import type { DailySalesItem } from "../types";

export interface DailySalesReportProps {
  role: Role;
}

export function getUtcTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function parseYmdToUtc(dateStr: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return null;
  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const d = parseInt(match[3], 10);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null;
  }
  return dt.getTime();
}

export function addDaysToYmd(dateStr: string, days: number): string {
  const ts = parseYmdToUtc(dateStr);
  if (ts === null) return dateStr;
  const dt = new Date(ts + days * 86400000);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function validateRange(
  from: string,
  to: string
): {
  isValid: boolean;
  error?: "invalid_format" | "from_after_to" | "range_too_long";
} {
  const fromTs = parseYmdToUtc(from);
  const toTs = parseYmdToUtc(to);
  if (fromTs === null || toTs === null) {
    return { isValid: false, error: "invalid_format" };
  }
  if (fromTs > toTs) {
    return { isValid: false, error: "from_after_to" };
  }
  const days = Math.round((toTs - fromTs) / 86400000) + 1;
  if (days > 92) {
    return { isValid: false, error: "range_too_long" };
  }
  return { isValid: true };
}

/**
 * Escapes CSV field per RFC 4180 rules.
 */
export function escapeCsvField(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (
    str.includes(",") ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Builds RFC-compliant CSV content from daily records with CRLF line endings.
 */
export function buildSalesCsv(daily: DailySalesItem[]): string {
  const header =
    "Date,Total Orders,Completed Orders,Cancelled Orders,Revenue (USD),Average Order Value (USD)";
  const rows = daily.map((d) => {
    const rev = (d.revenueCents / 100).toFixed(2);
    const aov = d.aovCents !== null ? (d.aovCents / 100).toFixed(2) : "0.00";
    return [
      escapeCsvField(d.date),
      escapeCsvField(d.totalOrders),
      escapeCsvField(d.completedOrders),
      escapeCsvField(d.cancelledOrders),
      escapeCsvField(rev),
      escapeCsvField(aov),
    ].join(",");
  });

  return [header, ...rows].join("\r\n") + "\r\n";
}

export function DailySalesReport({ role }: DailySalesReportProps) {
  const t = useTranslations("reports.daily");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const fromId = useId();
  const toId = useId();

  // Compute default range: 14 days ending today (UTC)
  const todayUtc = getUtcTodayString();
  const defaultTo = todayUtc;
  const defaultFrom = addDaysToYmd(defaultTo, -13);

  const urlFrom = searchParams.get("from");
  const urlTo = searchParams.get("to");
  const scenario = searchParams.get("scenario") ?? undefined;

  const activeFrom = urlFrom ?? defaultFrom;
  const activeTo = urlTo ?? defaultTo;

  // Local state for inputs
  const [inputFrom, setInputFrom] = useState(activeFrom);
  const [inputTo, setInputTo] = useState(activeTo);
  const [isExporting, setIsExporting] = useState(false);

  // Sync inputs with URL on Back/Forward navigation or direct query change
  useEffect(() => {
    setInputFrom(activeFrom);
    setInputTo(activeTo);
  }, [activeFrom, activeTo]);

  // Validate active range from URL
  const activeValidation = validateRange(activeFrom, activeTo);
  // Validate current input values
  const inputValidation = validateRange(inputFrom, inputTo);

  // Fetch report data
  const { data, isLoading, isFetching, isError, refetch } = useDailySalesReport(
    {
      from: activeFrom,
      to: activeTo,
      scenario,
      isValidRange: activeValidation.isValid,
    }
  );

  const canExport = hasPermission(role, "reports:export");

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValidation.isValid) {
      // Keep inputs, keep button usable, dispatch 0 requests
      return;
    }

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("from", inputFrom);
      params.set("to", inputTo);
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleExportCsv = () => {
    if (!data?.daily || data.daily.length === 0) return;
    setIsExporting(true);

    try {
      const csvContent = buildSalesCsv(data.daily);
      const fromDate = data.range.from;
      const toDate = data.range.to;
      const filename = `daily-sales_${fromDate}_${toDate}.csv`;
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const dateLocale = locale === "vi" ? vi : enUS;

  const formatReportDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const dateAtNoon = new Date(y, m - 1, d, 12, 0, 0);
      const pattern = locale === "vi" ? "EEE, dd/MM/yyyy" : "EEE, MMM d, yyyy";
      return format(dateAtNoon, pattern, { locale: dateLocale });
    } catch {
      return dateStr;
    }
  };

  const intlLocale = locale === "vi" ? "vi-VN" : "en-US";
  const summary = data?.summary;
  const daily = data?.daily ?? [];
  const isEmpty = summary ? summary.totalOrders === 0 : false;
  const isExportDisabled =
    isLoading ||
    isFetching ||
    isError ||
    !data ||
    daily.length === 0 ||
    isEmpty;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-caption font-medium bg-primary-muted text-primary-muted-foreground mb-1">
            {t("badge")}
          </div>
          <h1 className="text-page-title font-semibold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="text-body text-muted-foreground mt-1">
            {t("description")}
          </p>
        </div>

        {/* Action Toolbar: Date Range Filters & Export CSV */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <form
            onSubmit={handleApply}
            className="flex flex-wrap items-center gap-2"
          >
            <div className="flex items-center gap-1.5">
              <label
                htmlFor={fromId}
                className="text-caption font-medium text-foreground whitespace-nowrap"
              >
                {t("filters.fromLabel")}
              </label>
              <Input
                id={fromId}
                type="date"
                value={inputFrom}
                onChange={(e) => setInputFrom(e.target.value)}
                className="w-36 text-caption py-1.5 px-2"
                aria-invalid={!inputValidation.isValid}
              />
            </div>

            <div className="flex items-center gap-1.5">
              <label
                htmlFor={toId}
                className="text-caption font-medium text-foreground whitespace-nowrap"
              >
                {t("filters.toLabel")}
              </label>
              <Input
                id={toId}
                type="date"
                value={inputTo}
                onChange={(e) => setInputTo(e.target.value)}
                className="w-36 text-caption py-1.5 px-2"
                aria-invalid={!inputValidation.isValid}
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="sm"
              disabled={isFetching}
            >
              {isFetching ? t("filters.applying") : t("filters.apply")}
            </Button>
          </form>

          {/* Export CSV Button (Admin only) */}
          {canExport && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleExportCsv}
              disabled={isExportDisabled || isExporting}
              className="gap-2 shrink-0"
            >
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>{isExporting ? t("exporting") : t("exportCsv")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Inline range validation error alert */}
      {(!inputValidation.isValid || !activeValidation.isValid) && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive-muted text-destructive-muted-foreground p-3 text-caption"
        >
          {t("filters.invalidRange")}
        </div>
      )}

      {/* Refreshing subtle status indicator */}
      {isFetching && !isLoading && (
        <div
          role="status"
          aria-live="polite"
          className="text-caption text-muted-foreground flex items-center gap-2"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span>{t("refreshing")}</span>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-destructive/20 bg-destructive-muted text-destructive-muted-foreground p-6 space-y-3"
        >
          <h2 className="text-section-title font-semibold text-destructive">
            {t("errorTitle")}
          </h2>
          <p className="text-body text-destructive-muted-foreground">
            {t("errorDescription")}
          </p>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={refetch}
          >
            {t("retry")}
          </Button>
        </div>
      )}

      {/* KPI Tiles: Responsive 1 col at 375px, 2 col at sm, 4 col at lg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card variant="default">
          <CardHeader className="pb-2">
            <CardTitle className="text-caption font-medium text-muted-foreground">
              {t("kpis.totalRevenue")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-28 bg-muted animate-pulse rounded motion-reduce:animate-none" />
            ) : (
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {summary
                  ? formatCurrency(
                      summary.revenueCents / 100,
                      "USD",
                      intlLocale
                    )
                  : "$0.00"}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card variant="default">
          <CardHeader className="pb-2">
            <CardTitle className="text-caption font-medium text-muted-foreground">
              {t("kpis.totalOrders")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-20 bg-muted animate-pulse rounded motion-reduce:animate-none" />
            ) : (
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {summary
                  ? new Intl.NumberFormat(intlLocale).format(
                      summary.totalOrders
                    )
                  : "0"}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card variant="default">
          <CardHeader className="pb-2">
            <CardTitle className="text-caption font-medium text-muted-foreground">
              {t("kpis.aov")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded motion-reduce:animate-none" />
            ) : (
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {summary?.aovCents !== null && summary?.aovCents !== undefined
                  ? formatCurrency(summary.aovCents / 100, "USD", intlLocale)
                  : "—"}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cancellation Rate */}
        <Card variant="default">
          <CardHeader className="pb-2">
            <CardTitle className="text-caption font-medium text-muted-foreground">
              {t("kpis.cancellationRate")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded motion-reduce:animate-none" />
            ) : (
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {summary?.cancellationRate !== null &&
                summary?.cancellationRate !== undefined
                  ? `${(summary.cancellationRate * 100).toFixed(1)}%`
                  : "—"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area: Chart & Table or Empty State */}
      {isLoading ? (
        <div
          role="status"
          aria-busy="true"
          aria-live="polite"
          className="space-y-6"
        >
          <span className="sr-only">{t("loading")}</span>
          <div className="h-72 sm:h-80 w-full rounded-lg border border-border bg-surface p-4 flex items-center justify-center">
            <div className="h-8 w-40 bg-muted animate-pulse rounded motion-reduce:animate-none" />
          </div>
          <div className="h-48 w-full rounded-lg border border-border bg-surface p-4">
            <div className="space-y-3">
              <div className="h-5 w-32 bg-muted animate-pulse rounded motion-reduce:animate-none" />
              <div className="h-8 w-full bg-muted/60 animate-pulse rounded motion-reduce:animate-none" />
              <div className="h-8 w-full bg-muted/40 animate-pulse rounded motion-reduce:animate-none" />
            </div>
          </div>
        </div>
      ) : isEmpty ? (
        <Card variant="default" className="text-center py-12">
          <CardHeader>
            <CardTitle className="text-section-title font-semibold text-foreground">
              {t("empty.title")}
            </CardTitle>
            <p className="text-body text-muted-foreground mt-2 max-w-md mx-auto">
              {t("empty.description")}
            </p>
          </CardHeader>
        </Card>
      ) : !isError && data ? (
        <div className="space-y-6">
          {/* Recharts Bar Visualization */}
          <SalesChart
            daily={daily}
            from={activeFrom}
            to={activeTo}
            locale={locale}
          />

          {/* Daily Breakdown Table (Text Alternative) */}
          <div className="rounded-lg border border-border bg-surface shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-section-title font-semibold text-foreground">
                {t("table.title")}
              </h2>
            </div>
            {/* Horizontal scroll region inside container */}
            <div
              role="region"
              aria-label={t("table.ariaLabel")}
              tabIndex={0}
              className="overflow-x-auto focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <table className="w-full min-w-full text-left text-body border-collapse">
                <caption className="sr-only">{t("table.caption")}</caption>
                <thead>
                  <tr className="border-b border-border bg-muted/60 text-caption font-medium uppercase tracking-wider text-muted-foreground">
                    <th scope="col" className="py-3 px-4 whitespace-nowrap">
                      {t("table.colDate")}
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-4 whitespace-nowrap text-right"
                    >
                      {t("table.colTotal")}
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-4 whitespace-nowrap text-right"
                    >
                      {t("table.colCompleted")}
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-4 whitespace-nowrap text-right"
                    >
                      {t("table.colCancelled")}
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-4 whitespace-nowrap text-right"
                    >
                      {t("table.colRevenue")}
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-4 whitespace-nowrap text-right"
                    >
                      {t("table.colAov")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {daily.map((day) => (
                    <tr
                      key={day.date}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-foreground">
                        {formatReportDate(day.date)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right text-muted-foreground">
                        {day.totalOrders}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right text-muted-foreground">
                        {day.completedOrders}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right text-muted-foreground">
                        {day.cancelledOrders}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right font-medium text-foreground">
                        {formatCurrency(
                          day.revenueCents / 100,
                          "USD",
                          intlLocale
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right text-muted-foreground">
                        {day.aovCents !== null
                          ? formatCurrency(
                              day.aovCents / 100,
                              "USD",
                              intlLocale
                            )
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
