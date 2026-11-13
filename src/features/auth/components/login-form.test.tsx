import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./login-form";
import { TestProviders } from "../../../../vitest.setup";
import * as authActions from "../actions";

vi.mock("../actions", () => ({
  loginAction: vi.fn(),
  logoutAction: vi.fn(),
  refreshAccessTokenAction: vi.fn(),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows inline validation errors for invalid email and short password and blocks submission", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders>
        <LoginForm />
      </TestProviders>
    );

    const emailInput = screen.getByLabelText("Email address");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", {
      name: "Sign in to Console",
    });

    await user.type(emailInput, "invalid-email");
    await user.type(passwordInput, "123");
    await user.click(submitButton);

    expect(
      screen.getByText(
        "Please enter a valid email address (e.g., name@company.com)."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 8 characters.")
    ).toBeInTheDocument();
    expect(authActions.loginAction).not.toHaveBeenCalled();
  });

  it("submits the form and calls the login server action with valid credentials", async () => {
    const user = userEvent.setup();
    const mockAction = vi.fn().mockResolvedValue({ success: true });
    vi.mocked(authActions.loginAction).mockImplementation(mockAction);

    render(
      <TestProviders>
        <LoginForm />
      </TestProviders>
    );

    const emailInput = screen.getByLabelText("Email address");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", {
      name: "Sign in to Console",
    });

    await user.type(emailInput, "staff@orderhub.test");
    await user.type(passwordInput, "validpassword123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(authActions.loginAction).toHaveBeenCalled();
    });
  });
});
