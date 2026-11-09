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
  title: "Orders — OrderHub Admin Console",
  description: "Fulfillment and lifecycle operations for customer orders",
};

/**
 * Orders Workspace Page — Server Component
 *
 * Minimal server-rendered destination establishing the app shell destination.
 */
export default function OrdersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="neutral" size="sm">
              Fulfillment
            </Badge>
          </div>
          <h1 className="text-page-title font-semibold text-foreground tracking-tight">
            Orders
          </h1>
          <p className="mt-1 text-body text-muted-foreground">
            Manage customer orders, track fulfillment states, and review
            shipments.
          </p>
        </div>
      </header>

      {/* Orders Workspace Status Card */}
      <Card variant="default" size="md">
        <CardHeader>
          <CardTitle>Orders Overview</CardTitle>
          <CardDescription>
            Monitor order processing, view incoming shipments, and manage
            fulfillment status across partner distribution channels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-body text-muted-foreground">
            No active order filters applied. Real-time fulfillment data and
            search tools will populate here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
