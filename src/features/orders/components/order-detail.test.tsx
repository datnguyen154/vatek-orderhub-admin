import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { OrderDetail } from "./order-detail";
import { TestProviders, setMockNavigation } from "../../../../vitest.setup";

describe("OrderDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders order summary fields and activity timeline events for ord_001", async () => {
    setMockNavigation({ pathname: "/orders/ord_001" });

    render(
      <TestProviders>
        <OrderDetail orderId="ord_001" role="admin" />
      </TestProviders>
    );

    // Wait for ord_001 to load
    await waitFor(() => {
      expect(screen.getAllByText("ORD-2026-001").length).toBeGreaterThanOrEqual(
        1
      );
    });

    // Summary fields
    expect(screen.getByText("Order Summary")).toBeInTheDocument();
    expect(
      screen.getAllByText("Acme Logistics Inc.").length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("$1,420.00").length).toBeGreaterThanOrEqual(1);

    // Timeline events
    expect(screen.getByText("Activity Timeline")).toBeInTheDocument();
    expect(screen.getByText("Order created")).toBeInTheDocument();
    expect(
      screen.getByText("Status changed from Pending to Processing")
    ).toBeInTheDocument();
  });

  it("displays the not-found state when an unknown order id is supplied", async () => {
    setMockNavigation({ pathname: "/orders/ord_unknown_999" });

    render(
      <TestProviders>
        <OrderDetail orderId="ord_unknown_999" role="admin" />
      </TestProviders>
    );

    await waitFor(() => {
      expect(screen.getByText("Order Not Found")).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "The requested order could not be found or does not exist."
      )
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /Back to orders/i }).length
    ).toBeGreaterThanOrEqual(1);
  });
});
