import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get("numero")?.trim();
  const phone = request.nextUrl.searchParams.get("telefone")?.trim();

  if (!orderNumber || !phone) {
    return NextResponse.json(
      { error: "Indica o número do pedido e o telefone." },
      { status: 400 },
    );
  }

  const order = await prisma.order.findFirst({
    where: { orderNumber, customerPhone: phone },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Não encontrámos nenhum pedido com estes dados." },
      { status: 404 },
    );
  }

  return NextResponse.json({ order });
}
