import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { Card } from "@/components/ui/Card";

export function SettingsPage() {
  const [zoomPreference, setZoomPreference] = useState(10);
  const [zoomPrefSaved, setZoomPrefSaved] = useState(false);

  useEffect(() => {
    apiClient.get("/auth/me").then((res) => setZoomPreference(res.data.data.maxZoomPreference ?? 10)).catch(() => {});
  }, []);

  const zoomPrefMutation = useMutation({
    mutationFn: async () => { await apiClient.patch("/auth/zoom-preference", { maxZoomPreference: zoomPreference }); },
    onSuccess: () => {
      setZoomPrefSaved(true);
      setTimeout(() => setZoomPrefSaved(false), 1500);
    },
  });

  return (
    <div className="max-w-md mx-auto px-4 py-8 flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold">Settings</h1>
      <p className="text-sm text-standby-slate -mt-4">
        General app preferences. Account-specific settings (name, password, two-factor authentication, account deletion) live on your Profile page instead.
      </p>

      <Card>
        <p className="font-display text-sm font-semibold mb-1">Camera zoom limit</p>
        <p className="text-xs text-standby-slate mb-3">
          Controls how far the zoom slider goes on your Go Live camera preview — set it low to disable zoom, or raise it toward your device's hardware maximum.
        </p>
        <input
          type="range"
          min={1}
          max={50}
          step={1}
          value={zoomPreference}
          onChange={(e) => setZoomPreference(parseInt(e.target.value, 10))}
          onMouseUp={() => zoomPrefMutation.mutate()}
          onTouchEnd={() => zoomPrefMutation.mutate()}
          className="w-full"
        />
        <p className="text-xs text-standby-slate mt-1">Max: {zoomPreference}x{zoomPrefSaved ? " — saved" : ""}</p>
      </Card>
    </div>
  );
}
