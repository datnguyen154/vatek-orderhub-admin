"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalBody,
} from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import {
  hasPermission,
  type Role,
  type Permission,
} from "@/features/auth/types";

export interface MobileNavProps {
  role?: Role;
}

/**
 * Mobile Navigation Drawer
 *
 * Utilizes the approved Radix Dialog Modal primitive for responsive viewports (< lg).
 * - Styled as an edge-anchored side drawer panel on mobile/tablet viewports (< lg)
 * - Uses existing `w-sidebar` dimension token for width consistency with desktop sidebar
 * - Focus containment and trap managed by Radix Dialog
 * - Supports keyboard opening via Enter and Space
 * - Escape key dismisses drawer
 * - Focus automatically returns to trigger hamburger button upon closing via ModalTrigger
 * - Desktop layout remains completely unaffected (trigger hidden on lg+)
 * - Closes automatically upon route selection
 * - Accurately sets aria-current="page" and active styling for /orders and /preferences
 */
export function MobileNav({ role }: MobileNavProps = {}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");

  const navigationItems: Array<{
    name: string;
    href: string;
    permission?: Permission;
    icon: React.ReactNode;
  }> = [
    {
      name: t("orders"),
      href: "/orders",
      permission: "orders:view",
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
      name: t("dailySales"),
      href: "/reports/daily-sales",
      permission: "reports:view",
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      name: t("preferences"),
      href: "/preferences",
      permission: "preferences:manage",
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

  const visibleNavItems = navigationItems.filter(
    (item) => !item.permission || (role && hasPermission(role, item.permission))
  );

  return (
    <div className="lg:hidden">
      <Modal open={open} onOpenChange={setOpen}>
        {/* Drawer trigger button wrapped in ModalTrigger for guaranteed focus restoration */}
        <ModalTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("mobileMenuTriggerAria")}
            className="p-2"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
        </ModalTrigger>

        {/* Accessible Radix modal navigation drawer anchored to the viewport edge */}
        <ModalContent
          title={t("mobileDrawerTitle")}
          description={t("mobileDrawerDesc")}
          closeLabel={t("closeDrawer")}
          size="sm"
          className="fixed inset-y-0 left-0 top-0 bottom-0 h-full w-sidebar max-w-full rounded-none border-y-0 border-l-0 border-r border-border bg-surface shadow-lg"
        >
          <ModalBody className="flex-1 overflow-y-auto px-3 py-4">
            <nav aria-label={t("mobileNavAria")} className="space-y-1">
              {visibleNavItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setOpen(false)}
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
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
