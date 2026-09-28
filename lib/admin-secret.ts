// Chave das sessões do painel. Partilhada pelo middleware (edge) e por lib/auth.
export function adminSessionSecret(): Uint8Array {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) {
    // Em produção, nunca assinar sessões com uma chave conhecida publicamente.
    if (process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_SESSION_SECRET não está definido.");
    }
    return new TextEncoder().encode("dev-only-secret-change-me");
  }
  return new TextEncoder().encode(value);
}
