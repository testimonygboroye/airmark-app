import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/brand/Logo";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient.post("/auth/forgot-password", { email });
    } finally {
      setIsLoading(false);
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-navy px-4">
      <Card className="max-w-md w-full">
        <Logo />
        <h1 className="font-display text-xl font-semibold mt-6 mb-1">
          Reset your password
        </h1>

        {sent ? (
          <p className="text-sm text-standby-slate mt-4">
            If <strong>{email}</strong> is registered, a reset link is on its way.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
