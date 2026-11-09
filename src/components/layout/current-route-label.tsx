"use client";

import { usePathname } from "next/navigation";

const routeLabels: Record<string, string> = {
  "/orders": "Orders",
  "/preferences": "Preferences",
};

/**
 * Current Route Label — Client Leaf Component
 *
 * Smallest possible client boundary to display the active route name
 * in the Topbar breadcrumb based on client-side navigation.
 * Keeps Topbar itself as a Server Component and preserves the Server Action logout flow.
 */
export function CurrentRouteLabel() {
  const pathname = usePathname();

  let label = "Orders";
  if (pathname) {
    if (pathname.startsWith("/preferences")) {
      label = "Preferences";
    } else if (pathname.startsWith("/orders")) {
      label = "Orders";
    } else if (routeLabels[pathname]) {
      label = routeLabels[pathname];
    }
  }

  return <span className="font-medium text-foreground">{label}</span>;
}
