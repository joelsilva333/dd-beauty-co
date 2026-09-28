import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/angola";
import { createRealtimeToken, rooms } from "@/lib/realtime";

export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get("numero")?.trim().toUpperCase();
  const phone = request.nextUrl.searchParams.get("telefone");

  if (!orderNumber || !phone) {
    return NextResponse.json(
      { error: "Indica o número do pedido e o telefone." },
      { status: 400 },
    );
  }

  const order = await prisma.order.findFirst({
    where: { orderNumber, customerPhone: normalizePhone(phone) },
    select: {
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      totalCents: true,
      shippingCents: true,
      province: true,
      municipality: true,
      createdAt: true,
      items: { select: { id: true, name: true, quantity: true, priceCents: true } },
    },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Não encontrámos nenhum pedido com estes dados. Confirma o número e o telefone." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    order,
    token: await createRealtimeToken([rooms.order(order.orderNumber)]),
  });
}
