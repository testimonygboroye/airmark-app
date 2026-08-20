import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router";
import { Logo } from "@/components/brand/Logo";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/apiClient";
import { disconnectSocket } from "@/lib/socketClient";

export function SetupLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
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
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-light dark:bg-navy">
      <aside className="hidden md:flex md:flex-col md:w-64 border-r border-standby-slate/15 px-4 py-6">
        <Logo size={28} />
        <nav className="flex flex-col gap-1 mt-8">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-standby-slate/15">
          <p className="text-sm font-medium truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <button onClick={handleLogout} className="text-xs text-signal-red font-medium mt-2">
            Log out
          </button>
        </div>
      </aside>

      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-standby-slate/15">
        <Logo size={26} />
        <button onClick={() => setSidebarOpen(true)} aria-label="Open menu" className="p-2 -mr-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 bg-surface-light dark:bg-navy h-full px-4 py-6 flex flex-col">
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
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className="px-3 py-3 rounded-lg text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto pt-6 border-t border-standby-slate/15">
              <p className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <button onClick={handleLogout} className="text-xs text-signal-red font-medium mt-2">
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
