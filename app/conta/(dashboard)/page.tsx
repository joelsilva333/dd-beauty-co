import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";
import { ProfileForm } from "@/components/ProfileForm";
import { PasswordForm } from "@/components/PasswordForm";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getCustomerSession();
  const customer = await prisma.customer.findUniqueOrThrow({ where: { id: session!.customerId } });
  const orderCount = await prisma.order.count({ where: { customerId: customer.id } });

  return (
    <div className="flex flex-col gap-10">
      <Link
        href="/conta/encomendas"
        className="flex items-center justify-between gap-4 border border-ink/10 p-6 transition hover:border-ink/30"
      >
        <span className="flex items-center gap-3">
          <Package className="h-5 w-5 text-gold" aria-hidden="true" strokeWidth={1.5} />
          <span>
            <span className="block font-body font-medium text-ink">As minhas encomendas</span>
            <span className="block font-body text-sm text-ink/55">
              {orderCount === 0
                ? "Ainda não fizeste nenhuma compra."
                : `${orderCount} ${orderCount === 1 ? "encomenda" : "encomendas"}`}
            </span>
          </span>
        </span>
        <ArrowRight className="h-4 w-4 text-ink/40" aria-hidden="true" />
      </Link>

      <ProfileForm initialName={customer.name} initialPhone={customer.phone ?? ""} hasPassword={Boolean(customer.passwordHash)} />
      <PasswordForm hasPassword={Boolean(customer.passwordHash)} />

      <p className="font-body text-sm text-ink/50">{customer.email}</p>
    </div>
  );
}
