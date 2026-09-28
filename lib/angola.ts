export const ANGOLA_PROVINCES = [
  "Bengo",
  "Benguela",
  "Bié",
  "Cabinda",
  "Cuando Cubango",
  "Cuanza Norte",
  "Cuanza Sul",
  "Cunene",
  "Huambo",
  "Huíla",
  "Luanda",
  "Lunda Norte",
  "Lunda Sul",
  "Malanje",
  "Moxico",
  "Namibe",
  "Uíge",
  "Zaire",
] as const;

export function isAngolaProvince(value: string): boolean {
  return (ANGOLA_PROVINCES as readonly string[]).includes(value);
}

// Normaliza números angolanos para 9 dígitos (ex: "+244 923 456 789" -> "923456789"),
// para que a pesquisa de pedidos funcione independentemente da forma como foi escrito.
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("244")) return digits.slice(3);
  if (digits.length === 14 && digits.startsWith("00244")) return digits.slice(5);
  return digits;
}
