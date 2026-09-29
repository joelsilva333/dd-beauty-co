// Tabela de entregas por província. Os valores são em cêntimos de Kwanza.
// Ajustar aqui quando a transportadora confirmar os preços finais.
//
// Cada província tem uma taxa própria, agrupada por distância a partir de
// Luanda (a capital, de onde as encomendas saem): quanto mais longe e mais
// difícil o acesso, maior a taxa — sempre com um motivo geográfico claro.
// A taxa também cresce com a quantidade de produtos (mais volume, mais
// espaço/transporte necessário), até um limite razoável.

type ShippingZone = {
  priceCents: number;
  days: string;
};

// Nível 1 — Luanda (a origem: mais rápido e mais barato).
const N1: ShippingZone = { priceCents: 250000, days: "2 a 4 dias úteis" };
// Nível 2 — grande Luanda / litoral central, poucas horas de estrada.
const N2: ShippingZone = { priceCents: 400000, days: "3 a 5 dias úteis" };
// Nível 3 — planalto central, distância média.
const N3: ShippingZone = { priceCents: 480000, days: "5 a 8 dias úteis" };
// Nível 4 — mais distante, acesso mais lento.
const N4: ShippingZone = { priceCents: 550000, days: "7 a 10 dias úteis" };
// Nível 5 — interior/fronteira, rotas mais longas.
const N5: ShippingZone = { priceCents: 650000, days: "8 a 14 dias úteis" };
// Nível 6 — Cabinda: enclave separado do resto do país pela R.D. Congo,
// exige rota marítima ou aérea própria.
const N6: ShippingZone = { priceCents: 750000, days: "8 a 14 dias úteis" };

export const PROVINCE_SHIPPING: Record<string, ShippingZone> = {
  Luanda: N1,
  "Icolo e Bengo": N2,
  Bengo: N2,
  "Cuanza Norte": N2,
  "Cuanza Sul": N2,
  Benguela: N2,
  Huambo: N3,
  Malanje: N3,
  Huíla: N3,
  Uíge: N3,
  Namibe: N4,
  Bié: N4,
  Cunene: N4,
  Zaire: N4,
  "Cuando Cubango": N5,
  Cuando: N5,
  "Lunda Norte": N5,
  "Lunda Sul": N5,
  Moxico: N5,
  "Moxico Leste": N5,
  Cabinda: N6,
};

function zoneFor(province: string): ShippingZone {
  return PROVINCE_SHIPPING[province] ?? N5;
}

// Quanto mais produtos na encomenda, mais espaço/peso a transportar.
// As primeiras unidades já vêm incluídas na taxa base da província.
const FREE_UNITS = 2;
function quantityMultiplier(quantity: number): number {
  const extra = Math.max(0, quantity - FREE_UNITS);
  if (extra === 0) return 1;
  if (extra <= 3) return 1.3; // 3 a 5 produtos
  if (extra <= 8) return 1.6; // 6 a 10 produtos
  return 2; // 11+ produtos
}

export function calculateShippingCents(province: string, quantity = 1): number {
  const base = zoneFor(province).priceCents;
  const total = base * quantityMultiplier(quantity);
  // Arredonda ao Kwanza mais próximo (100 cêntimos), para não mostrar valores estranhos.
  return Math.round(total / 100) * 100;
}

export function estimateDeliveryDays(province: string): string {
  return zoneFor(province).days;
}

// Resumo usado na página de produto (agrupado por nível, para não listar as 21 províncias).
export const SHIPPING_SUMMARY = [
  { label: "Luanda", ...N1 },
  { label: "Grande Luanda e litoral central", ...N2 },
  { label: "Planalto central", ...N3 },
  { label: "Restantes províncias", ...N4 },
  { label: "Interior e fronteiras", ...N5 },
  { label: "Cabinda", ...N6 },
];
