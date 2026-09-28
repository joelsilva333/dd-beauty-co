import Link from "next/link";
import type { OrderStatus, Prisma } from "@prisma/client";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatKwanza } from "@/lib/currency";
import { ORDER_STATUS_LABELS } from "@/lib/order-number";

export const dynamic = "force-dynamic";

const FILTERS: { key: string; label: string; where: Prisma.OrderWhereInput }[] = [
  { key: "abertas", label: "Por tratar", where: { status: { in: ["PENDENTE", "PAGO", "EM_PREPARACAO"] } } },
  { key: "pagamento", label: "A aguardar pagamento", where: { paymentStatus: "PENDENTE", status: "PENDENTE" } },
  { key: "caminho", label: "A caminho", where: { status: "A_CAMINHO" } },
  { key: "entregues", label: "Entregues", where: { status: "ENTREGUE" } },
  { key: "canceladas", label: "Canceladas", where: { status: "CANCELADO" } },
  { key: "todas", label: "Todas", where: {} },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string; q?: string }>;
}) {
  const { filtro, q } = await searchParams;
  const active = FILTERS.find((f) => f.key === filtro) ?? FILTERS[0];
  const search = q?.trim();

  const orders = await prisma.order.findMany({
    where: {
      ...active.where,
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: "insensitive" } },
          { customerName: { contains: search, mode: "insensitive" } },
          { customerPhone: { contains: search.replace(/\D/g, "") || search } },
        ],
      }),
    },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-ink">Encomendas</h1>

      <form className="flex gap-2">
        <input type="hidden" name="filtro" value={active.key} />
        <input
          name="q"
          defaultValue={search}
          placeholder="Procurar por número, nome ou telefone"
          className="input flex-1"
        />
        <button className="h-12 rounded-full bg-ink px-5 font-body text-sm text-cream">Procurar</button>
      </form>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/encomendas?filtro=${f.key}`}
            className={`rounded-full border px-4 py-2 font-body text-sm ${
              f.key === active.key
                ? "border-ink bg-ink text-cream"
                : "border-taupe/40 text-ink/70 hover:border-ink"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/admin/encomendas/${order.id}`}
            className="flex items-center gap-4 rounded-xl border border-taupe/25 bg-white p-4 transition hover:border-gold"
          >
            <div className="grid flex-1 gap-1 sm:grid-cols-4 sm:items-center sm:gap-4">
              <div>
                <p className="font-body text-ink">{order.orderNumber}</p>
                <p className="font-body text-xs text-ink/40">
                  {order.createdAt.toLocaleDateString("pt-AO")} · {order._count.items}{" "}
                  {order._count.items === 1 ? "artigo" : "artigos"}
                </p>
              </div>
              <div>
                <p className="font-body text-sm text-ink">{order.customerName}</p>
                <p className="font-body text-xs text-ink/50">
                  {order.municipality}, {order.province}
                </p>
              </div>
              <div className="font-body text-sm">
                <p className="text-ink">{formatKwanza(order.totalCents)}</p>
                <p className="text-xs text-ink/50">
                  {order.paymentMethod === "STRIPE" ? "Cartão" : "BitPayAO"} ·{" "}
                  {order.paymentStatus === "PAGO" ? "pago" : "por pagar"}
                </p>
              </div>
              <div>
                <StatusPill status={order.status} />
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-taupe" aria-hidden="true" />
          </Link>
        ))}
        {orders.length === 0 && (
          <p className="rounded-xl border border-taupe/25 bg-white px-4 py-8 text-center font-body text-sm text-ink/50">
            Não há encomendas neste filtro.
          </p>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: OrderStatus }) {
  const strong = status === "PENDENTE" || status === "PAGO";
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 font-body text-xs ${
        strong ? "bg-gold text-white" : status === "CANCELADO" ? "bg-taupe/15 text-ink/50" : "bg-gold/15 text-ink"
      }`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
