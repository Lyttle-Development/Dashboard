export function capitalizeWords(str: string): string {
  // Capitalize the first letter of each word the rest lowercase
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
