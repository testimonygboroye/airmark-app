export function SettingsPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-8 flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold">Settings</h1>
      <p className="text-sm text-standby-slate">
        General app preferences will appear here as they're added. Account-specific settings
        (name, password, two-factor authentication, account deletion) live on your Profile page.
      </p>
    </div>
  );
}
