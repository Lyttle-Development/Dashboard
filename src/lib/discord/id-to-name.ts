export function idToName(id: string) {
  const users = {
    "132487290835435521": "Kilian De Bock",
    "643450818690940929": "Emma Van der Haeghen",
    "469271199143428099": "Liudmila Mikhaylinova",
  };

  return users[id] || "Unknown";
}
