"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMoney = parseMoney;
exports.parseInteger = parseInteger;
exports.parseBooleanLike = parseBooleanLike;
const stringUtils_1 = require("./stringUtils");
function parseMoney(rawValue) {
    const trimmed = (0, stringUtils_1.trimToEmpty)(rawValue);
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
function parseInteger(rawValue) {
    const value = (0, stringUtils_1.trimToEmpty)(rawValue);
    if (!/^[-+]?\d+$/.test(value)) {
        return null;
    }
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) ? parsed : null;
}
function parseBooleanLike(value, trueSet, falseSet) {
    if ((0, stringUtils_1.isBlank)(value)) {
        return null;
    }
    const normalized = (0, stringUtils_1.trimToEmpty)(value).toLowerCase();
    if (trueSet.map((item) => item.toLowerCase()).includes(normalized)) {
        return true;
    }
    if (falseSet.map((item) => item.toLowerCase()).includes(normalized)) {
        return false;
    }
    return null;
}
