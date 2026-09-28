export function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DD-${y}${m}-${rand}`;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
  EM_PREPARACAO: "Em preparação",
  A_CAMINHO: "A caminho",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};
