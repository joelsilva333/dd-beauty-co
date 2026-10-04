"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export function ProfileForm({
  initialName,
  initialPhone,
  hasPassword,
}: {
  initialName: string;
  initialPhone: string;
  hasPassword: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/conta/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone: phone || undefined }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Não foi possível guardar.");
      setSaving(false);
      return;
    }

    setSaved(true);
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 border border-ink/10 p-7">
      <p className="eyebrow">Os teus dados</p>
      <label className="flex flex-col gap-2">
        <span className="font-body text-sm text-ink/70">Nome</span>
        <input value={name} onChange={(e) => setName(e.target.value)} required className="input" />
      </label>
      <label className="flex flex-col gap-2">
        <span className="font-body text-sm text-ink/70">Telefone</span>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="9XX XXX XXX"
          type="tel"
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
          Dados guardados.
        </p>
      )}

      <button type="submit" disabled={saving} className="btn-dark self-start">
        {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Guardar alterações
      </button>

      {!hasPassword && (
        <p className="border-t border-ink/10 pt-4 font-body text-xs text-ink/50">
          Entraste com a Google — ainda não tens password própria. Define uma em baixo se
          também quiseres entrar com email e password.
        </p>
      )}
    </form>
  );
}
