"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Copy, MessageCircle, Share2 } from "lucide-react";
import { whatsappLink } from "@/lib/site-config";

// A Web Share API não existe no servidor; usar useSyncExternalStore em vez de
// um efeito com setState evita divergência entre o HTML do servidor e o do
// cliente na primeira renderização (o valor nunca muda, por isso não há
// subscrição real a fazer).
function subscribeNever() {
  return () => {};
}
function hasNativeShare() {
  return typeof navigator !== "undefined" && "share" in navigator;
}
function hasNativeShareOnServer() {
  return false;
}

/**
 * Botões de partilha de um produto: WhatsApp, copiar link, e o partilhar
 * nativo do telemóvel (Web Share API) quando o navegador o suporta.
 */
export function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const canNativeShare = useSyncExternalStore(
    subscribeNever,
    hasNativeShare,
    hasNativeShareOnServer,
  );

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sem permissão de clipboard (ex: http sem TLS): não há muito a fazer.
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url });
    } catch {
      // Utilizadora cancelou a partilha — não é um erro a mostrar.
    }
  }

  return (
    <div className="flex flex-col gap-3 border-t border-ink/10 pt-6">
      <span className="eyebrow">Partilhar</span>
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={whatsappLink(`Olha este produto: ${title} — ${url}`)}
          target="_blank"
          rel="noreferrer"
          className="flex h-11 items-center gap-2 border border-ink/15 px-4 font-body text-[11px] font-medium tracking-[0.2em] text-ink/70 uppercase transition hover:border-ink hover:text-ink"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
          WhatsApp
        </a>

        <button
          type="button"
          onClick={copyLink}
          className="flex h-11 items-center gap-2 border border-ink/15 px-4 font-body text-[11px] font-medium tracking-[0.2em] text-ink/70 uppercase transition hover:border-ink hover:text-ink"
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
          )}
          {copied ? "Copiado" : "Copiar link"}
        </button>

        {canNativeShare && (
          <button
            type="button"
            onClick={nativeShare}
            className="flex h-11 items-center gap-2 border border-ink/15 px-4 font-body text-[11px] font-medium tracking-[0.2em] text-ink/70 uppercase transition hover:border-ink hover:text-ink"
          >
            <Share2 className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            Partilhar
          </button>
        )}
      </div>
    </div>
  );
}
