export function formatNumber(value: number): string {
  // Format belgian number: 1000000 => 1.000.000 or 5.26 => 5,26
  return value.toLocaleString("nl-BE");
}
