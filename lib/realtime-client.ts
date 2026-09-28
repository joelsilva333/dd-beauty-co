"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

// Uma única ligação socket.io por separador, partilhada por todos os componentes.
// Se NEXT_PUBLIC_REALTIME_URL não estiver definido, o site funciona na mesma,
// apenas sem atualizações ao vivo.

const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL;
let socket: Socket | null = null;

function getSocket(): Socket | null {
  if (!REALTIME_URL) return null;
  if (!socket) {
    socket = io(REALTIME_URL, {
      // Em redes móveis instáveis, o long-polling abre mais depressa e depois sobe para WebSocket.
      transports: ["polling", "websocket"],
      reconnectionDelayMax: 10000,
    });
  }
  return socket;
}

// Várias partes da página podem ouvir a mesma sala; só se sai quando a última deixa de ouvir.
const roomRefs = new Map<string, number>();

function retain(roomList: string[]) {
  for (const room of roomList) roomRefs.set(room, (roomRefs.get(room) ?? 0) + 1);
}

function release(s: Socket, roomList: string[]) {
  const toLeave = roomList.filter((room) => {
    const next = (roomRefs.get(room) ?? 1) - 1;
    if (next <= 0) roomRefs.delete(room);
    else roomRefs.set(room, next);
    return next <= 0;
  });
  if (toLeave.length) s.emit("leave", { rooms: toLeave });
}

type Handlers = Record<string, (data: never) => void>;

export function useRealtime({
  rooms,
  token,
  handlers,
}: {
  rooms: string[];
  token?: string | null;
  handlers: Handlers;
}): { connected: boolean } {
  const [connected, setConnected] = useState(false);
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  const roomsKey = rooms.join("|");

  useEffect(() => {
    const s = getSocket();
    if (!s || !roomsKey) return;
    const roomList = roomsKey.split("|");
    retain(roomList);

    // Voltar a entrar nas salas a cada (re)ligação.
    const join = () => {
      s.emit("join", { rooms: roomList, token });
      setConnected(true);
    };
    const onDisconnect = () => setConnected(false);

    const listeners = Object.keys(handlersRef.current).map((event) => {
      // Os dados chegam do servidor sem tipo; cada handler declara a forma que espera.
      const listener = (data: unknown) => handlersRef.current[event]?.(data as never);
      s.on(event, listener);
      return [event, listener] as const;
    });

    s.on("connect", join);
    s.on("disconnect", onDisconnect);
    if (s.connected) join();

    return () => {
      s.off("connect", join);
      s.off("disconnect", onDisconnect);
      for (const [event, listener] of listeners) s.off(event, listener);
      release(s, roomList);
    };
  }, [roomsKey, token]);

  return { connected };
}
