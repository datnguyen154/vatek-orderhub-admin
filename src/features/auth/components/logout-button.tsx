"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";
import { setAccessToken } from "@/features/auth/token-store";

/**
 * Client leaf component embedded in the Server Component Topbar.
 * Handles client sign out:
 * - Shows loading/pending state while executing
 * - Clears in-memory demo access token
 * - Calls server action to clear httpOnly session cookie
 * - Hard-navigates to `/login` via window.location.replace, dropping TanStack Query cache
 */
export function LogoutButton() {
  const t = useTranslations("nav");
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    if (isPending) return;
    setIsPending(true);

    try {
      // Clear in-memory demo access token
      setAccessToken(null);
      // Clear server-side httpOnly session cookie
      await logoutAction();
    } catch {
      // Proceed even if server action fails
    } finally {
      // Hard navigation drops in-memory QueryClient cache and resets client state
      window.location.replace("/login");
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isPending}
      loading={isPending}
      onClick={handleLogout}
      aria-label={t("signOutAria")}
    >
      {t("signOut")}
    </Button>
  );
}
