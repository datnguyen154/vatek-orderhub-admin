/**
 * OrderHub Admin Console — useUpdateOrderStatus Hook
 *
 * Implements pessimistic order status mutation via TanStack Query:
 * - Sends PATCH /api/orders/:orderId/status
 * - Control / button is disabled during pending mutation
 * - On success: updates cache for ["order", orderId], invalidates ["orders"] and ["order", orderId], shows success toast
 * - On error (409, 403, 500): preserves previous state, shows localized error toast, control stays usable
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateOrderStatus } from "../api";
import type { OrderDetail, OrderStatus } from "../types";
import { HttpError } from "@/lib/api/client";

export function useUpdateOrderStatus(orderId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations("orders.detail.statusControl");
  const tStatus = useTranslations("orders.status");

  return useMutation({
    mutationFn: async ({ status }: { status: OrderStatus }) => {
      const res = await updateOrderStatus(orderId, status);
      return res.data;
    },
    onSuccess: (data: OrderDetail) => {
      queryClient.setQueryData(["order", orderId], data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });

      toast.success(t("toastSuccess", { status: tStatus(data.status) }));
    },
    onError: (error: unknown) => {
      if (error instanceof HttpError) {
        if (error.status === 403) {
          toast.error(t("toastForbidden"));
          return;
        }
        if (error.status === 409) {
          toast.error(t("toastInvalid"));
          return;
        }
      }
      toast.error(t("toastError"));
    },
  });
}
