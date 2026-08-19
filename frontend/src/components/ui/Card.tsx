import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-standby-slate/15 bg-white dark:bg-navy/40 shadow-sm p-6 sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
