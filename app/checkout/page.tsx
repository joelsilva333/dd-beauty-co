"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Landmark,
  Loader2,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatKwanza } from "@/lib/currency";
import { calculateShippingCents, estimateDeliveryDays } from "@/lib/shipping";
import { aoaCentsToUsdCents } from "@/lib/exchange";
import { CheckoutSteps } from "@/components/CheckoutSteps";
import { LocationFields } from "@/components/LocationFields";

type DeliveryData = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  province: string;
  municipality: string;
  bairro: string;
  addressLine: string;
  addressNotes: string;
};

const EMPTY_DELIVERY: DeliveryData = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  province: "",
  municipality: "",
  bairro: "",
  addressLine: "",
  addressNotes: "",
};

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ pagamento?: string }>;
}) {
  // Voltou do Stripe sem pagar: o carrinho continua intacto para tentar de novo.
  const paymentCancelled = use(searchParams).pagamento === "cancelado";
  const { items, totalCents, hydrated } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [delivery, setDelivery] = useState<DeliveryData>(EMPTY_DELIVERY);
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "BITPAY_AO" | null>(
    null,
  );
  const [bitpayMethod, setBitpayMethod] = useState<"multicaixa_express" | "multicaixa_reference" | null>(null);
  const [bitpayMobile, setBitpayMobile] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && items.length === 0) router.replace("/carrinho");
  }, [hydrated, items, router]);

  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const shippingCents = delivery.province
    ? calculateShippingCents(delivery.province, totalQuantity)
    : 0;
  const totalWithShipping = totalCents + shippingCents;

  const deliveryValid = useMemo(
    () =>
      delivery.customerName.trim().length > 1 &&
      delivery.customerPhone.trim().length > 8 &&
      delivery.province.trim().length > 1 &&
      delivery.municipality.trim().length > 1 &&
      delivery.bairro.trim().length > 1 &&
      delivery.addressLine.trim().length > 4,
    [delivery],
  );

  if (!hydrated || items.length === 0) return null;

  async function handleConfirm() {
    if (!paymentMethod) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: delivery.customerName,
          customerPhone: delivery.customerPhone,
          customerEmail: delivery.customerEmail || undefined,
          province: delivery.province,
          municipality: delivery.municipality,
          bairro: delivery.bairro,
          addressLine: delivery.addressLine,
          addressNotes: delivery.addressNotes || undefined,
          paymentMethod,
          bitpayMethod: paymentMethod === "BITPAY_AO" ? bitpayMethod : undefined,
          bitpayMobile:
            paymentMethod === "BITPAY_AO" && bitpayMethod === "multicaixa_express" && bitpayMobile
              ? bitpayMobile
              : undefined,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Não foi possível concluir o pedido.");
        setSubmitting(false);
        return;
      }

      window.location.href = json.redirectUrl;
    } catch {
      setError("Ocorreu um problema de ligação. Tenta novamente.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-8 md:py-20">
      <CheckoutSteps current={step === 1 ? 2 : 3} />

      {paymentCancelled && (
        <p role="status" className="mb-8 flex items-start gap-3 border border-gold/40 bg-gold/5 px-4 py-3 font-body text-sm text-ink">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
          O pagamento não foi concluído e nada foi cobrado. Podes tentar novamente — o teu carrinho está guardado.
        </p>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="font-display text-3xl text-ink">
              Para onde enviamos a tua encomenda?
            </h1>
            <p className="mt-2 font-body text-sm text-ink/55">
              Faltam 2 passos para terminar.
            </p>
          </div>

          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (deliveryValid) setStep(2);
            }}
          >
            <Field label="Nome completo">
              <input
                required
                value={delivery.customerName}
                onChange={(e) =>
                  setDelivery((d) => ({ ...d, customerName: e.target.value }))
                }
                className="input"
                placeholder="O teu nome"
              />
            </Field>

            <Field label="Telefone (para combinar a entrega)">
              <input
                required
                type="tel"
                value={delivery.customerPhone}
                onChange={(e) =>
                  setDelivery((d) => ({ ...d, customerPhone: e.target.value }))
                }
                className="input"
                placeholder="9XX XXX XXX"
              />
            </Field>

            <Field label="Email (opcional)">
              <input
                type="email"
                value={delivery.customerEmail}
                onChange={(e) =>
                  setDelivery((d) => ({ ...d, customerEmail: e.target.value }))
                }
                className="input"
                placeholder="para receberes a confirmação"
              />
            </Field>

            <LocationFields
              value={{
                province: delivery.province,
                municipality: delivery.municipality,
                bairro: delivery.bairro,
              }}
              onChange={(location) => setDelivery((d) => ({ ...d, ...location }))}
            />

            <Field label="Morada / ponto de referência">
              <input
                required
                value={delivery.addressLine}
                onChange={(e) =>
                  setDelivery((d) => ({ ...d, addressLine: e.target.value }))
                }
                className="input"
                placeholder="Rua, número, ponto de referência..."
              />
            </Field>

            <Field label="Notas para a entrega (opcional)">
              <textarea
                value={delivery.addressNotes}
                onChange={(e) =>
                  setDelivery((d) => ({ ...d, addressNotes: e.target.value }))
                }
                className="input min-h-24"
                placeholder="Ex: casa azul perto do mercado"
              />
            </Field>

            {delivery.province && (
              <p className="font-body text-sm text-ink/60">
                Entrega em {delivery.province}: {estimateDeliveryDays(delivery.province)} ·{" "}
                {formatKwanza(shippingCents)} de portes ({totalQuantity}{" "}
                {totalQuantity === 1 ? "produto" : "produtos"}).
              </p>
            )}

            <button type="submit" disabled={!deliveryValid} className="btn-dark mt-2">
              Continuar para pagamento
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            {!deliveryValid && (
              <p className="text-center font-body text-sm text-ink/50">
                Preenche o nome, telefone, província, município, bairro e morada para continuar.
              </p>
            )}
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="font-display text-3xl text-ink">
              Como preferes pagar?
            </h1>
            <p className="mt-2 font-body text-sm text-ink/55">
              Todas as opções são seguras. Escolhe a que for mais fácil para ti — e recebes a
              encomenda no conforto da tua casa.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <PaymentOption
              icon={<Landmark className="h-5 w-5" aria-hidden="true" strokeWidth={1.5} />}
              title="Pagamento em Kwanza (Angola)"
              description="Multicaixa Express (aprovas no telemóvel) ou Referência Multicaixa (pagas no ATM ou na app do banco)."
              selected={paymentMethod === "BITPAY_AO"}
              onSelect={() => setPaymentMethod("BITPAY_AO")}
            />
            <PaymentOption
              icon={<CreditCard className="h-5 w-5" aria-hidden="true" strokeWidth={1.5} />}
              title="Cartão internacional"
              description="Visa, Mastercard e outros cartões internacionais, numa página de pagamento segura."
              selected={paymentMethod === "STRIPE"}
              onSelect={() => setPaymentMethod("STRIPE")}
            />
          </div>

          {paymentMethod === "BITPAY_AO" && (
            <fieldset className="fade-up flex flex-col gap-3 border-t border-ink/10 pt-6">
              <legend className="eyebrow mb-1">Escolhe a forma de pagar em Kwanza</legend>
              <SubOption
                icon={<Smartphone className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />}
                title="Multicaixa Express"
                description="Aprovas o pagamento na app, no teu telemóvel. É o mais rápido."
                selected={bitpayMethod === "multicaixa_express"}
                onSelect={() => setBitpayMethod("multicaixa_express")}
              />
              {bitpayMethod === "multicaixa_express" && (
                <label className="flex flex-col gap-2 pl-1">
                  <span className="eyebrow">Número com Multicaixa Express</span>
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={bitpayMobile || delivery.customerPhone}
                    onChange={(e) => setBitpayMobile(e.target.value)}
                    className="input"
                    placeholder="9XX XXX XXX"
                  />
                </label>
              )}
              <SubOption
                icon={<Landmark className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />}
                title="Referência Multicaixa"
                description="Recebes uma referência para pagar no ATM ou na app do banco, até 3 dias."
                selected={bitpayMethod === "multicaixa_reference"}
                onSelect={() => setBitpayMethod("multicaixa_reference")}
              />
            </fieldset>
          )}

          <p className="flex items-center gap-2 font-body text-sm text-ink/55">
            <ShieldCheck className="h-4 w-4 text-gold" aria-hidden="true" strokeWidth={1.5} />
            Nunca guardamos os dados do teu cartão.
          </p>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Voltar
            </button>
            <button
              type="button"
              disabled={!paymentMethod || (paymentMethod === "BITPAY_AO" && !bitpayMethod)}
              onClick={() => setStep(3)}
              className="btn-dark flex-1"
            >
              Continuar
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="font-display text-3xl text-ink">
              Revê o teu pedido
            </h1>
            <p className="mt-2 font-body text-sm text-ink/55">
              Falta 1 passo para terminar: confirma que está tudo certo.
            </p>
          </div>

          <div className="flex flex-col gap-3 border-y border-ink/10 py-6">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between font-body text-sm">
                <span>
                  {item.quantity}× {item.name}
                </span>
                <span>{formatKwanza(item.priceCents * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-ink/10 pt-3 flex justify-between font-body text-sm text-ink/60">
              <span>Entrega</span>
              <span>{formatKwanza(shippingCents)}</span>
            </div>
            <div className="flex justify-between font-display text-lg text-ink">
              <span>Total</span>
              <span>{formatKwanza(totalWithShipping)}</span>
            </div>
          </div>

          <div className="font-body text-sm text-ink/65">
            <p className="font-medium text-ink">Entregar a</p>
            <p className="mt-1">{delivery.customerName} · {delivery.customerPhone}</p>
            <p>
              {delivery.addressLine}, {delivery.bairro}, {delivery.municipality}, {delivery.province}
            </p>
            <p className="mt-2">Chega em {estimateDeliveryDays(delivery.province)}.</p>
            <button type="button" onClick={() => setStep(1)} className="link-underline mt-3 underline">
              Alterar morada
            </button>
          </div>

          <div className="flex items-start gap-3 border-t border-ink/10 pt-6 font-body text-sm text-ink/65">
            {paymentMethod === "STRIPE" ? (
              <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" strokeWidth={1.5} />
            ) : (
              <Landmark className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" strokeWidth={1.5} />
            )}
            <div>
              <p className="font-medium text-ink">
                {paymentMethod === "STRIPE"
                  ? "Cartão Visa ou Mastercard"
                  : bitpayMethod === "multicaixa_express"
                    ? "Multicaixa Express"
                    : "Referência Multicaixa"}
              </p>
              {paymentMethod === "STRIPE" ? (
                <p className="mt-1">
                  Ao confirmar, abrimos uma página de pagamento segura. O cartão é cobrado em
                  dólares: cerca de {(aoaCentsToUsdCents(totalWithShipping) / 100).toFixed(2)} USD
                  (o teu banco pode aplicar a taxa de câmbio dele).
                </p>
              ) : (
                <p className="mt-1">
                  {bitpayMethod === "multicaixa_express"
                    ? `Ao confirmar, recebes um pedido de pagamento na app Multicaixa Express do número ${bitpayMobile || delivery.customerPhone}. Só tens de aprovar.`
                    : "Ao confirmar, mostramos-te a entidade e a referência para pagares no ATM ou na app do banco."}
                </p>
              )}
            </div>
          </div>

          {error && (
            <p role="alert" className="flex items-start gap-3 border border-ink/20 bg-ink/5 px-4 py-3 font-body text-sm text-ink">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-ink" aria-hidden="true" />
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={submitting}
              className="btn-outline flex-1"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Voltar
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirm}
              className="btn-dark flex-1"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              )}
              {submitting ? "A confirmar..." : "Confirmar pedido"}
            </button>
          </div>
        </div>
      )}

      <p className="mt-12 text-center font-body text-xs text-ink/40">
        Tens dúvidas?{" "}
        <Link href="/contacto" className="underline underline-offset-4">
          Fala connosco
        </Link>
        .
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow">{label}</span>
      {children}
    </label>
  );
}

function PaymentOption({
  icon,
  title,
  description,
  selected,
  onSelect,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`relative flex items-start gap-4 border p-5 text-left transition ${
        selected ? "border-ink" : "border-ink/15 hover:border-ink/40"
      }`}
    >
      <span className={selected ? "text-gold" : "text-ink/50"}>{icon}</span>
      <span className="flex flex-col gap-1">
        <span className="font-body font-medium text-ink">{title}</span>
        <span className="font-body text-sm text-ink/55">{description}</span>
      </span>
      {selected && (
        <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center bg-ink text-cream">
          <Check className="h-3 w-3" aria-hidden="true" />
        </span>
      )}
    </button>
  );
}

function SubOption({
  icon,
  title,
  description,
  selected,
  onSelect,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`relative flex min-h-16 items-start gap-3 border p-4 text-left transition ${
        selected ? "border-ink" : "border-ink/15 hover:border-ink/40"
      }`}
    >
      <span className={`mt-0.5 ${selected ? "text-gold" : "text-ink/50"}`}>{icon}</span>
      <span className="flex flex-col gap-0.5">
        <span className="font-body font-medium text-ink">{title}</span>
        <span className="font-body text-sm text-ink/55">{description}</span>
      </span>
      {selected && (
        <span className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center bg-ink text-cream">
          <Check className="h-2.5 w-2.5" aria-hidden="true" />
        </span>
      )}
    </button>
  );
}
