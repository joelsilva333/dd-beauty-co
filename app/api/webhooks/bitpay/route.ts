import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyPaymentIntent, verifyBitpaySignature, type PaymentIntent } from "@/lib/bitpay";

// Registar no painel BitPay (Developers → Webhooks) o URL <site>/api/webhooks/bitpay.
// A entrega é "pelo menos uma vez": todas as operações abaixo são idempotentes.
export async function POST(request: NextRequest) {
  const body = await request.text();
  if (!verifyBitpaySignature(body, request.headers.get("bitpay-signature"))) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  let event: { type?: string; data?: PaymentIntent };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!event.type?.startsWith("payment.") || !event.data?.id) {
    // reference.paid, refund.*, test.ping… — informativos para nós.
    return NextResponse.json({ received: true });
  }

  const order = await prisma.order.findFirst({
    where: { bitpayPaymentId: event.data.id },
    select: { id: true },
  });
  if (order) await applyPaymentIntent(order.id, event.data);

  return NextResponse.json({ received: true });
}
