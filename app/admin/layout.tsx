import Link from "next/link";
import { LayoutDashboard, MessagesSquare, Package, ShoppingCart, Tags, Wallet } from "lucide-react";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRealtimeToken, rooms } from "@/lib/realtime";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { AdminLiveAlerts } from "@/components/admin/AdminLiveAlerts";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    return <div className="min-h-screen bg-cream">{children}</div>;
  }

  const [pendingOrders, unreadChats, token] = await Promise.all([
    prisma.order.count({ where: { status: { in: ["PENDENTE", "PAGO"] } } }),
    prisma.chatConversation.count({ where: { unreadByTeam: { gt: 0 }, closed: false } }),
    createRealtimeToken([rooms.admin]),
  ]);

  const links = [
    { href: "/admin", label: "Painel", icon: LayoutDashboard, badge: 0 },
    { href: "/admin/encomendas", label: "Encomendas", icon: ShoppingCart, badge: pendingOrders },
    { href: "/admin/conversas", label: "Conversas", icon: MessagesSquare, badge: unreadChats },
    { href: "/admin/produtos", label: "Produtos", icon: Package, badge: 0 },
    { href: "/admin/categorias", label: "Categorias", icon: Tags, badge: 0 },
    { href: "/admin/financeiro", label: "Financeiro", icon: Wallet, badge: 0 },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Telemóvel: navegação em separadores no topo */}
      <nav className="flex gap-1 overflow-x-auto border-b border-taupe/25 bg-cream px-2 py-2 md:hidden">
        {links.map(({ href, label, icon: Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className="flex h-11 shrink-0 items-center gap-2 rounded-full px-4 font-body text-sm text-ink/80 hover:bg-taupe/10"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
            {badge > 0 && <Badge value={badge} />}
          </Link>
        ))}
      </nav>

      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 md:px-8">
        <aside className="hidden w-56 shrink-0 flex-col gap-1 md:flex">
          <p className="mb-2 font-body text-xs uppercase tracking-wide-label text-ink/40">
            Olá, {session.name}
          </p>
          {links.map(({ href, label, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-body text-sm text-ink/80 transition hover:bg-taupe/10"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {badge > 0 && <Badge value={badge} />}
            </Link>
          ))}
          <div className="mt-4">
            <AdminLogoutButton />
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="font-body text-xs uppercase tracking-wide-label text-ink/40 md:hidden">
              Olá, {session.name}
            </p>
            <div className="md:ml-auto">
              <AdminLiveAlerts token={token} />
            </div>
            <div className="md:hidden">
              <AdminLogoutButton />
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

function Badge({ value }: { value: number }) {
  return (
    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 font-body text-xs text-white">
      {value}
    </span>
  );
}
