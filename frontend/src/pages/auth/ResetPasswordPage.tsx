import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/brand/Logo";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await apiClient.post("/auth/reset-password", { token, newPassword });
      navigate("/login");
    } catch (err: any) {
      setError(err?.response?.data?.message || "This link is invalid or has expired.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-navy px-4">
      <Card className="max-w-md w-full">
        <Logo />
        <h1 className="font-display text-xl font-semibold mt-6 mb-1">
          Set a new password
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <Input
            label="New password"
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {error && <p className="text-sm text-signal-red">{error}</p>}
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
