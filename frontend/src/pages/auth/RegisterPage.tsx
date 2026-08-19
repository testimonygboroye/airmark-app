import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/brand/Logo";

export function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await apiClient.post("/auth/register", form);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-navy px-4">
        <Card className="max-w-md w-full text-center">
          <Logo />
          <h1 className="font-display text-xl font-semibold mt-6 mb-2">
            Check your inbox
          </h1>
          <p className="text-sm text-standby-slate">
            We sent a verification link to <strong>{form.email}</strong>.
            Click it to activate your account, then come back to log in.
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
        <h1 className="font-display text-xl font-semibold mt-6 mb-1">
          Create your account
        </h1>
        <p className="text-sm text-standby-slate mb-6">
          Coordinate your live production team in minutes.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <Input
              label="Last name"
              required
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <p className="text-xs text-standby-slate -mt-2">
            At least 8 characters, with an uppercase letter, lowercase letter, and a number.
          </p>

          {error && <p className="text-sm text-signal-red">{error}</p>}

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
