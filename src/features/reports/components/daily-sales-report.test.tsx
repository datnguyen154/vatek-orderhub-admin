import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DailySalesReport } from "./daily-sales-report";
import {
  TestProviders,
  setMockNavigation,
  mockRouter,
} from "../../../../vitest.setup";

describe("DailySalesReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockNavigation({ searchParams: {} });
  });

  it("renders 4 KPI tiles ($26,804.58, 437, $65.22, 5.9%) with range from=2026-10-01&to=2026-10-31", async () => {
    setMockNavigation({
      searchParams: {
        from: "2026-10-01",
        to: "2026-10-31",
      },
    });

    render(
      <TestProviders>
        <DailySalesReport role="admin" />
      </TestProviders>
    );

    // Wait for the report data to load and KPI values to appear
    expect(await screen.findByText("$26,804.58")).toBeInTheDocument();
    expect(screen.getByText("437")).toBeInTheDocument();
    expect(screen.getByText("$65.22")).toBeInTheDocument();
    expect(screen.getByText("5.9%")).toBeInTheDocument();
  });

  it("triggers inline error and dispatches 0 network requests when from > to", async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <DailySalesReport role="admin" />
      </TestProviders>
    );

    // Wait until initial fetch finishes and Apply button is ready
    const applyButton = await screen.findByRole("button", { name: "Apply" });

    // Set invalid range: from > to
    const fromInput = screen.getByLabelText("From");
    const toInput = screen.getByLabelText("To");

    fireEvent.change(fromInput, { target: { value: "2026-11-15" } });
    fireEvent.change(toInput, { target: { value: "2026-11-01" } });

    // Expect inline error alert
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Invalid date range. Start date must be on or before end date, and range cannot exceed 92 days."
    );

    // Clicking Apply does not push new URL (0 network navigation requests)
    await user.click(applyButton);

    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("renders Export CSV button for admin and hides it for staff", async () => {
    setMockNavigation({
      searchParams: {
        from: "2026-10-01",
        to: "2026-10-31",
      },
    });

    const { unmount } = render(
      <TestProviders>
        <DailySalesReport role="admin" />
      </TestProviders>
    );

    // Admin should see Export CSV button
    expect(
      await screen.findByRole("button", { name: /Export CSV/i })
    ).toBeInTheDocument();

    unmount();

    // Staff should NOT see Export CSV button
    render(
      <TestProviders>
        <DailySalesReport role="staff" />
      </TestProviders>
    );

    await screen.findByText("$26,804.58");
    expect(
      screen.queryByRole("button", { name: /Export CSV/i })
    ).not.toBeInTheDocument();
  });
});
