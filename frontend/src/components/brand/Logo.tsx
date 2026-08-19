export function Logo({ size = 32, showWordmark = true }: { size?: number; showWordmark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/icons/mark-transparent-512.png"
        alt="Airmark"
        style={{ width: size, height: size }}
        className="select-none"
        draggable={false}
      />
      {showWordmark && (
        <span
          className="font-display font-semibold tracking-tight text-navy dark:text-surface-light"
          style={{ fontSize: size * 0.6 }}
        >
          Airmark
        </span>
      )}
    </div>
  );
}
