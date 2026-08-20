import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/store/authStore";
import { connectSocket } from "@/lib/socketClient";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/brand/Logo";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const justLoggedOut = searchParams.get("loggedOut") === "1";
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const { data } = await apiClient.post("/auth/login", form);
      setAuth(data.data.accessToken, data.data.user);
      connectSocket(data.data.accessToken);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Invalid email or password."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-navy px-4">
      <Card className="max-w-md w-full">
        <Logo />
        <h1 className="font-display text-xl font-semibold mt-6 mb-1">Welcome back</h1>
        <p className="text-sm text-standby-slate mb-6">Log in to your Airmark account.</p>

        {justLoggedOut && (
          <div className="mb-4 rounded-lg bg-accent-teal/10 border border-accent-teal/30 px-4 py-3 text-sm text-accent-teal font-medium">
            You've been logged out successfully.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <PasswordInput
            label="Password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {error && <p className="text-sm text-signal-red">{error}</p>}

          <div className="flex justify-end -mt-2">
            <Link to="/forgot-password" className="text-xs text-accent-teal font-medium">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" isLoading={isLoading}>
            Log in
          </Button>
        </form>

        <p className="text-sm text-standby-slate text-center mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-accent-teal font-medium">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
