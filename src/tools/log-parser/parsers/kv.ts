import type { LogParser, ParseResult } from "./types.ts";

// Matches multiple key=value pairs
const KV_RE = /\b[\w.-]+\s*=\s*[^\s,;]+/g;

export const KVParser: LogParser = {
  name: "KVParser",
  detect(input: string): number {
    const matches = input.match(KV_RE);
    if (!matches || matches.length < 2) return 0;
    return 0.5;
  },
  parse(input: string): ParseResult {
    const data: Record<string, unknown> = {};
    const re = /([\w.-]+)\s*=\s*([^\s,;]+)/g;
    let count = 0;

    for (const m of input.matchAll(re)) {
      const key = m[1];
      const rawVal = m[2];
      // Type inference
      if (rawVal === "null" || rawVal === "<null>") {
        data[key] = null;
      } else if (rawVal === "true") {
        data[key] = true;
      } else if (rawVal === "false") {
        data[key] = false;
      } else if (/^-?\d+(\.\d+)?$/.test(rawVal)) {
        data[key] = Number(rawVal);
      } else {
        data[key] = rawVal;
      }
      count++;
    }

    if (count < 2) {
      return {
        success: false,
        data: null,
        raw: input,
        parserName: "KVParser",
        confidence: 0,
        error: "未找到足够的 key=value 对",
      };
    }

    return {
      success: true,
      data,
      raw: input,
      parserName: "KVParser",
      confidence: 0.5,
    };
  },
};
