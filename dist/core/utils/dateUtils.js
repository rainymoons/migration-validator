"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeDateTime = normalizeDateTime;
exports.normalizeDateOnly = normalizeDateOnly;
exports.calculateKoreanAge = calculateKoreanAge;
const stringUtils_1 = require("./stringUtils");
const SEOUL_DATE_TIME_FORMATTER = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
});
const SEOUL_DATE_FORMATTER = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});
function formatSeoulDateTimeFromEpoch(epochMs) {
    return SEOUL_DATE_TIME_FORMATTER.format(new Date(epochMs)).replace(" ", " ");
}
function formatSeoulDateFromEpoch(epochMs) {
    return SEOUL_DATE_FORMATTER.format(new Date(epochMs));
}
function zeroPad(value) {
    return String(value).padStart(2, "0");
}
function isValidDateParts(year, month, day, hour = 0, minute = 0, second = 0) {
    const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    return (date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day &&
        date.getUTCHours() === hour &&
        date.getUTCMinutes() === minute &&
        date.getUTCSeconds() === second);
}
function formatDateTime(year, month, day, hour = 0, minute = 0, second = 0) {
    return `${year}-${zeroPad(month)}-${zeroPad(day)} ${zeroPad(hour)}:${zeroPad(minute)}:${zeroPad(second)}`;
}
function formatDate(year, month, day) {
    return `${year}-${zeroPad(month)}-${zeroPad(day)}`;
}
function resolveTwoDigitYear(twoDigitYear) {
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    return twoDigitYear > currentYear ? 1900 + twoDigitYear : 2000 + twoDigitYear;
}
function to24Hour(hour, ampm) {
    if (!ampm) {
        return hour;
    }
    const marker = ampm.toUpperCase();
    if (marker === "AM") {
        return hour === 12 ? 0 : hour;
    }
    return hour === 12 ? 12 : hour + 12;
}
function cleanDateText(value) {
    return (0, stringUtils_1.normalizeWhitespace)(value.replace(/[\[\]()]/g, " "));
}
function parseYearFirstDate(value) {
    const match = value.match(/^(\d{4})[-/ ](\d{1,2})[-/ ](\d{1,2})(?:\s+(?:(AM|PM)\s+)?(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s+(AM|PM))?)?$/i);
    if (!match) {
        return null;
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const prefixAmPm = match[4];
    const hourRaw = match[5];
    const minuteRaw = match[6];
    const secondRaw = match[7];
    const suffixAmPm = match[8];
    const hour = hourRaw ? Number(hourRaw) : 0;
    const minute = minuteRaw ? Number(minuteRaw) : 0;
    const second = secondRaw ? Number(secondRaw) : 0;
    const ampm = prefixAmPm ?? suffixAmPm;
    const resolvedHour = to24Hour(hour, ampm);
    if (!isValidDateParts(year, month, day, resolvedHour, minute, second)) {
        return null;
    }
    return formatDateTime(year, month, day, resolvedHour, minute, second);
}
function parseMonthFirstDate(value) {
    const match = value.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    if (!match) {
        return null;
    }
    const month = Number(match[1]);
    const day = Number(match[2]);
    const year = Number(match[3]);
    const hour = match[4] ? Number(match[4]) : 0;
    const minute = match[5] ? Number(match[5]) : 0;
    const second = match[6] ? Number(match[6]) : 0;
    if (!isValidDateParts(year, month, day, hour, minute, second)) {
        return null;
    }
    return formatDateTime(year, month, day, hour, minute, second);
}
function normalizeDateTime(rawValue) {
    const value = cleanDateText(rawValue.trim());
    if (value.length === 0) {
        return null;
    }
    if (/^\d{10}$/.test(value)) {
        return formatSeoulDateTimeFromEpoch(Number(value) * 1000);
    }
    if (/^\d{13}$/.test(value)) {
        return formatSeoulDateTimeFromEpoch(Number(value));
    }
    if (/^\d{14}$/.test(value)) {
        const year = Number(value.slice(0, 4));
        const month = Number(value.slice(4, 6));
        const day = Number(value.slice(6, 8));
        const hour = Number(value.slice(8, 10));
        const minute = Number(value.slice(10, 12));
        const second = Number(value.slice(12, 14));
        return isValidDateParts(year, month, day, hour, minute, second)
            ? formatDateTime(year, month, day, hour, minute, second)
            : null;
    }
    if (/^\d{8}$/.test(value)) {
        const year = Number(value.slice(0, 4));
        const month = Number(value.slice(4, 6));
        const day = Number(value.slice(6, 8));
        return isValidDateParts(year, month, day) ? formatDateTime(year, month, day) : null;
    }
    const yearFirst = parseYearFirstDate(value);
    if (yearFirst) {
        return yearFirst;
    }
    const monthFirst = parseMonthFirstDate(value);
    if (monthFirst) {
        return monthFirst;
    }
    return null;
}
function normalizeDateOnly(rawValue) {
    const value = cleanDateText(rawValue.trim());
    if (value.length === 0) {
        return null;
    }
    if (/^\d{10}$/.test(value)) {
        return formatSeoulDateFromEpoch(Number(value) * 1000);
    }
    if (/^\d{13}$/.test(value)) {
        return formatSeoulDateFromEpoch(Number(value));
    }
    if (/^\d{8}$/.test(value)) {
        const year = Number(value.slice(0, 4));
        const month = Number(value.slice(4, 6));
        const day = Number(value.slice(6, 8));
        return isValidDateParts(year, month, day) ? formatDate(year, month, day) : null;
    }
    if (/^\d{6}$/.test(value)) {
        const year = resolveTwoDigitYear(Number(value.slice(0, 2)));
        const month = Number(value.slice(2, 4));
        const day = Number(value.slice(4, 6));
        return isValidDateParts(year, month, day) ? formatDate(year, month, day) : null;
    }
    const dateTime = normalizeDateTime(value);
    if (dateTime) {
        return dateTime.slice(0, 10);
    }
    return null;
}
function calculateKoreanAge(dateOnly, referenceDate = new Date()) {
    const match = dateOnly.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
        return null;
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (!isValidDateParts(year, month, day)) {
        return null;
    }
    const nowYear = referenceDate.getFullYear();
    let age = nowYear - year;
    const birthdayThisYear = new Date(referenceDate.getFullYear(), month - 1, day);
    if (referenceDate < birthdayThisYear) {
        age -= 1;
    }
    return age;
}
