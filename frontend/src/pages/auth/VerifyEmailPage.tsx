import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { apiClient } from "@/lib/apiClient";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/brand/Logo";
import { Spinner } from "@/components/ui/Button";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing its token.");
      return;
    }
    apiClient
      .post("/auth/verify-email", { token })
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setMessage(
          err?.response?.data?.message || "This link is invalid or has expired."
        );
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-navy px-4">
      <Card className="max-w-md w-full text-center">
        <Logo />
        <div className="mt-6">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-3">
              <Spinner size={28} />
              <p className="text-sm text-standby-slate">Verifying your email…</p>
            </div>
          )}
          {status === "success" && (
            <>
              <h1 className="font-display text-xl font-semibold mb-2">Email verified</h1>
              <p className="text-sm text-standby-slate mb-6">
                Your account is now active.
              </p>
              <Link to="/login" className="text-accent-teal font-medium text-sm">
                Continue to login
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <h1 className="font-display text-xl font-semibold mb-2 text-signal-red">
                Verification failed
              </h1>
              <p className="text-sm text-standby-slate mb-6">{message}</p>
              <Link to="/login" className="text-accent-teal font-medium text-sm">
                Back to login
              </Link>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
