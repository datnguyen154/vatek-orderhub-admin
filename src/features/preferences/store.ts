import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface DefaultFilters {
  status: string;
  search: string;
  startDate: string;
  endDate: string;
}

export type ThemePreference = "light" | "dark" | "system";
export type LocalePreference = "en" | "vi";

export interface PreferencesState {
  theme: ThemePreference;
  locale: LocalePreference;
  defaultFilters: DefaultFilters;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  setTheme: (theme: ThemePreference) => void;
  setLocale: (locale: LocalePreference) => void;
  setDefaultFilters: (filters: Partial<DefaultFilters>) => void;
  resetDefaultFilters: () => void;
  resetPreferences: () => void;
}

export const INITIAL_DEFAULT_FILTERS: DefaultFilters = {
  status: "",
  search: "",
  startDate: "",
  endDate: "",
};

export const INITIAL_PREFERENCES = {
  theme: "system" as ThemePreference,
  locale: "en" as LocalePreference,
  defaultFilters: INITIAL_DEFAULT_FILTERS,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...INITIAL_PREFERENCES,
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
      setDefaultFilters: (filters) =>
        set((state) => ({
          defaultFilters: {
            ...state.defaultFilters,
            ...filters,
          },
        })),
      resetDefaultFilters: () =>
        set({
          defaultFilters: { ...INITIAL_DEFAULT_FILTERS },
        }),
      resetPreferences: () =>
        set({
          ...INITIAL_PREFERENCES,
          hasHydrated: true,
        }),
    }),
    {
      name: "orderhub_preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        locale: state.locale,
        defaultFilters: state.defaultFilters,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
