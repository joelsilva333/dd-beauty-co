import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/angola";
import { addMessage, customerChatToken, messageBodySchema, newAccessKey } from "@/lib/chat";

const startSchema = z.object({
  name: z.string().trim().min(2, "Indica o teu nome").max(80),
  phone: z.string().max(30).optional(),
  message: messageBodySchema,
});

// Inicia uma conversa de apoio. Não é preciso conta: a cliente recebe uma
// chave que fica guardada no browser para continuar a conversa mais tarde.
export async function POST(request: NextRequest) {
  const parsed = startSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }

  const { name, phone, message } = parsed.data;
  const conversation = await prisma.chatConversation.create({
    data: {
      accessKey: newAccessKey(),
      customerName: name,
      customerPhone: phone ? normalizePhone(phone) || null : null,
    },
  });

  const first = await addMessage(conversation.id, "CLIENTE", message);

  return NextResponse.json({
    conversation: { id: conversation.id, accessKey: conversation.accessKey, customerName: name },
    messages: [first],
    token: await customerChatToken(conversation.id),
  });
}
