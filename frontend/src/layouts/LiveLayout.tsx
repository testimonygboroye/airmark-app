import { Outlet } from "react-router";

/**
 * Live Mode shell — minimal-to-no chrome, per Navigation & UX requirements.
 * Individual Tier 2 live features (tally, run-of-show, etc.) render inside
 * this layout once built; this is intentionally bare until then.
 */
export function LiveLayout() {
  return (
    <div className="min-h-screen bg-navy text-surface-light">
      <Outlet />
    </div>
  );
}
