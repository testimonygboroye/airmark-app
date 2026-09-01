import { useEffect } from "react";
import { useLocation } from "react-router";
import { useNavHistoryStore } from "@/store/navHistoryStore";

/** Silently records the last visited path outside Alerts/Profile, so the
 * bottom nav's Home tab can return you to exactly where you were. */
export function RouteTracker() {
  const location = useLocation();
  const setLastHomePath = useNavHistoryStore((s) => s.setLastHomePath);

  useEffect(() => {
    if (location.pathname !== "/notifications" && location.pathname !== "/profile") {
      setLastHomePath(location.pathname);
    }
  }, [location.pathname, setLastHomePath]);

  return null;
}
