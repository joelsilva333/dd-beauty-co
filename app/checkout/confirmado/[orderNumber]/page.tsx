import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatKwanza } from "@/lib/currency";
import { estimateDeliveryDays } from "@/lib/angola";
import { ClearCartOnMount } from "@/components/ClearCartOnMount";

export const dynamic = "force-dynamic";

export default async function OrderConfirmedPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <ClearCartOnMount />
      <CheckCircle2 className="mx-auto h-14 w-14 text-gold" aria-hidden="true" />
      <h1 className="mt-5 font-display text-3xl text-ink">
        O teu pedido foi confirmado
      </h1>
      <p className="mt-2 font-body text-ink/60">
        Número do pedido: <span className="font-medium text-ink">{order.orderNumber}</span>
      </p>

      <div className="mt-8 flex flex-col gap-3 rounded-xl border border-taupe/25 p-6 text-left">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between font-body text-sm">
            <span>
              {item.quantity}× {item.name}
            </span>
            <span>{formatKwanza(item.priceCents * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-taupe/25 pt-3 font-display text-lg text-ink">
          <span>Total</span>
          <span>{formatKwanza(order.totalCents)}</span>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gold/30 bg-gold/10 p-6 text-left font-body text-sm text-ink/80">
        <p className="font-medium text-ink">Próximo passo</p>
        <p className="mt-1">
          A tua encomenda chega em {estimateDeliveryDays(order.province)}. Vamos
          contactar-te pelo telefone {order.customerPhone} para combinar a
          entrega em {order.municipality}, {order.province}.
        </p>
        {order.paymentMethod === "BITPAY_AO" && (
          <p className="mt-3">
            Estamos a confirmar o teu pagamento via BitPayAO. Se tiveres
            dúvidas, fala connosco pelo WhatsApp.
          </p>
        )}
      </div>

      <Link
        href="/colecoes"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 font-body text-sm tracking-wide-label uppercase text-cream transition hover:bg-gold"
      >
        Continuar a explorar
      </Link>
    </div>
  );
}
