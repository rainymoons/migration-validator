import fs from "fs";
import readline from "readline";

import { parseCsvRecord } from "./csvRecordParser";

interface StreamCsvFileOptions {
  filePath: string;
  encoding: string;
  delimiter: string;
  onHeaders: (headers: string[]) => void | Promise<void>;
  onRecord: (record: string[], rowNumber: number) => void | Promise<void>;
}

declare const require: ((id: string) => unknown) | undefined;

function createReadableTextStream(filePath: string, encoding: string): NodeJS.ReadableStream {
  const fileStream = fs.createReadStream(filePath);
  const normalizedEncoding = encoding.toLowerCase();

  if (normalizedEncoding === "utf8" || normalizedEncoding === "utf-8") {
    fileStream.setEncoding("utf8");
    return fileStream;
  }

  if (typeof require !== "function") {
    throw new Error(`Encoding \"${encoding}\" requires iconv-lite, but dynamic require is unavailable.`);
  }

  let iconv: { decodeStream: (targetEncoding: string) => NodeJS.ReadWriteStream } | undefined;
  try {
    iconv = require("iconv-lite") as { decodeStream: (targetEncoding: string) => NodeJS.ReadWriteStream };
  } catch (error) {
    throw new Error(
      `Encoding \"${encoding}\" requires the optional dependency iconv-lite. Run \"yarn add iconv-lite\" first.`,
    );
  }

  return fileStream.pipe(iconv.decodeStream(encoding));
}

export async function streamCsvFile(options: StreamCsvFileOptions): Promise<void> {
  const readable = createReadableTextStream(options.filePath, options.encoding);
  const lineReader = readline.createInterface({
    input: readable,
    crlfDelay: Infinity,
  });

  let pendingRecord = "";
  let logicalRowNumber = 0;
  let headerProcessed = false;

  for await (const line of lineReader) {
    const currentText = pendingRecord.length > 0 ? `${pendingRecord}\n${line}` : line;

    if (pendingRecord.length === 0 && currentText.trim().length === 0) {
      continue;
    }

    const parsed = parseCsvRecord(currentText, options.delimiter);
    if (!parsed.complete) {
      pendingRecord = currentText;
      continue;
    }

    pendingRecord = "";
    const normalizedFields = parsed.fields.map((field, index) => (logicalRowNumber === 0 && index === 0 ? field.replace(/^\ufeff/, "") : field));

    logicalRowNumber += 1;
    if (!headerProcessed) {
      headerProcessed = true;
      await options.onHeaders(normalizedFields);
      continue;
    }

    await options.onRecord(normalizedFields, logicalRowNumber);
  }

  if (pendingRecord.length > 0) {
    throw new Error("CSV ended while a quoted field was still open.");
  }
}
