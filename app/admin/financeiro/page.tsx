import Link from "next/link";
import { Banknote, Clock3, CreditCard, Smartphone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatKwanza } from "@/lib/currency";

export const dynamic = "force-dynamic";

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  STRIPE: "Cartão internacional",
  BITPAY_AO: "Multicaixa (Express/Referência)",
};

export default async function AdminFinancePage() {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const paidWhere = { paymentStatus: "PAGO" as const };

  const [today, week, month, allTime, pending, byMethod, recent] = await Promise.all([
    prisma.order.aggregate({ _sum: { totalCents: true }, _count: true, where: { ...paidWhere, createdAt: { gte: todayStart } } }),
    prisma.order.aggregate({ _sum: { totalCents: true }, _count: true, where: { ...paidWhere, createdAt: { gte: weekStart } } }),
    prisma.order.aggregate({ _sum: { totalCents: true }, _count: true, where: { ...paidWhere, createdAt: { gte: monthStart } } }),
    prisma.order.aggregate({ _sum: { totalCents: true }, _count: true, where: paidWhere }),
    prisma.order.aggregate({ _sum: { totalCents: true }, _count: true, where: { paymentStatus: "PENDENTE" } }),
    prisma.order.groupBy({
      by: ["paymentMethod"],
      where: paidWhere,
      _sum: { totalCents: true },
      _count: true,
    }),
    prisma.order.findMany({
      where: paidWhere,
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        totalCents: true,
        paymentMethod: true,
        bitpayMethod: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-3xl text-ink">Financeiro</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Vendas hoje" value={formatKwanza(today._sum.totalCents ?? 0)} sub={`${today._count} encomenda(s)`} />
        <StatCard label="Últimos 7 dias" value={formatKwanza(week._sum.totalCents ?? 0)} sub={`${week._count} encomenda(s)`} />
        <StatCard label="Este mês" value={formatKwanza(month._sum.totalCents ?? 0)} sub={`${month._count} encomenda(s)`} />
        <StatCard label="Total (desde sempre)" value={formatKwanza(allTime._sum.totalCents ?? 0)} sub={`${allTime._count} encomenda(s)`} />
      </div>

      <section className="rounded-xl border border-gold/40 bg-gold/10 p-5">
        <h2 className="flex items-center gap-2 font-display text-xl text-ink">
          <Clock3 className="h-5 w-5 text-gold" aria-hidden="true" />
          A aguardar pagamento
        </h2>
        <p className="mt-2 font-body text-sm text-ink/70">
          {pending._count} encomenda(s), no valor de{" "}
          <strong className="text-ink">{formatKwanza(pending._sum.totalCents ?? 0)}</strong> — ainda não contam
          como venda.
        </p>
      </section>

      <section className="rounded-xl border border-taupe/25 bg-white p-5">
        <h2 className="mb-3 font-display text-xl text-ink">Vendas por método de pagamento</h2>
        <div className="flex flex-col">
          {byMethod.map((m) => (
            <div
              key={m.paymentMethod}
              className="flex items-center justify-between gap-3 border-t border-taupe/15 py-3 font-body text-sm first:border-0"
            >
              <span className="flex items-center gap-2.5 text-ink">
                {m.paymentMethod === "STRIPE" ? (
                  <CreditCard className="h-4 w-4 text-gold" aria-hidden="true" strokeWidth={1.5} />
                ) : (
                  <Smartphone className="h-4 w-4 text-gold" aria-hidden="true" strokeWidth={1.5} />
                )}
                {PAYMENT_METHOD_LABEL[m.paymentMethod] ?? m.paymentMethod}
              </span>
              <span className="text-ink/70">
                {m._count} venda(s) · {formatKwanza(m._sum.totalCents ?? 0)}
              </span>
            </div>
          ))}
          {byMethod.length === 0 && (
            <p className="font-body text-sm text-ink/50">Ainda não há vendas pagas.</p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-taupe/25 bg-white p-5">
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl text-ink">
          <Banknote className="h-5 w-5 text-gold" aria-hidden="true" />
          Últimas vendas pagas
        </h2>
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
              <span className="text-ink/60">
                {PAYMENT_METHOD_LABEL[o.paymentMethod] ?? o.paymentMethod}
              </span>
              <span className="text-ink">{formatKwanza(o.totalCents)}</span>
            </Link>
          ))}
          {recent.length === 0 && <p className="font-body text-sm text-ink/50">Ainda não há vendas pagas.</p>}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-taupe/25 bg-white p-5">
      <p className="font-body text-sm text-ink/60">{label}</p>
      <p className="mt-2 font-display text-2xl text-ink">{value}</p>
      {sub && <p className="mt-1 font-body text-xs text-ink/50">{sub}</p>}
    </div>
  );
}
