import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-page-title text-foreground">{t("title")}</h1>
        <p className="mt-3 text-body text-muted-foreground">
          {t("description")}
        </p>
        <div className="mt-6 rounded-md border border-border bg-muted p-3 text-caption font-mono text-muted-foreground">
          {t("status")}
        </div>
      </div>
    </main>
  );
}
