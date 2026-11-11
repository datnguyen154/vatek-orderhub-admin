import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

/**
 * Orders Loading Skeleton — Route Suspension State
 *
 * Rendered by Next.js 15 App Router when the Orders route is suspending or streaming.
 * - Semantic container with role="status", aria-busy="true", and aria-live="polite".
 * - Screen-reader announcement provided via sr-only text, preventing repeated announcements.
 * - Decorative skeleton placeholders are marked aria-hidden="true".
 * - Uses semantic design tokens (bg-muted, rounded-md, animate-pulse, motion-reduce:animate-none).
 * - Matches the existing Orders layout header and documented future table hierarchy (toolbar, headers, rows).
 */
export default async function OrdersLoading() {
  const t = await getTranslations("orders");

  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="space-y-6"
    >
      <span className="sr-only">{t("loadingWorkspace")}</span>

      {/* Header Skeleton */}
      <div className="pb-2 space-y-2" aria-hidden="true">
        <div className="h-5 w-20 rounded-sm bg-muted animate-pulse motion-reduce:animate-none" />
        <div className="h-8 w-36 rounded-md bg-muted animate-pulse motion-reduce:animate-none" />
        <div className="h-4 w-72 max-w-full rounded-md bg-muted animate-pulse motion-reduce:animate-none" />
      </div>

      {/* Orders Container Skeleton */}
      <Card variant="default" size="md" aria-hidden="true">
        <CardHeader className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="h-5 w-40 rounded-md bg-muted animate-pulse motion-reduce:animate-none" />
              <div className="h-4 w-80 max-w-full rounded-md bg-muted animate-pulse motion-reduce:animate-none" />
            </div>
            {/* Toolbar buttons placeholder */}
            <div className="flex items-center gap-2">
              <div className="h-control-sm w-24 rounded-md bg-muted animate-pulse motion-reduce:animate-none" />
              <div className="h-control-sm w-20 rounded-md bg-muted animate-pulse motion-reduce:animate-none" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Skeleton Table Hierarchy */}
          <div className="rounded-md border border-border overflow-hidden">
            {/* Table Header Row Skeleton */}
            <div className="bg-muted/50 p-4 border-b border-border flex items-center justify-between gap-4">
              <div className="h-4 w-20 rounded-sm bg-muted animate-pulse motion-reduce:animate-none" />
              <div className="h-4 w-32 rounded-sm bg-muted animate-pulse motion-reduce:animate-none" />
              <div className="h-4 w-24 rounded-sm bg-muted animate-pulse motion-reduce:animate-none" />
              <div className="h-4 w-20 rounded-sm bg-muted animate-pulse motion-reduce:animate-none" />
              <div className="h-4 w-16 rounded-sm bg-muted animate-pulse motion-reduce:animate-none" />
              <div className="h-4 w-16 rounded-sm bg-muted animate-pulse motion-reduce:animate-none" />
            </div>

            {/* Table Body Skeleton Rows */}
            <div className="divide-y divide-border">
              {[1, 2, 3, 4, 5].map((row) => (
                <div
                  key={row}
                  className="p-4 flex items-center justify-between gap-4"
                >
                  <div className="h-4 w-20 rounded-sm bg-muted animate-pulse motion-reduce:animate-none" />
                  <div className="h-4 w-36 rounded-sm bg-muted animate-pulse motion-reduce:animate-none" />
                  <div className="h-4 w-24 rounded-sm bg-muted animate-pulse motion-reduce:animate-none" />
                  <div className="h-4 w-20 rounded-sm bg-muted animate-pulse motion-reduce:animate-none" />
                  <div className="h-4 w-16 rounded-sm bg-muted animate-pulse motion-reduce:animate-none" />
                  <div className="h-4 w-12 rounded-sm bg-muted animate-pulse motion-reduce:animate-none" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
