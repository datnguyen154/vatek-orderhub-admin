import type { Metadata } from "next";
import Link from "next/link";
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
import { CreateOrderWizard } from "@/features/orders/components/create-order-wizard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("orders.create");
  return {
    title: `${t("title")} — OrderHub Admin Console`,
    description: t("description"),
  };
}

/**
 * Create Order Workspace Route — Server Component
 *
 * Implements server-side role permission guard:
 * - If current role lacks orders:create permission (e.g. viewer), renders an accessible
 *   "no permission" card with return link; does not render the interactive form.
 * - If role has orders:create (e.g. admin, staff), renders the multi-step CreateOrderWizard.
 */
export default async function NewOrderPage() {
  const t = await getTranslations("orders.create");
  const session = await getDemoSessionFromCookies();
  const canCreate = session
    ? hasPermission(session.role, "orders:create")
    : false;

  if (!canCreate) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card variant="default">
          <CardHeader>
            <h1 className="text-xl font-semibold leading-7 tracking-tight text-foreground">
              {t("noPermission.title")}
            </h1>
            <CardDescription>{t("noPermission.description")}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link
              href="/orders"
              className={buttonVariants({ variant: "secondary", size: "md" })}
            >
              {t("noPermission.backToOrders")}
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href="/orders"
          className={`${buttonVariants({ variant: "ghost", size: "sm" })} gap-1.5 -ml-3 mb-2 text-muted-foreground hover:text-foreground inline-flex items-center`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          {t("backToOrders")}
        </Link>
        <header className="pb-2">
          <h1 className="text-page-title font-semibold text-foreground tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-1 text-body text-muted-foreground">
            {t("description")}
          </p>
        </header>
      </div>

      <CreateOrderWizard />
    </div>
  );
}
