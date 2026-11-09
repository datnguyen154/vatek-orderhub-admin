"use client";

import { FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  validateLoginForm,
  type LoginFormValues,
  type LoginFormErrors,
} from "../validation";

export function LoginForm() {
  const [values, setValues] = useState<LoginFormValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoNotice, setDemoNotice] = useState<{
    submittedEmail: string;
    timestamp: string;
  } | null>(null);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleEmailChange = (nextEmail: string) => {
    setValues((prev) => ({ ...prev, email: nextEmail }));
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (nextPassword: string) => {
    setValues((prev) => ({ ...prev, password: nextPassword }));
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setDemoNotice(null);

    const validation = validateLoginForm(values);

    if (!validation.isValid) {
      setErrors(validation.errors);

      // Focus the first invalid field per accessibility requirements
      if (validation.errors.email) {
        emailInputRef.current?.focus();
      } else if (validation.errors.password) {
        passwordInputRef.current?.focus();
      }
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      // Simulate realistic submission latency without persisting credentials
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Display demo response confirming successful validation
      // Password is immediately cleared from memory; never logged, persisted, or transmitted
      const validatedEmail = values.email.trim();
      setValues({ email: validatedEmail, password: "" });
      setDemoNotice({
        submittedEmail: validatedEmail,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Demo status alert banner */}
      {demoNotice && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-md border border-primary-muted bg-primary-muted/30 p-4"
        >
          <div className="flex items-start gap-3">
            <span
              className="mt-1 inline-block h-2 w-2 rounded-full bg-primary"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="text-body-medium font-semibold text-primary">
                Demo Mode Notice
              </p>
              <p className="text-body text-muted-foreground">
                Client validation passed successfully. Authentication service is
                currently not connected (scheduled for Session 07 / D9).
                Credentials were not sent, stored, or logged.
              </p>
              <p className="text-caption font-mono text-muted-foreground">
                Validated account: {demoNotice.submittedEmail} at{" "}
                {demoNotice.timestamp}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Email input field with base primitive */}
      <div>
        <label
          htmlFor="login-email"
          className="block text-body-medium font-medium text-foreground mb-2"
        >
          Email address
        </label>
        <Input
          ref={emailInputRef}
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => handleEmailChange(e.target.value)}
          disabled={isSubmitting}
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "login-email-error" : undefined}
          placeholder="name@company.com"
        />
        {errors.email && (
          <p
            id="login-email-error"
            role="alert"
            className="mt-1 text-caption text-destructive"
          >
            {errors.email}
          </p>
        )}
      </div>

      {/* Password input field with base primitive */}
      <div>
        <label
          htmlFor="login-password"
          className="block text-body-medium font-medium text-foreground mb-2"
        >
          Password
        </label>
        <Input
          ref={passwordInputRef}
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          disabled={isSubmitting}
          aria-invalid={errors.password ? "true" : "false"}
          aria-describedby={
            errors.password ? "login-password-error" : undefined
          }
          placeholder="••••••••"
        />
        {errors.password && (
          <p
            id="login-password-error"
            role="alert"
            className="mt-1 text-caption text-destructive"
          >
            {errors.password}
          </p>
        )}
      </div>

      {/* Submit button with base primitive */}
      <div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          loading={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Signing in..." : "Sign in to Console"}
        </Button>
      </div>

      {/* Demo guidance reference block with base Card primitive */}
      <Card variant="muted" size="sm" className="text-center">
        <p className="text-caption font-medium text-foreground">
          Demo Mode Preview
        </p>
        <p className="mt-1 text-caption text-muted-foreground">
          Client validation only. Enter any valid email and 8+ character
          password.
        </p>
      </Card>
    </form>
  );
}
