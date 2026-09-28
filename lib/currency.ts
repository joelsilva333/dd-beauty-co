export function formatKwanza(cents: number): string {
  const value = cents / 100;
  return (
    new Intl.NumberFormat("pt-AO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value) + " Kz"
  );
}
