import Link from "next/link";
import { LayoutDashboard, LogOut, Package, ShoppingCart } from "lucide-react";
import { getAdminSession } from "@/lib/auth";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    return <div className="min-h-screen bg-cream">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 md:px-8">
        <aside className="hidden w-56 flex-shrink-0 flex-col gap-1 md:flex">
          <p className="mb-4 font-body text-xs uppercase tracking-wide-label text-ink/40">
            Olá, {session.name}
          </p>
          <AdminNavLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />}>
            Painel
          </AdminNavLink>
          <AdminNavLink href="/admin/produtos" icon={<Package className="h-4 w-4" />}>
            Produtos
          </AdminNavLink>
          <AdminNavLink href="/admin/encomendas" icon={<ShoppingCart className="h-4 w-4" />}>
            Encomendas
          </AdminNavLink>
          <div className="mt-4">
            <AdminLogoutButton />
          </div>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function AdminNavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg px-3 py-2 font-body text-sm text-ink/80 transition hover:bg-taupe/10"
    >
      {icon}
      {children}
    </Link>
  );
}
