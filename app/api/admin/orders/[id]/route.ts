import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { markOrderPaid, OrderError, setOrderStatus } from "@/lib/orders";

const patchSchema = z.union([
  z.object({
    status: z.enum(["PENDENTE", "PAGO", "EM_PREPARACAO", "A_CAMINHO", "ENTREGUE", "CANCELADO"]),
  }),
  // Confirmação manual (ex: transferência BitPayAO verificada pela equipa).
  z.object({ confirmPayment: z.literal(true) }),
]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });

  const { id } = await params;

  try {
    if ("confirmPayment" in parsed.data) {
      const order = await markOrderPaid(id);
      if (!order) {
        return NextResponse.json(
          { error: "Este pagamento já estava confirmado ou o pedido foi cancelado." },
          { status: 409 },
        );
      }
      return NextResponse.json({ order });
    }

    const order = await setOrderStatus(id, parsed.data.status);
    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
