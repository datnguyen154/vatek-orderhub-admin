"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import {
  usePreferencesStore,
  type ThemePreference,
  type LocalePreference,
} from "../store";
import { ORDER_STATUSES, type OrderStatus } from "@/features/orders/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function PreferencesForm() {
  const router = useRouter();
  const t = useTranslations("preferences");
  const tStatus = useTranslations("orders.status");
  const { theme, setTheme, resolvedTheme } = useTheme();

  const storeTheme = usePreferencesStore((s) => s.theme);
  const storeLocale = usePreferencesStore((s) => s.locale);
  const defaultFilters = usePreferencesStore((s) => s.defaultFilters);
  const setStoreTheme = usePreferencesStore((s) => s.setTheme);
  const setStoreLocale = usePreferencesStore((s) => s.setLocale);
  const setDefaultFilters = usePreferencesStore((s) => s.setDefaultFilters);
  const resetDefaultFilters = usePreferencesStore((s) => s.resetDefaultFilters);
  const resetPreferences = usePreferencesStore((s) => s.resetPreferences);

  // Prevent server/client hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: ThemePreference) => {
    setTheme(newTheme);
    setStoreTheme(newTheme);
  };

  const handleLocaleChange = (newLocale: LocalePreference) => {
    setStoreLocale(newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    router.refresh();
  };

  const handleStatusDefaultChange = (val: string) => {
    setDefaultFilters({ status: val });
  };

  const handleSearchDefaultChange = (val: string) => {
    setDefaultFilters({ search: val });
  };

  const handleStartDateDefaultChange = (val: string) => {
    setDefaultFilters({ startDate: val });
  };

  const handleEndDateDefaultChange = (val: string) => {
    setDefaultFilters({ endDate: val });
  };

  const handleResetDefaults = () => {
    resetDefaultFilters();
  };

  const handleResetAll = () => {
    resetPreferences();
    setTheme("system");
    document.cookie = "NEXT_LOCALE=en;path=/;max-age=31536000;SameSite=Lax";
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* 1. Theme Configuration Card */}
      <Card variant="default" size="md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle>{t("theme.title")}</CardTitle>
              <CardDescription className="mt-1">
                {t("theme.description")}
              </CardDescription>
            </div>
            {mounted && resolvedTheme && (
              <Badge
                variant="neutral"
                size="sm"
                className="self-start sm:self-auto"
              >
                <span>{t("theme.currentActive")}</span>
                <span className="font-semibold uppercase tracking-wide">
                  {resolvedTheme}
                </span>
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-xs space-y-1.5">
            <label
              htmlFor="preference-theme-select"
              className="block text-body-medium font-medium text-foreground"
            >
              {t("theme.label")}
            </label>
            <Select
              id="preference-theme-select"
              value={mounted ? (storeTheme ?? theme ?? "system") : "system"}
              onChange={(e) =>
                handleThemeChange(e.target.value as ThemePreference)
              }
              size="md"
              disabled={!mounted}
            >
              <option value="system">{t("theme.system")}</option>
              <option value="light">{t("theme.light")}</option>
              <option value="dark">{t("theme.dark")}</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 2. Language & Localization Card */}
      <Card variant="default" size="md">
        <CardHeader>
          <CardTitle>{t("locale.title")}</CardTitle>
          <CardDescription className="mt-1">
            {t("locale.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-xs space-y-1.5">
            <label
              htmlFor="preference-locale-select"
              className="block text-body-medium font-medium text-foreground"
            >
              {t("locale.label")}
            </label>
            <Select
              id="preference-locale-select"
              value={mounted ? storeLocale : "en"}
              onChange={(e) =>
                handleLocaleChange(e.target.value as LocalePreference)
              }
              size="md"
              disabled={!mounted}
            >
              <option value="en">{t("locale.en")}</option>
              <option value="vi">{t("locale.vi")}</option>
            </Select>
          </div>
          <p className="text-caption text-muted-foreground">
            {t("locale.preservedNotice")}
          </p>
        </CardContent>
      </Card>

      {/* 3. Default Orders Filters Card */}
      <Card variant="default" size="md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle>{t("filters.title")}</CardTitle>
              <CardDescription className="mt-1">
                {t("filters.description")}
              </CardDescription>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetDefaults}
              disabled={!mounted}
              className="self-start sm:self-auto"
            >
              {t("filters.resetDefaults")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Default Status */}
            <div className="space-y-1.5">
              <label
                htmlFor="preference-default-status"
                className="block text-caption font-medium text-foreground"
              >
                {t("filters.statusLabel")}
              </label>
              <Select
                id="preference-default-status"
                value={mounted ? defaultFilters.status : ""}
                onChange={(e) => handleStatusDefaultChange(e.target.value)}
                size="sm"
                disabled={!mounted}
                className="w-full capitalize"
              >
                <option value="">{t("filters.allStatuses")}</option>
                {ORDER_STATUSES.map((s: OrderStatus) => (
                  <option key={s} value={s} className="capitalize">
                    {tStatus(s)}
                  </option>
                ))}
              </Select>
            </div>

            {/* Default Search */}
            <div className="space-y-1.5">
              <label
                htmlFor="preference-default-search"
                className="block text-caption font-medium text-foreground"
              >
                {t("filters.searchLabel")}
              </label>
              <Input
                id="preference-default-search"
                type="search"
                placeholder={t("filters.searchPlaceholder")}
                value={mounted ? defaultFilters.search : ""}
                onChange={(e) => handleSearchDefaultChange(e.target.value)}
                size="sm"
                disabled={!mounted}
                className="w-full"
              />
            </div>

            {/* Default Start Date */}
            <div className="space-y-1.5">
              <label
                htmlFor="preference-default-start-date"
                className="block text-caption font-medium text-foreground"
              >
                {t("filters.startDateLabel")}
              </label>
              <Input
                id="preference-default-start-date"
                type="date"
                value={mounted ? defaultFilters.startDate : ""}
                onChange={(e) => handleStartDateDefaultChange(e.target.value)}
                size="sm"
                disabled={!mounted}
                className="w-full"
              />
            </div>

            {/* Default End Date */}
            <div className="space-y-1.5">
              <label
                htmlFor="preference-default-end-date"
                className="block text-caption font-medium text-foreground"
              >
                {t("filters.endDateLabel")}
              </label>
              <Input
                id="preference-default-end-date"
                type="date"
                value={mounted ? defaultFilters.endDate : ""}
                onChange={(e) => handleEndDateDefaultChange(e.target.value)}
                size="sm"
                disabled={!mounted}
                className="w-full"
              />
            </div>
          </div>

          <p className="text-caption text-muted-foreground border-t border-border pt-4">
            {t("filters.precedenceNotice")}
          </p>
        </CardContent>
      </Card>

      {/* 4. Action Summary & Global Reset */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <p className="text-caption text-muted-foreground">{t("savedNotice")}</p>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleResetAll}
          disabled={!mounted}
        >
          {t("resetAll")}
        </Button>
      </div>
    </div>
  );
}
