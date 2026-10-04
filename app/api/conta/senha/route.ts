import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/customer-schema";
import { getCustomerSession } from "@/lib/customer-auth";

// Define ou muda a password. Quem entrou só pela Google ainda não tem
// password: a primeira vez não pede a password atual, só a nova.
export async function PATCH(request: NextRequest) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Sessão expirada. Entra outra vez." }, { status: 401 });

  const parsed = changePasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }

  const customer = await prisma.customer.findUniqueOrThrow({ where: { id: session.customerId } });

  if (customer.passwordHash) {
    const valid =
      parsed.data.currentPassword && (await bcrypt.compare(parsed.data.currentPassword, customer.passwordHash));
    if (!valid) {
      return NextResponse.json({ error: "A password atual está incorreta." }, { status: 401 });
    }
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.customer.update({ where: { id: customer.id }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}
