/**
 * OrderHub Admin Console — Daily Sales Report Types & Contracts
 *
 * Implements the approved contract for Session 16 / step-18:
 * - Date format: YYYY-MM-DD (UTC calendar date)
 * - Currency: USD, with revenue and AOV stored as integer US cents
 * - Summary: Aggregates recomputed from summed daily values (never averaged)
 */

export interface DailySalesItem {
  date: string; // YYYY-MM-DD
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  revenueCents: number;
  aovCents: number | null;
}

export interface DailySalesSummary {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  revenueCents: number;
  aovCents: number | null;
  cancellationRate: number | null;
}

export interface DailySalesRange {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}

export interface DailySalesResponseData {
  range: DailySalesRange;
  currency: string;
  summary: DailySalesSummary;
  daily: DailySalesItem[];
}

export interface DailySalesReportResponse {
  data: DailySalesResponseData;
}

export interface GetDailySalesReportOptions {
  from: string;
  to: string;
  scenario?: string;
  signal?: AbortSignal;
}

/**
 * Type guard for DailySalesItem runtime validation.
 */
export function isDailySalesItem(value: unknown): value is DailySalesItem {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.date === "string" &&
    typeof r.totalOrders === "number" &&
    typeof r.completedOrders === "number" &&
    typeof r.cancelledOrders === "number" &&
    typeof r.revenueCents === "number" &&
    (r.aovCents === null || typeof r.aovCents === "number")
  );
}

/**
 * Type guard for DailySalesSummary runtime validation.
 */
export function isDailySalesSummary(
  value: unknown
): value is DailySalesSummary {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.totalOrders === "number" &&
    typeof r.completedOrders === "number" &&
    typeof r.cancelledOrders === "number" &&
    typeof r.revenueCents === "number" &&
    (r.aovCents === null || typeof r.aovCents === "number") &&
    (r.cancellationRate === null || typeof r.cancellationRate === "number")
  );
}

/**
 * Type guard for DailySalesRange runtime validation.
 */
export function isDailySalesRange(value: unknown): value is DailySalesRange {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return typeof r.from === "string" && typeof r.to === "string";
}

/**
 * Type guard for DailySalesResponseData runtime validation.
 */
export function isDailySalesResponseData(
  value: unknown
): value is DailySalesResponseData {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    isDailySalesRange(r.range) &&
    typeof r.currency === "string" &&
    isDailySalesSummary(r.summary) &&
    Array.isArray(r.daily) &&
    r.daily.every(isDailySalesItem)
  );
}

/**
 * Type guard for DailySalesReportResponse runtime validation.
 */
export function isDailySalesReportResponse(
  value: unknown
): value is DailySalesReportResponse {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return isDailySalesResponseData(r.data);
}
