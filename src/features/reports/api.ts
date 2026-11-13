/**
 * OrderHub Admin Console — Daily Sales Reports API Client
 */

import { apiClient } from "@/lib/api/client";
import {
  isDailySalesReportResponse,
  type DailySalesReportResponse,
  type GetDailySalesReportOptions,
} from "./types";

/**
 * Fetches daily sales report aggregates from `/api/reports/daily`.
 */
export async function getDailySalesReport(
  options: GetDailySalesReportOptions
): Promise<DailySalesReportResponse> {
  const { from, to, scenario, signal } = options;
  const params = new URLSearchParams();
  params.set("from", from);
  params.set("to", to);

  const headers: Record<string, string> = {};
  if (scenario) {
    headers["x-mock-report"] = scenario;
  }

  const endpoint = `/api/reports/daily?${params.toString()}`;

  return apiClient<DailySalesReportResponse>(endpoint, {
    method: "GET",
    headers,
    signal,
    validate: isDailySalesReportResponse,
  });
}
