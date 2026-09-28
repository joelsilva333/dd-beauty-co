// Contactos de apoio ao cliente. Definidos no .env para a equipa poder mudar
// o número sem mexer no código.
const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "244900000000";

export const SITE = {
  name: "Deodália Dias — Beauty & Co.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  whatsappNumber,
  phoneDisplay: process.env.NEXT_PUBLIC_SUPPORT_PHONE_DISPLAY ?? "+244 900 000 000",
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "ola@deodaliadias.co.ao",
};

export function whatsappLink(message?: string, number = SITE.whatsappNumber): string {
  const base = `https://wa.me/${number.replace(/\D/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function telLink(): string {
  return `tel:+${SITE.whatsappNumber.replace(/\D/g, "")}`;
}
