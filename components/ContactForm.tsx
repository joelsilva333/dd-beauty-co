"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

const STORAGE_KEY = "dd-support-chat";

// Mesmo formato usado pelo SupportWidget (components/SupportWidget.tsx), para
// que uma dúvida enviada aqui apareça logo na mesma conversa do botão de ajuda.
function saveChatSession(session: { id: string; accessKey: string; customerName: string }) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // sem armazenamento: a mensagem foi enviada na mesma, só não fica guardada no browser
  }
}

export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: phone || undefined, message }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Não foi possível enviar. Tenta novamente.");
        return;
      }
      saveChatSession(json.conversation);
      setSent(true);
      setMessage("");
    } catch {
      setError("Sem ligação à internet. Tenta novamente.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 border border-ink/10 px-6 py-10 text-center">
        <CheckCircle2 className="h-8 w-8 text-gold" aria-hidden="true" strokeWidth={1.25} />
        <p className="font-display text-xl text-ink">A tua mensagem foi enviada</p>
        <p className="max-w-sm font-body text-sm text-ink/60">
          Vamos responder o mais depressa possível. Podes continuar esta conversa a qualquer
          momento pelo botão “Precisas de ajuda?”.
        </p>
        <button type="button" onClick={() => setSent(false)} className="link-underline mt-2 underline">
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 border border-ink/10 p-7">
      <div>
        <p className="font-display text-xl text-ink">Tens uma dúvida ou reclamação?</p>
        <p className="mt-1 font-body text-sm text-ink/55">
          Escreve aqui. Respondemos pela mesma conversa do botão de ajuda.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="eyebrow">O teu nome</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome"
            className="input"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="eyebrow">Telefone (opcional)</span>
          <input
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9XX XXX XXX"
            className="input"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="eyebrow">A tua dúvida ou reclamação</span>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escreve aqui o que precisas..."
          maxLength={1000}
          className="input min-h-32"
        />
      </label>

      {error && (
        <p role="alert" className="border border-ink/20 bg-ink/5 px-4 py-3 font-body text-sm text-ink">
          {error}
        </p>
      )}

      <button type="submit" disabled={sending} className="btn-dark self-start">
        {sending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="h-4 w-4" aria-hidden="true" />
        )}
        Enviar mensagem
      </button>
    </form>
  );
}
