"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runValidation = runValidation;
const streamCsvFile_1 = require("../csv/streamCsvFile");
const IssueCsvWriter_1 = require("../report/IssueCsvWriter");
const SummaryTracker_1 = require("../report/SummaryTracker");
const writeSummary_1 = require("../report/writeSummary");
const stringUtils_1 = require("../utils/stringUtils");
const columnResolver_1 = require("./columnResolver");
function progressLog(datasetType, rowCount) {
    if (rowCount > 0 && rowCount % 10000 === 0) {
        console.log(`[${datasetType}] ${rowCount.toLocaleString("ko-KR")} rows processed...`);
    }
}
async function runValidation(preset, options) {
    const writer = new IssueCsvWriter_1.IssueCsvWriter(options.outDir);
    const summaryTracker = new SummaryTracker_1.SummaryTracker();
    const runtime = {
        options,
        emailDomainCache: new Map(),
    };
    const state = preset.createState();
    let columns = (0, columnResolver_1.buildColumnResolution)([], preset.fields);
    const pushIssue = (issue) => {
        writer.write(issue);
        summaryTracker.recordIssue(issue);
    };
    try {
        await (0, streamCsvFile_1.streamCsvFile)({
            filePath: options.inputPath,
            encoding: options.encoding,
            delimiter: options.delimiter,
            onHeaders: async (headers) => {
                columns = (0, columnResolver_1.buildColumnResolution)(headers, preset.fields);
                for (const field of preset.fields) {
                    if (field.requiredHeader && !columns.fieldToIndex.has(field.name)) {
                        pushIssue({
                            datasetType: preset.type,
                            rowNumber: 1,
                            columnIndex: 0,
                            columnName: field.name,
                            code: "MISSING_HEADER",
                            severity: "error",
                            message: `필수 헤더가 없습니다: ${field.name}`,
                            rawValue: "",
                        });
                    }
                }
                for (const duplicateFieldName of columns.duplicateFieldNames) {
                    pushIssue({
                        datasetType: preset.type,
                        rowNumber: 1,
                        columnIndex: columns.fieldToIndex.get(duplicateFieldName) ?? 0,
                        columnName: duplicateFieldName,
                        code: "DUPLICATE_HEADER",
                        severity: "warning",
                        message: `동일한 의미의 헤더가 2개 이상 존재합니다: ${duplicateFieldName}`,
                        rawValue: duplicateFieldName,
                    });
                }
                for (const unknownHeader of columns.unrecognizedHeaders) {
                    pushIssue({
                        datasetType: preset.type,
                        rowNumber: 1,
                        columnIndex: unknownHeader.columnIndex,
                        columnName: unknownHeader.header,
                        code: "UNRECOGNIZED_HEADER",
                        severity: "warning",
                        message: `인식되지 않은 헤더입니다: ${unknownHeader.header}`,
                        rawValue: unknownHeader.header,
                    });
                }
            },
            onRecord: async (rowValues, rowNumber) => {
                summaryTracker.incrementRowCount();
                progressLog(preset.type, rowNumber - 1);
                const rowContext = {
                    datasetType: preset.type,
                    rowNumber,
                    state,
                    runtime,
                    columns,
                    rowValues,
                    hasHeader: (fieldName) => columns.fieldToIndex.has(fieldName),
                    getValue: (fieldName) => {
                        const columnIndex = columns.fieldToIndex.get(fieldName);
                        if (!columnIndex) {
                            return "";
                        }
                        return (0, stringUtils_1.trimToEmpty)(rowValues[columnIndex - 1] ?? "");
                    },
                    addIssue: (issue) => {
                        pushIssue({
                            datasetType: preset.type,
                            rowNumber,
                            ...issue,
                        });
                    },
                    addFieldIssue: (fieldName, issue) => {
                        const columnIndex = columns.fieldToIndex.get(fieldName) ?? 0;
                        const columnName = columns.fieldToActualHeader.get(fieldName) ?? fieldName;
                        const rawValue = issue.rawValue ?? (columnIndex > 0 ? rowValues[columnIndex - 1] ?? "" : "");
                        pushIssue({
                            datasetType: preset.type,
                            rowNumber,
                            columnIndex,
                            columnName,
                            ...issue,
                            rawValue,
                        });
                    },
                };
                for (const field of preset.fields) {
                    if (!rowContext.hasHeader(field.name)) {
                        continue;
                    }
                    const value = rowContext.getValue(field.name);
                    const isRequired = typeof field.required === "function" ? field.required(rowContext) : Boolean(field.required);
                    if (isRequired && (0, stringUtils_1.isBlank)(value)) {
                        rowContext.addFieldIssue(field.name, {
                            severity: "error",
                            code: "REQUIRED_FIELD_EMPTY",
                            message: "필수 값이 비어 있습니다.",
                            rawValue: value,
                        });
                        continue;
                    }
                    if ((0, stringUtils_1.isBlank)(value)) {
                        continue;
                    }
                    for (const validator of field.validators ?? []) {
                        await validator(value, rowContext, field);
                    }
                }
                for (const rowValidator of preset.rowValidators ?? []) {
                    await rowValidator(rowContext);
                }
            },
        });
    }
    finally {
        await writer.close();
    }
    const summary = summaryTracker.toSummary(preset.type, options.inputPath);
    await (0, writeSummary_1.writeSummary)(options.outDir, summary);
    return summary;
}
