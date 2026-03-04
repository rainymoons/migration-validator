import { streamCsvFile } from "../csv/streamCsvFile";
import { IssueCsvWriter } from "../report/IssueCsvWriter";
import { SummaryTracker } from "../report/SummaryTracker";
import { writeSummary } from "../report/writeSummary";
import { DatasetPreset, RowContext, ValidationIssue, ValidationRunOptions, ValidationSummary } from "../types";
import { isBlank, trimToEmpty } from "../utils/stringUtils";
import { buildColumnResolution } from "./columnResolver";

function progressLog(datasetType: string, rowCount: number): void {
  if (rowCount > 0 && rowCount % 10000 === 0) {
    console.log(`[${datasetType}] ${rowCount.toLocaleString("ko-KR")} rows processed...`);
  }
}

export async function runValidation<State>(
  preset: DatasetPreset<State>,
  options: ValidationRunOptions,
): Promise<ValidationSummary> {
  const writer = new IssueCsvWriter(options.outDir);
  const summaryTracker = new SummaryTracker();
  const runtime = {
    options,
    emailDomainCache: new Map<string, Promise<boolean>>(),
  };
  const state = preset.createState();

  let columns = buildColumnResolution([], preset.fields);

  const pushIssue = (issue: ValidationIssue): void => {
    writer.write(issue);
    summaryTracker.recordIssue(issue);
  };

  try {
    await streamCsvFile({
      filePath: options.inputPath,
      encoding: options.encoding,
      delimiter: options.delimiter,
      onHeaders: async (headers) => {
        columns = buildColumnResolution(headers, preset.fields);

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

        const rowContext: RowContext<State> = {
          datasetType: preset.type,
          rowNumber,
          state,
          runtime,
          columns,
          rowValues,
          hasHeader: (fieldName: string) => columns.fieldToIndex.has(fieldName),
          getValue: (fieldName: string) => {
            const columnIndex = columns.fieldToIndex.get(fieldName);
            if (!columnIndex) {
              return "";
            }
            return trimToEmpty(rowValues[columnIndex - 1] ?? "");
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
          if (isRequired && isBlank(value)) {
            rowContext.addFieldIssue(field.name, {
              severity: "error",
              code: "REQUIRED_FIELD_EMPTY",
              message: "필수 값이 비어 있습니다.",
              rawValue: value,
            });
            continue;
          }

          if (isBlank(value)) {
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
  } finally {
    await writer.close();
  }

  const summary = summaryTracker.toSummary(preset.type, options.inputPath);
  await writeSummary(options.outDir, summary);
  return summary;
}
