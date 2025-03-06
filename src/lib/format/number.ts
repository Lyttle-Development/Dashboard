export function formatNumber(value: number): string {
  // Format belgian number: 1000000 => 1.000.000,00 or 5.26 => 5,26 with always 2 decimals
  return new Intl.NumberFormat("nl-BE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
