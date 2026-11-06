import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign in — OrderHub Admin Console",
  description: "Sign in to OrderHub B2B Admin Console",
};

export default function LoginPage() {
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
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-muted bg-primary-muted/20 px-3 py-1 text-caption font-medium text-primary mb-3">
                <span
                  className="inline-block h-2 w-2 rounded-full bg-primary"
                  aria-hidden="true"
                />
                <span>B2B Console Preview</span>
              </div>
              <h1
                id="intro-heading"
                className="text-page-title text-foreground font-semibold tracking-tight"
              >
                OrderHub Admin Console
              </h1>
              <p className="mt-3 text-body text-muted-foreground max-w-lg leading-relaxed">
                Centralized B2B fulfillment, inventory orchestration, and
                operational visibility across partner networks. Built for
                high-density operational workflows.
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
                    Real-time Fulfillment:
                  </strong>{" "}
                  <span className="text-muted-foreground">
                    Track orders seamlessly from pending to fulfilled across all
                    channels.
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
                    Access Control (Planned):
                  </strong>{" "}
                  <span className="text-muted-foreground">
                    Role-based authorization is not yet implemented; this view
                    serves purely as an unauthenticated UI preview.
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
                    High-Density UI:
                  </strong>{" "}
                  <span className="text-muted-foreground">
                    Accessible, keyboard-navigable primitives optimized for
                    daily administrative tasks.
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
              <span>
                Session 04 UI Preview &bull; Authentication backend not
                connected
              </span>
            </div>
          </section>

          {/* Form Card (Desktop right column / Mobile centered stack) */}
          <section
            aria-labelledby="form-heading"
            className="lg:col-span-5 flex justify-center"
          >
            <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 sm:p-8 shadow-sm">
              <div className="mb-6">
                <h2
                  id="form-heading"
                  className="text-section-title font-semibold text-foreground"
                >
                  Sign in to your account
                </h2>
                <p className="mt-1 text-body text-muted-foreground">
                  Enter any demo credentials to test client-side validation.
                </p>
              </div>

              <LoginForm />

              <p className="mt-6 text-center text-caption text-muted-foreground">
                Demo environment for capstone evaluation. No credentials are
                stored.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
