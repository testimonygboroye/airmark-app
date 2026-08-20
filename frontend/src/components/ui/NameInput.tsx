import { forwardRef, type InputHTMLAttributes } from "react";
import { sanitizeNameInput } from "@/lib/validation";

interface NameInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  error?: string | null;
  value: string;
  onValueChange: (value: string) => void;
}

export const NameInput = forwardRef<HTMLInputElement, NameInputProps>(
  ({ label, error, id, value, onValueChange, className = "", ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-standby-slate dark:text-surface-light/80">
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          value={value}
          onChange={(e) => onValueChange(sanitizeNameInput(e.target.value))}
          className={`rounded-lg border px-4 py-3 text-sm bg-white dark:bg-navy/60 text-navy dark:text-surface-light border-standby-slate/30 focus:border-accent-teal outline-none transition-colors ${
            error ? "border-signal-red" : ""
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-signal-red">{error}</span>}
      </div>
    );
  }
);
NameInput.displayName = "NameInput";
