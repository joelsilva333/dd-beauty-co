// Chave das sessões de cliente — separada da do admin (lib/admin-secret.ts),
// para que uma nunca sirva para forjar a outra.
export function customerSessionSecret(): Uint8Array {
  const value = process.env.CUSTOMER_SESSION_SECRET;
  if (!value) {
    // Em produção, nunca assinar sessões com uma chave conhecida publicamente.
    if (process.env.NODE_ENV === "production") {
      throw new Error("CUSTOMER_SESSION_SECRET não está definido.");
    }
    return new TextEncoder().encode("dev-only-customer-secret-change-me");
  }
  return new TextEncoder().encode(value);
}
