/**
 * OrderHub Admin Console — Deterministic Products Mock Data Fixtures
 *
 * Provides a standardized collection of 12 product fixtures for development,
 * testing, and MSW response interception. Prices are in USD with at most 2 decimals.
 */

import type { Product } from "@/features/orders/types";

export const mockProducts: readonly Product[] = [
  {
    id: "prd_001",
    sku: "SKU-PLT-001",
    name: "Heavy Duty Wooden Pallet",
    unitPrice: 45.0,
  },
  {
    id: "prd_002",
    sku: "SKU-CNT-002",
    name: "Standard Steel Cargo Container 20ft",
    unitPrice: 2450.0,
  },
  {
    id: "prd_003",
    sku: "SKU-JCK-003",
    name: "Hydraulic Manual Pallet Jack",
    unitPrice: 380.5,
  },
  {
    id: "prd_004",
    sku: "SKU-STP-004",
    name: "Polypropylene Strapping Band 1000m",
    unitPrice: 28.75,
  },
  {
    id: "prd_005",
    sku: "SKU-WRP-005",
    name: "Industrial Stretch Wrap Film 500m",
    unitPrice: 19.99,
  },
  {
    id: "prd_006",
    sku: "SKU-BOX-006",
    name: "Reinforced Corrugated Box XL",
    unitPrice: 4.5,
  },
  {
    id: "prd_007",
    sku: "SKU-LBL-007",
    name: "Direct Thermal Shipping Labels 1000ct",
    unitPrice: 15.25,
  },
  {
    id: "prd_008",
    sku: "SKU-TAP-008",
    name: "Reinforced Water-Activated Tape 6pk",
    unitPrice: 32.0,
  },
  {
    id: "prd_009",
    sku: "SKU-SCL-009",
    name: "Digital Industrial Platform Scale",
    unitPrice: 145.0,
  },
  {
    id: "prd_010",
    sku: "SKU-SEL-010",
    name: "High-Security Container Bolt Seals 50pk",
    unitPrice: 65.5,
  },
  {
    id: "prd_011",
    sku: "SKU-CNR-011",
    name: "Cardboard Edge Protectors 100pk",
    unitPrice: 22.0,
  },
  {
    id: "prd_012",
    sku: "SKU-SCN-012",
    name: "Wireless Industrial Barcode Scanner",
    unitPrice: 89.9,
  },
] as const;
