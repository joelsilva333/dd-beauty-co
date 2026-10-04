import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { checkoutSchema } from "@/lib/checkout-schema";
import { aoaCentsToUsdCents } from "@/lib/exchange";
import { cancelUnpaidOrder, createOrder, OrderError } from "@/lib/orders";
import { BitpayError, bitpayConfigured, startBitpayPayment } from "@/lib/bitpay";
import { normalizePhone } from "@/lib/angola";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 },
    );
  }

  // Lida pelo servidor (nunca confiamos num customerId vindo do cliente):
  // se há sessão de cliente iniciada, a encomenda fica ligada à conta.
  const customerSession = await getCustomerSession();

  let created;
  try {
    created = await createOrder(parsed.data, customerSession?.customerId);
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }

  const { order, products } = created;
  const origin = request.nextUrl.origin;
  const confirmationUrl = `/checkout/confirmado/${order.orderNumber}`;

  if (order.paymentMethod === "STRIPE") {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        locale: "pt",
        line_items: order.items.map((item) => {
          const image = products.find((p) => p.id === item.productId)?.images[0]?.url;
          return {
            quantity: item.quantity,
            price_data: {
              currency: "usd",
              unit_amount: aoaCentsToUsdCents(item.priceCents),
              product_data: { name: item.name, images: image ? [image] : undefined },
            },
          };
        }),
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: { amount: aoaCentsToUsdCents(order.shippingCents), currency: "usd" },
              display_name: "Entrega em Angola",
            },
          },
        ],
        // O stock fica reservado enquanto a sessão está aberta; ao expirar é devolvido (webhook).
        expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
        success_url: `${origin}${confirmationUrl}`,
        cancel_url: `${origin}/checkout?pagamento=cancelado`,
        metadata: { orderId: order.id, orderNumber: order.orderNumber },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: session.id },
      });

      return NextResponse.json({ redirectUrl: session.url });
    } catch (error) {
      console.error("[checkout] Stripe falhou:", error);
      await cancelUnpaidOrder(order.id);
      return NextResponse.json(
        { error: "Não conseguimos abrir o pagamento por cartão. Tenta novamente ou escolhe BitPayAO." },
        { status: 502 },
      );
    }
  }

  // Sem credenciais BitPay: modo manual (a equipa confirma o pagamento no painel).
  if (bitpayConfigured()) {
    try {
      const mobile = parsed.data.bitpayMobile ? normalizePhone(parsed.data.bitpayMobile) : undefined;
      await startBitpayPayment(order, parsed.data.bitpayMethod ?? "multicaixa_express", mobile);
    } catch (error) {
      await cancelUnpaidOrder(order.id);
      const message =
        error instanceof BitpayError ? error.message : "Não conseguimos iniciar o pagamento. Tenta novamente.";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  return NextResponse.json({ redirectUrl: confirmationUrl });
}
