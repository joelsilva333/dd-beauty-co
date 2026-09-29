import { CreditCard, Home, Landmark, Smartphone } from "lucide-react";

const METHODS = [
  {
    icon: Smartphone,
    title: "Multicaixa Express",
    description: "Aprovas o pagamento no teu telemóvel, em Kwanza. É o mais rápido.",
  },
  {
    icon: Landmark,
    title: "Referência Multicaixa",
    description: "Pagas no ATM ou na app do teu banco, em Kwanza, até 3 dias.",
  },
  {
    icon: CreditCard,
    title: "Cartão internacional",
    description: "Visa, Mastercard e outros cartões internacionais.",
  },
];

/**
 * Formas de pagamento explicadas ao cliente sem mencionar os prestadores
 * técnicos por trás (não são relevantes para quem compra) — só o que a
 * cliente de facto escolhe e usa.
 */
export function PaymentMethods() {
  return (
    <div className="flex flex-col gap-4 border-t border-ink/10 pt-6">
      <p className="flex items-center gap-2.5 font-medium text-ink">
        <Home className="h-4 w-4 text-gold" aria-hidden="true" strokeWidth={1.5} />
        Recebes a encomenda no conforto da tua casa
      </p>
      <ul className="flex flex-col gap-3 pl-6 font-body text-sm text-ink/65">
        {METHODS.map(({ icon: Icon, title, description }) => (
          <li key={title} className="flex items-start gap-2.5">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink/40" aria-hidden="true" strokeWidth={1.5} />
            <span>
              <span className="font-medium text-ink">{title}</span> — {description}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
