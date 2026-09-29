import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, MessageCircle, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatKwanza } from "@/lib/currency";
import { whatsappLink } from "@/lib/site-config";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { ConfirmPaymentButton } from "@/components/admin/ConfirmPaymentButton";

export const dynamic = "force-dynamic";

const PAYMENT_LABELS: Record<string, string> = {
  PENDENTE: "A aguardar",
  PAGO: "Pago",
  FALHOU: "Não concluído",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { slug: true, stock: true } } } } },
  });
  if (!order) notFound();

  const customerWhatsapp = `244${order.customerPhone}`;
  const firstName = order.customerName.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/encomendas"
        className="flex items-center gap-2 font-body text-sm text-ink/60 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Todas as encomendas
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">{order.orderNumber}</h1>
          <p className="font-body text-sm text-ink/60">
            {order.createdAt.toLocaleString("pt-AO", { dateStyle: "long", timeStyle: "short" })}
          </p>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-xl border border-taupe/25 bg-white p-5">
          <h2 className="font-display text-xl text-ink">Cliente e entrega</h2>
          <p className="font-body text-ink">{order.customerName}</p>
          <p className="flex items-start gap-2 font-body text-sm text-ink/70">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
            <span>
              {order.addressLine}
              <br />
              {order.bairro && <>{order.bairro}, </>}
              {order.municipality}, {order.province}
              {order.addressNotes && (
                <>
                  <br />
                  <em>Nota: {order.addressNotes}</em>
                </>
              )}
            </span>
          </p>
          {order.customerEmail && (
            <p className="font-body text-sm text-ink/70">{order.customerEmail}</p>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={`tel:+${customerWhatsapp}`}
              className="flex h-11 items-center gap-2 rounded-full border border-taupe/40 px-4 font-body text-sm text-ink hover:border-gold"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Ligar {order.customerPhone}
            </a>
            <a
              href={whatsappLink(
                `Olá ${firstName}, somos da Deodália Dias. Estamos a contactar-te sobre o pedido ${order.orderNumber}.`,
                customerWhatsapp,
              )}
              target="_blank"
              rel="noreferrer"
              className="flex h-11 items-center gap-2 rounded-full border border-taupe/40 px-4 font-body text-sm text-ink hover:border-gold"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp
            </a>
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-xl border border-taupe/25 bg-white p-5">
          <h2 className="font-display text-xl text-ink">Pagamento</h2>
          <p className="font-body text-sm text-ink/70">
            Método: {order.paymentMethod === "STRIPE" ? "Cartão (Stripe)" : "BitPayAO"}
          </p>
          <p className="font-body text-sm text-ink/70">
            Estado:{" "}
            <span className="font-medium text-ink">{PAYMENT_LABELS[order.paymentStatus]}</span>
          </p>
          {order.stripeSessionId && (
            <p className="break-all font-body text-xs text-ink/40">Stripe: {order.stripeSessionId}</p>
          )}
          {order.bitpayMethod && (
            <p className="font-body text-sm text-ink/70">
              {order.bitpayMethod === "multicaixa_express" ? "Multicaixa Express" : "Referência Multicaixa"}
              {order.bitpayAttempts > 1 && ` · ${order.bitpayAttempts} tentativas`}
            </p>
          )}
          {order.bitpayRefNumber && (
            <p className="font-body text-sm text-ink/70">
              Entidade {order.bitpayRefEntity} · Referência {order.bitpayRefNumber}
              {order.bitpayRefExpiresAt &&
                ` · válida até ${order.bitpayRefExpiresAt.toLocaleString("pt-AO", { dateStyle: "short", timeStyle: "short" })}`}
            </p>
          )}
          {order.bitpayFailureCode && order.paymentStatus === "FALHOU" && (
            <p className="font-body text-sm text-ink">Última tentativa recusada: {order.bitpayFailureCode}</p>
          )}
          {order.bitpayPaymentId && (
            <p className="break-all font-body text-xs text-ink/40">BitPay: {order.bitpayPaymentId}</p>
          )}
          {order.paymentStatus !== "PAGO" && order.status !== "CANCELADO" && (
            <div className="pt-2">
              <p className="mb-3 font-body text-sm text-ink/60">
                Depois de verificares que o dinheiro entrou, confirma aqui. A cliente
                recebe logo uma mensagem.
              </p>
              <ConfirmPaymentButton orderId={order.id} />
            </div>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-taupe/25 bg-white p-5">
        <h2 className="mb-3 font-display text-xl text-ink">Artigos</h2>
        <div className="flex flex-col gap-2 font-body text-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3">
              <span>
                {item.quantity}× {item.name}
                <span className="ml-2 text-xs text-ink/40">(stock atual: {item.product.stock})</span>
              </span>
              <span>{formatKwanza(item.priceCents * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-taupe/20 pt-2 text-ink/60">
            <span>Entrega</span>
            <span>{formatKwanza(order.shippingCents)}</span>
          </div>
          <div className="flex justify-between font-display text-lg text-ink">
            <span>Total</span>
            <span>{formatKwanza(order.totalCents)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
