import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/angola";
import { registerSchema } from "@/lib/customer-schema";
import { createCustomerSession } from "@/lib/customer-auth";

export async function POST(request: NextRequest) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }
  const { name, email, password, phone } = parsed.data;

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Já existe uma conta com este email. Tenta entrar em vez de criar uma nova." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const customer = await prisma.customer.create({
    data: {
      name,
      email,
      passwordHash,
      phone: phone ? normalizePhone(phone) : null,
    },
  });

  await createCustomerSession({ customerId: customer.id, email: customer.email, name: customer.name });
  return NextResponse.json({ ok: true });
}
