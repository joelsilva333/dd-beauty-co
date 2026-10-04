import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/angola";
import { profileSchema } from "@/lib/customer-schema";
import { createCustomerSession, getCustomerSession } from "@/lib/customer-auth";

export async function PATCH(request: NextRequest) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Sessão expirada. Entra outra vez." }, { status: 401 });

  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }

  const customer = await prisma.customer.update({
    where: { id: session.customerId },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone ? normalizePhone(parsed.data.phone) : null,
    },
  });

  // O nome pode ter mudado — atualiza o cookie de sessão também.
  await createCustomerSession({ customerId: customer.id, email: customer.email, name: customer.name });

  return NextResponse.json({ customer: { name: customer.name, phone: customer.phone } });
}
