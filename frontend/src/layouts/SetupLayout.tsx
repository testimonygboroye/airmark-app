import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router";
import { Logo } from "@/components/brand/Logo";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { BottomNav } from "@/components/ui/BottomNav";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/apiClient";
import { disconnectSocket } from "@/lib/socketClient";

export function SetupLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("airmark-sidebar-collapsed") === "1");
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("airmark-sidebar-collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

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
    { label: "Profile", to: "/profile" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-light dark:bg-navy">
      <aside
        className={`hidden md:flex md:flex-col border-r border-standby-slate/15 py-6 transition-all ${
          collapsed ? "md:w-16 px-2" : "md:w-64 px-4"
        }`}
      >
        <div className={`flex items-center ${collapsed ? "flex-col gap-3" : "justify-between"}`}>
          <Logo size={28} showWordmark={!collapsed} />
          {!collapsed && <NotificationBell />}
        </div>

        <nav className="flex flex-col gap-1 mt-8">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 ${
                collapsed ? "text-center text-xs" : ""
              }`}
            >
              {collapsed ? item.label.charAt(0) : item.label}
            </Link>
          ))}
          {user?.isSuperAdmin && (
            <Link
              to="/system-console"
              title={collapsed ? "System Console" : undefined}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium text-signal-red hover:bg-black/5 dark:hover:bg-white/5 ${
                collapsed ? "text-center text-xs" : ""
              }`}
            >
              {collapsed ? "S" : "System Console"}
            </Link>
          )}
        </nav>

        <button
          onClick={() => setCollapsed((v) => !v)}
          className="mt-4 text-xs text-standby-slate self-center"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "»" : "« Collapse"}
        </button>

        <div className="mt-auto pt-6 border-t border-standby-slate/15">
          {!collapsed && (
            <>
              <p className="text-sm font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <div className="mt-2">
                <ThemeToggle />
              </div>
            </>
          )}
          <button
            onClick={handleLogout}
            className={`text-xs text-signal-red font-medium mt-2 ${collapsed ? "block mx-auto" : ""}`}
          >
            {collapsed ? "⏻" : "Log out"}
          </button>
        </div>
      </aside>

      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-standby-slate/15">
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
              {user?.isSuperAdmin && (
                <Link
                  to="/system-console"
                  onClick={() => setSidebarOpen(false)}
                  className="px-3 py-3 rounded-lg text-sm font-medium text-signal-red hover:bg-black/5 dark:hover:bg-white/5"
                >
                  System Console
                </Link>
              )}
            </nav>
            <div className="mt-auto pt-6 border-t border-standby-slate/15">
              <p className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <div className="mt-2">
                <ThemeToggle />
              </div>
              <button onClick={handleLogout} className="text-xs text-signal-red font-medium mt-3">
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
