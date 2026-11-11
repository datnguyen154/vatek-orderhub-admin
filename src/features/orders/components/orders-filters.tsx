/**
 * OrderHub Admin Console — Orders Filters Component
 *
 * Provides URL-backed filter controls for:
 * - Debounced order-code search
 * - Order status dropdown
 * - Deterministic date-range selection (From / To)
 * - Clear filters affordance
 *
 * Adheres to WCAG 2.1 AA with persistent labels and visible focus rings.
 */

"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ORDER_STATUSES, type OrderStatus } from "../types";

export interface OrdersFiltersProps {
  status: string;
  search: string;
  startDate: string;
  endDate: string;
  hasStatusParam?: boolean;
  hasSearchParam?: boolean;
  hasStartDateParam?: boolean;
  hasEndDateParam?: boolean;
  onFilterChange: (updates: {
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) => void;
  onResetFilters: () => void;
  disabled?: boolean;
}

export function OrdersFilters({
  status,
  search,
  startDate,
  endDate,
  onFilterChange,
  onResetFilters,
  disabled = false,
}: OrdersFiltersProps) {
  const t = useTranslations("orders.filters");
  const tStatus = useTranslations("orders.status");

  // Local state for debounced search and immediate local input synchronization
  const [localSearch, setLocalSearch] = useState(search);
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const [, startTransition] = useTransition();

  // Keep local search term synchronized if URL search param changes externally
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    setLocalStartDate(startDate);
  }, [startDate]);

  useEffect(() => {
    setLocalEndDate(endDate);
  }, [endDate]);

  // Debounce search input updates (350ms) to avoid dispatching a request on every keystroke
  useEffect(() => {
    if (localSearch === search) {
      return;
    }

    const timer = setTimeout(() => {
      startTransition(() => {
        onFilterChange({
          search: localSearch,
        });
      });
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [localSearch, search, onFilterChange]);

  const handleStartDateChange = (val: string) => {
    setLocalStartDate(val);
    onFilterChange({
      startDate: val,
    });
  };

  const handleEndDateChange = (val: string) => {
    setLocalEndDate(val);
    onFilterChange({
      endDate: val,
    });
  };

  const hasActiveFilters = Boolean(
    status || localSearch || localStartDate || localEndDate
  );

  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* 1. Order Code Search */}
        <div className="space-y-1.5">
          <label
            htmlFor="orders-filter-search"
            className="block text-caption font-medium text-foreground"
          >
            {t("searchLabel")}
          </label>
          <Input
            id="orders-filter-search"
            type="search"
            placeholder={t("searchPlaceholder")}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            disabled={disabled}
            size="sm"
            className="w-full"
          />
        </div>

        {/* 2. Status Dropdown */}
        <div className="space-y-1.5">
          <label
            htmlFor="orders-filter-status"
            className="block text-caption font-medium text-foreground"
          >
            {t("statusLabel")}
          </label>
          <Select
            id="orders-filter-status"
            value={status}
            onChange={(e) =>
              onFilterChange({
                status: e.target.value,
              })
            }
            disabled={disabled}
            size="sm"
            className="w-full capitalize"
          >
            <option value="">{t("allStatuses")}</option>
            {ORDER_STATUSES.map((s: OrderStatus) => (
              <option key={s} value={s} className="capitalize">
                {tStatus(s)}
              </option>
            ))}
          </Select>
        </div>

        {/* 3. From Date */}
        <div className="space-y-1.5">
          <label
            htmlFor="orders-filter-start-date"
            className="block text-caption font-medium text-foreground"
          >
            {t("startDateLabel")}
          </label>
          <Input
            id="orders-filter-start-date"
            type="date"
            value={localStartDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            disabled={disabled}
            size="sm"
            className="w-full"
          />
        </div>

        {/* 4. To Date & Reset */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="orders-filter-end-date"
              className="block text-caption font-medium text-foreground"
            >
              {t("endDateLabel")}
            </label>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-caption font-medium text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm transition-colors"
              >
                {t("clearAll")}
              </button>
            )}
          </div>
          <Input
            id="orders-filter-end-date"
            type="date"
            value={localEndDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            disabled={disabled}
            size="sm"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
