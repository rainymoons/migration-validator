"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummaryTracker = void 0;
class SummaryTracker {
    totalRows = 0;
    errorCount = 0;
    warningCount = 0;
    headerIssues = 0;
    rowsWithError = new Set();
    rowsWithWarning = new Set();
    ruleCounts = new Map();
    incrementRowCount() {
        this.totalRows += 1;
    }
    recordIssue(issue) {
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
    toSummary(datasetType, inputPath) {
        const sortedRuleCounts = Object.fromEntries([...this.ruleCounts.entries()].sort((left, right) => left[0].localeCompare(right[0], "ko-KR")));
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
exports.SummaryTracker = SummaryTracker;
