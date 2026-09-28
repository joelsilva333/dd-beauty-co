"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, Landmark, Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatKwanza } from "@/lib/currency";
import { ANGOLA_PROVINCES, estimateDeliveryDays } from "@/lib/angola";
import { calculateShippingCents } from "@/lib/shipping";
import { CheckoutSteps } from "@/components/CheckoutSteps";

type DeliveryData = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  province: string;
  municipality: string;
  addressLine: string;
  addressNotes: string;
};

const EMPTY_DELIVERY: DeliveryData = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  province: "",
  municipality: "",
  addressLine: "",
  addressNotes: "",
};

export default function CheckoutPage() {
  const { items, totalCents } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [delivery, setDelivery] = useState<DeliveryData>(EMPTY_DELIVERY);
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "BITPAY_AO" | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) router.replace("/carrinho");
  }, [items, router]);

  const shippingCents = delivery.province
    ? calculateShippingCents(delivery.province)
    : 0;
  const totalWithShipping = totalCents + shippingCents;

  const deliveryValid = useMemo(
    () =>
      delivery.customerName.trim().length > 1 &&
      delivery.customerPhone.trim().length > 8 &&
      delivery.province.trim().length > 1 &&
      delivery.municipality.trim().length > 1 &&
      delivery.addressLine.trim().length > 4,
    [delivery],
  );

  if (items.length === 0) return null;

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
          addressLine: delivery.addressLine,
          addressNotes: delivery.addressNotes || undefined,
          paymentMethod,
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
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
      <CheckoutSteps current={step + 1} />

      {step === 1 && (
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-display text-2xl text-ink">
              Para onde enviamos a tua encomenda?
            </h1>
            <p className="mt-1 font-body text-sm text-ink/60">
              Falta 1 passo para terminar depois deste.
            </p>
          </div>

          <form
            className="flex flex-col gap-5"
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

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Província">
                <select
                  required
                  value={delivery.province}
                  onChange={(e) =>
                    setDelivery((d) => ({ ...d, province: e.target.value }))
                  }
                  className="input"
                >
                  <option value="">Escolhe a província</option>
                  {ANGOLA_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Município">
                <input
                  required
                  value={delivery.municipality}
                  onChange={(e) =>
                    setDelivery((d) => ({ ...d, municipality: e.target.value }))
                  }
                  className="input"
                  placeholder="O teu município"
                />
              </Field>
            </div>

            <Field label="Morada / ponto de referência">
              <input
                required
                value={delivery.addressLine}
                onChange={(e) =>
                  setDelivery((d) => ({ ...d, addressLine: e.target.value }))
                }
                className="input"
                placeholder="Rua, número, bairro..."
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
                Tempo estimado de entrega em {delivery.province}:{" "}
                {estimateDeliveryDays(delivery.province)}.
              </p>
            )}

            <button
              type="submit"
              disabled={!deliveryValid}
              className="flex h-14 items-center justify-center rounded-full bg-ink font-body text-base tracking-wide-label uppercase text-cream transition hover:bg-gold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continuar para pagamento
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-display text-2xl text-ink">
              Como preferes pagar?
            </h1>
            <p className="mt-1 font-body text-sm text-ink/60">
              As duas opções são seguras. Escolhe a que for mais fácil para ti.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <PaymentOption
              icon={<CreditCard className="h-6 w-6" aria-hidden="true" />}
              title="Cartão internacional (Stripe)"
              description="Paga com cartão Visa ou Mastercard, de forma segura."
              selected={paymentMethod === "STRIPE"}
              onSelect={() => setPaymentMethod("STRIPE")}
            />
            <PaymentOption
              icon={<Landmark className="h-6 w-6" aria-hidden="true" />}
              title="BitPayAO (pagamento local)"
              description="Paga através dos métodos angolanos de referência, com toda a confiança."
              selected={paymentMethod === "BITPAY_AO"}
              onSelect={() => setPaymentMethod("BITPAY_AO")}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex h-14 flex-1 items-center justify-center rounded-full border border-taupe/40 font-body text-sm tracking-wide-label uppercase text-ink"
            >
              Voltar
            </button>
            <button
              type="button"
              disabled={!paymentMethod}
              onClick={() => setStep(3)}
              className="flex h-14 flex-1 items-center justify-center rounded-full bg-ink font-body text-sm tracking-wide-label uppercase text-cream transition hover:bg-gold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-display text-2xl text-ink">
              Revê o teu pedido
            </h1>
            <p className="mt-1 font-body text-sm text-ink/60">
              Confirma que está tudo certo antes de finalizar.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-taupe/25 p-5">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between font-body text-sm">
                <span>
                  {item.quantity}× {item.name}
                </span>
                <span>{formatKwanza(item.priceCents * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-taupe/25 pt-3 flex justify-between font-body text-sm text-ink/70">
              <span>Entrega</span>
              <span>{formatKwanza(shippingCents)}</span>
            </div>
            <div className="flex justify-between font-display text-lg text-ink">
              <span>Total</span>
              <span>{formatKwanza(totalWithShipping)}</span>
            </div>
          </div>

          <div className="rounded-xl border border-taupe/25 p-5 font-body text-sm text-ink/70">
            <p className="font-medium text-ink">Entregar a</p>
            <p>{delivery.customerName} · {delivery.customerPhone}</p>
            <p>
              {delivery.addressLine}, {delivery.municipality}, {delivery.province}
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 font-body text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex h-14 flex-1 items-center justify-center rounded-full border border-taupe/40 font-body text-sm tracking-wide-label uppercase text-ink"
            >
              Voltar
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirm}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-gold font-body text-sm tracking-wide-label uppercase text-white transition hover:bg-ink disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Confirmar pedido
            </button>
          </div>
        </div>
      )}

      <p className="mt-10 text-center font-body text-xs text-ink/40">
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
      <span className="font-body text-sm text-ink/70">{label}</span>
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
      className={`flex items-start gap-4 rounded-xl border p-5 text-left transition ${
        selected ? "border-gold bg-gold/10" : "border-taupe/30 hover:border-gold/60"
      }`}
    >
      <span className={selected ? "text-gold" : "text-ink/60"}>{icon}</span>
      <span className="flex flex-col gap-1">
        <span className="font-display text-lg text-ink">{title}</span>
        <span className="font-body text-sm text-ink/60">{description}</span>
      </span>
    </button>
  );
}
