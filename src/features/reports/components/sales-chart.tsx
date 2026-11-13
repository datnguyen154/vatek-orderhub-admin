/**
 * OrderHub Admin Console — Sales Chart Component
 *
 * Implements Recharts visualization for daily sales revenue:
 * - Single bar series: daily revenue in USD
 * - Semantic theme variables for all colors (no hex values):
 *   - Bars: rgb(var(--color-chart-bar))
 *   - Grid and axis: rgb(var(--color-border))
 *   - Tick text: rgb(var(--color-muted-foreground))
 *   - Tooltip: custom component with bg-surface, text-foreground, border-border
 * - Accessible name via role="img" and aria-label
 * - Zero hydration warnings (client-mounted guard)
 */

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { DailySalesItem } from "../types";
import { formatCurrency } from "@/features/orders/components/orders-table";

export interface SalesChartProps {
  daily: DailySalesItem[];
  from: string;
  to: string;
  locale: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      date: string;
      revenue: number;
      revenueCents: number;
      totalOrders: number;
      completedOrders: number;
      cancelledOrders: number;
      aovCents: number | null;
    };
  }>;
  locale: string;
}

function CustomTooltip({ active, payload, locale }: CustomTooltipProps) {
  const t = useTranslations("reports.daily");
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;
  const formattedRevenue = formatCurrency(
    item.revenue,
    "USD",
    locale === "vi" ? "vi-VN" : "en-US"
  );

  return (
    <div className="rounded-lg border border-border bg-surface p-3 shadow-md text-foreground text-caption">
      <p className="font-semibold text-foreground mb-1">{item.date}</p>
      <div className="space-y-0.5">
        <p className="text-muted-foreground">
          {t("chart.revenue")}:{" "}
          <span className="font-medium text-foreground">
            {formattedRevenue}
          </span>
        </p>
        <p className="text-muted-foreground">
          {t("table.colTotal")}:{" "}
          <span className="font-medium text-foreground">
            {item.totalOrders}
          </span>
        </p>
        <p className="text-muted-foreground">
          {t("table.colCompleted")}:{" "}
          <span className="font-medium text-foreground">
            {item.completedOrders}
          </span>
        </p>
      </div>
    </div>
  );
}

export function SalesChart({ daily, from, to, locale }: SalesChartProps) {
  const t = useTranslations("reports.daily");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dateLocale = locale === "vi" ? vi : enUS;

  // Format date helper using date-fns at noon to avoid local timezone date shift
  const formatAxisDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const dateAtNoon = new Date(y, m - 1, d, 12, 0, 0);
      return format(dateAtNoon, "dd/MM", { locale: dateLocale });
    } catch {
      return dateStr;
    }
  };

  const chartData = daily.map((d) => ({
    ...d,
    revenue: d.revenueCents / 100,
  }));

  const ariaLabel = t("chart.ariaLabel", { from, to });

  if (!mounted) {
    return (
      <div
        role="img"
        aria-label={ariaLabel}
        className="w-full h-72 sm:h-80 flex items-center justify-center bg-surface rounded-lg border border-border"
      >
        <div className="h-6 w-32 bg-muted animate-pulse rounded motion-reduce:animate-none" />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className="w-full h-72 sm:h-80 rounded-lg border border-border bg-surface p-4"
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
        >
          <CartesianGrid
            stroke="rgb(var(--color-border))"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke="rgb(var(--color-border))"
            tick={{ fill: "rgb(var(--color-muted-foreground))", fontSize: 12 }}
            tickLine={{ stroke: "rgb(var(--color-border))" }}
            tickFormatter={formatAxisDate}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="rgb(var(--color-border))"
            tick={{ fill: "rgb(var(--color-muted-foreground))", fontSize: 12 }}
            tickLine={{ stroke: "rgb(var(--color-border))" }}
            tickFormatter={(val: number) => `$${val}`}
          />
          <Tooltip content={<CustomTooltip locale={locale} />} />
          <Bar
            dataKey="revenue"
            name={t("chart.revenue")}
            fill="rgb(var(--color-chart-bar))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
