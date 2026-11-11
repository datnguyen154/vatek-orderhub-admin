import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getDemoSessionFromCookies } from "@/lib/auth/demo-session";
import { Topbar } from "@/components/layout/topbar";
import { Sidebar } from "@/components/layout/sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Dashboard Shell Layout — Server Component
 *
 * Provides the persistent authenticated frame for console routes:
 * 1. Cryptographically verifies the HTTP-only demo session cookie.
 * 2. Redirects unauthenticated or invalid sessions to `/login`.
 * 3. Renders the accessible keyboard skip link, persistent Topbar, and desktop Sidebar.
 * 4. Persists the shell structure without remounting across dashboard route transitions.
 */
export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await getDemoSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  const t = await getTranslations("nav");

  return (
    <div className="min-h-screen bg-background">
      {/* Keyboard accessible skip-to-main link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-md focus:ring-2 focus:ring-focus focus:outline-none"
      >
        {t("skipToMain")}
      </a>

      {/* Persistent top navigation bar */}
      <Topbar userEmail={session.email} />

      {/* Persistent desktop sidebar navigation */}
      <Sidebar />

      {/* Main content landmark */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 lg:pl-sidebar pt-topbar min-h-screen focus:outline-none"
      >
        <div className="p-4 lg:p-6 max-w-container-max mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
