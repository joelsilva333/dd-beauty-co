import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";
import { formatKwanza } from "@/lib/currency";
import { OrderTimeline } from "@/components/OrderTimeline";

export const dynamic = "force-dynamic";

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const session = await getCustomerSession();
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  // Nunca confirma se o número de pedido existe quando não é da cliente — 404 nos dois casos.
  if (!order || order.customerId !== session!.customerId) notFound();

  return (
    <div className="flex flex-col gap-8">
      <Link href="/conta/encomendas" className="flex items-center gap-2 font-body text-sm text-ink/60 hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        As minhas encomendas
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">{order.orderNumber}</h1>
          <p className="mt-1 font-body text-sm text-ink/55">
            {order.createdAt.toLocaleDateString("pt-AO", { dateStyle: "long" })}
          </p>
        </div>
        {order.paymentStatus === "PAGO" && (
          <a href={`/api/conta/encomendas/${order.orderNumber}/fatura`} className="btn-outline">
            <Download className="h-4 w-4" aria-hidden="true" />
            Baixar fatura
          </a>
        )}
      </div>

      <OrderTimeline status={order.status} />

      <div className="flex flex-col gap-3 border-y border-ink/10 py-6">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between font-body text-sm">
            <span>
              {item.quantity}× {item.name}
            </span>
            <span>{formatKwanza(item.priceCents * item.quantity)}</span>
          </div>
        ))}
        <div className="border-t border-ink/10 pt-3 flex justify-between font-body text-sm text-ink/60">
          <span>Entrega</span>
          <span>{formatKwanza(order.shippingCents)}</span>
        </div>
        <div className="flex justify-between font-display text-lg text-ink">
          <span>Total</span>
          <span>{formatKwanza(order.totalCents)}</span>
        </div>
      </div>

      <div className="font-body text-sm text-ink/65">
        <p className="font-medium text-ink">Entregue a</p>
        <p className="mt-1">{order.customerName} · {order.customerPhone}</p>
        <p>
          {order.addressLine}
          {order.bairro ? `, ${order.bairro}` : ""}, {order.municipality}, {order.province}
        </p>
      </div>
    </div>
  );
}
