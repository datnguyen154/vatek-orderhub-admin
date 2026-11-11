"use client";

import type { ReactNode } from "react";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";

interface InternationalizationProviderProps {
  children: ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
}

export function InternationalizationProvider({
  children,
  locale,
  messages,
}: InternationalizationProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  );
}
