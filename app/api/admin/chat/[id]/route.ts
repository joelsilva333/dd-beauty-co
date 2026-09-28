import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  closed: z.boolean().optional(),
  markRead: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { id } = await params;
  const conversation = await prisma.chatConversation.update({
    where: { id },
    data: {
      ...(parsed.data.closed !== undefined && { closed: parsed.data.closed }),
      ...(parsed.data.markRead && { unreadByTeam: 0 }),
    },
  });

  return NextResponse.json({ conversation: { id: conversation.id, closed: conversation.closed } });
}
