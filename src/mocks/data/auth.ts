/**
 * OrderHub Admin Console — Demo Authentication Fixtures
 *
 * NOTE: For capstone evaluation only. Contains no passwords.
 * Resolves demo roles based on approved email fixtures.
 */

import type { Role } from "@/features/auth/types";

export interface DemoUserFixture {
  email: string;
  role: Role;
}

export const DEMO_USERS: Record<string, Role> = {
  "admin@orderhub.test": "admin",
  "staff@orderhub.test": "staff",
  "viewer@orderhub.test": "viewer",
};

/**
 * Resolves user role based on email fixture:
 * - admin@orderhub.test -> admin
 * - staff@orderhub.test -> staff
 * - viewer@orderhub.test -> viewer
 * - any other valid email -> viewer
 */
export function resolveRoleByEmail(email: string): Role {
  const normalized = email.trim().toLowerCase();
  return DEMO_USERS[normalized] ?? "viewer";
}
