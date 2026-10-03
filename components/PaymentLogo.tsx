import Image from "next/image";

// Logótipos reais dos métodos de pagamento — ajudam a cliente a reconhecer
// de imediato o que está a escolher, em vez de depender só de um ícone genérico.
// width/height são as dimensões reais do ficheiro (para o aspect-ratio correto);
// o tamanho visível é controlado pela className (ex: "h-9 w-auto").
const LOGOS = {
  visa: { src: "/payments/visa.png", alt: "Visa", width: 369, height: 151 },
  multicaixa: { src: "/payments/multicaixa.png", alt: "Multicaixa", width: 447, height: 447 },
  multicaixa_express: {
    src: "/payments/multicaixa-express.png",
    alt: "Multicaixa Express",
    width: 336,
    height: 266,
  },
} as const;

export type PaymentLogoKey = keyof typeof LOGOS;

export function PaymentLogo({
  logo,
  className = "h-9 w-auto",
}: {
  logo: PaymentLogoKey;
  className?: string;
}) {
  const { src, alt, width, height } = LOGOS[logo];
  return (
    <Image src={src} alt={alt} width={width} height={height} className={`shrink-0 object-contain ${className}`} />
  );
}
