import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { checkoutSchema } from "@/lib/checkout-schema";
import { calculateShippingCents } from "@/lib/shipping";
import { generateOrderNumber } from "@/lib/order-number";
import { aoaCentsToUsdCents } from "@/lib/exchange";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const products = await prisma.product.findMany({
    where: { id: { in: data.items.map((i) => i.productId) }, active: true },
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });

  if (products.length === 0) {
    return NextResponse.json({ error: "Carrinho inválido" }, { status: 400 });
  }

  const orderItemsData = data.items.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return [];
    return [
      {
        productId: product.id,
        quantity: item.quantity,
        priceCents: product.priceCents,
        name: product.name,
      },
    ];
  });

  const subtotalCents = orderItemsData.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0,
  );
  const shippingCents = calculateShippingCents(data.province);
  const totalCents = subtotalCents + shippingCents;
  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || null,
      province: data.province,
      municipality: data.municipality,
      addressLine: data.addressLine,
      addressNotes: data.addressNotes || null,
      subtotalCents,
      shippingCents,
      totalCents,
      paymentMethod: data.paymentMethod,
      items: { create: orderItemsData },
    },
  });

  if (data.paymentMethod === "STRIPE") {
    const origin = request.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: orderItemsData.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          quantity: item.quantity,
          price_data: {
            currency: "usd",
            unit_amount: aoaCentsToUsdCents(item.priceCents),
            product_data: {
              name: item.name,
              images: product?.images[0] ? [product.images[0].url] : undefined,
            },
          },
        };
      }),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: aoaCentsToUsdCents(shippingCents),
              currency: "usd",
            },
            display_name: "Entrega em Angola",
          },
        },
      ],
      success_url: `${origin}/checkout/confirmado/${order.orderNumber}`,
      cancel_url: `${origin}/checkout`,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ redirectUrl: session.url });
  }

  return NextResponse.json({
    redirectUrl: `/checkout/confirmado/${order.orderNumber}`,
  });
}
