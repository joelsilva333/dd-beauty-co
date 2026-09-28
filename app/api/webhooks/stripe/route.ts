import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { cancelUnpaidOrder, markOrderPaid } from "@/lib/orders";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook não configurado" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.orderId;

  if (orderId) {
    if (event.type === "checkout.session.completed" && session.payment_status === "paid") {
      await markOrderPaid(orderId);
    } else if (event.type === "checkout.session.async_payment_succeeded") {
      await markOrderPaid(orderId);
    } else if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      await cancelUnpaidOrder(orderId);
    }
  }

  return NextResponse.json({ received: true });
}
