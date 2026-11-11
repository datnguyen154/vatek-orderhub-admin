"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * Desktop Persistent Sidebar Navigation
 *
 * Implemented as a Client Component to dynamically reflect the active route pathname
 * without triggering full page reloads or remounting the parent dashboard shell layout.
 * - Displayed on desktop (`lg` and wider) using the fixed `w-sidebar` dimension token.
 * - Hidden on mobile/tablet viewports (< lg), where `MobileNav` provides navigation.
 * - Enforces semantic `<aside>` and `<nav>` structure with explicit accessibility labels.
 * - Sets `aria-current="page"` and active tokens exclusively on the currently matching route.
 */
export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const navigationItems = [
    {
      name: t("orders"),
      href: "/orders",
      icon: (
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
      ),
    },
    {
      name: t("preferences"),
      href: "/preferences",
      icon: (
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <aside
      aria-label={t("sidebarAria")}
      className="hidden lg:flex fixed left-0 top-topbar bottom-0 w-sidebar z-20 flex-col border-r border-border bg-surface py-4 px-3"
    >
      <nav aria-label={t("mainNavAria")} className="flex-1 space-y-1">
        {navigationItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-body-medium font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                isActive
                  ? "bg-primary-muted text-primary-muted-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer status / environment indicator */}
      <div className="border-t border-border pt-4 px-2">
        <div className="flex items-center gap-2 text-caption text-muted-foreground">
          <span
            className="inline-block h-2 w-2 rounded-full bg-success"
            aria-hidden="true"
          />
          <span>{t("onlineStatus")}</span>
        </div>
      </div>
    </aside>
  );
}
