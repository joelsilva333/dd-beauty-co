import { Wallet } from "lucide-react";
import { PaymentLogo, type PaymentLogoKey } from "@/components/PaymentLogo";

const METHODS: { logo: PaymentLogoKey; title: string; description: string }[] = [
  {
    logo: "multicaixa_express",
    title: "Multicaixa Express",
    description: "Aprovas o pagamento no teu telemóvel, em Kwanza. É o mais rápido.",
  },
  {
    logo: "multicaixa",
    title: "Referência Multicaixa",
    description: "Pagas no ATM ou na app do teu banco, em Kwanza, até 3 dias.",
  },
  {
    logo: "visa",
    title: "Cartão internacional",
    description: "Visa, Mastercard e outros cartões internacionais.",
  },
];

/**
 * Formas de pagamento explicadas ao cliente sem mencionar os prestadores
 * técnicos por trás (não são relevantes para quem compra) — só o que a
 * cliente de facto escolhe e usa, com os logótipos reais para reconhecer
 * de imediato.
 */
export function PaymentMethods() {
  return (
    <div className="flex flex-col gap-4 border-t border-ink/10 pt-6">
      <p className="flex items-center gap-2.5 font-medium text-ink">
        <Wallet className="h-4 w-4 text-gold" aria-hidden="true" strokeWidth={1.5} />
        Métodos de pagamento disponíveis
      </p>
      <ul className="flex flex-col gap-3 pl-6 font-body text-sm text-ink/65">
        {METHODS.map(({ logo, title, description }) => (
          <li key={title} className="flex items-start gap-3">
            <PaymentLogo logo={logo} className="mt-0.5 h-5 w-auto shrink-0" />
            <span>
              <span className="font-medium text-ink">{title}</span> — {description}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
