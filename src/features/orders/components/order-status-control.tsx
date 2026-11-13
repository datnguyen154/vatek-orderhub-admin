/**
 * OrderHub Admin Console — Order Status Control Component
 *
 * Implements pessimistic status updates and role-based guard:
 * - Visible interactive control only for roles with `orders:updateStatus` (admin, staff).
 * - Read-only guidance text for viewer role.
 * - Displays only valid transition options according to business rule state machine.
 * - Terminal statuses ("delivered", "cancelled") render clean status notice.
 * - Confirmation Modal triggered prior to applying destructive "cancelled" status.
 */

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { hasPermission, type Role } from "@/features/auth/types";
import {
  ORDER_STATUS_TRANSITIONS,
  type OrderDetail,
  type OrderStatus,
} from "../types";
import { useUpdateOrderStatus } from "../hooks/use-update-order-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";

export interface OrderStatusControlProps {
  order: OrderDetail;
  role: Role;
}

function getStatusBadgeVariant(
  status: OrderStatus
): "success" | "warning" | "neutral" | "destructive" {
  switch (status) {
    case "delivered":
      return "success";
    case "pending":
      return "warning";
    case "processing":
    case "shipped":
      return "neutral";
    case "cancelled":
      return "destructive";
  }
}

export function OrderStatusControl({ order, role }: OrderStatusControlProps) {
  const t = useTranslations("orders.detail.statusControl");
  const tStatus = useTranslations("orders.status");
  const canUpdate = hasPermission(role, "orders:updateStatus");

  const allowedStatuses = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
  const isTerminal = allowedStatuses.length === 0;

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const updateMutation = useUpdateOrderStatus(order.id);

  // Sync selected status when order.status changes or after update
  useEffect(() => {
    setSelectedStatus("");
  }, [order.status]);

  const handleApplyClick = () => {
    if (!selectedStatus) {
      return;
    }

    if (selectedStatus === "cancelled") {
      setIsCancelModalOpen(true);
      return;
    }

    updateMutation.mutate(
      { status: selectedStatus },
      {
        onSuccess: () => {
          setSelectedStatus("");
        },
      }
    );
  };

  const handleConfirmCancel = async () => {
    setIsCancelModalOpen(false);
    updateMutation.mutate(
      { status: "cancelled" },
      {
        onSuccess: () => {
          setSelectedStatus("");
        },
      }
    );
  };

  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canUpdate ? (
          <p className="text-sm text-muted-foreground">{t("readOnlyNotice")}</p>
        ) : isTerminal ? (
          <p className="text-sm font-medium text-muted-foreground">
            {t("terminalNotice")}
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t("currentStatus")}</span>
              <Badge variant={getStatusBadgeVariant(order.status)} size="sm">
                {tStatus(order.status)}
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <label
                  htmlFor="status-select"
                  className="text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                  {t("selectLabel")}
                </label>
                <Select
                  id="status-select"
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as OrderStatus)
                  }
                  disabled={updateMutation.isPending}
                  size="md"
                >
                  <option value="" disabled>
                    {t("selectPlaceholder")}
                  </option>
                  {allowedStatuses.map((st) => (
                    <option key={st} value={st}>
                      {tStatus(st)}
                    </option>
                  ))}
                </Select>
              </div>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleApplyClick}
                disabled={
                  updateMutation.isPending ||
                  !selectedStatus ||
                  !allowedStatuses.includes(selectedStatus)
                }
                className="shrink-0"
              >
                {updateMutation.isPending ? t("submitting") : t("submitButton")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Confirmation Modal for Cancel status */}
      <Modal open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <ModalContent
          title={t("confirmCancelTitle")}
          description={t("confirmCancelDescription", { code: order.orderCode })}
          closeLabel="Close"
          variant="destructive"
          size="sm"
        >
          <ModalBody>
            <p className="text-sm text-muted-foreground">
              {t("confirmCancelWarning")}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsCancelModalOpen(false)}
              disabled={updateMutation.isPending}
            >
              {t("dismissCancelButton")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="md"
              onClick={handleConfirmCancel}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending
                ? t("submitting")
                : t("confirmCancelButton")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
}
