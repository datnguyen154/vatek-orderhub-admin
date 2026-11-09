import { logoutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "./mobile-nav";
import { CurrentRouteLabel } from "./current-route-label";

interface TopbarProps {
  userEmail: string;
}

/**
 * Persistent Topbar Component
 *
 * Implemented as a Server Component.
 * - Persistent top navigation bar using the `h-topbar` dimension token.
 * - Integrates `MobileNav` drawer trigger for viewports below `lg`.
 * - Includes branding, breadcrumbs, user session status, and accessible logout Server Action.
 * - Uses `CurrentRouteLabel` as a minimal client leaf to dynamically reflect active route.
 */
export function Topbar({ userEmail }: TopbarProps) {
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
          <span>Console</span>
          <span aria-hidden="true">/</span>
          <CurrentRouteLabel />
        </div>
      </div>

      {/* Right section: authenticated user session and logout action */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2">
          <Badge variant="neutral" size="sm">
            <span
              className="inline-block h-2 w-2 rounded-full bg-primary"
              aria-hidden="true"
            />
            <span>{userEmail}</span>
          </Badge>
        </div>

        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            aria-label="Sign out of console"
          >
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
