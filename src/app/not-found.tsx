import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

/**
 * Root Not Found Page — Server Component
 *
 * Rendered by Next.js App Router when an unmatched URL is requested.
 * - Semantic <main> landmark centered on the page canvas.
 * - Accessible <h1> heading with clear status badge.
 * - Concise, calm explanation with zero leaked implementation details or stack traces.
 * - Visible-focus call-to-action button leading back to the valid /orders route.
 */
export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card variant="default" size="lg" className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <Badge variant="neutral" size="sm">
              404
            </Badge>
          </div>
          <h1 className="text-page-title font-semibold text-foreground tracking-tight">
            Page not found
          </h1>
          <CardDescription className="mt-2">
            The page you are looking for does not exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <Link
            href="/orders"
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            Return to Orders
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
