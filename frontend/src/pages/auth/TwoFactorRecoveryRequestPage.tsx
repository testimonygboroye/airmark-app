import { useState } from "react";
import { Link } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/errors";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";

export function TwoFactorRecoveryRequestPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.post("/auth/2fa/recovery/request", { email, password });
      setMessage(res.data.message);
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
        <h1 className="font-display text-xl font-semibold mt-6 mb-1">Recover 2FA access</h1>
        <p className="text-sm text-standby-slate mb-6">
          Enter your account email and password to receive a link that disables two-factor authentication.
        </p>

        {message ? (
          <p className="text-sm text-accent-teal">{message}</p>
        ) : (
          <div className="flex flex-col gap-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <PasswordInput label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="text-sm text-signal-red">{error}</p>}
            <Button onClick={handleSubmit} isLoading={isLoading} disabled={!email || !password}>
              Send recovery link
            </Button>
          </div>
        )}

        <Link to="/login" className="inline-block mt-6 text-accent-teal font-medium text-sm">Back to login</Link>
      </Card>
    </div>
  );
}
