import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/errors";
import { validateEmail } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/brand/Logo";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(value: string) {
    setEmail(value);
    if (attempted) setError(validateEmail(value));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setAttempted(true);
    const validationError = validateEmail(email);
    setError(validationError);
    if (validationError) return;

    setIsLoading(true);
    try {
      await apiClient.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-navy px-4">
      <Card className="max-w-md w-full">
        <Logo />
        <h1 className="font-display text-xl font-semibold mt-6 mb-1">Reset your password</h1>

        {sent ? (
          <p className="text-sm text-standby-slate mt-4">
            If <strong>{email}</strong> is registered, a reset link is on its way. Check your
            spam folder if it doesn't arrive within a few minutes.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4" noValidate>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => handleChange(e.target.value)}
              error={error ?? undefined}
            />
            <Button type="submit" isLoading={isLoading}>
              Send reset link
            </Button>
          </form>
        )}

        <p className="text-sm text-standby-slate text-center mt-6">
          <Link to="/login" className="text-accent-teal font-medium">
            Back to login
          </Link>
        </p>
      </Card>
    </div>
  );
}
