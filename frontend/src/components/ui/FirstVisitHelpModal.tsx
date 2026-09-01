import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const SEEN_KEY = "airmark-help-modal-seen";

export function FirstVisitHelpModal() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem(SEEN_KEY)) {
      setShow(true);
    }
  }, []);

  function dismiss(goToHelp: boolean) {
    localStorage.setItem(SEEN_KEY, "1");
    setShow(false);
    if (goToHelp) navigate("/help");
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-navy/90 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white dark:bg-navy border border-standby-slate/20 rounded-2xl p-6 text-center">
        <p className="font-display text-lg font-semibold mb-2">Welcome to Airmark 👋</p>
        <p className="text-sm text-standby-slate mb-6">
          New here? Our Help & Guide explains every feature, role, and how-to in detail — worth a quick look before
          your first event.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => dismiss(false)}
            className="flex-1 py-2.5 rounded-lg text-sm text-standby-slate border border-standby-slate/20"
          >
            Skip for now
          </button>
          <button
            onClick={() => dismiss(true)}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-accent-teal text-navy"
          >
            View Help Guide
          </button>
        </div>
      </div>
    </div>
  );
}
