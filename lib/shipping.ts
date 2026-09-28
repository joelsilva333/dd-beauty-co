export function calculateShippingCents(province: string): number {
  return province === "Luanda" ? 250000 : 450000;
}
