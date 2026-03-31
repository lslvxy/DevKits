import type { LogParser, ParseResult } from "./types.ts";

export const JsonDetectParser: LogParser = {
  name: "JsonDetectParser",
  detect(input: string): number {
    const t = input.trim();
    if (t.startsWith("{") || t.startsWith("[")) {
      try {
        JSON.parse(t);
        return 1.0;
      } catch {
        return 0;
      }
    }
    return 0;
  },
  parse(input: string): ParseResult {
    const t = input.trim();
    try {
      const parsed = JSON.parse(t);
      const data: Record<string, unknown> = Array.isArray(parsed)
        ? { items: parsed }
        : (parsed as Record<string, unknown>);
      return {
        success: true,
        data,
        raw: input,
        parserName: "JsonDetectParser",
        confidence: 1.0,
      };
    } catch (e) {
      return {
        success: false,
        data: null,
        raw: input,
        parserName: "JsonDetectParser",
        confidence: 0,
        error: e instanceof Error ? e.message : "JSON parse error",
      };
    }
  },
};
