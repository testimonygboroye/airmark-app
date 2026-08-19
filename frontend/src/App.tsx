import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AppRouter } from "@/routes/AppRouter";
import { useAuthHydration } from "@/hooks/useAuth";

function AppShell() {
  useAuthHydration();
  return <AppRouter />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}
