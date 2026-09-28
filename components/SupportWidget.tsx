"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageCircle,
  MessagesSquare,
  Phone,
  Send,
  X,
} from "lucide-react";
import { useRealtime } from "@/lib/realtime-client";
import { SITE, telLink, whatsappLink } from "@/lib/site-config";

type Message = { id: string; sender: "CLIENTE" | "EQUIPA"; body: string; createdAt: string };
type Session = { id: string; accessKey: string; customerName: string };

const STORAGE_KEY = "dd-support-chat";

function loadSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function saveSession(session: Session | null) {
  try {
    if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // sem armazenamento: a conversa dura apenas esta visita
  }
}

export function SupportWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"menu" | "chat">("menu");

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Ajuda"
          className="glass-dark fixed inset-x-3 bottom-24 z-50 flex max-h-[75vh] flex-col overflow-hidden shadow-2xl shadow-ink/10 sm:inset-x-auto sm:right-5 sm:w-96"
        >
          <div className="flex items-center justify-between bg-ink px-4 py-3 text-cream">
            {view === "chat" ? (
              <button
                type="button"
                onClick={() => setView("menu")}
                className="flex h-10 items-center gap-2 font-body text-sm"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Voltar
              </button>
            ) : (
              <p className="font-display text-lg">Como podemos ajudar?</p>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center"
              aria-label="Fechar ajuda"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {view === "menu" ? (
            <div className="flex flex-col gap-3 p-4">
              <p className="font-body text-sm text-ink/70">
                Estamos aqui para ti. Escolhe a forma mais fácil.
              </p>
              <HelpOption
                icon={<MessagesSquare className="h-6 w-6" aria-hidden="true" />}
                title="Conversar aqui"
                description="Escreve-nos sem sair do site."
                onClick={() => setView("chat")}
              />
              <HelpOption
                icon={<MessageCircle className="h-6 w-6" aria-hidden="true" />}
                title="WhatsApp"
                description={SITE.phoneDisplay}
                href={whatsappLink("Olá, preciso de ajuda com a minha compra")}
              />
              <HelpOption
                icon={<Phone className="h-6 w-6" aria-hidden="true" />}
                title="Ligar"
                description={SITE.phoneDisplay}
                href={telLink()}
              />
            </div>
          ) : (
            <ChatPanel />
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-50 flex h-14 items-center gap-2 rounded-full border border-ink/10 bg-ink/90 px-5 text-cream shadow-lg shadow-ink/15 backdrop-blur-md transition hover:bg-ink"
      >
        {open ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
        )}
        <span className="font-body text-sm">{open ? "Fechar" : "Precisas de ajuda?"}</span>
      </button>
    </>
  );
}

function HelpOption({
  icon,
  title,
  description,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
}) {
  const className =
    "flex min-h-16 items-center gap-4 border border-ink/10 bg-white/70 px-4 py-3 text-left backdrop-blur-sm transition hover:border-ink/40";
  const content = (
    <>
      <span className="text-gold">{icon}</span>
      <span className="flex flex-col">
        <span className="font-display text-lg text-ink">{title}</span>
        <span className="font-body text-sm text-ink/60">{description}</span>
      </span>
    </>
  );
  return href ? (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

// Só é montado depois de a cliente abrir o chat (nunca no servidor), por isso
// pode ler o localStorage diretamente no estado inicial.
function ChatPanel() {
  const [session, setSession] = useState<Session | null>(loadSession);
  const [messages, setMessages] = useState<Message[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(() => session !== null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const addMessages = useCallback((incoming: Message[]) => {
    setMessages((prev) => {
      const known = new Set(prev.map((m) => m.id));
      const fresh = incoming.filter((m) => !known.has(m.id));
      return fresh.length ? [...prev, ...fresh] : prev;
    });
  }, []);

  const refresh = useCallback(async (s: Session) => {
    const res = await fetch(`/api/chat/${s.id}`, { headers: { "x-chat-key": s.accessKey } });
    if (res.status === 404) {
      saveSession(null);
      setSession(null);
      return;
    }
    if (!res.ok) return;
    const json = await res.json();
    addMessages(json.messages);
    setToken(json.token);
  }, [addMessages]);

  const initialSession = useRef(session);
  useEffect(() => {
    const stored = initialSession.current;
    if (stored) refresh(stored).finally(() => setLoading(false));
  }, [refresh]);

  const { connected } = useRealtime({
    rooms: session ? [`chat:${session.id}`] : [],
    token,
    handlers: {
      "chat:message": (data: { message: Message }) => addMessages([data.message]),
    },
  });

  // Sem tempo real disponível (ou ligação perdida), procurar respostas de vez em quando.
  useEffect(() => {
    if (!session || connected) return;
    const timer = setInterval(() => refresh(session), 10000);
    return () => clearInterval(timer);
  }, [session, connected, refresh]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    setError(null);

    try {
      const res = session
        ? await fetch(`/api/chat/${session.id}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-chat-key": session.accessKey },
            body: JSON.stringify({ body }),
          })
        : await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, phone: phone || undefined, message: body }),
          });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Não conseguimos enviar. Tenta novamente.");
        return;
      }
      if (session) {
        addMessages([json.message]);
      } else {
        saveSession(json.conversation);
        setSession(json.conversation);
        setToken(json.token);
        addMessages(json.messages);
      }
      setDraft("");
    } catch {
      setError("Sem ligação à internet. Tenta novamente.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gold" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={listRef} className="flex min-h-40 flex-1 flex-col gap-3 overflow-y-auto p-4">
        <Bubble sender="EQUIPA">
          Olá{session ? `, ${session.customerName.split(" ")[0]}` : ""}! Escreve a tua dúvida e
          respondemos aqui mesmo, o mais depressa possível.
        </Bubble>
        {messages.map((m) => (
          <Bubble key={m.id} sender={m.sender}>
            {m.body}
          </Bubble>
        ))}
        {session && messages.length > 0 && messages.at(-1)?.sender === "CLIENTE" && (
          <p className="flex items-center gap-1.5 self-end font-body text-xs text-ink/50">
            <CheckCircle2 className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
            Mensagem enviada. Vamos responder em breve.
          </p>
        )}
      </div>

      <form onSubmit={send} className="flex flex-col gap-2 border-t border-ink/10 bg-white/70 p-3 backdrop-blur-sm">
        {!session && (
          <div className="grid grid-cols-2 gap-2">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="O teu nome"
              autoComplete="given-name"
              className="input h-11 text-sm"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Telefone (opcional)"
              type="tel"
              autoComplete="tel"
              className="input h-11 text-sm"
            />
          </div>
        )}
        {error && <p className="font-body text-sm text-ink">{error}</p>}
        <div className="flex gap-2">
          <input
            required
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Escreve a tua mensagem"
            maxLength={1000}
            className="input h-12 flex-1 text-sm"
          />
          <button
            type="submit"
            disabled={sending}
            className="flex h-12 items-center gap-2 border border-ink bg-ink px-4 font-body text-sm text-cream transition hover:bg-cream hover:text-ink disabled:opacity-60"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}

function Bubble({ sender, children }: { sender: Message["sender"]; children: React.ReactNode }) {
  const mine = sender === "CLIENTE";
  return (
    <div
      className={`max-w-[85%] whitespace-pre-wrap px-4 py-2.5 font-body text-sm ${
        mine ? "self-end bg-ink text-cream" : "self-start border border-ink/15 bg-white/80 text-ink"
      }`}
    >
      {!mine && <span className="mb-0.5 block text-xs text-gold">Deodália Dias</span>}
      {children}
    </div>
  );
}
