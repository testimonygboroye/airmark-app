import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { Spinner } from "@/components/ui/Button";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isHydrating } = useAuthStore();

  if (isHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
