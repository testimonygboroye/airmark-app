import { Link, useNavigate } from "react-router";
import { Logo } from "@/components/brand/Logo";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { DashboardIcon, NewTeamIcon, InvitesIcon, ProfileIcon, SettingsIcon, HelpIcon, ConsoleIcon } from "@/components/ui/NavIcons";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/apiClient";
import { disconnectSocket } from "@/lib/socketClient";
import { queryClient } from "@/lib/queryClient";
import { checkLogoutAllowed } from "@/lib/logoutGuard";

interface Props {
  collapsed: boolean;
  onToggleCollapse: () => void;
  inviteCount?: number;
}

export function AppSidebar({ collapsed, onToggleCollapse, inviteCount = 0 }: Props) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

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
      queryClient.clear();
      clearAuth();
      navigate("/login", { state: { loggedOut: true }, replace: true });
    }
  }

  return (
    <aside className={`hidden md:flex md:flex-col md:sticky md:top-0 md:h-screen border-r border-standby-slate/15 py-6 transition-all ${collapsed ? "md:w-16 px-2" : "md:w-64 px-4"}`}>
      <div className={`flex items-center ${collapsed ? "flex-col gap-3" : "justify-between"}`}>
        <Logo size={28} showWordmark={!collapsed} />
        {!collapsed && <NotificationBell />}
      </div>

      <nav className="flex flex-col gap-1 mt-8">
        {NAV_ITEMS.map(({ label, to, Icon, badge }) => (
          <Link key={to} to={to} title={collapsed ? label : undefined} className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 ${collapsed ? "justify-center" : "justify-between"}`}>
            <span className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0"><Icon /></svg>
              {!collapsed && <span>{label}</span>}
            </span>
            {badge > 0 && (
              <span className={`${collapsed ? "absolute -top-1 -right-1" : ""} w-5 h-5 rounded-full bg-signal-red text-white text-[10px] font-bold flex items-center justify-center shrink-0`}>
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </Link>
        ))}
        {user?.isSuperAdmin && (
          <Link to="/system-console" title={collapsed ? "System Console" : undefined} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-signal-red hover:bg-black/5 dark:hover:bg-white/5 ${collapsed ? "justify-center" : ""}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0"><ConsoleIcon /></svg>
            {!collapsed && <span>System Console</span>}
          </Link>
        )}
      </nav>

      <button onClick={onToggleCollapse} className="mt-4 text-xs text-standby-slate self-center" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
        {collapsed ? "»" : "« Collapse"}
      </button>

      <div className="mt-auto pt-6 border-t border-standby-slate/15">
        {!collapsed && (
          <>
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <div className="mt-2"><ThemeToggle /></div>
          </>
        )}
        <button onClick={handleLogout} className={`text-xs text-signal-red font-medium mt-2 ${collapsed ? "block mx-auto" : ""}`}>
          {collapsed ? "⏻" : "Log out"}
        </button>
      </div>
    </aside>
  );
}
