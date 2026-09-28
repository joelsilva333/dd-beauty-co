import { prisma } from "@/lib/prisma";
import { formatKwanza } from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [productCount, pendingOrders, totalOrders, revenue] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.order.count({ where: { status: "PENDENTE" } }),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalCents: true }, where: { paymentStatus: "PAGO" } }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-3xl text-ink">Painel</h1>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Produtos ativos" value={productCount.toString()} />
        <StatCard label="Encomendas pendentes" value={pendingOrders.toString()} />
        <StatCard label="Total de encomendas" value={totalOrders.toString()} />
        <StatCard
          label="Receita confirmada"
          value={formatKwanza(revenue._sum.totalCents ?? 0)}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-taupe/25 bg-white p-5">
      <p className="font-body text-sm text-ink/60">{label}</p>
      <p className="mt-2 font-display text-2xl text-ink">{value}</p>
    </div>
  );
}
