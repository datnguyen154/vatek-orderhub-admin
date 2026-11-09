"use client";

import { useActionState, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  validateLoginForm,
  type LoginFormValues,
  type LoginFormErrors,
} from "../validation";
import { loginAction, type LoginActionResult } from "../actions";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<
    LoginActionResult,
    FormData
  >(loginAction, {});

  const [values, setValues] = useState<LoginFormValues>({
    email: "",
    password: "",
  });
  const [clientErrors, setClientErrors] = useState<LoginFormErrors>({});

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Combined errors: client validation overrides or server action feedback
  const errors: LoginFormErrors = {
    ...state?.errors,
    ...clientErrors,
  };

  const handleEmailChange = (nextEmail: string) => {
    setValues((prev) => ({ ...prev, email: nextEmail }));
    if (clientErrors.email || state?.errors?.email) {
      setClientErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (nextPassword: string) => {
    setValues((prev) => ({ ...prev, password: nextPassword }));
    if (clientErrors.password || state?.errors?.password) {
      setClientErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (isPending) {
      e.preventDefault();
      return;
    }

    const validation = validateLoginForm(values);

    if (!validation.isValid) {
      e.preventDefault();
      setClientErrors(validation.errors);

      // Focus the first invalid field per accessibility requirements
      if (validation.errors.email) {
        emailInputRef.current?.focus();
      } else if (validation.errors.password) {
        passwordInputRef.current?.focus();
      }
      return;
    }

    setClientErrors({});
  };

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6"
    >
      {/* Server error alert banner if authentication service fails closed */}
      {state?.serverError && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-md border border-destructive/30 bg-destructive-muted p-4"
        >
          <div className="flex items-start gap-3">
            <span
              className="mt-1 inline-block h-2 w-2 rounded-full bg-destructive"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="text-body-medium font-semibold text-destructive">
                Authentication Notice
              </p>
              <p className="text-caption text-destructive-muted-foreground">
                {state.serverError}
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
          disabled={isPending}
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
          disabled={isPending}
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
          disabled={isPending}
          loading={isPending}
          className="w-full"
        >
          {isPending ? "Signing in..." : "Sign in to Console"}
        </Button>
      </div>

      {/* Demo guidance reference block with base Card primitive */}
      <Card variant="muted" size="sm" className="text-center">
        <p className="text-caption font-medium text-foreground">
          Demo Mode Session
        </p>
        <p className="mt-1 text-caption text-muted-foreground">
          Enter any valid email and 8+ character password to establish a signed
          demo session.
        </p>
      </Card>
    </form>
  );
}
