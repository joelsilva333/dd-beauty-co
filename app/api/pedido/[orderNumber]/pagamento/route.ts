import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/angola";
import {
  BitpayError,
  bitpayConfigured,
  cancelBitpayPayment,
  startBitpayPayment,
  syncBitpayPayment,
} from "@/lib/bitpay";

// Estado do pagamento de uma encomenda, com acesso pelo número do pedido
// (o mesmo nível de acesso da página de confirmação).

async function findOrder(orderNumber: string) {
  return prisma.order.findUnique({ where: { orderNumber } });
}

function publicPayment(order: NonNullable<Awaited<ReturnType<typeof findOrder>>>) {
  return {
    status: order.status,
    paymentStatus: order.paymentStatus,
    bitpayMethod: order.bitpayMethod,
    failureCode: order.bitpayFailureCode,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;
  let order = await findOrder(orderNumber);
  if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

  if (order.paymentMethod === "BITPAY_AO" && order.paymentStatus === "PENDENTE") {
    await syncBitpayPayment(order);
    order = (await findOrder(orderNumber))!;
  }

  return NextResponse.json(publicPayment(order));
}

const retrySchema = z.object({
  method: z.enum(["multicaixa_express", "multicaixa_reference"]),
  mobile: z
    .string()
    .optional()
    .refine((v) => !v || /^9\d{8}$/.test(normalizePhone(v)), "O número deve ter 9 dígitos e começar por 9"),
});

// Nova tentativa: depois de um Express recusado, ou para trocar de método.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const parsed = retrySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }

  const { orderNumber } = await params;
  const order = await findOrder(orderNumber);
  if (!order || order.paymentMethod !== "BITPAY_AO") {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }
  if (order.paymentStatus === "PAGO") {
    return NextResponse.json({ error: "Este pedido já está pago." }, { status: 409 });
  }
  if (order.status === "CANCELADO") {
    return NextResponse.json(
      { error: "Este pedido expirou. Volta ao carrinho para fazer um novo." },
      { status: 409 },
    );
  }
  if (!bitpayConfigured()) {
    return NextResponse.json({ error: "Pagamento indisponível. Fala connosco." }, { status: 503 });
  }
  if (order.bitpayAttempts >= 5) {
    return NextResponse.json(
      { error: "Já tentaste várias vezes. Fala connosco pelo botão de ajuda e resolvemos contigo." },
      { status: 429 },
    );
  }

  if (order.bitpayPaymentId) await cancelBitpayPayment(order.bitpayPaymentId);

  try {
    const mobile = parsed.data.mobile ? normalizePhone(parsed.data.mobile) : undefined;
    const updated = await startBitpayPayment(order, parsed.data.method, mobile);
    return NextResponse.json(publicPayment(updated));
  } catch (error) {
    const message = error instanceof BitpayError ? error.message : "Não conseguimos iniciar o pagamento.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
