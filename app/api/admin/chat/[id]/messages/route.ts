import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addMessage, messageBodySchema } from "@/lib/chat";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const exists = await prisma.chatConversation.count({ where: { id } });
  if (!exists) return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = messageBodySchema.safeParse(body?.body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const message = await addMessage(id, "EQUIPA", parsed.data);
  return NextResponse.json({ message });
}
