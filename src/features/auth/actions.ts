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
  getDemoSessionFromCookies,
} from "@/lib/auth/demo-session";
import { resolveRoleByEmail } from "@/mocks/data/auth";
import type { RefreshTokenResult } from "./types";

export interface LoginActionResult {
  success?: boolean;
  errors?: LoginFormErrors;
  serverError?: string;
}

/**
 * Server Action for user login.
 * Performs runtime FormData extraction and validation without persisting credentials.
 * Resolves role from fixtures and issues a signed demo session cookie containing the role.
 * Upon successful validation, redirects to `/orders`.
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
  // Role is resolved from demo email fixtures:
  // admin@orderhub.test -> admin, staff@orderhub.test -> staff, viewer@orderhub.test -> viewer, other -> viewer
  const role = resolveRoleByEmail(values.email);

  try {
    await setDemoSessionCookie(values.email.trim(), role);
  } catch {
    // Return localized message key instead of raw error to avoid leaking secrets
    return {
      success: false,
      serverError: "serverError",
    };
  }

  // Fixed internal redirect only — no open redirect vector
  redirect("/orders");
}

/**
 * Server Action for user logout.
 * Clears the HTTP-only demo session cookie.
 */
export async function logoutAction(): Promise<void> {
  await clearDemoSessionCookie();
}

/**
 * Server Action for demo access token refresh.
 * Verifies the HTTP-only session cookie. If valid, mints an in-memory demo access token
 * with TTL 5 minutes formatted as `demo.<role>.<expiresAtMs>.<random>`.
 * Returns `{ ok: true, accessToken, expiresAt }` or `{ ok: false }`.
 */
export async function refreshAccessTokenAction(): Promise<RefreshTokenResult> {
  const session = await getDemoSessionFromCookies();
  if (!session) {
    return { ok: false };
  }

  const now = Date.now();
  const ttlMs = 5 * 60 * 1000; // 5 minutes
  const expiresAt = now + ttlMs;
  const random = Math.random().toString(36).substring(2, 10);
  const accessToken = `demo.${session.role}.${expiresAt}.${random}`;

  return {
    ok: true,
    accessToken,
    expiresAt,
  };
}
