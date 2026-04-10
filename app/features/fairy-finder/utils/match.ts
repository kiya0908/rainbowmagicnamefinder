import { FAIRY_LIST } from "../data/fairies";
import type { FairyData } from "../data/types";

export function normalizeName(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z]/g, "");
}

const FAIRY_BY_NORMALIZED_NAME = new Map<string, FairyData>();

for (const fairy of FAIRY_LIST) {
  const normalizedFairyName = normalizeName(fairy.name);
  if (!normalizedFairyName) continue;
  if (FAIRY_BY_NORMALIZED_NAME.has(normalizedFairyName)) continue;
  FAIRY_BY_NORMALIZED_NAME.set(normalizedFairyName, fairy);
}

export function hashString(str: string): number {
  let hash = 5381;

  for (let index = 0; index < str.length; index += 1) {
    hash = (hash * 33 + str.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function matchFairy(name: string): FairyData | null {
  const normalizedName = normalizeName(name);

  if (!normalizedName || FAIRY_LIST.length === 0) {
    return null;
  }

  const exactNameMatch = FAIRY_BY_NORMALIZED_NAME.get(normalizedName);
  return exactNameMatch ?? null;
}
