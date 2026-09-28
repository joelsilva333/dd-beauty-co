"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "Como faço uma compra no site?",
    answer:
      "Escolhe o produto que gostas, carrega em \"Adicionar ao carrinho\" e depois em \"Finalizar compra\". Vamos guiar-te passo a passo até à confirmação.",
  },
  {
    question: "Quais são as formas de pagamento?",
    answer:
      "Aceitamos cartão internacional (Stripe) e BitPayAO, o método de pagamento local angolano. Escolhe a opção com que te sentires mais confortável.",
  },
  {
    question: "Quanto tempo demora a entrega?",
    answer:
      "Em Luanda, a entrega demora entre 2 a 4 dias úteis. Nas restantes províncias, entre 5 a 10 dias úteis. Vamos sempre contactar-te para combinar a entrega.",
  },
  {
    question: "Posso pagar quando a encomenda chegar?",
    answer:
      "De momento o pagamento é feito no site, através de cartão ou BitPayAO, para garantir a tua encomenda. Se tiveres dúvidas, fala connosco antes de finalizar a compra.",
  },
  {
    question: "Como acompanho o estado do meu pedido?",
    answer:
      "Na página \"Os meus pedidos\", indica o número do pedido e o teu telefone para veres o estado atual: Em preparação, A caminho ou Entregue.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col divide-y divide-ink/10 border-y border-ink/10">
      {FAQS.map((faq, index) => {
        const open = openIndex === index;
        return (
          <div key={faq.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
              aria-expanded={open}
            >
              <span className="font-display text-lg text-ink">{faq.question}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-gold transition-transform ${
                  open ? "rotate-180" : ""
                }`}
                aria-hidden="true"
                strokeWidth={1.5}
              />
            </button>
            {open && (
              <p className="pb-5 font-body text-sm leading-relaxed text-ink/65">{faq.answer}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
