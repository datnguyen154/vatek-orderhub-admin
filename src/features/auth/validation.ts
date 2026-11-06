export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: LoginFormErrors;
}

/**
 * Basic client-side email format regex pattern checking `user@domain.tld` structure (not full RFC 5322).
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates login form inputs with strict typing and no third-party schema dependencies.
 * Passwords are never logged, persisted, or stored.
 */
export function validateLoginForm(values: LoginFormValues): ValidationResult {
  const errors: LoginFormErrors = {};
  const trimmedEmail = values.email.trim();

  if (!trimmedEmail) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email =
      "Please enter a valid email address (e.g., name@company.com).";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
