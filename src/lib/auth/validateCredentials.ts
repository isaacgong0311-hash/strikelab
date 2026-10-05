/**
 * Checks for the sign-up and sign-in forms. They run on submit instead of
 * leaving it to the browser, whose validation bubble is unstyled, covers the
 * field it points at, reports one problem at a time and isn't announced
 * reliably by screen readers. Every problem comes back at once so the form can
 * show each beside its field.
 */
export type FieldErrors<K extends string> = Partial<Record<K, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailError(email: string): string | undefined {
  const value = email.trim();
  if (!value) return "Enter your email address.";
  if (!EMAIL.test(value)) return "That doesn't look like an email address. It should look like you@school.edu.";
  return undefined;
}

export interface SignUpFields {
  role: string | null;
  name: string;
  email: string;
  password: string;
}

export function validateSignUp(fields: SignUpFields): FieldErrors<"role" | "name" | "email" | "password"> {
  const errors: FieldErrors<"role" | "name" | "email" | "password"> = {};
  if (!fields.role) errors.role = "Choose whether you're a student or a club leader or teacher.";
  if (!fields.name.trim()) errors.name = "Enter your name.";
  const email = emailError(fields.email);
  if (email) errors.email = email;
  if (fields.password.length < 8) errors.password = "Use at least 8 characters.";
  return errors;
}

export function validateSignIn(fields: { email: string; password: string }): FieldErrors<"email" | "password"> {
  const errors: FieldErrors<"email" | "password"> = {};
  const email = emailError(fields.email);
  if (email) errors.email = email;
  if (!fields.password) errors.password = "Enter your password.";
  return errors;
}
