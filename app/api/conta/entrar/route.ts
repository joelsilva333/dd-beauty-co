import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/customer-schema";
import { createCustomerSession } from "@/lib/customer-auth";

const GENERIC_ERROR = "Email ou password incorretos.";

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer || !customer.passwordHash) {
    // Sem mensagens diferentes para "não existe" vs "é conta Google" — evita confirmar emails a terceiros.
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, customer.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  await createCustomerSession({ customerId: customer.id, email: customer.email, name: customer.name });
  return NextResponse.json({ ok: true });
}
