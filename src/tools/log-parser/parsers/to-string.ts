import { postProcess } from "./composite-data.ts";
import { parseValue } from "./recursive-descent.ts";
import type { LogParser, ParseResult } from "./types.ts";

// Matches: ClassName[ or ClassName{ or ClassName@hash[ (with optional space before bracket)
const TOSTRING_START_RE =
  /^(?:[a-zA-Z_$][\w$]*\.)*[A-Z][a-zA-Z_$\d]*(?:@[0-9a-fA-F]+)?\s*[\[{]/;

export const ToStringParser: LogParser = {
  name: "ToStringParser",
  detect(input: string): number {
    return TOSTRING_START_RE.test(input.trim()) ? 0.8 : 0;
  },
  parse(input: string): ParseResult {
    try {
      const parsed = parseValue(input.trim());
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        return {
          success: false,
          data: null,
          raw: input,
          parserName: "ToStringParser",
          confidence: 0,
          error: "无法解析 toString 格式",
        };
      }
      const data = postProcess(parsed) as Record<string, unknown>;
      return {
        success: true,
        data,
        raw: input,
        parserName: "ToStringParser",
        confidence: 0.8,
      };
    } catch (e) {
      return {
        success: false,
        data: null,
        raw: input,
        parserName: "ToStringParser",
        confidence: 0,
        error: e instanceof Error ? e.message : "toString parse error",
      };
    }
  },
};

/**
 * @deprecated Use parseValue() from recursive-descent.ts directly.
 * Kept for backward compat with existing tests.
 */
export function parseToStringValue(input: string): unknown {
  const trimmed = input.trim();
  // Try JSON first for bare JSON objects/arrays
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // fall through to recursive descent
    }
  }
  return parseValue(trimmed);
}
