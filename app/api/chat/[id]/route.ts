import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerChatToken, findConversationForCustomer, serializeMessage } from "@/lib/chat";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const conversation = await findConversationForCustomer(id, request.headers.get("x-chat-key"));
  if (!conversation) {
    return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return NextResponse.json({
    conversation: { id, customerName: conversation.customerName },
    messages: messages.map(serializeMessage),
    token: await customerChatToken(id),
  });
}
