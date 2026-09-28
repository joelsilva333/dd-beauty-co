import { MessageCircle, Phone } from "lucide-react";
import { FaqAccordion } from "@/components/FaqAccordion";

export const metadata = {
  title: "Ajuda — Deodália Dias",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-8">
      <div className="mb-10 flex flex-col gap-2 text-center">
        <p className="font-body text-sm tracking-wide-label uppercase text-gold">
          Estamos aqui para ajudar
        </p>
        <h1 className="font-display text-3xl text-ink md:text-4xl">
          Perguntas frequentes
        </h1>
        <p className="font-body text-ink/60">
          Se não encontrares a tua resposta aqui, fala connosco diretamente.
        </p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        <a
          href="https://wa.me/244900000000"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl border border-taupe/25 p-5 transition hover:border-gold"
        >
          <MessageCircle className="h-6 w-6 text-gold" aria-hidden="true" />
          <div>
            <p className="font-display text-lg text-ink">WhatsApp</p>
            <p className="font-body text-sm text-ink/60">+244 900 000 000</p>
          </div>
        </a>
        <a
          href="tel:+244900000000"
          className="flex items-center gap-3 rounded-xl border border-taupe/25 p-5 transition hover:border-gold"
        >
          <Phone className="h-6 w-6 text-gold" aria-hidden="true" />
          <div>
            <p className="font-display text-lg text-ink">Telefone</p>
            <p className="font-body text-sm text-ink/60">+244 900 000 000</p>
          </div>
        </a>
      </div>

      <FaqAccordion />
    </div>
  );
}
