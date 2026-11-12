import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { OrdersList } from "@/features/orders/components/orders-list";
import { getDemoSessionFromCookies } from "@/lib/auth/demo-session";
import { hasPermission } from "@/features/auth/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("orders");
  return {
    title: `${t("title")} — OrderHub Admin Console`,
    description: t("description"),
  };
}

/**
 * Orders Workspace Page — Server Component
 *
 * Composes server-rendered header and client data island for Orders.
 * - Server Component preserves SEO metadata and layout-level static shell.
 * - Client data island (<OrdersList />) handles async fetching via browser MSW.
 * - "New order" button is strictly gated by role permission orders:create.
 */
export default async function OrdersPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const t = await getTranslations("orders");
  const session = await getDemoSessionFromCookies();
  const canCreate = session
    ? hasPermission(session.role, "orders:create")
    : false;

  const searchParams = props.searchParams ? await props.searchParams : {};
  const createVal =
    typeof searchParams.create === "string" ? searchParams.create : "";
  const createParam =
    createVal === "fail" || createVal === "fail-once"
      ? `?create=${createVal}`
      : "";

  return (
    <div className="space-y-6">
      {/* Page Header - Server Rendered */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="neutral" size="sm">
              {t("badge")}
            </Badge>
          </div>
          <h1 className="text-page-title font-semibold text-foreground tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-1 text-body text-muted-foreground">
            {t("description")}
          </p>
        </div>

        {canCreate && (
          <div className="flex items-center">
            <Link
              href={`/orders/new${createParam}`}
              className={buttonVariants({ variant: "primary", size: "md" })}
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {t("createButton")}
            </Link>
          </div>
        )}
      </header>

      {/* Orders Client Data Island */}
      <OrdersList />
    </div>
  );
}
