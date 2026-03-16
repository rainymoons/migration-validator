import fs from "fs";
import path from "path";

import { ValidationIssue } from "../types";
import { ensureDirectory } from "../utils/pathUtils";
import { escapeCsvValue } from "../utils/stringUtils";

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
] as const;
const UTF8_BOM = "\uFEFF";

function toCsvLine(issue: ValidationIssue): string {
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
  return `${values.map((value) => escapeCsvValue(value)).join(",")}\n`;
}

export class IssueCsvWriter {
  private readonly errorStream: any;
  private readonly warningStream: any;

  constructor(outputDirectory: string) {
    ensureDirectory(outputDirectory);
    this.errorStream = fs.createWriteStream(path.join(outputDirectory, "errors.csv"), { encoding: "utf8" });
    this.warningStream = fs.createWriteStream(path.join(outputDirectory, "warnings.csv"), { encoding: "utf8" });

    // Excel 등에서 UTF-8을 자동 인식하도록 BOM을 추가한다.
    this.errorStream.write(UTF8_BOM);
    this.warningStream.write(UTF8_BOM);

    const headerLine = `${ISSUE_HEADERS.join(",")}\n`;
    this.errorStream.write(headerLine);
    this.warningStream.write(headerLine);
  }

  public write(issue: ValidationIssue): void {
    const line = toCsvLine(issue);
    if (issue.severity === "error") {
      this.errorStream.write(line);
      return;
    }
    this.warningStream.write(line);
  }

  public async close(): Promise<void> {
    await Promise.all([
      new Promise<void>((resolve) => this.errorStream.end(resolve)),
      new Promise<void>((resolve) => this.warningStream.end(resolve)),
    ]);
  }
}
