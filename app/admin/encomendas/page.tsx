import { prisma } from "@/lib/prisma";
import { formatKwanza } from "@/lib/currency";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-ink">Encomendas</h1>

      <div className="overflow-hidden rounded-xl border border-taupe/25 bg-white">
        <table className="w-full text-left font-body text-sm">
          <thead className="bg-taupe/10 text-ink/60">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Local</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Pagamento</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-taupe/15 align-top">
                <td className="px-4 py-3">
                  <p className="text-ink">{order.orderNumber}</p>
                  <p className="text-xs text-ink/40">
                    {order.items.length} {order.items.length === 1 ? "artigo" : "artigos"}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-ink">{order.customerName}</p>
                  <p className="text-xs text-ink/40">{order.customerPhone}</p>
                </td>
                <td className="px-4 py-3 text-ink/60">
                  {order.municipality}, {order.province}
                </td>
                <td className="px-4 py-3">{formatKwanza(order.totalCents)}</td>
                <td className="px-4 py-3 text-ink/60">
                  {order.paymentMethod === "STRIPE" ? "Cartão" : "BitPayAO"}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusSelect orderId={order.id} status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="px-4 py-8 text-center font-body text-sm text-ink/50">
            Ainda não há encomendas.
          </p>
        )}
      </div>
    </div>
  );
}
