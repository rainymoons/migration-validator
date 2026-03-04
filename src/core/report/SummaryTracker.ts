import { ValidationIssue, ValidationSummary } from "../types";

export class SummaryTracker {
  private totalRows = 0;
  private errorCount = 0;
  private warningCount = 0;
  private headerIssues = 0;
  private readonly rowsWithError = new Set<number>();
  private readonly rowsWithWarning = new Set<number>();
  private readonly ruleCounts = new Map<string, number>();

  public incrementRowCount(): void {
    this.totalRows += 1;
  }

  public recordIssue(issue: ValidationIssue): void {
    const isHeaderIssue = issue.rowNumber === 1;
    if (isHeaderIssue) {
      this.headerIssues += 1;
    }

    const previous = this.ruleCounts.get(issue.code) ?? 0;
    this.ruleCounts.set(issue.code, previous + 1);

    if (issue.severity === "error") {
      this.errorCount += 1;
      if (!isHeaderIssue) {
        this.rowsWithError.add(issue.rowNumber);
      }
      return;
    }

    this.warningCount += 1;
    if (!isHeaderIssue) {
      this.rowsWithWarning.add(issue.rowNumber);
    }
  }

  public toSummary(datasetType: ValidationSummary["datasetType"], inputPath: string): ValidationSummary {
    const sortedRuleCounts = Object.fromEntries(
      [...this.ruleCounts.entries()].sort((left, right) => left[0].localeCompare(right[0], "ko-KR")),
    );

    return {
      datasetType,
      totalRows: this.totalRows,
      validRows: this.totalRows - this.rowsWithError.size,
      errorRows: this.rowsWithError.size,
      warningRows: this.rowsWithWarning.size,
      errorCount: this.errorCount,
      warningCount: this.warningCount,
      headerIssues: this.headerIssues,
      ruleCounts: sortedRuleCounts,
      generatedAt: new Date().toISOString(),
      inputPath,
    };
  }
}
