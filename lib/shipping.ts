// Tabela de entregas por província. Os valores são em cêntimos de Kwanza.
// Ajustar aqui quando a transportadora confirmar os preços finais.

type ShippingZone = {
  priceCents: number;
  days: string;
};

const ZONES = {
  luanda: { priceCents: 250000, days: "2 a 4 dias úteis" },
  proxima: { priceCents: 400000, days: "4 a 7 dias úteis" },
  distante: { priceCents: 550000, days: "7 a 12 dias úteis" },
} satisfies Record<string, ShippingZone>;

const PROVINCE_ZONE: Record<string, keyof typeof ZONES> = {
  Luanda: "luanda",
  Bengo: "proxima",
  "Cuanza Norte": "proxima",
  "Cuanza Sul": "proxima",
  Benguela: "proxima",
  Huambo: "proxima",
  Malanje: "proxima",
  Uíge: "proxima",
  Huíla: "proxima",
  Namibe: "distante",
  Bié: "distante",
  Cabinda: "distante",
  Zaire: "distante",
  Cunene: "distante",
  "Cuando Cubango": "distante",
  "Lunda Norte": "distante",
  "Lunda Sul": "distante",
  Moxico: "distante",
};

function zoneFor(province: string): ShippingZone {
  return ZONES[PROVINCE_ZONE[province] ?? "distante"];
}

export function calculateShippingCents(province: string): number {
  return zoneFor(province).priceCents;
}

export function estimateDeliveryDays(province: string): string {
  return zoneFor(province).days;
}

// Resumo usado na página de produto.
export const SHIPPING_SUMMARY = [
  { label: "Luanda", ...ZONES.luanda },
  { label: "Províncias próximas", ...ZONES.proxima },
  { label: "Restantes províncias", ...ZONES.distante },
];
