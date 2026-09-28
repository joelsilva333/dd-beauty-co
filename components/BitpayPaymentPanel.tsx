"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Copy, Landmark, Loader2, RefreshCw, Smartphone } from "lucide-react";
import { formatKwanza } from "@/lib/currency";

const FAILURE_MESSAGES: Record<string, string> = {
  rejected_by_customer: "O pagamento foi recusado na app Multicaixa Express.",
  insufficient_funds: "O pagamento não passou por falta de saldo.",
  provider_unavailable: "O serviço Multicaixa não respondeu.",
};

type Props = {
  orderNumber: string;
  method: "multicaixa_express" | "multicaixa_reference" | null;
  paymentStatus: string;
  failureCode: string | null;
  totalCents: number;
  phone: string;
  reference: { entity: string; number: string; expiresAt: string } | null;
};

export function BitpayPaymentPanel(props: Props) {
  const router = useRouter();
  const failed = props.paymentStatus === "FALHOU";
  const waitingExpress = !failed && props.method === "multicaixa_express";

  // Enquanto a cliente aprova na app, perguntamos o estado a cada 4 s (máx. 5 min).
  // O tempo real também atualiza a página; isto é a rede de segurança.
  useEffect(() => {
    if (!waitingExpress) return;
    let tries = 0;
    const timer = setInterval(async () => {
      tries++;
      if (tries > 75) return clearInterval(timer);
      const res = await fetch(`/api/pedido/${props.orderNumber}/pagamento`, { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      if (json.paymentStatus !== "PENDENTE" || json.status === "CANCELADO") {
        clearInterval(timer);
        router.refresh();
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [waitingExpress, props.orderNumber, router]);

  if (failed) return <RetryPayment {...props} />;

  if (props.method === "multicaixa_reference" && props.reference) {
    return <ReferenceDetails reference={props.reference} totalCents={props.totalCents} />;
  }

  if (props.method === "multicaixa_express") {
    return (
      <div role="status" className="flex flex-col items-center gap-5 border border-ink/10 p-8 text-center">
        <span className="relative flex h-14 w-14 items-center justify-center">
          <Smartphone className="h-7 w-7 text-gold" aria-hidden="true" strokeWidth={1.25} />
          <span className="absolute inset-0 animate-ping border border-gold/40" aria-hidden="true" />
        </span>
        <p className="font-display text-2xl text-ink">Aprova o pagamento no teu telemóvel</p>
        <ol className="flex flex-col gap-2 text-left font-body text-sm text-ink/80">
          <li>1. Abre a app <strong>Multicaixa Express</strong> no número {props.phone}.</li>
          <li>2. Vais ver um pedido de {formatKwanza(props.totalCents)} da Deodália Dias.</li>
          <li>3. Toca em <strong>Aprovar</strong>. Esta página atualiza sozinha.</li>
        </ol>
        <p className="flex items-center gap-2 font-body text-sm text-ink/60">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          À espera da tua aprovação...
        </p>
      </div>
    );
  }

  // Modo manual (BitPay sem credenciais): a equipa entra em contacto.
  return null;
}

function ReferenceDetails({
  reference,
  totalCents,
}: {
  reference: NonNullable<Props["reference"]>;
  totalCents: number;
}) {
  const formattedRef = reference.number.replace(/(\d{3})(?=\d)/g, "$1 ");
  const expires = new Date(reference.expiresAt).toLocaleString("pt-AO", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div className="flex flex-col gap-6 border border-ink/10 p-8 text-left">
      <p className="flex items-center gap-2.5 font-display text-2xl text-ink">
        <Landmark className="h-5 w-5 text-gold" aria-hidden="true" strokeWidth={1.5} />
        Paga por referência Multicaixa
      </p>
      <dl className="grid gap-6 border-y border-ink/10 py-6 sm:grid-cols-3">
        <CopyField label="Entidade" value={reference.entity} />
        <CopyField label="Referência" value={reference.number} display={formattedRef} />
        <CopyField label="Montante" value={String(Math.round(totalCents / 100))} display={formatKwanza(totalCents)} />
      </dl>
      <ol className="flex flex-col gap-2 font-body text-sm text-ink/80">
        <li>1. Num ATM Multicaixa ou na app do teu banco, escolhe <strong>Pagamentos → Pagamentos por referência</strong>.</li>
        <li>2. Escreve a entidade, a referência e o montante acima.</li>
        <li>3. Confirma. Assim que pagares, esta página atualiza e recebes uma mensagem.</li>
      </ol>
      <p className="font-body text-sm text-ink/60">
        Guardamos a tua encomenda até <strong>{expires}</strong>. Enviámos também estes dados por mensagem.
      </p>
    </div>
  );
}

function CopyField({ label, value, display }: { label: string; value: string; display?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <dt className="eyebrow">{label}</dt>
      <dd className="flex items-center gap-2">
        <span className="font-display text-2xl text-ink tabular-nums">{display ?? value}</span>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              // sem acesso à área de transferência: o número está visível para copiar à mão
            }
          }}
          className="flex h-9 items-center gap-1 border border-ink/25 px-2.5 font-body text-xs text-ink transition hover:border-ink"
          aria-label={`Copiar ${label}`}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-gold" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </dd>
    </div>
  );
}

function RetryPayment({ orderNumber, failureCode, phone }: Props) {
  const router = useRouter();
  const [method, setMethod] = useState<"multicaixa_express" | "multicaixa_reference">("multicaixa_express");
  const [mobile, setMobile] = useState(phone);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function retry(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/pedido/${orderNumber}/pagamento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, mobile: method === "multicaixa_express" ? mobile : undefined }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Não foi possível tentar de novo.");
        return;
      }
      router.refresh();
    } catch {
      setError("Sem ligação à internet. Tenta novamente.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={retry} className="flex flex-col gap-5 border border-ink/10 p-8 text-left">
      <p className="flex items-start gap-2.5 font-body text-ink">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-ink" aria-hidden="true" strokeWidth={1.5} />
        <span>
          {(failureCode && FAILURE_MESSAGES[failureCode]) ?? "O pagamento não foi concluído."} Não foi
          cobrado nada e a tua encomenda continua guardada.
        </span>
      </p>

      <fieldset className="flex flex-col gap-3">
        <legend className="eyebrow mb-2">Como queres tentar agora?</legend>
        <label className={`flex items-center gap-3 border p-4 transition ${method === "multicaixa_express" ? "border-ink" : "border-ink/15 hover:border-ink/40"}`}>
          <input type="radio" name="method" checked={method === "multicaixa_express"} onChange={() => setMethod("multicaixa_express")} className="h-4 w-4 accent-ink" />
          <Smartphone className="h-4 w-4 text-gold" aria-hidden="true" strokeWidth={1.5} />
          <span className="font-body text-sm text-ink">Multicaixa Express outra vez</span>
        </label>
        {method === "multicaixa_express" && (
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="input"
            aria-label="Número Multicaixa Express"
            placeholder="9XX XXX XXX"
          />
        )}
        <label className={`flex items-center gap-3 border p-4 transition ${method === "multicaixa_reference" ? "border-ink" : "border-ink/15 hover:border-ink/40"}`}>
          <input type="radio" name="method" checked={method === "multicaixa_reference"} onChange={() => setMethod("multicaixa_reference")} className="h-4 w-4 accent-ink" />
          <Landmark className="h-4 w-4 text-gold" aria-hidden="true" strokeWidth={1.5} />
          <span className="font-body text-sm text-ink">Referência Multicaixa (pagar no ATM ou na app do banco)</span>
        </label>
      </fieldset>

      {error && <p role="alert" className="font-body text-sm text-ink">{error}</p>}

      <button type="submit" disabled={sending} className="btn-dark">
        {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
        Tentar pagar de novo
      </button>
    </form>
  );
}
