"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const runValidation_1 = require("../core/engine/runValidation");
const pathUtils_1 = require("../core/utils/pathUtils");
const presets_1 = require("../presets");
function printHelp() {
    console.log(`
Cafe24 Migration Validator

Usage:
  yarn dev --type member --input ./input/member.csv
  yarn build && yarn validate -- --type order --input ./input/order.csv --out ./reports/order

Options:
  --type                 member | order
  --input                CSV 파일 경로
  --out                  리포트 출력 디렉터리 (기본값: ./reports/<type>-<timestamp>)
  --encoding             utf8 | cp949 | euc-kr (기본값: utf8)
  --delimiter            CSV 구분자 (기본값: ,)
  --strict-email-domain  이메일 도메인 DNS 검사 사용
  --help                 도움말 출력
`);
}
function parseArguments(argv) {
    const parsed = {
        strictEmailDomain: false,
        help: false,
    };
    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index];
        const nextValue = argv[index + 1];
        switch (token) {
            case "--type":
                parsed.type = nextValue;
                index += 1;
                break;
            case "--input":
                parsed.inputPath = nextValue;
                index += 1;
                break;
            case "--out":
                parsed.outDir = nextValue;
                index += 1;
                break;
            case "--encoding":
                parsed.encoding = nextValue;
                index += 1;
                break;
            case "--delimiter":
                parsed.delimiter = nextValue;
                index += 1;
                break;
            case "--strict-email-domain":
                parsed.strictEmailDomain = true;
                break;
            case "--help":
            case "-h":
                parsed.help = true;
                break;
            default:
                throw new Error(`알 수 없는 옵션입니다: ${token}`);
        }
    }
    return parsed;
}
function resolveDelimiter(rawDelimiter) {
    if (!rawDelimiter || rawDelimiter.length === 0) {
        return ",";
    }
    if (rawDelimiter === "\\t") {
        return "\t";
    }
    return rawDelimiter;
}
function createDefaultOutputDirectory(type) {
    const now = new Date();
    const stamp = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
        "-",
        String(now.getHours()).padStart(2, "0"),
        String(now.getMinutes()).padStart(2, "0"),
        String(now.getSeconds()).padStart(2, "0"),
    ].join("");
    return path_1.default.resolve(`./reports/${type}-${stamp}`);
}
async function main() {
    const args = parseArguments(process.argv.slice(2));
    if (args.help) {
        printHelp();
        return;
    }
    if (!args.type || (args.type !== "member" && args.type !== "order")) {
        throw new Error("--type 옵션은 member 또는 order 이어야 합니다.");
    }
    if (!args.inputPath) {
        throw new Error("--input 옵션은 필수입니다.");
    }
    const inputPath = path_1.default.resolve(args.inputPath);
    if (!fs_1.default.existsSync(inputPath)) {
        throw new Error(`입력 파일을 찾을 수 없습니다: ${inputPath}`);
    }
    const outDir = (0, pathUtils_1.resolveOutputDirectory)(args.outDir ? path_1.default.resolve(args.outDir) : createDefaultOutputDirectory(args.type));
    const options = {
        type: args.type,
        inputPath,
        outDir,
        encoding: args.encoding ?? "utf8",
        delimiter: resolveDelimiter(args.delimiter),
        strictEmailDomain: args.strictEmailDomain,
    };
    const preset = (0, presets_1.getPreset)(options.type);
    console.log(`[START] ${preset.displayName} CSV 검증을 시작합니다.`);
    console.log(` - input : ${options.inputPath}`);
    console.log(` - output: ${options.outDir}`);
    console.log(` - encoding: ${options.encoding}`);
    console.log(` - delimiter: ${JSON.stringify(options.delimiter)}`);
    console.log(` - strictEmailDomain: ${options.strictEmailDomain}`);
    const summary = await (0, runValidation_1.runValidation)(preset, options);
    console.log("\n[FINISH] 검증이 완료되었습니다.");
    console.log(` - totalRows   : ${summary.totalRows.toLocaleString("ko-KR")}`);
    console.log(` - validRows   : ${summary.validRows.toLocaleString("ko-KR")}`);
    console.log(` - errorRows   : ${summary.errorRows.toLocaleString("ko-KR")}`);
    console.log(` - warningRows : ${summary.warningRows.toLocaleString("ko-KR")}`);
    console.log(` - errorCount  : ${summary.errorCount.toLocaleString("ko-KR")}`);
    console.log(` - warningCount: ${summary.warningCount.toLocaleString("ko-KR")}`);
    console.log("\n생성 파일");
    console.log(` - ${path_1.default.join(outDir, "errors.csv")}`);
    console.log(` - ${path_1.default.join(outDir, "warnings.csv")}`);
    console.log(` - ${path_1.default.join(outDir, "summary.json")}`);
}
main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n[ERROR] ${message}`);
    process.exitCode = 1;
});
