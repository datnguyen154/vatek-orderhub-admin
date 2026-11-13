/**
 * OrderHub Admin Console — Daily Sales Mock Fixtures
 *
 * Deterministic daily sales aggregates spanning 2026-09-01 through 2026-12-31 (122 calendar days).
 *
 * Requirements:
 * - Contractually independent of in-memory orders store (mutations in app do not alter report aggregates).
 * - Fixed mathematical formula over day index: strictly deterministic, no Math.random, no Date.now.
 * - Explicit edge cases:
 *   - Zero-order days: 2026-09-15, 2026-10-15, 2026-11-05, 2026-12-25 (total = 0, cancelled = 0, revenue = 0).
 *   - Cancelled-only days: 2026-09-20, 2026-10-20, 2026-11-20 (total > 0, cancelled = total, revenue = 0).
 */

export interface DailySalesRecord {
  date: string;
  totalOrders: number;
  cancelledOrders: number;
  revenueCents: number;
}

// Known edge-case date mappings for deterministic testing
export const ZERO_ORDER_DATES = [
  "2026-09-15",
  "2026-10-15",
  "2026-11-05",
  "2026-12-25",
] as const;

export const ONLY_CANCELLED_ORDER_DATES = [
  "2026-09-20",
  "2026-10-20",
  "2026-11-20",
] as const;

const zeroOrderSet = new Set<string>(ZERO_ORDER_DATES);
const onlyCancelledMap = new Map<string, number>([
  ["2026-09-20", 3],
  ["2026-10-20", 4],
  ["2026-11-20", 2],
]);

/**
 * Generates deterministic daily sales dataset for 2026-09-01 through 2026-12-31.
 */
function generateDeterministicSalesData(): Map<string, DailySalesRecord> {
  const map = new Map<string, DailySalesRecord>();

  // Start: 2026-09-01 (UTC midnight)
  const startTs = Date.UTC(2026, 8, 1);
  // End: 2026-12-31 (UTC midnight)
  const endTs = Date.UTC(2026, 11, 31);
  const dayMs = 86400000;

  const totalDays = Math.round((endTs - startTs) / dayMs) + 1; // 122 days

  for (let i = 0; i < totalDays; i++) {
    const currentTs = startTs + i * dayMs;
    const d = new Date(currentTs);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    if (zeroOrderSet.has(dateStr)) {
      map.set(dateStr, {
        date: dateStr,
        totalOrders: 0,
        cancelledOrders: 0,
        revenueCents: 0,
      });
      continue;
    }

    if (onlyCancelledMap.has(dateStr)) {
      const count = onlyCancelledMap.get(dateStr)!;
      map.set(dateStr, {
        date: dateStr,
        totalOrders: count,
        cancelledOrders: count,
        revenueCents: 0,
      });
      continue;
    }

    // Deterministic formula over day index i:
    // Total orders: 8 to 22 orders
    const totalOrders = 8 + ((i * 7 + 3) % 15);
    // Cancelled orders: 0 to 2
    const cancelledOrders = i % 5 === 0 ? 2 : i % 3 === 0 ? 1 : 0;
    const completedOrders = totalOrders - cancelledOrders;

    // Average order value between $45.00 and $84.99 (in cents)
    const avgOrderCents = 4500 + ((i * 131) % 4000);
    const revenueCents = completedOrders * avgOrderCents;

    map.set(dateStr, {
      date: dateStr,
      totalOrders,
      cancelledOrders,
      revenueCents,
    });
  }

  return map;
}

export const mockSalesData: Map<string, DailySalesRecord> =
  generateDeterministicSalesData();
