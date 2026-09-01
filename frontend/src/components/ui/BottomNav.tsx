import { NavLink, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useNavHistoryStore } from "@/store/navHistoryStore";

export function BottomNav() {
  const location = useLocation();
  const lastHomePath = useNavHistoryStore((s) => s.lastHomePath);

  const { data } = useQuery({
    queryKey: ["notifications", "all"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { unreadCount: number } }>("/notifications");
      return res.data.data;
    },
    refetchInterval: 30000,
  });

  const isHomeActive = location.pathname !== "/notifications" && location.pathname !== "/profile";

  const items = [
    {
      to: lastHomePath,
      label: "Home",
      active: isHomeActive,
      icon: (
        <path d="M4 11l8-7 8 7M6 10v9a1 1 0 001 1h3v-6h4v6h3a1 1 0 001-1v-9" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      ),
    },
    {
      to: "/notifications",
      label: "Alerts",
      active: location.pathname === "/notifications",
      badge: data?.unreadCount,
      icon: (
        <path
          d="M12 2a7 7 0 00-7 7v4l-2 3h18l-2-3V9a7 7 0 00-7-7zM9.5 20a2.5 2.5 0 005 0"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      ),
    },
    {
      to: "/profile",
      label: "Profile",
      active: location.pathname === "/profile",
      icon: (
        <>
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M5 20c1.5-4 4.5-6 7-6s5.5 2 7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      ),
    },
  ];

  return (
    <nav className="md:hidden sticky bottom-0 left-0 right-0 z-30 bg-surface-light dark:bg-navy border-t border-standby-slate/15 flex items-stretch pb-[env(safe-area-inset-bottom)]">
      {items.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative ${
            item.active ? "text-accent-teal" : "text-standby-slate"
          }`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            {item.icon}
          </svg>
          <span className="text-[10px] font-medium">{item.label}</span>
          {!!item.badge && (
            <span className="absolute top-1 right-[30%] w-3.5 h-3.5 rounded-full bg-signal-red text-white text-[8px] font-bold flex items-center justify-center">
              {item.badge > 9 ? "9+" : item.badge}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
