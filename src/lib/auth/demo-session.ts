import { cookies } from "next/headers";
import crypto from "node:crypto";
import { isValidRole, type Role } from "@/features/auth/types";

/**
 * OrderHub Demo Session Management
 *
 * NOTE: This is a learning/demo route guard for capstone evaluation, NOT production authentication.
 * - Minimal signed payload containing email, role, creation timestamp, and expiration timestamp.
 * - Never logs, persists, or stores user passwords.
 * - Never puts credentials into cookies, localStorage, or client props.
 * - Signs tokens using HMAC-SHA256 with DEMO_SESSION_SECRET.
 * - Fails closed if DEMO_SESSION_SECRET is missing or less than 32 characters.
 * - Compares HMAC signatures in constant time after verifying identical byte lengths.
 */

export const DEMO_SESSION_COOKIE_NAME = "orderhub_demo_session";

/** Session cookie lifetime: 8 hours in seconds (28,800 seconds) */
export const DEMO_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export interface DemoSessionPayload {
  email: string;
  role: Role;
  createdAt: number;
  expiresAt: number;
}

/**
 * Retrieves the session secret, enforcing a minimum 32-character requirement.
 * Fails closed if the secret is missing or insufficient.
 */
function getSecretKey(): string {
  const secret = process.env.DEMO_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "DEMO_SESSION_SECRET is missing or insufficient (must be at least 32 characters). Demo auth fails closed."
    );
  }
  return secret;
}

/**
 * Signs a demo session payload using HMAC-SHA256.
 * Output format: `<base64url(payload)>.<base64url(hmac_signature)>`
 */
export function signDemoSession(email: string, role: Role): string {
  const secret = getSecretKey();
  const now = Date.now();
  const payload: DemoSessionPayload = {
    email: email.trim(),
    role,
    createdAt: now,
    expiresAt: now + DEMO_SESSION_MAX_AGE_SECONDS * 1000,
  };

  const payloadJson = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadJson, "utf8").toString("base64url");
  const signatureBase64 = crypto
    .createHmac("sha256", secret)
    .update(payloadBase64)
    .digest("base64url");

  return `${payloadBase64}.${signatureBase64}`;
}

/**
 * Verifies a demo session token.
 * Validates payload structure, checks expiration, and validates HMAC signature
 * using constant-time comparison after checking equal byte lengths.
 * Returns null if invalid, expired, missing valid role, or if secret is missing/weak.
 */
export function verifyDemoSession(
  token: string | null | undefined
): DemoSessionPayload | null {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [payloadBase64, signatureBase64] = parts;
  if (!payloadBase64 || !signatureBase64) {
    return null;
  }

  try {
    const secret = getSecretKey();
    const expectedSignatureBuffer = crypto
      .createHmac("sha256", secret)
      .update(payloadBase64)
      .digest();
    const actualSignatureBuffer = Buffer.from(signatureBase64, "base64url");

    // Guard equal byte lengths before constant-time comparison
    if (expectedSignatureBuffer.length !== actualSignatureBuffer.length) {
      return null;
    }

    if (
      !crypto.timingSafeEqual(expectedSignatureBuffer, actualSignatureBuffer)
    ) {
      return null;
    }

    const payloadJson = Buffer.from(payloadBase64, "base64url").toString(
      "utf8"
    );
    const parsed = JSON.parse(payloadJson) as Partial<DemoSessionPayload>;

    // Validates payload structure including approved role enum
    if (
      !parsed ||
      typeof parsed.email !== "string" ||
      !parsed.email ||
      !isValidRole(parsed.role) ||
      typeof parsed.createdAt !== "number" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }

    // Check expiration timestamp
    if (Date.now() > parsed.expiresAt) {
      return null;
    }

    return {
      email: parsed.email,
      role: parsed.role,
      createdAt: parsed.createdAt,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    // Fail closed on any cryptographic or parsing error
    return null;
  }
}

/**
 * Reads and verifies the demo session from the HTTP-only cookie in Next.js Server Components.
 */
export async function getDemoSessionFromCookies(): Promise<DemoSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(DEMO_SESSION_COOKIE_NAME);
    if (!cookie?.value) {
      return null;
    }
    return verifyDemoSession(cookie.value);
  } catch {
    return null;
  }
}

/**
 * Sets the signed demo session cookie on the response.
 */
export async function setDemoSessionCookie(
  email: string,
  role: Role
): Promise<void> {
  const token = signDemoSession(email, role);
  const cookieStore = await cookies();
  cookieStore.set(DEMO_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: DEMO_SESSION_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
}

/**
 * Deletes the demo session cookie on logout.
 */
export async function clearDemoSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_SESSION_COOKIE_NAME);
}
