import { isBlank, trimToEmpty } from "./stringUtils";

export interface ParsedMoney {
  valid: boolean;
  normalized?: string;
  numericValue?: number;
}

export function parseMoney(rawValue: string): ParsedMoney {
  const trimmed = trimToEmpty(rawValue);
  if (trimmed.length === 0) {
    return { valid: false };
  }

  const sanitized = trimmed.replace(/[원₩￦$\s,\\]/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(sanitized)) {
    return { valid: false };
  }

  const numericValue = Number(sanitized);
  if (Number.isNaN(numericValue)) {
    return { valid: false };
  }

  return {
    valid: true,
    numericValue,
    normalized: String(numericValue),
  };
}

export function parseInteger(rawValue: string): number | null {
  const value = trimToEmpty(rawValue);
  if (!/^[-+]?\d+$/.test(value)) {
    return null;
  }
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function parseBooleanLike(value: string, trueSet: string[], falseSet: string[]): boolean | null {
  if (isBlank(value)) {
    return null;
  }
  const normalized = trimToEmpty(value).toLowerCase();
  if (trueSet.map((item) => item.toLowerCase()).includes(normalized)) {
    return true;
  }
  if (falseSet.map((item) => item.toLowerCase()).includes(normalized)) {
    return false;
  }
  return null;
}
