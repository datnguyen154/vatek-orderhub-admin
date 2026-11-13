import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderStatusControl } from "./order-status-control";
import { Toaster } from "@/components/ui/toaster";
import { TestProviders } from "../../../../vitest.setup";
import type { OrderDetail } from "../types";

const pendingOrderFixture: OrderDetail = {
  id: "ord_002",
  orderCode: "ORD-2026-002",
  customerName: "Nexus Retailers Co.",
  createdAt: "2026-11-05T14:15:00Z",
  total: 890.5,
  currency: "USD",
  status: "pending",
  itemCount: 5,
  poNumber: "PO-9912",
  invoice: null,
  timeline: [
    {
      id: "ord_002_evt_0",
      type: "created",
      at: "2026-11-05T14:15:00Z",
      actorRole: "system",
    },
  ],
};

describe("OrderStatusControl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("disables update initially, enables it when choosing Processing, and shows success toast after update", async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <OrderStatusControl order={pendingOrderFixture} role="staff" />
        <Toaster />
      </TestProviders>
    );

    const select = screen.getByLabelText("Next Status");
    const updateButton = screen.getByRole("button", { name: "Update status" });

    // Initial state: placeholder is selected, Update status button is disabled
    expect(select).toHaveValue("");
    expect(updateButton).toBeDisabled();

    // Selecting "Processing" enables the Update button
    await user.selectOptions(select, "processing");
    expect(updateButton).toBeEnabled();

    // Clicking update initiates mutation and triggers success toast
    await user.click(updateButton);

    await waitFor(
      () => {
        expect(
          screen.getByText("Order status updated to Processing")
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("opens the confirmation dialog when Cancelled is selected", async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <OrderStatusControl order={pendingOrderFixture} role="staff" />
      </TestProviders>
    );

    const select = screen.getByLabelText("Next Status");
    await user.selectOptions(select, "cancelled");

    const updateButton = screen.getByRole("button", { name: "Update status" });
    await user.click(updateButton);

    // Confirmation dialog opens
    expect(
      screen.getByRole("dialog", { name: "Cancel Order Confirmation" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Yes, cancel order" })
    ).toBeInTheDocument();
  });

  it("renders read-only notice and no status control when user has viewer role", () => {
    render(
      <TestProviders>
        <OrderStatusControl order={pendingOrderFixture} role="viewer" />
      </TestProviders>
    );

    expect(
      screen.getByText(
        "Read-only access (status update requires staff or admin role)"
      )
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Next Status")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Update status" })
    ).not.toBeInTheDocument();
  });
});
