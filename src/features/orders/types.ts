/**
 * OrderHub Admin Console — Orders Type Definitions & Runtime Type Guards
 *
 * Explicit TypeScript contracts for Order entities, catalog entities, and API responses.
 * Runtime type guards validate `unknown` JSON data without relying on unsafe type assertions.
 */

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export const ORDER_STATUSES: readonly OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  createdAt: string;
  total: number;
  currency: string;
  status: OrderStatus;
  itemCount: number;
}

export interface OrdersResponse {
  data: Order[];
  total: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface OrdersFilterParams {
  page?: number;
  pageSize?: number;
  status?: OrderStatus | "";
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
}

export interface CustomersResponse {
  data: Customer[];
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  unitPrice: number;
}

export interface ProductsResponse {
  data: Product[];
}

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
  discountPercent: number;
}

export interface CreateOrderInput {
  idempotencyKey: string;
  customerId: string;
  poNumber?: string;
  items: CreateOrderItemInput[];
}

export interface CreateOrderResponse {
  data: Order;
}

/**
 * Returns true if the order is an optimistic local insertion (starts with "tmp_").
 */
export function isOptimisticOrder(order: Order): boolean {
  return order.id.startsWith("tmp_");
}

/**
 * Type guard to check if a value is a valid OrderStatus string.
 */
export function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" && ORDER_STATUSES.includes(value as OrderStatus)
  );
}

/**
 * Type guard to validate an unknown value as an Order object.
 */
export function isOrder(value: unknown): value is Order {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  if (
    typeof record.id !== "string" ||
    record.id.trim() === "" ||
    typeof record.orderCode !== "string" ||
    record.orderCode.trim() === "" ||
    typeof record.customerName !== "string" ||
    record.customerName.trim() === "" ||
    typeof record.createdAt !== "string" ||
    Number.isNaN(Date.parse(record.createdAt)) ||
    typeof record.total !== "number" ||
    Number.isNaN(record.total) ||
    typeof record.currency !== "string" ||
    record.currency.trim() === "" ||
    !isOrderStatus(record.status) ||
    typeof record.itemCount !== "number" ||
    Number.isNaN(record.itemCount)
  ) {
    return false;
  }

  return true;
}

/**
 * Type guard to validate an unknown value as an OrdersResponse object.
 */
export function isOrdersResponse(value: unknown): value is OrdersResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  if (
    !Array.isArray(record.data) ||
    typeof record.total !== "number" ||
    Number.isNaN(record.total)
  ) {
    return false;
  }

  if (
    record.page !== undefined &&
    (typeof record.page !== "number" ||
      Number.isNaN(record.page) ||
      record.page < 1)
  ) {
    return false;
  }

  if (
    record.pageSize !== undefined &&
    (typeof record.pageSize !== "number" ||
      Number.isNaN(record.pageSize) ||
      record.pageSize < 1)
  ) {
    return false;
  }

  if (
    record.totalPages !== undefined &&
    (typeof record.totalPages !== "number" ||
      Number.isNaN(record.totalPages) ||
      record.totalPages < 0)
  ) {
    return false;
  }

  return record.data.every((item) => isOrder(item));
}

/**
 * Type guard to validate an unknown value as a Customer object.
 */
export function isCustomer(value: unknown): value is Customer {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    record.id.trim() !== "" &&
    typeof record.name === "string" &&
    record.name.trim() !== "" &&
    typeof record.email === "string" &&
    record.email.trim() !== ""
  );
}

/**
 * Type guard to validate an unknown value as a CustomersResponse object.
 */
export function isCustomersResponse(
  value: unknown
): value is CustomersResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return Array.isArray(record.data) && record.data.every((c) => isCustomer(c));
}

/**
 * Type guard to validate an unknown value as a Product object.
 */
export function isProduct(value: unknown): value is Product {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    record.id.trim() !== "" &&
    typeof record.sku === "string" &&
    record.sku.trim() !== "" &&
    typeof record.name === "string" &&
    record.name.trim() !== "" &&
    typeof record.unitPrice === "number" &&
    !Number.isNaN(record.unitPrice)
  );
}

/**
 * Type guard to validate an unknown value as a ProductsResponse object.
 */
export function isProductsResponse(value: unknown): value is ProductsResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return Array.isArray(record.data) && record.data.every((p) => isProduct(p));
}

/**
 * Type guard to validate an unknown value as a CreateOrderResponse object.
 */
export function isCreateOrderResponse(
  value: unknown
): value is CreateOrderResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return isOrder(record.data);
}
