import { ColumnResolution, FieldDefinition } from "../types";
import { sanitizeHeader } from "../utils/stringUtils";

export function buildColumnResolution(headers: string[], fields: Array<FieldDefinition>): ColumnResolution {
  const aliasMap = new Map<string, string>();
  const duplicateFieldNames: string[] = [];

  for (const field of fields) {
    const candidates = [field.name, ...(field.aliases ?? [])];
    for (const candidate of candidates) {
      aliasMap.set(sanitizeHeader(candidate), field.name);
    }
  }

  const fieldToIndex = new Map<string, number>();
  const fieldToActualHeader = new Map<string, string>();
  const unrecognizedHeaders: Array<{ header: string; columnIndex: number }> = [];

  headers.forEach((header, index) => {
    const sanitized = sanitizeHeader(header);
    const resolvedFieldName = aliasMap.get(sanitized);
    if (!resolvedFieldName) {
      unrecognizedHeaders.push({
        header,
        columnIndex: index + 1,
      });
      return;
    }

    if (fieldToIndex.has(resolvedFieldName)) {
      duplicateFieldNames.push(resolvedFieldName);
      return;
    }

    fieldToIndex.set(resolvedFieldName, index + 1);
    fieldToActualHeader.set(resolvedFieldName, header);
  });

  return {
    actualHeaders: headers,
    fieldToIndex,
    fieldToActualHeader,
    duplicateFieldNames,
    unrecognizedHeaders,
  };
}
