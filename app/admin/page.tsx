import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatKwanza } from "@/lib/currency";

export const dynamic = "force-dynamic";

const LOW_STOCK = 5;

export default async function AdminDashboardPage() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [toHandle, awaitingPayment, unreadChats, revenueMonth, lowStock, recent] = await Promise.all([
    prisma.order.count({ where: { status: { in: ["PAGO", "EM_PREPARACAO"] } } }),
    prisma.order.count({ where: { status: "PENDENTE", paymentStatus: "PENDENTE" } }),
    prisma.chatConversation.count({ where: { unreadByTeam: { gt: 0 }, closed: false } }),
    prisma.order.aggregate({
      _sum: { totalCents: true },
      where: { paymentStatus: "PAGO", createdAt: { gte: monthStart } },
    }),
    prisma.product.findMany({
      where: { active: true, stock: { lte: LOW_STOCK } },
      orderBy: { stock: "asc" },
      select: { id: true, name: true, stock: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, orderNumber: true, customerName: true, totalCents: true, createdAt: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-3xl text-ink">Painel</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Encomendas para preparar" value={toHandle} href="/admin/encomendas?filtro=abertas" />
        <StatCard label="A aguardar pagamento" value={awaitingPayment} href="/admin/encomendas?filtro=pagamento" />
        <StatCard label="Mensagens por responder" value={unreadChats} href="/admin/conversas" />
        <StatCard label="Vendas deste mês" value={formatKwanza(revenueMonth._sum.totalCents ?? 0)} />
      </div>

      {lowStock.length > 0 && (
        <section className="rounded-xl border border-gold/40 bg-gold/10 p-5">
          <h2 className="flex items-center gap-2 font-display text-xl text-ink">
            <AlertTriangle className="h-5 w-5 text-gold" aria-hidden="true" />
            Stock a acabar
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {lowStock.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/produtos/${p.id}`}
                  className="flex justify-between font-body text-sm text-ink hover:text-gold"
                >
                  <span>{p.name}</span>
                  <span>{p.stock === 0 ? "Esgotado" : `${p.stock} unid.`}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-xl border border-taupe/25 bg-white p-5">
        <h2 className="mb-3 font-display text-xl text-ink">Últimas encomendas</h2>
        <div className="flex flex-col">
          {recent.map((o) => (
            <Link
              key={o.id}
              href={`/admin/encomendas/${o.id}`}
              className="flex items-center justify-between gap-3 border-t border-taupe/15 py-3 font-body text-sm first:border-0 hover:text-gold"
            >
              <span>
                {o.orderNumber} · {o.customerName}
              </span>
              <span className="flex items-center gap-2">
                {formatKwanza(o.totalCents)}
                <ChevronRight className="h-4 w-4 text-taupe" aria-hidden="true" />
              </span>
            </Link>
          ))}
          {recent.length === 0 && <p className="font-body text-sm text-ink/50">Ainda não há encomendas.</p>}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number | string; href?: string }) {
  const highlight = typeof value === "number" && value > 0;
  const content = (
    <>
      <p className="font-body text-sm text-ink/60">{label}</p>
      <p className={`mt-2 font-display text-3xl ${highlight ? "text-gold" : "text-ink"}`}>{value}</p>
    </>
  );
  const className = "rounded-xl border border-taupe/25 bg-white p-5 transition";
  return href ? (
    <Link href={href} className={`${className} hover:border-gold`}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}
