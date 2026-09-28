import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { Server } from "socket.io";
import { jwtVerify } from "jose";

// Servidor de tempo real da Deodália Dias.
//
// Não tem base de dados nem regras de negócio: o site (Vercel) é a única fonte
// de verdade. O site publica eventos em POST /emit e este servidor entrega-os
// aos browsers ligados às salas certas.
//
// Salas:
//   product:<id>   pública  — stock em tempo real na página de produto
//   order:<número> privada  — estado do pedido para a cliente
//   chat:<id>      privada  — conversa de apoio
//   admin          privada  — painel da equipa (novas encomendas, chat)
// As salas privadas exigem um token emitido pelo site (/api/realtime/token).

const PORT = Number(process.env.PORT ?? 4000);
const SECRET = process.env.REALTIME_SECRET;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

if (!SECRET) {
  console.error("REALTIME_SECRET em falta. Define a mesma chave aqui e no site.");
  process.exit(1);
}

const secretKey = new TextEncoder().encode(SECRET);
const PUBLIC_ROOM = /^product:[\w-]+$/;
const MAX_BODY_BYTES = 256 * 1024;

type EmitEvent = { room: string; event: string; data: unknown };

function isAuthorized(req: IncomingMessage): boolean {
  const header = req.headers.authorization ?? "";
  const expected = Buffer.from(`Bearer ${SECRET}`);
  const received = Buffer.from(header);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("payload demasiado grande"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

const httpServer = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    return send(res, 200, { ok: true, connections: io.engine.clientsCount });
  }

  if (req.method === "POST" && req.url === "/emit") {
    if (!isAuthorized(req)) return send(res, 401, { error: "unauthorized" });
    try {
      const { events } = JSON.parse(await readBody(req)) as { events?: EmitEvent[] };
      if (!Array.isArray(events)) return send(res, 400, { error: "events em falta" });
      for (const e of events) {
        if (typeof e?.room === "string" && typeof e?.event === "string") {
          io.to(e.room).emit(e.event, e.data);
        }
      }
      return send(res, 200, { delivered: events.length });
    } catch {
      return send(res, 400, { error: "pedido inválido" });
    }
  }

  // Socket.io trata dos seus próprios caminhos (/socket.io/); o resto é 404.
  if (!req.url?.startsWith("/socket.io")) send(res, 404, { error: "not found" });
});

const io = new Server(httpServer, {
  cors: { origin: ALLOWED_ORIGINS, credentials: false },
  // Redes móveis lentas: tolerar mais tempo antes de considerar a ligação perdida.
  pingInterval: 25000,
  pingTimeout: 30000,
});

io.on("connection", (socket) => {
  socket.on(
    "join",
    async (
      payload: { rooms?: unknown; token?: unknown },
      ack?: (result: { joined: string[] }) => void,
    ) => {
      const requested = Array.isArray(payload?.rooms)
        ? payload.rooms.filter((r): r is string => typeof r === "string").slice(0, 20)
        : [];

      let allowed: string[] = [];
      if (typeof payload?.token === "string") {
        try {
          const { payload: claims } = await jwtVerify(payload.token, secretKey);
          if (Array.isArray(claims.rooms)) allowed = claims.rooms as string[];
        } catch {
          // token inválido ou expirado: só entra nas salas públicas
        }
      }

      const joined = requested.filter((room) => PUBLIC_ROOM.test(room) || allowed.includes(room));
      await socket.join(joined);
      ack?.({ joined });
    },
  );

  socket.on("leave", (payload: { rooms?: unknown }) => {
    if (!Array.isArray(payload?.rooms)) return;
    for (const room of payload.rooms) if (typeof room === "string") socket.leave(room);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Tempo real a correr na porta ${PORT}. Origens: ${ALLOWED_ORIGINS.join(", ")}`);
});
