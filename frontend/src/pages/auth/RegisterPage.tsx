import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/errors";
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NameInput } from "@/components/ui/NameInput";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/brand/Logo";

interface FormState {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type FieldErrors = Partial<Record<keyof FormState, string | null>>;

export function RegisterPage() {
  const [form, setForm] = useState<FormState>({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function validateField(field: keyof FormState, values: FormState): string | null {
    switch (field) {
      case "firstName":
        return validateName(values.firstName, true);
      case "middleName":
        return validateName(values.middleName, false);
      case "lastName":
        return validateName(values.lastName, true);
      case "email":
        return validateEmail(values.email);
      case "password":
        return validatePassword(values.password);
      case "confirmPassword":
        return validateConfirmPassword(values.password, values.confirmPassword);
      default:
        return null;
    }
  }

  function validateAll(values: FormState): FieldErrors {
    const fields: (keyof FormState)[] = [
      "firstName",
      "middleName",
      "lastName",
      "email",
      "password",
      "confirmPassword",
    ];
    const errors: FieldErrors = {};
    fields.forEach((f) => {
      errors[f] = validateField(f, values);
    });
    return errors;
  }

  function updateField(field: keyof FormState, value: string) {
    const next = { ...form, [field]: value };
    setForm(next);

    // Only live-validate after the first submit attempt — before that,
    // no red borders appear no matter what the user types or skips.
    if (hasAttemptedSubmit) {
      setFieldErrors((prev) => ({ ...prev, [field]: validateField(field, next) }));
      // Confirm-password depends on password's current value too — recheck it live.
      if (field === "password") {
        setFieldErrors((prev) => ({
          ...prev,
          confirmPassword: validateConfirmPassword(value, next.confirmPassword),
        }));
      }
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    setHasAttemptedSubmit(true);

    const errors = validateAll(form);
    setFieldErrors(errors);
    const hasErrors = Object.values(errors).some((err) => err !== null);
    if (hasErrors) return;

    setIsLoading(true);
    try {
      await apiClient.post("/auth/register", {
        firstName: form.firstName,
        middleName: form.middleName || undefined,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setSuccess(true);
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-navy px-4">
        <Card className="max-w-md w-full text-center">
          <Logo />
          <h1 className="font-display text-xl font-semibold mt-6 mb-2">Check your inbox</h1>
          <p className="text-sm text-standby-slate">
            We sent a verification link to <strong>{form.email}</strong>. Click it to activate
            your account, then come back to log in.
          </p>
          <Link to="/login" className="inline-block mt-6 text-accent-teal font-medium text-sm">
            Back to login
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-navy px-4 py-12">
      <Card className="max-w-md w-full">
        <Logo />
        <h1 className="font-display text-xl font-semibold mt-6 mb-1">Create your account</h1>
        <p className="text-sm text-standby-slate mb-6">
          Coordinate your live production team in minutes.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <NameInput
            label="First name"
            value={form.firstName}
            onValueChange={(v) => updateField("firstName", v)}
            error={fieldErrors.firstName}
          />
          <NameInput
            label="Middle name (optional)"
            value={form.middleName}
            onValueChange={(v) => updateField("middleName", v)}
            error={fieldErrors.middleName}
          />
          <NameInput
            label="Last name"
            value={form.lastName}
            onValueChange={(v) => updateField("lastName", v)}
            error={fieldErrors.lastName}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            error={fieldErrors.email ?? undefined}
          />
          <PasswordInput
            label="Password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            error={fieldErrors.password}
          />
          <p className="text-xs text-standby-slate -mt-2">
            At least 8 characters, with an uppercase letter, lowercase letter, number, and special character.
          </p>
          <PasswordInput
            label="Confirm password"
            value={form.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            error={fieldErrors.confirmPassword}
          />

          {serverError && <p className="text-sm text-signal-red">{serverError}</p>}

          <Button type="submit" isLoading={isLoading} className="mt-2">
            Create account
          </Button>
        </form>

        <p className="text-sm text-standby-slate text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-accent-teal font-medium">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
