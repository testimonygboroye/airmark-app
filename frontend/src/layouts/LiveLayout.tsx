import { useState } from "react";
import { Outlet, Link } from "react-router";
import { Logo } from "@/components/brand/Logo";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { BottomNav } from "@/components/ui/BottomNav";
import { AppSidebar } from "@/components/ui/AppSidebar";
import { DashboardIcon, NewTeamIcon, InvitesIcon, ProfileIcon, SettingsIcon, HelpIcon, ConsoleIcon } from "@/components/ui/NavIcons";
import { useAuthStore } from "@/store/authStore";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", Icon: DashboardIcon },
  { label: "New Team", to: "/teams/new", Icon: NewTeamIcon },
  { label: "Invites", to: "/invites", Icon: InvitesIcon },
  { label: "Profile", to: "/profile", Icon: ProfileIcon },
  { label: "Settings", to: "/settings", Icon: SettingsIcon },
  { label: "Help & Guide", to: "/help", Icon: HelpIcon },
];

export function LiveLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("airmark-sidebar-collapsed") === "1");
  const { user } = useAuthStore();

  return (
    // h-screen (fixed) not min-h-screen (grows-if-needed) — this was the
    // actual bug. min-h-screen let content exceed the viewport and the
    // whole page scrolled to reveal it; h-screen forces everything inside
    // to fit within one real screen's height, no exceptions.
    <div className="h-screen overflow-hidden flex flex-col md:flex-row bg-surface-light dark:bg-navy">
      <AppSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((v) => !v)} />

      <div className="flex-1 flex flex-col min-h-0">
        <header className="md:hidden shrink-0 flex items-center justify-between px-4 py-3 border-b border-standby-slate/15 bg-surface-light dark:bg-navy">
          <Logo size={26} />
          <div className="flex items-center gap-1">
            <NotificationBell />
            <button onClick={() => setSidebarOpen(true)} aria-label="Open menu" className="p-2 -mr-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
        </header>

        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-72 bg-surface-light dark:bg-navy h-full px-4 py-6 flex flex-col overflow-y-auto ml-auto">
              <div className="flex items-center justify-between mb-8">
                <Logo size={26} />
                <button onClick={() => setSidebarOpen(false)} aria-label="Close menu">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map(({ label, to, Icon }) => (
                  <Link key={to} to={to} onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><Icon /></svg>
                    {label}
                  </Link>
                ))}
                {user?.isSuperAdmin && (
                  <Link to="/system-console" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-signal-red hover:bg-black/5 dark:hover:bg-white/5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><ConsoleIcon /></svg>
                    System Console
                  </Link>
                )}
              </nav>
              <div className="mt-auto pt-6 border-t border-standby-slate/15">
                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <div className="mt-2"><ThemeToggle /></div>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <Outlet />
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
