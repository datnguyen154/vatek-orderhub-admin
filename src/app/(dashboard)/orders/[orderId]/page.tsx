import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getDemoSessionFromCookies } from "@/lib/auth/demo-session";
import { OrderDetail } from "@/features/orders/components/order-detail";

interface OrderDetailPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { orderId } = await params;
  const t = await getTranslations("orders.detail");
  return {
    title: `${orderId} — ${t("title")} — OrderHub Admin Console`,
    description: t("summary.title"),
  };
}

/**
 * Order Detail Route — Server Component
 *
 * Verifies authenticated session, derives active user role,
 * and renders the client OrderDetail interactive island.
 */
export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { orderId } = await params;
  const session = await getDemoSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  return <OrderDetail orderId={orderId} role={session.role} />;
}
