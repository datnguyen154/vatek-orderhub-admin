import type { Metadata } from "next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Preferences — OrderHub Admin Console",
  description: "Console configuration and operational preferences",
};

/**
 * Preferences Workspace Page — Server Component Placeholder
 *
 * Implemented as a Server Component placeholder to verify persistent shell navigation.
 * States plainly that preferences are planned for Week 3.
 * Does not imply persistence or add settings behavior.
 */
export default function PreferencesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="neutral" size="sm">
              Settings
            </Badge>
          </div>
          <h1 className="text-page-title font-semibold text-foreground tracking-tight">
            Preferences
          </h1>
          <p className="mt-1 text-body text-muted-foreground">
            Console configuration and operational preferences.
          </p>
        </div>
      </header>

      {/* Preferences Placeholder Card */}
      <Card variant="default" size="md">
        <CardHeader>
          <CardTitle>Preferences Overview</CardTitle>
          <CardDescription>
            Configure console workspace preferences, notification settings, and
            default operational filters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-body text-muted-foreground">
            Preferences management and persistent configuration settings are
            planned for Week 3. No preferences are active or persisted at this
            time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
