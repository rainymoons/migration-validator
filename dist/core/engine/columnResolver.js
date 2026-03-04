"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildColumnResolution = buildColumnResolution;
const stringUtils_1 = require("../utils/stringUtils");
function buildColumnResolution(headers, fields) {
    const aliasMap = new Map();
    const duplicateFieldNames = [];
    for (const field of fields) {
        const candidates = [field.name, ...(field.aliases ?? [])];
        for (const candidate of candidates) {
            aliasMap.set((0, stringUtils_1.sanitizeHeader)(candidate), field.name);
        }
    }
    const fieldToIndex = new Map();
    const fieldToActualHeader = new Map();
    const unrecognizedHeaders = [];
    headers.forEach((header, index) => {
        const sanitized = (0, stringUtils_1.sanitizeHeader)(header);
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
