"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useRealtime } from "@/lib/realtime-client";
import type { ChatMessageDTO } from "@/lib/chat";

export function AdminChatThread({
  conversationId,
  closed,
  initialMessages,
}: {
  conversationId: string;
  closed: boolean;
  initialMessages: ChatMessageDTO[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  function append(message: ChatMessageDTO) {
    setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
  }

  // O AdminLiveAlerts já está ligado à sala "admin"; aqui só filtramos esta conversa.
  useRealtime({
    rooms: ["admin"],
    handlers: {
      "chat:conversation": (data: { id: string; message: ChatMessageDTO }) => {
        if (data.id !== conversationId) return;
        append(data.message);
        if (data.message.sender === "CLIENTE") {
          fetch(`/api/admin/chat/${conversationId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ markRead: true }),
          });
        }
      },
    },
  });

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    setError(null);
    const res = await fetch(`/api/admin/chat/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      append(json.message);
      setDraft("");
    } else {
      setError(json.error ?? "Não foi possível enviar.");
    }
    setSending(false);
  }

  async function toggleClosed() {
    await fetch(`/api/admin/chat/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ closed: !closed }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-taupe/25 bg-white">
      <div ref={listRef} className="flex max-h-[60vh] min-h-64 flex-col gap-3 overflow-y-auto p-4">
        {messages.map((m) => {
          const team = m.sender === "EQUIPA";
          return (
            <div
              key={m.id}
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 font-body text-sm ${
                team ? "self-end bg-ink text-cream" : "self-start border border-taupe/25 bg-cream text-ink"
              }`}
            >
              {m.body}
              <span className={`mt-1 block text-[11px] ${team ? "text-cream/50" : "text-ink/40"}`}>
                {new Date(m.createdAt).toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
      </div>

      <form onSubmit={send} className="flex flex-col gap-2 border-t border-taupe/25 p-3">
        {error && <p className="font-body text-sm text-ink">{error}</p>}
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Escreve a resposta"
            maxLength={1000}
            className="input flex-1"
          />
          <button
            type="submit"
            disabled={sending}
            className="flex h-12 items-center gap-2 rounded-full bg-gold px-5 font-body text-sm text-white transition hover:bg-ink disabled:opacity-60"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
            Responder
          </button>
        </div>
        <button
          type="button"
          onClick={toggleClosed}
          className="flex items-center gap-2 self-start font-body text-sm text-ink/60 underline underline-offset-4"
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          {closed ? "Reabrir conversa" : "Marcar como resolvida"}
        </button>
      </form>
    </div>
  );
}
