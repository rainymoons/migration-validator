"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCsvRecord = parseCsvRecord;
function parseCsvRecord(recordText, delimiter) {
    const fields = [];
    let current = "";
    let inQuotes = false;
    for (let index = 0; index < recordText.length; index += 1) {
        const char = recordText[index];
        if (inQuotes) {
            if (char === '"') {
                const nextChar = recordText[index + 1];
                if (nextChar === '"') {
                    current += '"';
                    index += 1;
                }
                else {
                    inQuotes = false;
                }
            }
            else {
                current += char;
            }
            continue;
        }
        if (char === '"') {
            inQuotes = true;
            continue;
        }
        if (char === delimiter) {
            fields.push(current);
            current = "";
            continue;
        }
        if (char === "\r" || char === "\n") {
            continue;
        }
        current += char;
    }
    if (inQuotes) {
        return {
            complete: false,
            fields: [],
        };
    }
    fields.push(current);
    return {
        complete: true,
        fields,
    };
}
