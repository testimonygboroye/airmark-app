import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/errors";
import { validateName, validatePassword, validateConfirmPassword } from "@/lib/validation";
import { useAuthStore } from "@/store/authStore";
import { disconnectSocket } from "@/lib/socketClient";
import { Card } from "@/components/ui/Card";
import { NameInput } from "@/components/ui/NameInput";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ProfilePage() {
  const { user, setUser, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [middleName, setMiddleName] = useState(user?.middleName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean | null>(null);
  const [twoFactorStep, setTwoFactorStep] = useState<"idle" | "setup" | "backup">("idle");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [manualSecret, setManualSecret] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableError, setDisableError] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [secretCopied, setSecretCopied] = useState(false);
  const [backupCopied, setBackupCopied] = useState(false);

  const [deleteText, setDeleteText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    apiClient.get("/auth/me").then((res) => {
      setTwoFactorEnabled(res.data.data.twoFactorEnabled ?? false);
    }).catch(() => setTwoFactorEnabled(false));
  }, []);

  const profileMutation = useMutation({
    mutationFn: async () => {
      const nameErrors = [validateName(firstName, true), validateName(middleName, false), validateName(lastName, true)];
      if (nameErrors.some((e) => e)) throw new Error(nameErrors.find((e) => e) as string);
      const res = await apiClient.patch("/auth/me", { firstName, middleName: middleName || undefined, lastName });
      return res.data.data;
    },
    onSuccess: (data) => {
      setUser(data);
      setProfileMessage("Profile updated.");
      setProfileError(null);
      setTimeout(() => setProfileMessage(null), 3000);
    },
    onError: (err) => setProfileError(getErrorMessage(err, (err as Error).message)),
  });

  const passwordMutation = useMutation({
    mutationFn: async () => {
      const pwError = validatePassword(newPassword);
      const confirmError = validateConfirmPassword(newPassword, confirmNewPassword);
      if (pwError || confirmError) throw new Error(pwError || confirmError || "Invalid password");
      await apiClient.post("/auth/change-password", { currentPassword, newPassword, confirmNewPassword });
    },
    onSuccess: () => {
      setPasswordMessage("Password changed. Please log in again.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordError(null);
    },
    onError: (err) => setPasswordError(getErrorMessage(err, (err as Error).message)),
  });

  const start2FAMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/auth/2fa/setup");
      return res.data.data;
    },
    onSuccess: (data) => {
      setQrCode(data.qrCodeDataUrl);
      setManualSecret(data.secret);
      setTwoFactorStep("setup");
      setSetupError(null);
    },
    onError: (err) => setSetupError(getErrorMessage(err)),
  });

  const confirm2FAMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/auth/2fa/confirm", { code: totpCode });
      return res.data.data;
    },
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setTwoFactorStep("backup");
      setTwoFactorEnabled(true);
    },
    onError: (err) => setSetupError(getErrorMessage(err)),
  });

  const disable2FAMutation = useMutation({
    mutationFn: async () => { await apiClient.post("/auth/2fa/disable", { password: disablePassword }); },
    onSuccess: () => {
      setDisablePassword("");
      setDisableError(null);
      setTwoFactorEnabled(false);
    },
    onError: (err) => setDisableError(getErrorMessage(err)),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => { await apiClient.delete("/auth/me", { data: { confirmationText: deleteText, password: deletePassword } }); },
    onSuccess: () => {
      disconnectSocket();
      clearAuth();
      navigate("/login");
    },
    onError: (err) => setDeleteError(getErrorMessage(err)),
  });

  function copyText(text: string, onDone: () => void) {
    navigator.clipboard?.writeText(text);
    onDone();
  }

  function downloadQrCode() {
    if (!qrCode) return;
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = "airmark-2fa-qr-code.png";
    link.click();
  }

  function downloadBackupCodes() {
    const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "airmark-backup-codes.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold">Profile</h1>

      <Card>
        <p className="font-display text-sm font-semibold mb-3">Your details</p>
        <div className="flex flex-col gap-3">
          <NameInput label="First name" value={firstName} onValueChange={setFirstName} />
          <NameInput label="Middle name (optional)" value={middleName} onValueChange={setMiddleName} />
          <NameInput label="Last name" value={lastName} onValueChange={setLastName} />
          <p className="text-xs text-standby-slate">Email: {user?.email} (contact support to change)</p>
          {profileError && <p className="text-sm text-signal-red">{profileError}</p>}
          {profileMessage && <p className="text-sm text-accent-teal">{profileMessage}</p>}
          <Button onClick={() => profileMutation.mutate()} isLoading={profileMutation.isPending}>Save changes</Button>
        </div>
      </Card>

      <Card>
        <p className="font-display text-sm font-semibold mb-3">Change password</p>
        <div className="flex flex-col gap-3">
          <PasswordInput label="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          <PasswordInput label="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <PasswordInput label="Confirm new password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
          {passwordError && <p className="text-sm text-signal-red">{passwordError}</p>}
          {passwordMessage && <p className="text-sm text-accent-teal">{passwordMessage}</p>}
          <Button onClick={() => passwordMutation.mutate()} isLoading={passwordMutation.isPending} disabled={!currentPassword || !newPassword}>
            Change password
          </Button>
        </div>
      </Card>

      <Card>
        <p className="font-display text-sm font-semibold mb-1">Two-factor authentication</p>
        <p className="text-xs text-standby-slate mb-3">Adds a second layer of protection — a code from your phone in addition to your password.</p>

        {twoFactorEnabled === null && <p className="text-xs text-standby-slate">Loading…</p>}

        {twoFactorEnabled === false && twoFactorStep === "idle" && (
          <div>
            {setupError && <p className="text-sm text-signal-red mb-2">{setupError}</p>}
            <Button onClick={() => start2FAMutation.mutate()} isLoading={start2FAMutation.isPending}>Set up 2FA</Button>
          </div>
        )}

        {twoFactorEnabled === true && twoFactorStep === "idle" && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-accent-teal">2FA is currently enabled on your account.</p>
            <PasswordInput label="Confirm password to disable" value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)} />
            {disableError && <p className="text-sm text-signal-red">{disableError}</p>}
            <Button variant="ghost" onClick={() => disable2FAMutation.mutate()} isLoading={disable2FAMutation.isPending} disabled={!disablePassword}>
              Disable 2FA
            </Button>
          </div>
        )}

        {twoFactorStep === "setup" && qrCode && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-standby-slate">Scan this QR code with Google Authenticator, Authy, or any TOTP app.</p>
            <img src={qrCode} alt="2FA QR code" className="w-40 h-40 mx-auto rounded-lg bg-white p-2" />
            <button onClick={downloadQrCode} className="text-xs text-accent-teal font-medium text-center">Download QR code</button>
            <div className="flex items-center justify-center gap-2 text-xs text-standby-slate">
              <span className="font-mono">{manualSecret}</span>
              <button
                onClick={() => copyText(manualSecret ?? "", () => { setSecretCopied(true); setTimeout(() => setSecretCopied(false), 1500); })}
                className="text-accent-teal font-medium"
              >
                {secretCopied ? "Copied!" : "Copy"}
              </button>
            </div>
            {setupError && <p className="text-sm text-signal-red text-center">{setupError}</p>}
            <input placeholder="Enter 6-digit code" value={totpCode} onChange={(e) => setTotpCode(e.target.value)} className="text-sm rounded-lg border border-standby-slate/30 px-3 py-2.5 text-center tracking-widest bg-white dark:bg-navy/60 text-navy dark:text-surface-light" maxLength={6} />
            <Button onClick={() => confirm2FAMutation.mutate()} isLoading={confirm2FAMutation.isPending} disabled={totpCode.length !== 6}>Confirm & Enable</Button>
          </div>
        )}

        {twoFactorStep === "backup" && (
          <div className="flex flex-col gap-3">
            <div className="rounded-lg bg-accent-teal/10 border border-accent-teal/30 px-4 py-3 text-sm text-accent-teal">
              2FA enabled. Save these backup codes somewhere safe — each works once if you lose access to your authenticator app.
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              {backupCodes.map((code) => (<div key={code} className="bg-standby-slate/10 rounded px-2 py-1.5 text-center">{code}</div>))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => copyText(backupCodes.join("\n"), () => { setBackupCopied(true); setTimeout(() => setBackupCopied(false), 1500); })}
                className="flex-1"
              >
                {backupCopied ? "Copied!" : "Copy all"}
              </Button>
              <Button variant="ghost" onClick={downloadBackupCodes} className="flex-1">Download</Button>
            </div>
            <Button onClick={() => setTwoFactorStep("idle")}>Done</Button>
          </div>
        )}
      </Card>

      <Card className="border-signal-red/30">
        <p className="font-display text-sm font-semibold text-signal-red mb-1">Danger zone</p>
        <p className="text-xs text-standby-slate mb-3">Permanently delete your account. If you own any team with other members, remove them first.</p>

        {!showDelete ? (
          <Button variant="ghost" onClick={() => setShowDelete(true)} className="text-signal-red">Delete my account</Button>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-standby-slate">Type <strong>DELETE MY ACCOUNT</strong> to confirm.</p>
            <Input label="Confirmation" value={deleteText} onChange={(e) => setDeleteText(e.target.value)} />
            <PasswordInput label="Password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
            {deleteError && <p className="text-sm text-signal-red">{deleteError}</p>}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setShowDelete(false)} className="flex-1">Cancel</Button>
              <Button onClick={() => deleteAccountMutation.mutate()} isLoading={deleteAccountMutation.isPending} disabled={deleteText !== "DELETE MY ACCOUNT" || !deletePassword} className="flex-1 !bg-signal-red">
                Permanently delete
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
