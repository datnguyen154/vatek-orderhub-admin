import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "./mobile-nav";
import { CurrentRouteLabel } from "./current-route-label";
import { LogoutButton } from "@/features/auth/components/logout-button";
import type { Role } from "@/features/auth/types";

interface TopbarProps {
  userEmail: string;
  role: Role;
}

/**
 * Persistent Topbar Component
 *
 * Implemented as a Server Component.
 * - Persistent top navigation bar using the `h-topbar` dimension token.
 * - Integrates `MobileNav` drawer trigger for viewports below `lg`.
 * - Includes branding, breadcrumbs, user session status, verified role badge, and client LogoutButton.
 * - Uses `CurrentRouteLabel` as a minimal client leaf to dynamically reflect active route.
 */
export async function Topbar({ userEmail, role }: TopbarProps) {
  const t = await getTranslations("nav");
  const tRoles = await getTranslations("roles");

  return (
    <header className="fixed top-0 left-0 right-0 h-topbar z-30 border-b border-border bg-surface px-4 lg:px-6 flex items-center justify-between">
      {/* Left section: mobile menu toggle, brand, and breadcrumb */}
      <div className="flex items-center gap-3">
        <MobileNav />

        <div className="flex items-center gap-3">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-caption"
            aria-hidden="true"
          >
            OH
          </span>
          <span className="text-section-title font-semibold text-foreground tracking-tight">
            OrderHub
          </span>
        </div>

        {/* Section separator and dynamic route indicator */}
        <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-border text-caption text-muted-foreground">
          <span>{t("console")}</span>
          <span aria-hidden="true">/</span>
          <CurrentRouteLabel />
        </div>
      </div>

      {/* Right section: authenticated user session, role badge, and logout action */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden md:flex items-center gap-2">
          <Badge variant="neutral" size="sm">
            <span
              className="inline-block h-2 w-2 rounded-full bg-primary"
              aria-hidden="true"
            />
            <span>{userEmail}</span>
          </Badge>
        </div>

        {/* Topbar role badge with text */}
        <Badge variant="neutral" size="sm" className="font-medium">
          <span>{tRoles(role)}</span>
        </Badge>

        <LogoutButton />
      </div>
    </header>
  );
}
