import { after } from "next/server";
import { Prisma, type Order, type OrderStatus, type PaymentMethod } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/order-number";
import { calculateShippingCents } from "@/lib/shipping";
import { normalizePhone } from "@/lib/angola";
import { emitRealtime, REALTIME_EVENTS, rooms } from "@/lib/realtime";
import {
  notifyOrderReceived,
  notifyPaymentConfirmed,
  notifyStatusChanged,
} from "@/lib/notifications";
import type { CheckoutInput } from "@/lib/checkout-schema";

export class OrderError extends Error {}

// Dados públicos de uma encomenda enviados em tempo real (sem morada nem contactos).
function publicOrderEvent(order: Order) {
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
  };
}

function adminOrderEvent(order: Order) {
  return {
    ...publicOrderEvent(order),
    id: order.id,
    customerName: order.customerName,
    totalCents: order.totalCents,
    paymentMethod: order.paymentMethod,
    province: order.province,
    createdAt: order.createdAt,
  };
}

async function emitStock(productIds: string[]) {
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, stock: true },
  });
  await emitRealtime(
    ...products.map((p) => ({
      room: rooms.product(p.id),
      event: REALTIME_EVENTS.stockUpdated,
      data: { productId: p.id, stock: p.stock },
    })),
  );
}

// Cria a encomenda e reserva o stock na mesma transação: se um produto
// esgotar entretanto, nada é gravado e a cliente recebe uma mensagem clara.
export async function createOrder(data: CheckoutInput, customerId?: string) {
  const quantities = new Map<string, number>();
  for (const item of data.items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }

  const products = await prisma.product.findMany({
    where: { id: { in: [...quantities.keys()] }, active: true },
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });

  if (products.length !== quantities.size) {
    throw new OrderError(
      "Um dos produtos do teu carrinho já não está disponível. Revê o carrinho e tenta novamente.",
    );
  }

  const itemsData = products.map((product) => ({
    productId: product.id,
    quantity: quantities.get(product.id)!,
    priceCents: product.priceCents,
    name: product.name,
  }));

  const subtotalCents = itemsData.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
  const totalQuantity = itemsData.reduce((sum, i) => sum + i.quantity, 0);
  const shippingCents = calculateShippingCents(data.province, totalQuantity);

  for (let attempt = 0; ; attempt++) {
    try {
      const order = await prisma.$transaction(async (tx) => {
        for (const item of itemsData) {
          const reserved = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (reserved.count === 0) {
            const left = products.find((p) => p.id === item.productId)!;
            throw new OrderError(
              `Já não temos ${item.quantity} unidade(s) de "${left.name}". Ajusta a quantidade no carrinho.`,
            );
          }
        }

        return tx.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            customerId,
            customerName: data.customerName.trim(),
            customerPhone: normalizePhone(data.customerPhone),
            customerEmail: data.customerEmail || null,
            province: data.province,
            municipality: data.municipality.trim(),
            bairro: data.bairro.trim(),
            addressLine: data.addressLine.trim(),
            addressNotes: data.addressNotes?.trim() || null,
            subtotalCents,
            shippingCents,
            totalCents: subtotalCents + shippingCents,
            paymentMethod: data.paymentMethod as PaymentMethod,
            items: { create: itemsData },
          },
          include: { items: true },
        });
      });

      after(async () => {
        await Promise.all([
          emitStock(itemsData.map((i) => i.productId)),
          emitRealtime({
            room: rooms.admin,
            event: REALTIME_EVENTS.orderCreated,
            data: adminOrderEvent(order),
          }),
        ]);
        // Pagamentos por cartão só são notificados depois de confirmados (markOrderPaid).
        // Relemos a encomenda: entretanto ganhou a referência Multicaixa a incluir na mensagem.
        if (order.paymentMethod !== "STRIPE") {
          const fresh = await prisma.order.findUnique({ where: { id: order.id }, include: { items: true } });
          if (fresh && fresh.status !== "CANCELADO") await notifyOrderReceived(fresh);
        }
      });

      return { order, products };
    } catch (error) {
      // Número de pedido repetido (raro): tenta novamente com outro número.
      const duplicate =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (duplicate && attempt < 4) continue;
      throw error;
    }
  }
}

// Idempotente: pode ser chamado pelo webhook e pela página de confirmação ao mesmo tempo.
export async function markOrderPaid(orderId: string) {
  const updated = await prisma.order.updateMany({
    where: { id: orderId, paymentStatus: { not: "PAGO" }, status: { not: "CANCELADO" } },
    data: { paymentStatus: "PAGO", status: "PAGO" },
  });
  if (updated.count === 0) return null;

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: true },
  });

  after(async () => {
    await emitRealtime(
      { room: rooms.order(order.orderNumber), event: REALTIME_EVENTS.orderUpdated, data: publicOrderEvent(order) },
      { room: rooms.admin, event: REALTIME_EVENTS.orderUpdated, data: adminOrderEvent(order) },
    );
    if (order.paymentMethod === "STRIPE") await notifyOrderReceived(order);
    else await notifyPaymentConfirmed(order);
  });

  return order;
}

// Pagamento recusado (ex: Multicaixa Express rejeitado). A encomenda continua
// reservada para a cliente poder tentar outra vez ou escolher outro método.
export async function recordPaymentFailure(orderId: string, failureCode: string) {
  const updated = await prisma.order.updateMany({
    where: { id: orderId, paymentStatus: "PENDENTE", status: "PENDENTE" },
    data: { paymentStatus: "FALHOU", bitpayFailureCode: failureCode },
  });
  if (updated.count === 0) return;

  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  after(() =>
    emitRealtime(
      { room: rooms.order(order.orderNumber), event: REALTIME_EVENTS.orderUpdated, data: publicOrderEvent(order) },
      { room: rooms.admin, event: REALTIME_EVENTS.orderUpdated, data: adminOrderEvent(order) },
    ),
  );
}

// Devolve o stock de uma encomenda não concluída. Seguro contra dupla devolução.
async function releaseStock(tx: Prisma.TransactionClient, orderId: string) {
  const claimed = await tx.order.updateMany({
    where: { id: orderId, stockReleased: false },
    data: { stockReleased: true },
  });
  if (claimed.count === 0) return [];

  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
  }
  return items.map((i) => i.productId);
}

export async function setOrderStatus(orderId: string, status: OrderStatus) {
  const current = await prisma.order.findUnique({ where: { id: orderId } });
  if (!current) throw new OrderError("Encomenda não encontrada.");
  if (current.status === status) return current;
  // O stock de uma encomenda cancelada já voltou à loja; reabri-la venderia stock em duplicado.
  if (current.status === "CANCELADO") {
    throw new OrderError("Esta encomenda foi cancelada e não pode ser reaberta. Cria um novo pedido.");
  }

  const { order, releasedProductIds } = await prisma.$transaction(async (tx) => {
    const releasedProductIds = status === "CANCELADO" ? await releaseStock(tx, orderId) : [];
    const order = await tx.order.update({ where: { id: orderId }, data: { status } });
    return { order, releasedProductIds };
  });

  after(async () => {
    await Promise.all([
      emitRealtime(
        { room: rooms.order(order.orderNumber), event: REALTIME_EVENTS.orderUpdated, data: publicOrderEvent(order) },
        { room: rooms.admin, event: REALTIME_EVENTS.orderUpdated, data: adminOrderEvent(order) },
      ),
      releasedProductIds.length ? emitStock(releasedProductIds) : null,
    ]);
    await notifyStatusChanged(order);
  });

  return order;
}

// Pagamento abandonado (ex: sessão Stripe expirada): cancela sem notificar a cliente.
export async function cancelUnpaidOrder(orderId: string) {
  const result = await prisma.$transaction(async (tx) => {
    const cancelled = await tx.order.updateMany({
      where: { id: orderId, paymentStatus: { not: "PAGO" }, status: "PENDENTE" },
      data: { status: "CANCELADO", paymentStatus: "FALHOU" },
    });
    if (cancelled.count === 0) return null;
    return releaseStock(tx, orderId);
  });

  if (result?.length) {
    after(() => emitStock(result));
  }
}
