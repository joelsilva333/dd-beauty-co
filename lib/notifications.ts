import type { Order, OrderItem, OrderStatus } from "@prisma/client";
import { formatKwanza } from "@/lib/currency";
import { estimateDeliveryDays } from "@/lib/shipping";
import { SITE } from "@/lib/site-config";

// Notificações automáticas de encomenda por email (Resend), WhatsApp (Meta
// Cloud API) e SMS (Twilio). Cada canal só é usado se as variáveis de ambiente
// respetivas estiverem definidas; sem elas a mensagem fica apenas no log.
// Nenhuma falha aqui pode impedir uma encomenda — por isso nada lança erro.

type OrderWithItems = Order & { items: OrderItem[] };

type Message = { subject: string; text: string };

function orderLink(order: Order) {
  return `${SITE.url}/minha-conta?numero=${encodeURIComponent(order.orderNumber)}`;
}

function receivedMessage(order: OrderWithItems): Message {
  const paid = order.paymentStatus === "PAGO";
  const lines = [
    `Olá ${order.customerName.split(" ")[0]}, obrigada pela tua compra.`,
    ``,
    `Pedido: ${order.orderNumber}`,
    ...order.items.map((i) => `${i.quantity}× ${i.name} — ${formatKwanza(i.priceCents * i.quantity)}`),
    `Entrega: ${formatKwanza(order.shippingCents)}`,
    `Total: ${formatKwanza(order.totalCents)}`,
    ``,
    ...(paid
      ? [`✔ O teu pagamento foi confirmado.`]
      : order.bitpayRefNumber
        ? [
            `Para pagar no Multicaixa (ATM ou app), escolhe "Pagamentos por referência":`,
            `Entidade: ${order.bitpayRefEntity}`,
            `Referência: ${order.bitpayRefNumber.replace(/(\d{3})(?=\d)/g, "$1 ")}`,
            `Montante: ${formatKwanza(order.totalCents)}`,
            order.bitpayRefExpiresAt
              ? `Válida até ${order.bitpayRefExpiresAt.toLocaleString("pt-AO", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Luanda" })}.`
              : ``,
          ]
        : [`Estamos a confirmar o teu pagamento. Avisamos-te assim que estiver tudo certo.`]),
    `A tua encomenda chega em ${estimateDeliveryDays(order.province)}. Vamos ligar-te para o ${order.customerPhone} para combinar a entrega.`,
    ``,
    `Ver o teu pedido: ${orderLink(order)}`,
    `Dúvidas? WhatsApp ${SITE.phoneDisplay}`,
  ];
  return { subject: `O teu pedido ${order.orderNumber} foi recebido`, text: lines.join("\n") };
}

function paymentConfirmedMessage(order: Order): Message {
  return {
    subject: `Pagamento confirmado — pedido ${order.orderNumber}`,
    text: [
      `Olá ${order.customerName.split(" ")[0]},`,
      `✔ Recebemos o pagamento do teu pedido ${order.orderNumber} (${formatKwanza(order.totalCents)}).`,
      `Vamos preparar tudo com cuidado. Chega em ${estimateDeliveryDays(order.province)}.`,
      ``,
      `Ver o teu pedido: ${orderLink(order)}`,
    ].join("\n"),
  };
}

const STATUS_MESSAGES: Partial<Record<OrderStatus, (o: Order) => string>> = {
  EM_PREPARACAO: (o) => `O teu pedido ${o.orderNumber} está a ser preparado com todo o cuidado.`,
  A_CAMINHO: (o) =>
    `O teu pedido ${o.orderNumber} está a caminho. Vamos ligar-te para o ${o.customerPhone} para combinar a entrega.`,
  ENTREGUE: (o) =>
    `O teu pedido ${o.orderNumber} foi entregue. Esperamos que gostes — a tua rotina de beleza merece isto.`,
  CANCELADO: (o) =>
    `O teu pedido ${o.orderNumber} foi cancelado. Se tiveres dúvidas, fala connosco pelo WhatsApp ${SITE.phoneDisplay}.`,
};

function statusMessage(order: Order): Message | null {
  const build = STATUS_MESSAGES[order.status];
  if (!build) return null;
  return {
    subject: `Atualização do pedido ${order.orderNumber}`,
    text: `Olá ${order.customerName.split(" ")[0]},\n${build(order)}\n\nVer o teu pedido: ${orderLink(order)}`,
  };
}

// ---------- canais ----------

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

function emailHtml(message: Message) {
  const body = escapeHtml(message.text)
    .split("\n")
    .map((line) => (line ? `<p style="margin:0 0 10px">${line}</p>` : ""))
    .join("");
  return `<div style="background:#F7F2EA;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;color:#2E2019">
  <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border-radius:12px;padding:32px">
    <p style="margin:0;font-family:Georgia,serif;font-size:22px">Deodália Dias</p>
    <p style="margin:2px 0 24px;font-size:11px;letter-spacing:0.28em;color:#B08D57">BEAUTY &amp; CO.</p>
    <div style="font-size:15px;line-height:1.5">${body}</div>
  </div>
</div>`;
}

async function sendEmail(to: string, message: Message) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return log("email", to, message);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject: message.subject, text: message.text, html: emailHtml(message) }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

// Formato internacional sem "+" (ex: 244923456789), exigido pela Meta e Twilio.
function internationalPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 9 ? `244${digits}` : digits;
}

async function sendWhatsApp(phone: string, message: Message) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return log("whatsapp", phone, message);

  // Mensagens iniciadas pela marca precisam de um modelo aprovado pela Meta.
  // O modelo deve ter uma única variável {{1}} no corpo, que recebe o texto.
  const template = process.env.WHATSAPP_TEMPLATE_NAME;
  const payload = template
    ? {
        messaging_product: "whatsapp",
        to: internationalPhone(phone),
        type: "template",
        template: {
          name: template,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG ?? "pt_PT" },
          components: [
            { type: "body", parameters: [{ type: "text", text: message.text.replace(/\n+/g, " ") }] },
          ],
        },
      }
    : { messaging_product: "whatsapp", to: internationalPhone(phone), type: "text", text: { body: message.text } };

  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`WhatsApp ${res.status}: ${await res.text()}`);
}

async function sendSms(phone: string, message: Message) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !authToken || !from) return log("sms", phone, message);

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: `+${internationalPhone(phone)}`, From: from, Body: message.text }),
  });
  if (!res.ok) throw new Error(`Twilio ${res.status}: ${await res.text()}`);
}

function log(channel: string, to: string, message: Message) {
  console.info(`[notificação:${channel}] (sem provedor configurado) para ${to}: ${message.subject}`);
}

async function deliver(order: Order, message: Message) {
  const tasks: Promise<void>[] = [sendWhatsApp(order.customerPhone, message)];
  // SMS só como alternativa quando o WhatsApp não está configurado, para não duplicar.
  if (!process.env.WHATSAPP_TOKEN) tasks.push(sendSms(order.customerPhone, message));
  if (order.customerEmail) tasks.push(sendEmail(order.customerEmail, message));

  const results = await Promise.allSettled(tasks);
  for (const r of results) {
    if (r.status === "rejected") console.error("[notificação] falhou:", r.reason);
  }
}

// ---------- API pública ----------

export async function notifyOrderReceived(order: OrderWithItems) {
  await deliver(order, receivedMessage(order));

  const teamEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (teamEmail) {
    await sendEmail(teamEmail, {
      subject: `Nova encomenda ${order.orderNumber} — ${formatKwanza(order.totalCents)}`,
      text: [
        `${order.customerName} · ${order.customerPhone}`,
        `${order.addressLine}, ${order.municipality}, ${order.province}`,
        `Pagamento: ${order.paymentMethod === "STRIPE" ? "Cartão" : "BitPayAO"} (${order.paymentStatus})`,
        ...order.items.map((i) => `${i.quantity}× ${i.name}`),
        ``,
        `${SITE.url}/admin/encomendas/${order.id}`,
      ].join("\n"),
    }).catch((e) => console.error("[notificação] equipa:", e));
  }
}

export async function notifyPaymentConfirmed(order: Order) {
  await deliver(order, paymentConfirmedMessage(order));
}

export async function notifyStatusChanged(order: Order) {
  const message = statusMessage(order);
  if (message) await deliver(order, message);
}
