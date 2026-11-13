import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateOrderWizard } from "./create-order-wizard";
import { TestProviders, setMockNavigation } from "../../../../vitest.setup";

describe("CreateOrderWizard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("blocks step 1 Next until a customer is chosen, showing a visible error alert", async () => {
    const user = userEvent.setup();
    setMockNavigation({ pathname: "/orders/new" });

    render(
      <TestProviders>
        <CreateOrderWizard />
      </TestProviders>
    );

    // Wait for customer data to load in Step 1
    await waitFor(() => {
      expect(screen.getByLabelText(/Customer/i)).toBeInTheDocument();
    });

    const nextButton = screen.getByRole("button", {
      name: "Continue to line items",
    });

    // Attempt to proceed without selecting customer
    await user.click(nextButton);

    // Visible error alert is shown
    expect(
      screen.getByText("Customer selection is required")
    ).toBeInTheDocument();

    // Still on step 1
    expect(
      screen.getByRole("heading", { name: "Step 1: Customer details" })
    ).toBeInTheDocument();
  });

  it("adds a product and moves to Review step showing the calculated total", async () => {
    const user = userEvent.setup();
    setMockNavigation({ pathname: "/orders/new" });

    render(
      <TestProviders>
        <CreateOrderWizard />
      </TestProviders>
    );

    // Step 1: Select a customer
    await waitFor(() => {
      expect(screen.getByLabelText(/Customer/i)).toBeInTheDocument();
    });
    const customerSelect = screen.getByLabelText(/Customer/i);
    await user.selectOptions(customerSelect, "cus_001");

    const toStep2Button = screen.getByRole("button", {
      name: "Continue to line items",
    });
    await user.click(toStep2Button);

    // Step 2: Line items heading is visible
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Step 2: Line items" })
      ).toBeInTheDocument();
    });

    // Add first product (Heavy Duty Wooden Pallet, unitPrice: 45.00, default qty 1)
    const addButton = await screen.findByRole("button", {
      name: /Add Heavy Duty Wooden Pallet/i,
    });
    await user.click(addButton);

    // Proceed to Step 3: Review
    const toStep3Button = screen.getByRole("button", {
      name: "Continue to review",
    });
    await user.click(toStep3Button);

    // Step 3: Review and submit heading is visible
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Step 3: Review and submit" })
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Total Amount")).toBeInTheDocument();
    expect(screen.getAllByText("$45.00").length).toBeGreaterThanOrEqual(1);
  });
});
