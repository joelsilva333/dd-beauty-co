import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock, MessageCircle, PackageSearch, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { formatKwanza } from "@/lib/currency";
import { estimateDeliveryDays } from "@/lib/shipping";
import { markOrderPaid } from "@/lib/orders";
import { syncBitpayPayment } from "@/lib/bitpay";
import { BitpayPaymentPanel } from "@/components/BitpayPaymentPanel";
import { createRealtimeToken, rooms } from "@/lib/realtime";
import { SITE, whatsappLink } from "@/lib/site-config";
import { ClearCartOnMount } from "@/components/ClearCartOnMount";
import { CheckoutSteps } from "@/components/CheckoutSteps";
import { LiveOrderRefresh } from "@/components/LiveOrderRefresh";

export const dynamic = "force-dynamic";

async function syncStripePayment(order: { id: string; stripeSessionId: string | null }) {
  // O webhook pode chegar depois da cliente: confirmamos diretamente com o Stripe.
  if (!order.stripeSessionId) return false;
  try {
    const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
    if (session.payment_status === "paid") {
      await markOrderPaid(order.id);
      return true;
    }
  } catch (error) {
    console.error("[confirmado] não foi possível verificar o Stripe:", error);
  }
  return false;
}

export default async function OrderConfirmedPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  let order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) notFound();

  if (order.paymentMethod === "STRIPE" && order.paymentStatus !== "PAGO") {
    if (await syncStripePayment(order)) {
      order = await prisma.order.findUniqueOrThrow({ where: { orderNumber }, include: { items: true } });
    }
  }
  if (order.paymentMethod === "BITPAY_AO" && order.paymentStatus === "PENDENTE") {
    await syncBitpayPayment(order);
    order = await prisma.order.findUniqueOrThrow({ where: { orderNumber }, include: { items: true } });
  }

  const paid = order.paymentStatus === "PAGO";
  const cancelled = order.status === "CANCELADO";
  // Pagamento BitPay ainda por concluir no nosso ecrã (Express ou Referência).
  const bitpayInProgress = !paid && !cancelled && Boolean(order.bitpayPaymentId);
  const token = await createRealtimeToken([rooms.order(order.orderNumber)]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 text-center md:py-20">
      <ClearCartOnMount />
      <LiveOrderRefresh orderNumber={order.orderNumber} token={token} />
      {!cancelled && <CheckoutSteps current={bitpayInProgress ? 3 : 5} />}

      {cancelled ? (
        <XCircle className="mx-auto h-12 w-12 text-taupe" aria-hidden="true" strokeWidth={1.25} />
      ) : bitpayInProgress ? null : (
        <CheckCircle2 className="fade-up mx-auto h-12 w-12 text-gold" aria-hidden="true" strokeWidth={1.25} />
      )}
      <h1 className="mt-6 font-display text-4xl text-ink">
        {cancelled
          ? "Este pedido foi cancelado"
          : bitpayInProgress
            ? "Falta só o pagamento"
            : "O teu pedido foi confirmado"}
      </h1>
      <p className="mt-3 font-body text-ink/60">
        Número do pedido:{" "}
        <span className="font-medium text-ink">{order.orderNumber}</span>
      </p>
      <p className="mt-1 font-body text-sm text-ink/45">
        Guarda este número. Vais precisar dele para acompanhar a encomenda.
      </p>

      {bitpayInProgress && (
        <div className="mt-10">
          <BitpayPaymentPanel
            orderNumber={order.orderNumber}
            method={order.bitpayMethod as "multicaixa_express" | "multicaixa_reference" | null}
            paymentStatus={order.paymentStatus}
            failureCode={order.bitpayFailureCode}
            totalCents={order.totalCents}
            phone={order.customerPhone}
            reference={
              order.bitpayRefEntity && order.bitpayRefNumber && order.bitpayRefExpiresAt
                ? {
                    entity: order.bitpayRefEntity,
                    number: order.bitpayRefNumber,
                    expiresAt: order.bitpayRefExpiresAt.toISOString(),
                  }
                : null
            }
          />
        </div>
      )}

      {!cancelled && !bitpayInProgress && (
        <div
          role="status"
          className={`mx-auto mt-7 inline-flex items-center gap-2 border px-4 py-2 font-body text-sm ${
            paid ? "border-gold/40 text-ink" : "border-ink/20 text-ink/70"
          }`}
        >
          {paid ? (
            <CheckCircle2 className="h-4 w-4 text-gold" aria-hidden="true" />
          ) : (
            <Clock className="h-4 w-4 text-taupe" aria-hidden="true" />
          )}
          {paid ? "Pagamento recebido" : "A aguardar confirmação do pagamento"}
        </div>
      )}

      <div className="mt-10 flex flex-col gap-3 border-y border-ink/10 py-6 text-left">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between font-body text-sm">
            <span>
              {item.quantity}× {item.name}
            </span>
            <span>{formatKwanza(item.priceCents * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between font-body text-sm text-ink/60">
          <span>Entrega</span>
          <span>{formatKwanza(order.shippingCents)}</span>
        </div>
        <div className="flex justify-between border-t border-ink/10 pt-3 font-display text-lg text-ink">
          <span>Total</span>
          <span>{formatKwanza(order.totalCents)}</span>
        </div>
      </div>

      {!cancelled && (
        <div className="mt-8 text-left font-body text-sm text-ink/75">
          <p className="eyebrow-gold mb-2">{bitpayInProgress ? "Depois de pagares" : "Próximo passo"}</p>
          {order.paymentMethod === "BITPAY_AO" && !paid && !bitpayInProgress ? (
            <p>
              Vamos confirmar o teu pagamento BitPay. Se ainda não pagaste, a nossa
              equipa vai ligar-te para o {order.customerPhone} com as instruções. Assim
              que estiver confirmado, esta página atualiza sozinha e recebes uma mensagem.
            </p>
          ) : (
            <p>
              A tua encomenda chega em {estimateDeliveryDays(order.province)}. Vamos
              contactar-te pelo telefone {order.customerPhone} para combinar a entrega em{" "}
              {order.municipality}, {order.province}.
            </p>
          )}
          {order.customerEmail && (
            <p className="mt-3">Enviámos também um resumo para {order.customerEmail}.</p>
          )}
        </div>
      )}

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href={`/minha-conta?numero=${encodeURIComponent(order.orderNumber)}`}
          className="btn-outline"
        >
          <PackageSearch className="h-4 w-4" aria-hidden="true" />
          Acompanhar pedido
        </Link>
        <Link href="/colecoes" className="btn-dark">
          Continuar a explorar
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <a
        href={whatsappLink(`Olá, tenho uma dúvida sobre o pedido ${order.orderNumber}`)}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-flex items-center gap-2 font-body text-sm text-ink/55 underline underline-offset-4"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Dúvidas? WhatsApp {SITE.phoneDisplay}
      </a>
    </div>
  );
}
