"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeSummary = writeSummary;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function writeSummary(outputDirectory, summary) {
    const summaryPath = path_1.default.join(outputDirectory, "summary.json");
    await fs_1.default.promises.writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}
