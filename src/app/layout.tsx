import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale, getMessages } from "next-intl/server";
import { MockProvider } from "@/components/providers/mock-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { InternationalizationProvider } from "@/components/providers/internationalization-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "OrderHub Admin Console",
  description: "B2B Admin Console for OrderHub",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <InternationalizationProvider locale={locale} messages={messages}>
            <MockProvider>
              <QueryProvider>{children}</QueryProvider>
            </MockProvider>
          </InternationalizationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
