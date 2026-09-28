import { NextRequest, NextResponse } from "next/server";
import {
  addMessage,
  customerIsFlooding,
  findConversationForCustomer,
  messageBodySchema,
} from "@/lib/chat";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const conversation = await findConversationForCustomer(id, request.headers.get("x-chat-key"));
  if (!conversation) {
    return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = messageBodySchema.safeParse(body?.body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  if (await customerIsFlooding(id)) {
    return NextResponse.json(
      { error: "Estás a enviar muitas mensagens seguidas. Espera um momento." },
      { status: 429 },
    );
  }

  const message = await addMessage(id, "CLIENTE", parsed.data);
  return NextResponse.json({ message });
}
