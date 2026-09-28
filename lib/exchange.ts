// Taxa de câmbio fixa usada apenas para converter os totais em Kwanza (AOA)
// para USD no checkout Stripe, já que o Stripe não processa pagamentos em AOA.
// Substituir por uma taxa em tempo real antes de produção.
const AOA_PER_USD = 950;

export function aoaCentsToUsdCents(aoaCents: number): number {
  return Math.round(aoaCents / AOA_PER_USD);
}
