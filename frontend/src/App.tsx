import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AppRouter } from "@/routes/AppRouter";
import { useAuthHydration } from "@/hooks/useAuth";
import { initServiceWorkerAutoUpdate } from "@/lib/swUpdateCheck";

function AppShell() {
  useAuthHydration();
  useEffect(() => {
    initServiceWorkerAutoUpdate();
  }, []);
  return <AppRouter />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}
