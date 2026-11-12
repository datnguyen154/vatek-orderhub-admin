/**
 * OrderHub Admin Console — useCreateOrder Hook
 *
 * TanStack Query mutation for creating an order with:
 * - Hook-level callbacks (onMutate, onError, onSuccess) that run even after wizard unmounts
 * - Optimistic insertion into page-1 matching query caches
 * - Exact rollback on simulated or real errors without invalidation
 * - In-memory draft persistence for "Review and retry" (/orders/new?resume=1)
 * - Sonner toast notifications with action buttons and keyboard accessibility
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createOrder } from "../api";
import {
  calculateOrderTotals,
  type CreateOrderFormValues,
} from "../schemas/create-order";
import type {
  Order,
  OrdersResponse,
  ProductsResponse,
  CustomersResponse,
  CreateOrderItemInput,
} from "../types";
import { HttpError } from "@/lib/api/client";

export interface CreateOrderMutationInput {
  idempotencyKey: string;
  customerId: string;
  poNumber?: string;
  items: CreateOrderItemInput[];
  createScenario?: string;
}

export interface SavedDraft {
  values: CreateOrderFormValues;
  idempotencyKey: string;
}

// Module-level in-memory draft storage for review and retry
let savedDraft: SavedDraft | null = null;

export function getSavedDraft(): SavedDraft | null {
  return savedDraft;
}

export function clearSavedDraft(): void {
  savedDraft = null;
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations("orders.create.toast");

  return useMutation({
    mutationFn: async (variables: CreateOrderMutationInput) => {
      return createOrder(
        {
          idempotencyKey: variables.idempotencyKey,
          customerId: variables.customerId,
          poNumber: variables.poNumber,
          items: variables.items,
        },
        { createScenario: variables.createScenario }
      );
    },

    onMutate: async (variables) => {
      // 1. cancelQueries for orders
      await queryClient.cancelQueries({ queryKey: ["orders"] });

      // 2. Snapshot getQueriesData(["orders"])
      const previousQueries = queryClient.getQueriesData<OrdersResponse>({
        queryKey: ["orders"],
      });

      // 3. Build optimistic Order if catalog queries are cached
      const cachedProducts = queryClient.getQueryData<ProductsResponse>([
        "products",
      ])?.data;
      const cachedCustomers = queryClient.getQueryData<CustomersResponse>([
        "customers",
      ])?.data;

      // If either cache entry is missing, skip the optimistic cache patch and still submit
      if (!cachedProducts || !cachedCustomers) {
        return { previousQueries, optimisticOrder: null };
      }

      const customer = cachedCustomers.find(
        (c) => c.id === variables.customerId
      );
      const customerName = customer ? customer.name : "";
      const { total } = calculateOrderTotals(variables.items, cachedProducts);
      const itemCount = variables.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      const optimisticOrder: Order = {
        id: `tmp_${variables.idempotencyKey}`,
        orderCode: "ORD-PENDING",
        customerName,
        createdAt: new Date().toISOString(),
        total,
        currency: "USD",
        status: "pending",
        itemCount,
      };

      // 4. Prepend to matching cached orders queries:
      // Page 1, no search, no date filters, status null or 'pending', no scenario
      for (const [key, oldData] of previousQueries) {
        if (!oldData) continue;
        const params = (
          key as [
            string,
            (
              | {
                  page?: number;
                  pageSize?: number;
                  status?: string | null;
                  search?: string | null;
                  startDate?: string | null;
                  endDate?: string | null;
                  scenario?: string | null;
                }
              | undefined
            ),
          ]
        )[1];

        if (!params) continue;

        const isPage1 = params.page === 1;
        const noSearch = !params.search;
        const noDate = !params.startDate && !params.endDate;
        const isPendingOrNull = !params.status || params.status === "pending";
        const noScenario = !params.scenario;

        if (
          !isPage1 ||
          !noSearch ||
          !noDate ||
          !isPendingOrNull ||
          !noScenario
        ) {
          continue;
        }

        // Remove any existing row with the same tmp_ id first (prevent duplicate on retry)
        const filteredExisting = oldData.data.filter(
          (o: Order) => o.id !== optimisticOrder.id
        );

        const pageSize = params.pageSize || oldData.pageSize || 5;
        const newTotal = oldData.total + 1;
        const newTotalPages = Math.ceil(newTotal / pageSize);
        const newData = [optimisticOrder, ...filteredExisting].slice(
          0,
          pageSize
        );

        queryClient.setQueryData<OrdersResponse>(key, {
          ...oldData,
          data: newData,
          total: newTotal,
          totalPages: newTotalPages,
        });
      }

      return { previousQueries, optimisticOrder };
    },

    onError: (error, variables, context) => {
      // 1. Restore every snapshot with setQueryData (exact restoration)
      if (context?.previousQueries) {
        for (const [key, snapshot] of context.previousQueries) {
          queryClient.setQueryData(key, snapshot);
        }
      }

      // 2. Do not invalidate queries

      // 3. Keep failed form values and key in module memory
      savedDraft = {
        values: {
          customerId: variables.customerId,
          poNumber: variables.poNumber || "",
          items: variables.items,
        },
        idempotencyKey: variables.idempotencyKey,
      };

      // 4 & 5. Show localized error toast
      const isForbidden =
        (error instanceof HttpError && error.status === 403) ||
        (typeof error === "object" &&
          error !== null &&
          "status" in error &&
          (error as { status: number }).status === 403);

      if (isForbidden) {
        toast.error(t("noPermission"));
      } else {
        toast.error(t("error"), {
          action: {
            label: t("reviewAndRetry"),
            onClick: () => {
              router.push("/orders/new?resume=1");
            },
          },
        });
      }
    },

    onSuccess: (data, variables) => {
      const serverOrder = data.data;

      // 1. Replace the tmp_ row with the server order in patched queries
      const matchingQueries = queryClient.getQueriesData<OrdersResponse>({
        queryKey: ["orders"],
      });

      for (const [key, oldData] of matchingQueries) {
        if (!oldData) continue;
        const hasTmp = oldData.data.some(
          (o: Order) => o.id === `tmp_${variables.idempotencyKey}`
        );
        if (!hasTmp) continue;

        const replaced = oldData.data.map((order: Order) =>
          order.id === `tmp_${variables.idempotencyKey}` ? serverOrder : order
        );

        queryClient.setQueryData<OrdersResponse>(key, {
          ...oldData,
          data: replaced,
        });
      }

      // 2. Clear saved draft
      savedDraft = null;

      // 3. Show success toast
      toast.success(t("success", { code: serverOrder.orderCode }));

      // 4. Invalidate orders queries
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
