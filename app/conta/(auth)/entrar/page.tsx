"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { GoogleButton } from "@/components/GoogleButton";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; erro?: string }>;
}) {
  const { next, erro } = use(searchParams);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(erro ?? null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/conta/entrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Não foi possível entrar.");
      setLoading(false);
      return;
    }

    router.push(next && next.startsWith("/") ? next : "/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-3xl text-ink">Entrar na tua conta</h1>
        <p className="mt-2 font-body text-sm text-ink/55">
          Vê as tuas encomendas, faturas e dados guardados.
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
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          className="input"
        />
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
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
          Entrar
        </button>
      </form>

      <p className="text-center font-body text-sm text-ink/60">
        Ainda não tens conta?{" "}
        <Link href={`/conta/criar${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="link-underline underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
