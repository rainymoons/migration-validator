"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDirectory = ensureDirectory;
exports.resolveOutputDirectory = resolveOutputDirectory;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function ensureDirectory(targetPath) {
    fs_1.default.mkdirSync(targetPath, { recursive: true });
}
function resolveOutputDirectory(baseOutputPath) {
    const resolvedPath = path_1.default.resolve(baseOutputPath);
    ensureDirectory(resolvedPath);
    return resolvedPath;
}
