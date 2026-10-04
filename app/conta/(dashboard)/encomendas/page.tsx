import Link from "next/link";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";
import { formatKwanza } from "@/lib/currency";
import { ORDER_STATUS_LABELS } from "@/lib/order-number";

export const dynamic = "force-dynamic";

export default async function AccountOrdersPage() {
  const session = await getCustomerSession();
  const orders = await prisma.order.findMany({
    where: { customerId: session!.customerId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 border border-ink/10 py-20 text-center">
        <ShoppingBag className="h-8 w-8 text-taupe" aria-hidden="true" strokeWidth={1.25} />
        <p className="font-display text-xl text-ink">Ainda não tens encomendas</p>
        <Link href="/colecoes" className="link-underline underline">
          Ver coleções
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-ink/10 border-y border-ink/10">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/conta/encomendas/${order.orderNumber}`}
          className="flex items-center justify-between gap-4 py-5 transition hover:bg-ink/[0.02]"
        >
          <div>
            <p className="font-body font-medium text-ink">{order.orderNumber}</p>
            <p className="mt-0.5 font-body text-sm text-ink/55">
              {order.createdAt.toLocaleDateString("pt-AO", { dateStyle: "long" })} ·{" "}
              {order.items.length} {order.items.length === 1 ? "artigo" : "artigos"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-body text-ink">{formatKwanza(order.totalCents)}</p>
              <p className="font-body text-xs text-ink/50">
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-ink/30" aria-hidden="true" />
          </div>
        </Link>
      ))}
    </div>
  );
}
