export function isBlank(value: string | undefined | null): boolean {
  return value === undefined || value === null || value.trim().length === 0;
}

export function safeString(value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value);
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function sanitizeHeader(value: string): string {
  return safeString(value)
    .replace(/^\ufeff/, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

export function countCharacters(value: string): number {
  return Array.from(value).length;
}

export function escapeCsvValue(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function trimToEmpty(value: string): string {
  return safeString(value).trim();
}
