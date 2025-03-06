import { FormValueTypes } from "@/components/Form";

export function safeParseInt(value: FormValueTypes): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return parseInt(value, 10);
  }
  return 0;
}

export function safeParseFloat(value: FormValueTypes): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return parseFloat(value);
  }
  return 0;
}

export function safeParseFieldDate(value: FormValueTypes): string {
  try {
    if (!value || typeof value !== "string") return null;
    const date = new Date(value);
    // Return the date in the format "YYYY-MM-DD". Making sure always 1 -> 01 ... digits for month and day.
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  } catch (error) {}
  return null;
}
