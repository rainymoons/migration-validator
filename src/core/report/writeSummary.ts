import fs from "fs";
import path from "path";

import { ValidationSummary } from "../types";

export async function writeSummary(outputDirectory: string, summary: ValidationSummary): Promise<void> {
  const summaryPath = path.join(outputDirectory, "summary.json");
  await fs.promises.writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}
