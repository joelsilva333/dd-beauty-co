"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/conta/senha", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPassword || undefined, newPassword }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Não foi possível guardar.");
      setSaving(false);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setSaved(true);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 border border-ink/10 p-7">
      <p className="eyebrow">{hasPassword ? "Mudar password" : "Definir password"}</p>
      {hasPassword && (
        <label className="flex flex-col gap-2">
          <span className="font-body text-sm text-ink/70">Password atual</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="input"
          />
        </label>
      )}
      <label className="flex flex-col gap-2">
        <span className="font-body text-sm text-ink/70">
          {hasPassword ? "Nova password" : "Password"}
        </span>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
          className="input"
        />
      </label>

      {error && (
        <p role="alert" className="flex items-start gap-3 border border-ink/20 bg-ink/5 px-4 py-3 font-body text-sm text-ink">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" strokeWidth={1.5} />
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="flex items-center gap-2 font-body text-sm text-ink">
          <CheckCircle2 className="h-4 w-4 text-gold" aria-hidden="true" />
          Password atualizada.
        </p>
      )}

      <button type="submit" disabled={saving} className="btn-outline self-start">
        {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {hasPassword ? "Mudar password" : "Definir password"}
      </button>
    </form>
  );
}
