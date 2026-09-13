import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router";
import { Logo } from "@/components/brand/Logo";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { BottomNav } from "@/components/ui/BottomNav";
import { AppSidebar } from "@/components/ui/AppSidebar";
import { FirstVisitHelpModal } from "@/components/ui/FirstVisitHelpModal";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { DashboardIcon, NewTeamIcon, InvitesIcon, ProfileIcon, SettingsIcon, HelpIcon, ConsoleIcon } from "@/components/ui/NavIcons";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/apiClient";
import { disconnectSocket } from "@/lib/socketClient";
import { queryClient } from "@/lib/queryClient";
import { checkLogoutAllowed } from "@/lib/logoutGuard";
import { useQuery } from "@tanstack/react-query";
import type { MyInviteRecord } from "@/types";

export function SetupLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("airmark-sidebar-collapsed") === "1");
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("airmark-sidebar-collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const { data: myInvites } = useQuery({
    queryKey: ["myInvites"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: MyInviteRecord[] }>("/invites/mine/list");
      return res.data.data;
    },
    refetchInterval: 30000,
  });
  const inviteCount = myInvites?.length ?? 0;

  const NAV_ITEMS = [
    { label: "Dashboard", to: "/dashboard", Icon: DashboardIcon, badge: 0 },
    { label: "New Team", to: "/teams/new", Icon: NewTeamIcon, badge: 0 },
    { label: "Invites", to: "/invites", Icon: InvitesIcon, badge: inviteCount },
    { label: "Profile", to: "/profile", Icon: ProfileIcon, badge: 0 },
    { label: "Settings", to: "/settings", Icon: SettingsIcon, badge: 0 },
    { label: "Help & Guide", to: "/help", Icon: HelpIcon, badge: 0 },
  ];

  async function handleLogout() {
    const { blocked, reason } = await checkLogoutAllowed();
    if (blocked) {
      alert(`Can't log out right now: ${reason}`);
      return;
    }
    if (!window.confirm("Log out of Airmark?")) return;
    try {
      await apiClient.post("/auth/logout");
    } finally {
      disconnectSocket();
      // Critical: without this, cached data (roles, team memberships,
      // invites) from this account survives in memory and can bleed
      // into whoever logs in next on this same device/browser tab.
      queryClient.clear();
      clearAuth();
      navigate("/login", { state: { loggedOut: true }, replace: true });
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-light dark:bg-navy">
      <AppSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((v) => !v)} inviteCount={inviteCount} />

      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-standby-slate/15 bg-surface-light dark:bg-navy">
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
          <div className="relative w-72 bg-surface-light dark:bg-navy h-full px-4 py-6 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <Logo size={26} />
              <button onClick={() => setSidebarOpen(false)} aria-label="Close menu">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map(({ label, to, Icon, badge }) => (
                <Link key={to} to={to} onClick={() => setSidebarOpen(false)} className="flex items-center justify-between gap-3 px-3 py-3 rounded-lg text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5">
                  <span className="flex items-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><Icon /></svg>
                    {label}
                  </span>
                  {badge > 0 && <span className="w-5 h-5 rounded-full bg-signal-red text-white text-[10px] font-bold flex items-center justify-center">{badge > 9 ? "9+" : badge}</span>}
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
              <button type="button" onClick={handleLogout} className="text-sm font-semibold text-signal-red mt-4 block w-full text-left py-2">
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
      <FirstVisitHelpModal />
      <BackToTopButton />
    </div>
  );
}
