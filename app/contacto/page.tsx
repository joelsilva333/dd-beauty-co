import { MessageCircle, Phone } from "lucide-react";
import { FaqAccordion } from "@/components/FaqAccordion";
import { ContactForm } from "@/components/ContactForm";
import { SITE, telLink, whatsappLink } from "@/lib/site-config";

export const metadata = {
  title: "Ajuda",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-20">
      <div className="mb-12 flex flex-col gap-3 text-center">
        <p className="eyebrow-gold">Estamos aqui para ajudar</p>
        <h1 className="font-display text-4xl text-ink md:text-5xl">
          Perguntas frequentes
        </h1>
        <p className="font-body text-ink/60">
          Se não encontrares a tua resposta aqui, fala connosco diretamente.
        </p>
      </div>

      <div className="mb-14 grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2">
        <a
          href={whatsappLink("Olá, tenho uma dúvida")}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-4 bg-cream p-6 transition hover:bg-white"
        >
          <MessageCircle className="h-5 w-5 text-gold" aria-hidden="true" strokeWidth={1.5} />
          <div>
            <p className="font-display text-lg text-ink">WhatsApp</p>
            <p className="font-body text-sm text-ink/55">{SITE.phoneDisplay}</p>
          </div>
        </a>
        <a href={telLink()} className="flex items-center gap-4 bg-cream p-6 transition hover:bg-white">
          <Phone className="h-5 w-5 text-gold" aria-hidden="true" strokeWidth={1.5} />
          <div>
            <p className="font-display text-lg text-ink">Telefone</p>
            <p className="font-body text-sm text-ink/55">{SITE.phoneDisplay}</p>
          </div>
        </a>
      </div>

      <FaqAccordion />

      <div className="mt-16 border-t border-ink/10 pt-16">
        <ContactForm />
      </div>
    </div>
  );
}
