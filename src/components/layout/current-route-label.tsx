"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

/**
 * Current Route Label — Client Leaf Component
 *
 * Smallest possible client boundary to display the active route name
 * in the Topbar breadcrumb based on client-side navigation.
 * Keeps Topbar itself as a Server Component and preserves the Server Action logout flow.
 */
export function CurrentRouteLabel() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  let label = t("orders");
  if (pathname) {
    if (pathname.startsWith("/preferences")) {
      label = t("preferences");
    } else if (pathname.startsWith("/orders")) {
      label = t("orders");
    }
  }

  return <span className="font-medium text-foreground">{label}</span>;
}
