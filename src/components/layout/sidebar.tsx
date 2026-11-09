import Link from "next/link";

/**
 * Desktop Persistent Sidebar Navigation
 *
 * Implemented as a Server Component.
 * - Displayed on desktop (`lg` and wider) using the fixed `w-sidebar` dimension token.
 * - Hidden on mobile/tablet viewports (< lg), where `MobileNav` provides navigation.
 * - Enforces semantic `<aside>` and `<nav>` structure with explicit accessibility labels.
 * - Exclusively links to existing routes (`/orders`), marking active state with `aria-current="page"`.
 */
export function Sidebar() {
  return (
    <aside
      aria-label="Sidebar navigation"
      className="hidden lg:flex fixed left-0 top-topbar bottom-0 w-sidebar z-20 flex-col border-r border-border bg-surface py-4 px-3"
    >
      <nav aria-label="Main navigation" className="flex-1 space-y-1">
        <Link
          href="/orders"
          aria-current="page"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-body-medium font-medium bg-primary-muted text-primary-muted-foreground transition-colors"
        >
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <span>Orders</span>
        </Link>
      </nav>

      {/* Footer status / environment indicator */}
      <div className="border-t border-border pt-4 px-2">
        <div className="flex items-center gap-2 text-caption text-muted-foreground">
          <span
            className="inline-block h-2 w-2 rounded-full bg-success"
            aria-hidden="true"
          />
          <span>OrderHub Console &bull; Online</span>
        </div>
      </div>
    </aside>
  );
}
