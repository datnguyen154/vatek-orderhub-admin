/**
 * OrderHub Admin Console — Deterministic Customers Mock Data Fixtures
 *
 * Provides a standardized collection of 6 customer fixtures for development,
 * testing, and MSW response interception, reusing names from mockOrders.
 */

import type { Customer } from "@/features/orders/types";

export const mockCustomers: readonly Customer[] = [
  {
    id: "cus_001",
    name: "Acme Logistics Inc.",
    email: "billing@acmelogistics.example",
  },
  {
    id: "cus_002",
    name: "Nexus Retailers Co.",
    email: "orders@nexusretailers.example",
  },
  {
    id: "cus_003",
    name: "Global Freight Group",
    email: "procurement@globalfreight.example",
  },
  {
    id: "cus_004",
    name: "Horizon Distribution LLC",
    email: "ops@horizondist.example",
  },
  {
    id: "cus_005",
    name: "Apex Supply Co.",
    email: "accounts@apexsupply.example",
  },
  {
    id: "cus_006",
    name: "Metro Cargo Services",
    email: "dispatch@metrocargo.example",
  },
] as const;
