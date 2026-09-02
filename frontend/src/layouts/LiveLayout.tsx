import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router";
import { Logo } from "@/components/brand/Logo";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { BottomNav } from "@/components/ui/BottomNav";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/apiClient";
import { disconnectSocket } from "@/lib/socketClient";

export function LiveLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    if (!window.confirm("Log out of Airmark?")) return;
    try {
      await apiClient.post("/auth/logout");
    } finally {
      disconnectSocket();
      clearAuth();
      navigate("/login", { state: { loggedOut: true }, replace: true });
    }
  }

  const navItems = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "New Team", to: "/teams/new" },
    { label: "Invites", to: "/invites" },
    { label: "Profile", to: "/profile" },
    { label: "Help & Guide", to: "/help" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface-light dark:bg-navy">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-standby-slate/15 bg-surface-light dark:bg-navy">
        <Logo size={26} />
        <div className="flex items-center gap-1">
          <NotificationBell />
          <button onClick={() => setSidebarOpen(true)} aria-label="Open menu" className="p-2 -mr-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 bg-surface-light dark:bg-navy h-full px-4 py-6 flex flex-col overflow-y-auto ml-auto">
            <div className="flex items-center justify-between mb-8">
              <Logo size={26} />
              <button onClick={() => setSidebarOpen(false)} aria-label="Close menu">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)} className="px-3 py-3 rounded-lg text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5">
                  {item.label}
                </Link>
              ))}
              {user?.isSuperAdmin && (
                <Link to="/system-console" onClick={() => setSidebarOpen(false)} className="px-3 py-3 rounded-lg text-sm font-medium text-signal-red hover:bg-black/5 dark:hover:bg-white/5">
                  System Console
                </Link>
              )}
            </nav>
            <div className="mt-auto pt-6 border-t border-standby-slate/15">
              <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
              <div className="mt-2"><ThemeToggle /></div>
              <button onClick={handleLogout} className="text-xs text-signal-red font-medium mt-3">Log out</button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 pb-16">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
