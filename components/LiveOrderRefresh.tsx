"use client";

import { useRouter } from "next/navigation";
import { useRealtime } from "@/lib/realtime-client";

// Atualiza a página (componente de servidor) assim que o estado do pedido muda.
export function LiveOrderRefresh({ orderNumber, token }: { orderNumber: string; token: string | null }) {
  const router = useRouter();
  useRealtime({
    rooms: token ? [`order:${orderNumber}`] : [],
    token,
    handlers: { "order:updated": () => router.refresh() },
  });
  return null;
}
