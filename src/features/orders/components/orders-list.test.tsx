import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { OrdersList } from "./orders-list";
import {
  TestProviders,
  setMockNavigation,
  server,
} from "../../../../vitest.setup";

describe("OrdersList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders order fixtures as table rows with code, customer and status text", async () => {
    setMockNavigation({ pathname: "/orders" });

    render(
      <TestProviders>
        <OrdersList />
      </TestProviders>
    );

    // Initial fixtures from mockOrders include ORD-2026-001
    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    const table = screen.getByRole("table");
    expect(within(table).getByText("ORD-2026-001")).toBeInTheDocument();
    expect(within(table).getByText("Acme Logistics Inc.")).toBeInTheDocument();
    expect(within(table).getByText("Delivered")).toBeInTheDocument();
  });

  it("displays empty state message when scenario=empty is active", async () => {
    setMockNavigation({
      pathname: "/orders",
      searchParams: new URLSearchParams("scenario=empty"),
    });

    render(
      <TestProviders>
        <OrdersList />
      </TestProviders>
    );

    await waitFor(() => {
      expect(screen.getByText("No orders found")).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        "There are currently no customer orders matching the active filter criteria."
      )
    ).toBeInTheDocument();
  });

  it("displays error state message when scenario=error and allows retrying", async () => {
    const user = userEvent.setup();
    setMockNavigation({
      pathname: "/orders",
      searchParams: new URLSearchParams("scenario=error"),
    });

    render(
      <TestProviders>
        <OrdersList />
      </TestProviders>
    );

    await waitFor(() => {
      expect(screen.getByText("Unable to load orders")).toBeInTheDocument();
    });

    const retryButton = screen.getByRole("button", {
      name: "Retry loading orders",
    });
    expect(retryButton).toBeInTheDocument();

    // Now restore mock to return success on next attempt
    server.use(
      http.get("/api/orders", () => {
        return HttpResponse.json(
          {
            data: [
              {
                id: "ord_retry_01",
                orderCode: "ORD-RETRY-001",
                customerName: "Recovered Customer",
                createdAt: "2026-11-10T10:00:00Z",
                total: 250,
                currency: "USD",
                status: "processing",
                itemCount: 2,
              },
            ],
            total: 1,
            page: 1,
            pageSize: 5,
            totalPages: 1,
          },
          { status: 200 }
        );
      })
    );

    await user.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText("ORD-RETRY-001")).toBeInTheDocument();
    });
    expect(screen.getByText("Recovered Customer")).toBeInTheDocument();
  });
});
