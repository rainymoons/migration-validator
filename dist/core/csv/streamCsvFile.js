"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamCsvFile = streamCsvFile;
const fs_1 = __importDefault(require("fs"));
const readline_1 = __importDefault(require("readline"));
const csvRecordParser_1 = require("./csvRecordParser");
function createReadableTextStream(filePath, encoding) {
    const fileStream = fs_1.default.createReadStream(filePath);
    const normalizedEncoding = encoding.toLowerCase();
    if (normalizedEncoding === "utf8" || normalizedEncoding === "utf-8") {
        fileStream.setEncoding("utf8");
        return fileStream;
    }
    if (typeof require !== "function") {
        throw new Error(`Encoding \"${encoding}\" requires iconv-lite, but dynamic require is unavailable.`);
    }
    let iconv;
    try {
        iconv = require("iconv-lite");
    }
    catch (error) {
        throw new Error(`Encoding \"${encoding}\" requires the optional dependency iconv-lite. Run \"yarn add iconv-lite\" first.`);
    }
    return fileStream.pipe(iconv.decodeStream(encoding));
}
async function streamCsvFile(options) {
    const readable = createReadableTextStream(options.filePath, options.encoding);
    const lineReader = readline_1.default.createInterface({
        input: readable,
        crlfDelay: Infinity,
    });
    let pendingRecord = "";
    let logicalRowNumber = 0;
    let headerProcessed = false;
    for await (const line of lineReader) {
        const currentText = pendingRecord.length > 0 ? `${pendingRecord}\n${line}` : line;
        if (pendingRecord.length === 0 && currentText.trim().length === 0) {
            continue;
        }
        const parsed = (0, csvRecordParser_1.parseCsvRecord)(currentText, options.delimiter);
        if (!parsed.complete) {
            pendingRecord = currentText;
            continue;
        }
        pendingRecord = "";
        const normalizedFields = parsed.fields.map((field, index) => (logicalRowNumber === 0 && index === 0 ? field.replace(/^\ufeff/, "") : field));
        logicalRowNumber += 1;
        if (!headerProcessed) {
            headerProcessed = true;
            await options.onHeaders(normalizedFields);
            continue;
        }
        await options.onRecord(normalizedFields, logicalRowNumber);
    }
    if (pendingRecord.length > 0) {
        throw new Error("CSV ended while a quoted field was still open.");
    }
}
