import { forwardRef, useState, type InputHTMLAttributes } from "react";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string | null;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-standby-slate dark:text-surface-light/80">
          {label}
        </label>
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={visible ? "text" : "password"}
            className={`w-full rounded-lg border px-4 py-3 pr-11 text-sm bg-white dark:bg-navy/60 text-navy dark:text-surface-light border-standby-slate/30 focus:border-accent-teal outline-none transition-colors ${
              error ? "border-signal-red" : ""
            } ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-standby-slate hover:text-navy dark:hover:text-surface-light"
            aria-label={visible ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {visible ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2M9.9 5.1A10.7 10.7 0 0112 5c5 0 9 4 10.5 7-.5 1-1.2 2.1-2.1 3.1M6.5 6.6C4.5 8 3 9.9 1.5 12c1.5 3 5.5 7 10.5 7 1.3 0 2.5-.2 3.6-.7"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            )}
          </button>
        </div>
        {error && <span className="text-xs text-signal-red">{error}</span>}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
