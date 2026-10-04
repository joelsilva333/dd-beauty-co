import Link from "next/link";
import { Package, User } from "lucide-react";
import { getCustomerSession } from "@/lib/customer-auth";
import { CustomerLogoutButton } from "@/components/CustomerLogoutButton";

const LINKS = [
  { href: "/conta", label: "Perfil", icon: User },
  { href: "/conta/encomendas", label: "Encomendas", icon: Package },
];

export default async function AccountDashboardLayout({ children }: { children: React.ReactNode }) {
  // O proxy (middleware) já garante que só chega aqui quem tem sessão válida.
  const session = await getCustomerSession();

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 md:px-8 md:py-20">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-6">
        <div>
          <p className="eyebrow-gold">A minha conta</p>
          <h1 className="mt-1 font-display text-3xl text-ink">Olá, {session?.name.split(" ")[0]}</h1>
        </div>
        <nav className="flex items-center gap-6">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 font-body text-[11px] font-medium tracking-[0.2em] text-ink/70 uppercase transition hover:text-ink"
            >
              <Icon className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
              {label}
            </Link>
          ))}
          <CustomerLogoutButton />
        </nav>
      </div>
      {children}
    </div>
  );
}
