"use server";

import { redirect } from "next/navigation";
import {
  validateLoginForm,
  type LoginFormErrors,
  type LoginFormValues,
} from "./validation";
import {
  setDemoSessionCookie,
  clearDemoSessionCookie,
} from "@/lib/auth/demo-session";

export interface LoginActionResult {
  success?: boolean;
  errors?: LoginFormErrors;
  serverError?: string;
}

/**
 * Server Action for user login.
 * Performs runtime FormData extraction and validation without persisting credentials.
 * Upon successful validation, issues a signed demo session cookie and redirects to `/orders`.
 */
export async function loginAction(
  _prevState: LoginActionResult | null,
  formData: FormData
): Promise<LoginActionResult> {
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");

  const values: LoginFormValues = {
    email: typeof rawEmail === "string" ? rawEmail : "",
    password: typeof rawPassword === "string" ? rawPassword : "",
  };

  const validation = validateLoginForm(values);

  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
    };
  }

  // Demo credential validation: accepts valid email & 8+ character password
  // Password is immediately dropped from memory; never logged, persisted, or stored.
  try {
    await setDemoSessionCookie(values.email.trim());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Authentication service error";
    return {
      success: false,
      serverError: message,
    };
  }

  // Fixed internal redirect only — no open redirect vector
  redirect("/orders");
}

/**
 * Server Action for user logout.
 * Clears the HTTP-only demo session cookie and redirects to `/login`.
 */
export async function logoutAction(): Promise<void> {
  await clearDemoSessionCookie();
  redirect("/login");
}
