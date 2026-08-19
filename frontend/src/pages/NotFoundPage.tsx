import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="font-display text-3xl font-semibold">404</h1>
      <p className="text-standby-slate">This page doesn't exist.</p>
      <Link to="/dashboard" className="text-accent-teal font-medium text-sm">
        Back to dashboard
      </Link>
    </div>
  );
}
