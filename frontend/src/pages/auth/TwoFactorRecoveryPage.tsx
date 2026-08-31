import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/errors";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";

export function TwoFactorRecoveryPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleConfirm() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.post("/auth/2fa/recovery/confirm", { token });
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-navy px-4">
      <Card className="max-w-md w-full text-center">
        <Logo />
        <h1 className="font-display text-xl font-semibold mt-6 mb-2">Account recovery</h1>
        {message ? (
          <p className="text-sm text-accent-teal">{message} Redirecting to login…</p>
        ) : (
          <>
            <p className="text-sm text-standby-slate mb-6">
              Click below to disable two-factor authentication on your account. You'll be able to log in with just
              your password and set up 2FA again afterward.
            </p>
            {error && <p className="text-sm text-signal-red mb-4">{error}</p>}
            <Button onClick={handleConfirm} isLoading={isLoading}>
              Disable two-factor authentication
            </Button>
          </>
        )}
        <Link to="/login" className="inline-block mt-6 text-accent-teal font-medium text-sm">
          Back to login
        </Link>
      </Card>
    </div>
  );
}
