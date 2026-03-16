"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueCsvWriter = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pathUtils_1 = require("../utils/pathUtils");
const stringUtils_1 = require("../utils/stringUtils");
const ISSUE_HEADERS = [
    "datasetType",
    "rowNumber",
    "columnIndex",
    "columnName",
    "severity",
    "code",
    "message",
    "rawValue",
    "normalizedValue",
];
const UTF8_BOM = "\uFEFF";
function toCsvLine(issue) {
    const values = [
        issue.datasetType,
        String(issue.rowNumber),
        String(issue.columnIndex),
        issue.columnName,
        issue.severity,
        issue.code,
        issue.message,
        issue.rawValue,
        issue.normalizedValue ?? "",
    ];
    return `${values.map((value) => (0, stringUtils_1.escapeCsvValue)(value)).join(",")}\n`;
}
class IssueCsvWriter {
    errorStream;
    warningStream;
    constructor(outputDirectory) {
        (0, pathUtils_1.ensureDirectory)(outputDirectory);
        this.errorStream = fs_1.default.createWriteStream(path_1.default.join(outputDirectory, "errors.csv"), { encoding: "utf8" });
        this.warningStream = fs_1.default.createWriteStream(path_1.default.join(outputDirectory, "warnings.csv"), { encoding: "utf8" });
        // Excel 등에서 UTF-8을 자동 인식하도록 BOM을 추가한다.
        this.errorStream.write(UTF8_BOM);
        this.warningStream.write(UTF8_BOM);
        const headerLine = `${ISSUE_HEADERS.join(",")}\n`;
        this.errorStream.write(headerLine);
        this.warningStream.write(headerLine);
    }
    write(issue) {
        const line = toCsvLine(issue);
        if (issue.severity === "error") {
            this.errorStream.write(line);
            return;
        }
        this.warningStream.write(line);
    }
    async close() {
        await Promise.all([
            new Promise((resolve) => this.errorStream.end(resolve)),
            new Promise((resolve) => this.warningStream.end(resolve)),
        ]);
    }
}
exports.IssueCsvWriter = IssueCsvWriter;
