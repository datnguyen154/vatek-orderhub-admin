/**
 * OrderHub Admin Console — Deterministic Orders Mock Data Fixtures
 *
 * Provides a standardized collection of B2B order fixtures for development,
 * testing, and MSW response interception.
 */

import type {
  OrderDetail,
  OrderStatus,
  TimelineEvent,
} from "@/features/orders/types";

function generateDeterministicTimeline(
  id: string,
  status: OrderStatus,
  createdAt: string
): TimelineEvent[] {
  const baseTime = new Date(createdAt).getTime();
  const timeline: TimelineEvent[] = [
    {
      id: `${id}_evt_0`,
      type: "created",
      at: createdAt,
      actorRole: "system",
    },
  ];

  if (status === "pending") {
    return timeline;
  }

  if (status === "cancelled") {
    timeline.push({
      id: `${id}_evt_1`,
      type: "status_changed",
      at: new Date(baseTime + 2 * 3600 * 1000).toISOString(),
      actorRole: "admin",
      fromStatus: "pending",
      toStatus: "cancelled",
    });
    return timeline;
  }

  timeline.push({
    id: `${id}_evt_1`,
    type: "status_changed",
    at: new Date(baseTime + 3600 * 1000).toISOString(),
    actorRole: "staff",
    fromStatus: "pending",
    toStatus: "processing",
  });

  if (status === "processing") {
    return timeline;
  }

  timeline.push({
    id: `${id}_evt_2`,
    type: "status_changed",
    at: new Date(baseTime + 3 * 3600 * 1000).toISOString(),
    actorRole: "staff",
    fromStatus: "processing",
    toStatus: "shipped",
  });

  if (status === "shipped") {
    return timeline;
  }

  timeline.push({
    id: `${id}_evt_3`,
    type: "status_changed",
    at: new Date(baseTime + 24 * 3600 * 1000).toISOString(),
    actorRole: "staff",
    fromStatus: "shipped",
    toStatus: "delivered",
  });

  return timeline;
}

export const mockOrders: readonly OrderDetail[] = [
  {
    id: "ord_001",
    orderCode: "ORD-2026-001",
    customerName: "Acme Logistics Inc.",
    createdAt: "2026-11-06T10:30:00Z",
    total: 1420.0,
    currency: "USD",
    status: "delivered",
    itemCount: 12,
    poNumber: null,
    invoice: null,
    timeline: generateDeterministicTimeline(
      "ord_001",
      "delivered",
      "2026-11-06T10:30:00Z"
    ),
  },
  {
    id: "ord_002",
    orderCode: "ORD-2026-002",
    customerName: "Nexus Retailers Co.",
    createdAt: "2026-11-06T14:15:00Z",
    total: 540.5,
    currency: "USD",
    status: "pending",
    itemCount: 4,
    poNumber: null,
    invoice: null,
    timeline: generateDeterministicTimeline(
      "ord_002",
      "pending",
      "2026-11-06T14:15:00Z"
    ),
  },
  {
    id: "ord_003",
    orderCode: "ORD-2026-003",
    customerName: "Global Freight Group",
    createdAt: "2026-11-05T08:45:00Z",
    total: 210.0,
    currency: "USD",
    status: "cancelled",
    itemCount: 2,
    poNumber: null,
    invoice: null,
    timeline: generateDeterministicTimeline(
      "ord_003",
      "cancelled",
      "2026-11-05T08:45:00Z"
    ),
  },
  {
    id: "ord_004",
    orderCode: "ORD-2026-004",
    customerName: "Horizon Distribution LLC",
    createdAt: "2026-11-05T16:20:00Z",
    total: 3850.75,
    currency: "USD",
    status: "processing",
    itemCount: 28,
    poNumber: null,
    invoice: null,
    timeline: generateDeterministicTimeline(
      "ord_004",
      "processing",
      "2026-11-05T16:20:00Z"
    ),
  },
  {
    id: "ord_005",
    orderCode: "ORD-2026-005",
    customerName: "Apex Supply Co.",
    createdAt: "2026-11-04T11:00:00Z",
    total: 920.0,
    currency: "USD",
    status: "shipped",
    itemCount: 7,
    poNumber: null,
    invoice: null,
    timeline: generateDeterministicTimeline(
      "ord_005",
      "shipped",
      "2026-11-04T11:00:00Z"
    ),
  },
  {
    id: "ord_006",
    orderCode: "ORD-2026-006",
    customerName: "Metro Cargo Services",
    createdAt: "2026-11-04T13:40:00Z",
    total: 1150.25,
    currency: "USD",
    status: "delivered",
    itemCount: 9,
    poNumber: null,
    invoice: null,
    timeline: generateDeterministicTimeline(
      "ord_006",
      "delivered",
      "2026-11-04T13:40:00Z"
    ),
  },
  {
    id: "ord_007",
    orderCode: "ORD-2026-007",
    customerName: "Stellar Warehousing",
    createdAt: "2026-11-03T15:10:00Z",
    total: 675.0,
    currency: "USD",
    status: "processing",
    itemCount: 5,
    poNumber: null,
    invoice: null,
    timeline: generateDeterministicTimeline(
      "ord_007",
      "processing",
      "2026-11-03T15:10:00Z"
    ),
  },
  {
    id: "ord_008",
    orderCode: "ORD-2026-008",
    customerName: "Pacific Partners Ltd.",
    createdAt: "2026-11-02T09:25:00Z",
    total: 2430.0,
    currency: "USD",
    status: "shipped",
    itemCount: 16,
    poNumber: null,
    invoice: null,
    timeline: generateDeterministicTimeline(
      "ord_008",
      "shipped",
      "2026-11-02T09:25:00Z"
    ),
  },
  {
    id: "ord_009",
    orderCode: "ORD-2026-009",
    customerName: "Summit Logistics",
    createdAt: "2026-11-01T17:05:00Z",
    total: 310.5,
    currency: "USD",
    status: "cancelled",
    itemCount: 1,
    poNumber: null,
    invoice: null,
    timeline: generateDeterministicTimeline(
      "ord_009",
      "cancelled",
      "2026-11-01T17:05:00Z"
    ),
  },
  {
    id: "ord_010",
    orderCode: "ORD-2026-010",
    customerName: "Beacon Trading Corp.",
    createdAt: "2026-10-31T12:00:00Z",
    total: 1890.0,
    currency: "USD",
    status: "delivered",
    itemCount: 14,
    poNumber: null,
    invoice: null,
    timeline: generateDeterministicTimeline(
      "ord_010",
      "delivered",
      "2026-10-31T12:00:00Z"
    ),
  },
];
