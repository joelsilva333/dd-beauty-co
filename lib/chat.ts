import { randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { ChatMessage } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createRealtimeToken, emitRealtime, REALTIME_EVENTS, rooms } from "@/lib/realtime";

export const messageBodySchema = z
  .string()
  .trim()
  .min(1, "Escreve a tua mensagem")
  .max(1000, "A mensagem é demasiado longa");

export function newAccessKey() {
  return randomBytes(24).toString("base64url");
}

export async function findConversationForCustomer(id: string, key: string | null | undefined) {
  if (!key) return null;
  const conversation = await prisma.chatConversation.findUnique({ where: { id } });
  if (!conversation) return null;
  const a = Buffer.from(conversation.accessKey);
  const b = Buffer.from(key);
  return a.length === b.length && timingSafeEqual(a, b) ? conversation : null;
}

export function customerChatToken(conversationId: string) {
  return createRealtimeToken([rooms.chat(conversationId)]);
}

// Proteção simples contra abuso: no máximo 15 mensagens da cliente por minuto.
export async function customerIsFlooding(conversationId: string) {
  const recent = await prisma.chatMessage.count({
    where: {
      conversationId,
      sender: "CLIENTE",
      createdAt: { gte: new Date(Date.now() - 60_000) },
    },
  });
  return recent >= 15;
}

export function serializeMessage(m: ChatMessage) {
  return { id: m.id, sender: m.sender, body: m.body, createdAt: m.createdAt.toISOString() };
}

export type ChatMessageDTO = ReturnType<typeof serializeMessage>;

export async function addMessage(conversationId: string, sender: ChatMessage["sender"], body: string) {
  const [message, conversation] = await prisma.$transaction(async (tx) => {
    const message = await tx.chatMessage.create({ data: { conversationId, sender, body } });
    const conversation = await tx.chatConversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: message.createdAt,
        closed: false,
        unreadByTeam: sender === "CLIENTE" ? { increment: 1 } : 0,
      },
    });
    return [message, conversation] as const;
  });

  const dto = serializeMessage(message);
  await emitRealtime(
    { room: rooms.chat(conversationId), event: REALTIME_EVENTS.chatMessage, data: { conversationId, message: dto } },
    {
      room: rooms.admin,
      event: REALTIME_EVENTS.chatConversation,
      data: {
        id: conversation.id,
        customerName: conversation.customerName,
        unreadByTeam: conversation.unreadByTeam,
        lastMessageAt: conversation.lastMessageAt.toISOString(),
        preview: dto.body.slice(0, 120),
        sender,
        message: dto,
      },
    },
  );

  return dto;
}
