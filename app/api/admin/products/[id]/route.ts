import { after, NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { productData, productErrorMessage, productSchema } from "@/lib/product-schema";
import { emitRealtime, REALTIME_EVENTS, rooms } from "@/lib/realtime";

const stockSchema = z.object({
  stock: z.coerce.number().int().min(0, "O stock não pode ser negativo"),
});

// Ajuste rápido de stock a partir da lista de produtos, sem passar pelo
// formulário completo (que reescreveria todas as imagens do produto).
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const parsed = stockSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }

  const { id } = await params;
  const product = await prisma.product.update({
    where: { id },
    data: { stock: parsed.data.stock },
  });

  after(() =>
    emitRealtime({
      room: rooms.product(product.id),
      event: REALTIME_EVENTS.stockUpdated,
      data: { productId: product.id, stock: product.stock },
    }),
  );

  return NextResponse.json({ product });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const parsed = productSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }

  const { id } = await params;

  try {
    const product = await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      return tx.product.update({ where: { id }, data: productData(parsed.data) });
    });

    // Reposição de stock aparece logo a quem está a ver o produto.
    after(() =>
      emitRealtime({
        room: rooms.product(product.id),
        event: REALTIME_EVENTS.stockUpdated,
        data: { productId: product.id, stock: product.stock },
      }),
    );

    return NextResponse.json({ product });
  } catch (error) {
    const message = productErrorMessage(error);
    if (message) return NextResponse.json({ error: message }, { status: 409 });
    throw error;
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = productErrorMessage(error);
    if (message) return NextResponse.json({ error: message }, { status: 409 });
    throw error;
  }
}
