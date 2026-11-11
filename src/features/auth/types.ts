/**
 * OrderHub Admin Console — Auth & RBAC Types
 *
 * NOTE: Hiding UI is not authorization; later mutations must get 403 from MSW for disallowed roles.
 */

export type Role = "admin" | "staff" | "viewer";

export type Permission =
  | "orders:view"
  | "preferences:manage"
  | "orders:create"
  | "orders:updateStatus"
  | "orders:uploadInvoice"
  | "reports:view"
  | "reports:export";

export const ALL_PERMISSIONS: readonly Permission[] = [
  "orders:view",
  "preferences:manage",
  "orders:create",
  "orders:updateStatus",
  "orders:uploadInvoice",
  "reports:view",
  "reports:export",
] as const;

/**
 * Role-to-permission mapping matrix approved for Session 13 / step-15.
 *
 * | Permission                           | admin | staff | viewer |
 * |--------------------------------------|:-----:|:-----:|:------:|
 * | orders:view, preferences:manage      |   ✓   |   ✓   |   ✓    |
 * | orders:create, orders:updateStatus,  |   ✓   |   ✓   |   ✗    |
 * | orders:uploadInvoice, reports:view   |       |       |        |
 * | reports:export                       |   ✓   |   ✗   |   ✗    |
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  admin: [
    "orders:view",
    "preferences:manage",
    "orders:create",
    "orders:updateStatus",
    "orders:uploadInvoice",
    "reports:view",
    "reports:export",
  ],
  staff: [
    "orders:view",
    "preferences:manage",
    "orders:create",
    "orders:updateStatus",
    "orders:uploadInvoice",
    "reports:view",
  ],
  viewer: ["orders:view", "preferences:manage"],
} as const;

export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

export function isValidRole(role: unknown): role is Role {
  return role === "admin" || role === "staff" || role === "viewer";
}

export type RefreshTokenResult =
  | {
      ok: true;
      accessToken: string;
      expiresAt: number;
    }
  | {
      ok: false;
    };
