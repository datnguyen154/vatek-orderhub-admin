import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrdersFilters } from "./orders-filters";
import {
  TestProviders,
  mockRouter,
  setMockNavigation,
} from "../../../../vitest.setup";
import { useRouter, useSearchParams } from "next/navigation";

// A wrapper component simulating how OrdersList connects OrdersFilters with router navigation
function ConnectedOrdersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const handleFilterChange = (updates: {
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.status !== undefined) {
      if (updates.status) params.set("status", updates.status);
      else params.delete("status");
    }
    if (updates.search !== undefined) {
      if (updates.search) params.set("search", updates.search);
      else params.delete("search");
    }
    const qs = params.toString();
    router.replace(qs ? `/orders?${qs}` : "/orders");
  };

  const handleResetFilters = () => {
    router.replace("/orders");
  };

  return (
    <OrdersFilters
      status={status}
      search={search}
      startDate={startDate}
      endDate={endDate}
      onFilterChange={handleFilterChange}
      onResetFilters={handleResetFilters}
    />
  );
}

describe("OrdersFilters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates URL params through mocked router when typing a code and choosing a status", async () => {
    const user = userEvent.setup();
    setMockNavigation({ pathname: "/orders" });

    render(
      <TestProviders>
        <ConnectedOrdersFilters />
      </TestProviders>
    );

    const searchInput = screen.getByLabelText("Order Code Search");
    const statusSelect = screen.getByLabelText("Status");

    // 1. Choose a status
    await user.selectOptions(statusSelect, "pending");
    expect(mockRouter.replace).toHaveBeenCalledWith("/orders?status=pending");

    // 2. Type an order code search (debounced by 350ms in OrdersFilters)
    await user.type(searchInput, "ORD-2026-001");
    await waitFor(
      () => {
        expect(mockRouter.replace).toHaveBeenCalledWith(
          expect.stringContaining("search=ORD-2026-001")
        );
      },
      { timeout: 1000 }
    );
  });

  it("resets filter parameters when Clear all button is clicked", async () => {
    const user = userEvent.setup();
    setMockNavigation({
      pathname: "/orders",
      searchParams: new URLSearchParams("status=pending&search=ORD-2026"),
    });

    render(
      <TestProviders>
        <ConnectedOrdersFilters />
      </TestProviders>
    );

    const clearButton = screen.getByRole("button", { name: "Clear all" });
    await user.click(clearButton);

    expect(mockRouter.replace).toHaveBeenCalledWith("/orders");
  });
});
