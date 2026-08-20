import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/errors";
import { validatePassword, validateConfirmPassword } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/brand/Logo";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errors, setErrors] = useState<{ newPassword?: string | null; confirmNewPassword?: string | null }>({});
  const [attempted, setAttempted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handlePasswordChange(value: string) {
    setNewPassword(value);
    if (attempted) {
      setErrors({
        newPassword: validatePassword(value),
        confirmNewPassword: validateConfirmPassword(value, confirmNewPassword),
      });
    }
  }

  function handleConfirmChange(value: string) {
    setConfirmNewPassword(value);
    if (attempted) {
      setErrors((prev) => ({ ...prev, confirmNewPassword: validateConfirmPassword(newPassword, value) }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    setAttempted(true);

    const nextErrors = {
      newPassword: validatePassword(newPassword),
      confirmNewPassword: validateConfirmPassword(newPassword, confirmNewPassword),
    };
    setErrors(nextErrors);
    if (nextErrors.newPassword || nextErrors.confirmNewPassword) return;

    setIsLoading(true);
    try {
      await apiClient.post("/auth/reset-password", { token, newPassword, confirmNewPassword });
      navigate("/login");
    } catch (err) {
      setServerError(getErrorMessage(err, "This link is invalid or has expired."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-navy px-4">
      <Card className="max-w-md w-full">
        <Logo />
        <h1 className="font-display text-xl font-semibold mt-6 mb-1">Set a new password</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4" noValidate>
          <PasswordInput
            label="New password"
            value={newPassword}
            onChange={(e) => handlePasswordChange(e.target.value)}
            error={errors.newPassword}
          />
          <p className="text-xs text-standby-slate -mt-2">
            At least 8 characters, with an uppercase letter, lowercase letter, number, and special character.
          </p>
          <PasswordInput
            label="Confirm new password"
            value={confirmNewPassword}
            onChange={(e) => handleConfirmChange(e.target.value)}
            error={errors.confirmNewPassword}
          />
          {serverError && <p className="text-sm text-signal-red">{serverError}</p>}
          <Button type="submit" isLoading={isLoading}>
            Reset password
          </Button>
        </form>

        <p className="text-sm text-standby-slate text-center mt-6">
          <Link to="/login" className="text-accent-teal font-medium">
            Back to login
          </Link>
        </p>
      </Card>
    </div>
  );
}
