"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBlank = isBlank;
exports.safeString = safeString;
exports.normalizeWhitespace = normalizeWhitespace;
exports.sanitizeHeader = sanitizeHeader;
exports.countCharacters = countCharacters;
exports.escapeCsvValue = escapeCsvValue;
exports.trimToEmpty = trimToEmpty;
function isBlank(value) {
    return value === undefined || value === null || value.trim().length === 0;
}
function safeString(value) {
    if (value === undefined || value === null) {
        return "";
    }
    return String(value);
}
function normalizeWhitespace(value) {
    return value.replace(/\s+/g, " ").trim();
}
function sanitizeHeader(value) {
    return safeString(value)
        .replace(/^\ufeff/, "")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .replace(/\s+/g, "")
        .trim();
}
function countCharacters(value) {
    return Array.from(value).length;
}
function escapeCsvValue(value) {
    if (/[",\r\n]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}
function trimToEmpty(value) {
    return safeString(value).trim();
}
