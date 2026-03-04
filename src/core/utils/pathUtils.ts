import fs from "fs";
import path from "path";

export function ensureDirectory(targetPath: string): void {
  fs.mkdirSync(targetPath, { recursive: true });
}

export function resolveOutputDirectory(baseOutputPath: string): string {
  const resolvedPath = path.resolve(baseOutputPath);
  ensureDirectory(resolvedPath);
  return resolvedPath;
}
