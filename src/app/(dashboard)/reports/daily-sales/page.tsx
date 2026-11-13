import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getDemoSessionFromCookies } from "@/lib/auth/demo-session";
import { hasPermission } from "@/features/auth/types";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { DailySalesReport } from "@/features/reports/components/daily-sales-report";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("reports.daily");
  return {
    title: `${t("title")} — OrderHub Admin Console`,
    description: t("description"),
  };
}

/**
 * Daily Sales Report Page — Server Component
 *
 * Implements server-side role permission guard:
 * - If current role lacks reports:view permission (e.g. viewer), renders an accessible
 *   "no access" card with return link; does not render the interactive report island.
 * - If role has reports:view (e.g. admin, staff), renders the DailySalesReport island.
 */
export default async function DailySalesPage() {
  const t = await getTranslations("reports.daily");
  const session = await getDemoSessionFromCookies();
  const canView = session ? hasPermission(session.role, "reports:view") : false;

  if (!canView || !session) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card variant="default">
          <CardHeader>
            <h1 className="text-xl font-semibold leading-7 tracking-tight text-foreground">
              {t("noAccess.title")}
            </h1>
            <CardDescription>{t("noAccess.description")}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link
              href="/orders"
              className={buttonVariants({ variant: "secondary", size: "md" })}
            >
              {t("noAccess.backToOrders")}
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto p-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      }
    >
      <DailySalesReport role={session.role} />
    </Suspense>
  );
}
