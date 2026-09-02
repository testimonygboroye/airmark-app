import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { CameraAssignmentRecord } from "@/types";

interface Props {
  eventId: string;
  teamId: string;
  cameras: CameraAssignmentRecord[];
}

export function TalkbackControls({ eventId, teamId, cameras }: Props) {
  const [open, setOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState("");
  const [text, setText] = useState("");

  const assignedCameras = cameras.filter((c) => c.operatorUserId);

  const sendMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/events/${eventId}/talkback`, {
        teamId,
        toUserId: targetUserId,
        text,
      });
    },
    onSuccess: () => {
      setText("");
      setOpen(false);
    },
  });

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-standby-slate dark:text-surface-light/70 font-medium px-3 py-1.5 rounded-lg border border-standby-slate/30 dark:border-white/15"
      >
        Send message
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-navy/90 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-navy border border-standby-slate/30 dark:border-white/15 rounded-2xl p-5">
        <p className="font-display font-semibold mb-4">Send a cue</p>

        <select
          className="w-full text-sm rounded-lg border border-standby-slate/30 dark:border-white/15 bg-white/5 px-3 py-2.5 mb-3"
          value={targetUserId}
          onChange={(e) => setTargetUserId(e.target.value)}
        >
          <option value="">Select operator…</option>
          {assignedCameras.map((c) => (
            <option key={c._id} value={c.operatorUserId!._id}>
              {c.label} — {c.operatorUserId!.firstName} {c.operatorUserId!.lastName}
            </option>
          ))}
        </select>

        <textarea
          className="w-full text-sm rounded-lg border border-standby-slate/30 dark:border-white/15 bg-white/5 px-3 py-2.5 mb-4 resize-none"
          rows={3}
          maxLength={200}
          placeholder="e.g. Tighten your shot"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            onClick={() => setOpen(false)}
            className="flex-1 py-2.5 rounded-lg text-sm text-surface-light/60 border border-standby-slate/30 dark:border-white/15"
          >
            Cancel
          </button>
          <button
            onClick={() => sendMutation.mutate()}
            disabled={!targetUserId || !text.trim() || sendMutation.isPending}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-accent-teal text-navy disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
