import { createHmac, timingSafeEqual } from "node:crypto";
import type { Order } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cancelUnpaidOrder, markOrderPaid, recordPaymentFailure } from "@/lib/orders";

// Integração BitPay (https://developers.bitpay.ao) — pagamento local angolano.
// Usamos Payment Intents diretamente (e não o checkout alojado) para que a
// cliente nunca saia do site: no Multicaixa Express aprova na app do telemóvel;
// na Referência Multicaixa mostramos entidade + referência no nosso ecrã.

export type BitpayMethod = "multicaixa_express" | "multicaixa_reference";

type PaymentIntent = {
  id: string;
  status:
    | "PENDING"
    | "PROCESSING"
    | "UNKNOWN"
    | "SUCCEEDED"
    | "FAILED"
    | "CANCELLED"
    | "EXPIRED"
    | "PARTIALLY_REFUNDED"
    | "REFUNDED";
  payment_method: BitpayMethod;
  failure_code: string | null;
  merchant_reference: string | null;
  reference: { entity: string; number: string; expires_at: string } | null;
};

export class BitpayError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
  }
}

const FRIENDLY_ERRORS: Record<string, string> = {
  invalid_phone_number: "O número Multicaixa Express não parece correto. Confirma e tenta novamente.",
  amount_out_of_range: "O valor desta encomenda não é aceite por este método. Escolhe outro método.",
  method_disabled: "Este método de pagamento está temporariamente indisponível. Escolhe outro.",
  maintenance: "O sistema de pagamentos está em manutenção. Tenta dentro de alguns minutos.",
  rate_limit_exceeded: "Muitas tentativas seguidas. Espera um momento e tenta novamente.",
};

export function bitpayConfigured(): boolean {
  return Boolean(process.env.BITPAY_BASE_URL && process.env.BITPAY_SECRET_KEY);
}

async function bitpayFetch<T>(path: string, init: RequestInit & { idempotencyKey?: string } = {}): Promise<T> {
  if (!bitpayConfigured()) throw new BitpayError("BitPay não está configurado.");

  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.BITPAY_SECRET_KEY}`,
  };
  if (init.body) headers["Content-Type"] = "application/json";
  if (init.idempotencyKey) headers["Idempotency-Key"] = init.idempotencyKey;

  const res = await fetch(`${process.env.BITPAY_BASE_URL}${path}`, {
    ...init,
    headers,
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const code: string | undefined = json?.error?.code;
    console.error("[bitpay]", path, res.status, json?.error);
    throw new BitpayError(
      (code && FRIENDLY_ERRORS[code]) ?? "Não conseguimos iniciar o pagamento. Tenta novamente.",
      code,
    );
  }
  return json as T;
}

// Cria um novo pagamento para a encomenda e guarda-o. Cada tentativa tem a sua
// chave de idempotência, para que um duplo clique nunca cobre duas vezes.
export async function startBitpayPayment(order: Order, method: BitpayMethod, mobile?: string) {
  const attempt = order.bitpayAttempts + 1;
  const intent = await bitpayFetch<PaymentIntent>("/payment_intents", {
    method: "POST",
    idempotencyKey: `${order.id}-${attempt}`,
    body: JSON.stringify({
      // A BitPay trabalha em kwanzas inteiros; guardamos cêntimos.
      amount: Math.round(order.totalCents / 100),
      currency: "AOA",
      payment_method: method,
      ...(method === "multicaixa_express" && { customer: { mobile: mobile ?? order.customerPhone } }),
      merchant_reference: order.orderNumber,
      metadata: { orderId: order.id },
    }),
  });

  return prisma.order.update({
    where: { id: order.id },
    data: {
      bitpayPaymentId: intent.id,
      bitpayMethod: method,
      bitpayAttempts: attempt,
      bitpayFailureCode: null,
      paymentStatus: "PENDENTE",
      bitpayRefEntity: intent.reference?.entity ?? null,
      bitpayRefNumber: intent.reference?.number ?? null,
      bitpayRefExpiresAt: intent.reference ? new Date(intent.reference.expires_at) : null,
    },
  });
}

export async function cancelBitpayPayment(paymentId: string) {
  try {
    await bitpayFetch(`/payment_intents/${paymentId}/cancel`, { method: "POST" });
  } catch {
    // já não estava pendente — nada a cancelar
  }
}

// Aplica à encomenda o estado de um pagamento BitPay (vindo do webhook ou de consulta).
export async function applyPaymentIntent(orderId: string, intent: PaymentIntent) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  // Ignorar eventos de tentativas antigas (ex: Express recusado seguido de Referência).
  if (!order || order.bitpayPaymentId !== intent.id) return;

  switch (intent.status) {
    case "SUCCEEDED":
    case "PARTIALLY_REFUNDED":
    case "REFUNDED":
      await markOrderPaid(orderId);
      break;
    case "FAILED":
      // A encomenda e o stock mantêm-se: a cliente pode tentar de novo.
      await recordPaymentFailure(orderId, intent.failure_code ?? "failed");
      break;
    case "EXPIRED":
    case "CANCELLED":
      await cancelUnpaidOrder(orderId);
      break;
    // PENDING, PROCESSING, UNKNOWN: ainda à espera (UNKNOWN nunca é falha — é reconciliado).
  }
}

// Consulta direta: usada pela página de confirmação, para não depender só do webhook.
export async function syncBitpayPayment(order: Order) {
  if (!order.bitpayPaymentId || order.paymentStatus === "PAGO" || order.status === "CANCELADO") return;
  try {
    const intent = await bitpayFetch<PaymentIntent>(`/payment_intents/${order.bitpayPaymentId}`);
    await applyPaymentIntent(order.id, intent);
  } catch (error) {
    console.error("[bitpay] sincronização falhou:", error);
  }
}

// BitPay-Signature: t=<unix>,v1=<hex>, com v1 = HMAC-SHA256("<t>.<corpo cru>", whsec_…).
export function verifyBitpaySignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.BITPAY_WEBHOOK_SECRET;
  if (!secret || !header) return false;

  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const [k, ...v] = p.trim().split("=");
      return [k, v.join("=")];
    }),
  );
  const t = Number(parts.t);
  if (!t || !parts.v1 || Math.abs(Date.now() / 1000 - t) > 600) return false;

  const expected = Buffer.from(createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex"));
  const received = Buffer.from(parts.v1);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export type { PaymentIntent };
