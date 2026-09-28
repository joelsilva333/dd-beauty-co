import { SignJWT } from "jose";

// Ponte entre o site (Vercel) e o servidor socket.io (Render, pasta /realtime).
// O site nunca mantém ligações abertas: publica eventos por HTTP e o servidor
// socket.io entrega-os aos browsers ligados à sala certa.

export const REALTIME_EVENTS = {
  orderCreated: "order:created",
  orderUpdated: "order:updated",
  stockUpdated: "stock:updated",
  chatMessage: "chat:message",
  chatConversation: "chat:conversation",
} as const;

export const rooms = {
  admin: "admin",
  order: (orderNumber: string) => `order:${orderNumber}`,
  product: (productId: string) => `product:${productId}`,
  chat: (conversationId: string) => `chat:${conversationId}`,
};

const secret = () => process.env.REALTIME_SECRET;
const serverUrl = () => process.env.REALTIME_SERVER_URL;

export function realtimeEnabled(): boolean {
  return Boolean(secret() && serverUrl());
}

type RealtimeEvent = { room: string; event: string; data: unknown };

// Nunca lança erro: uma falha no tempo real não pode bloquear uma encomenda.
export async function emitRealtime(...events: RealtimeEvent[]): Promise<void> {
  if (!realtimeEnabled() || events.length === 0) return;
  try {
    const res = await fetch(`${serverUrl()}/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret()}`,
      },
      body: JSON.stringify({ events }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("[realtime] emit falhou:", res.status);
  } catch (error) {
    console.error("[realtime] servidor indisponível:", error);
  }
}

// Token curto que autoriza um browser a entrar em salas privadas.
// As salas públicas (product:*) não precisam de token.
export async function createRealtimeToken(allowedRooms: string[]): Promise<string | null> {
  const key = secret();
  if (!key) return null;
  return new SignJWT({ rooms: allowedRooms })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(new TextEncoder().encode(key));
}
