import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { PreferencesForm } from "@/features/preferences/components/preferences-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("preferences");
  return {
    title: `${t("title")} — OrderHub Admin Console`,
    description: t("description"),
  };
}

/**
 * Preferences Workspace Page — Server Component
 *
 * Implements the authenticated Preferences workspace:
 * - Server Component preserving SEO metadata and authenticated dashboard shell.
 * - Renders localized page header and accessible interactive PreferencesForm client island.
 * - Manages default Orders filters, light/dark/system theme, and English/Vietnamese language selection.
 */
export default async function PreferencesPage() {
  const t = await getTranslations("preferences");

  return (
    <div className="space-y-6">
      {/* Page Header */}
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

      {/* Interactive Preferences Form */}
      <PreferencesForm />
    </div>
  );
}
