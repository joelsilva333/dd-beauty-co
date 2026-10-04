"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { GoogleButton } from "@/components/GoogleButton";

export default function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = use(searchParams);
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/conta/registar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone: phone || undefined }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Não foi possível criar a conta.");
      setLoading(false);
      return;
    }

    router.push(next && next.startsWith("/") ? next : "/conta");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-3xl text-ink">Criar conta</h1>
        <p className="mt-2 font-body text-sm text-ink/55">
          Guarda as tuas encomendas e descarrega as faturas quando quiseres.
        </p>
      </div>

      <GoogleButton next={next} />

      <div className="flex items-center gap-3 font-body text-xs text-ink/40">
        <span className="h-px flex-1 bg-ink/10" />
        ou com email
        <span className="h-px flex-1 bg-ink/10" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="O teu nome"
          autoComplete="name"
          className="input"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          className="input"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefone (opcional)"
          autoComplete="tel"
          className="input"
        />
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (mínimo 8 caracteres)"
          autoComplete="new-password"
          minLength={8}
          className="input"
        />
        {error && (
          <p role="alert" className="flex items-start gap-3 border border-ink/20 bg-ink/5 px-4 py-3 font-body text-sm text-ink">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" strokeWidth={1.5} />
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} className="btn-dark">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          Criar conta
        </button>
      </form>

      <p className="text-center font-body text-sm text-ink/60">
        Já tens conta?{" "}
        <Link href={`/conta/entrar${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="link-underline underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
