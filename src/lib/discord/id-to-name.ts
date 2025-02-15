export function idToName(id: string) {
  const users = {
    "132487290835435521": "Kilian",
    "643450818690940929": "Emma",
    "469271199143428099": "Luda",
  };

  return users[id] || "Unknown";
}
