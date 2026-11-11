import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { OrdersList } from "@/features/orders/components/orders-list";

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
 */
export default async function OrdersPage() {
  const t = await getTranslations("orders");

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
      </header>

      {/* Orders Client Data Island */}
      <OrdersList />
    </div>
  );
}
