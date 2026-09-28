"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { MessagesSquare, ShoppingBag, X } from "lucide-react";
import { useRealtime } from "@/lib/realtime-client";
import { formatKwanza } from "@/lib/currency";

type Alert = { id: string; icon: "order" | "chat"; title: string; body: string; href: string };

// Som curto e suave gerado no browser (sem ficheiros para descarregar).
function chime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
    osc.onended = () => ctx.close();
  } catch {
    // o browser pode bloquear som antes de uma interação; o aviso visual chega
  }
}

export function AdminLiveAlerts({ token }: { token: string | null }) {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const push = useCallback((alert: Alert) => {
    setAlerts((prev) => [alert, ...prev].slice(0, 4));
    chime();
    setTimeout(() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id)), 12000);
  }, []);

  const { connected } = useRealtime({
    rooms: token ? ["admin"] : [],
    token,
    handlers: {
      "order:created": (o: { id: string; orderNumber: string; customerName: string; totalCents: number }) => {
        push({
          id: `order-${o.id}`,
          icon: "order",
          title: `Nova encomenda ${o.orderNumber}`,
          body: `${o.customerName} · ${formatKwanza(o.totalCents)}`,
          href: `/admin/encomendas/${o.id}`,
        });
        router.refresh();
      },
      "order:updated": () => router.refresh(),
      "chat:conversation": (c: { id: string; customerName: string; preview: string; sender: string }) => {
        if (c.sender === "CLIENTE") {
          push({
            id: `chat-${c.id}-${Date.now()}`,
            icon: "chat",
            title: `Mensagem de ${c.customerName}`,
            body: c.preview,
            href: `/admin/conversas/${c.id}`,
          });
        }
        router.refresh();
      },
    },
  });

  return (
    <>
      {token && (
        <p className="flex items-center gap-2 font-body text-xs text-ink/50">
          <span
            className={`h-2 w-2 rounded-full ${connected ? "bg-gold" : "bg-taupe/50"}`}
            aria-hidden="true"
          />
          {connected ? "Ao vivo" : "A ligar..."}
        </p>
      )}

      <div className="fixed bottom-5 right-5 z-50 flex w-[calc(100%-2.5rem)] max-w-sm flex-col gap-3" aria-live="polite">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="fade-up flex items-start gap-3 rounded-xl border border-gold/40 bg-white p-4 shadow-lg shadow-ink/10"
          >
            {alert.icon === "order" ? (
              <ShoppingBag className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
            ) : (
              <MessagesSquare className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
            )}
            <Link href={alert.href} className="flex-1" onClick={() => setAlerts((p) => p.filter((a) => a.id !== alert.id))}>
              <p className="font-body text-sm font-medium text-ink">{alert.title}</p>
              <p className="line-clamp-2 font-body text-sm text-ink/60">{alert.body}</p>
            </Link>
            <button
              type="button"
              onClick={() => setAlerts((p) => p.filter((a) => a.id !== alert.id))}
              className="flex h-8 w-8 items-center justify-center text-ink/50"
              aria-label="Fechar aviso"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
