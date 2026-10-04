import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";
import { getAdminSession } from "@/lib/auth";
import { renderInvoicePdf } from "@/lib/invoice";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

  // Só a cliente dona do pedido (sessão própria) ou a equipa (sessão de admin) vê a fatura.
  const [customerSession, adminSession] = await Promise.all([getCustomerSession(), getAdminSession()]);
  const isOwner = customerSession && order.customerId === customerSession.customerId;
  if (!isOwner && !adminSession) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const pdf = await renderInvoicePdf(order);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="fatura-${order.orderNumber}.pdf"`,
    },
  });
}
