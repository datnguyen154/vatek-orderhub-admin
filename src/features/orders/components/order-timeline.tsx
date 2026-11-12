/**
 * OrderHub Admin Console — Order Timeline Component
 *
 * Renders an accessible, chronological audit timeline for order life-cycle events:
 * - Semantic `<ol>` container with oldest event first.
 * - Localized event messages with parameter substitution (status names, filenames).
 * - Explicit `<time dateTime>` elements with formatted locale date-times.
 * - Semantic actor role badges (system, admin, staff, viewer).
 */

"use client";

import { useTranslations, useLocale } from "next-intl";
import type { TimelineEvent } from "../types";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface OrderTimelineProps {
  timeline: TimelineEvent[];
}

function formatTimelineDateTime(isoDate: string, locale = "en-US"): string {
  try {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
      return isoDate;
    }
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return isoDate;
  }
}

export function OrderTimeline({ timeline }: OrderTimelineProps) {
  const t = useTranslations("orders.detail.timeline");
  const tActors = useTranslations("orders.detail.timeline.actors");
  const tStatus = useTranslations("orders.status");
  const locale = useLocale();

  // Sort chronological: oldest first
  const sortedEvents = [...timeline].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );

  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <ol className="relative border-l border-border ml-3 space-y-6 py-2">
            {sortedEvents.map((event, idx) => {
              let description = "";
              if (event.type === "created") {
                description = t("eventCreated");
              } else if (event.type === "status_changed") {
                const fromText = event.fromStatus
                  ? tStatus(event.fromStatus)
                  : "";
                const toText = event.toStatus ? tStatus(event.toStatus) : "";
                description = t("eventStatusChanged", {
                  from: fromText,
                  to: toText,
                });
              } else if (event.type === "invoice_uploaded") {
                description = t("eventInvoiceUploaded", {
                  fileName: event.fileName || "",
                });
              }

              const actorLabel =
                event.actorRole in tActors
                  ? tActors(event.actorRole as any)
                  : event.actorRole;

              return (
                <li key={event.id || idx} className="ml-6 relative">
                  {/* Timeline bullet marker */}
                  <span className="absolute -left-9 flex h-5 w-5 items-center justify-center rounded-full bg-surface border border-border text-primary ring-4 ring-background">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">
                        {description}
                      </span>
                      <Badge variant="neutral" size="sm">
                        {actorLabel}
                      </Badge>
                    </div>

                    <time
                      dateTime={event.at}
                      className="text-xs text-muted-foreground"
                    >
                      {formatTimelineDateTime(event.at, locale)}
                    </time>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
