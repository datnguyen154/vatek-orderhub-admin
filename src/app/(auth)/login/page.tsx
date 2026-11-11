import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/features/auth/components/login-form";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return {
    title: `${t("formTitle")} — OrderHub Admin Console`,
    description: t("description"),
  };
}

export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-12">
      <div className="w-full max-w-container-max mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Introductory Panel (Desktop left column / Mobile header stack) */}
          <section
            aria-labelledby="intro-heading"
            className="lg:col-span-7 flex flex-col justify-center space-y-6"
          >
            <div>
              <Badge variant="neutral" size="md" className="mb-3">
                <span
                  className="inline-block h-2 w-2 rounded-full bg-primary"
                  aria-hidden="true"
                />
                <span>{t("previewBadge")}</span>
              </Badge>
              <h1
                id="intro-heading"
                className="text-page-title text-foreground font-semibold tracking-tight"
              >
                {t("title")}
              </h1>
              <p className="mt-3 text-body text-muted-foreground max-w-lg">
                {t("description")}
              </p>
            </div>

            {/* Key operational pillars */}
            <ul
              className="space-y-4 max-w-lg text-body text-foreground"
              role="list"
            >
              <li className="flex items-start gap-3">
                <span
                  className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-muted text-primary"
                  aria-hidden="true"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <div>
                  <strong className="font-semibold text-foreground">
                    {t("pillars.fulfillmentTitle")}
                  </strong>{" "}
                  <span className="text-muted-foreground">
                    {t("pillars.fulfillmentDesc")}
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span
                  className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-muted text-primary"
                  aria-hidden="true"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <div>
                  <strong className="font-semibold text-foreground">
                    {t("pillars.accessTitle")}
                  </strong>{" "}
                  <span className="text-muted-foreground">
                    {t("pillars.accessDesc")}
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span
                  className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-muted text-primary"
                  aria-hidden="true"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <div>
                  <strong className="font-semibold text-foreground">
                    {t("pillars.uiTitle")}
                  </strong>{" "}
                  <span className="text-muted-foreground">
                    {t("pillars.uiDesc")}
                  </span>
                </div>
              </li>
            </ul>

            {/* Demo status indicator */}
            <div className="flex items-center gap-2 pt-2 text-caption text-muted-foreground">
              <span
                className="inline-block h-2 w-2 rounded-full bg-primary"
                aria-hidden="true"
              />
              <span>{t("statusIndicator")}</span>
            </div>
          </section>

          {/* Form Card (Desktop right column / Mobile centered stack) */}
          <section
            aria-labelledby="form-heading"
            className="lg:col-span-5 flex justify-center"
          >
            <Card
              variant="default"
              size="md"
              className="w-full max-w-md sm:p-8"
            >
              <CardHeader className="p-0 mb-6">
                <h2
                  id="form-heading"
                  className="text-section-title font-semibold text-foreground"
                >
                  {t("formTitle")}
                </h2>
                <CardDescription className="mt-1 text-body text-muted-foreground">
                  {t("formDescription")}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <LoginForm />
              </CardContent>

              <CardFooter className="p-0 mt-6 justify-center">
                <p className="text-center text-caption text-muted-foreground">
                  {t("formFooter")}
                </p>
              </CardFooter>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
